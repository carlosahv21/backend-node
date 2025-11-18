// controllers/BaseController.js
const { da } = require('zod/locales');
const knex = require('../db/knex');
const { validationHandlers } = require('../utils/utilsValidations');

class BaseController {
    constructor(tableName) {
        this.tableName = tableName;
        this.knex = knex;
        this.validations = [];
    }

    // Validaciones
    async _runValidations(data) {
        for (const rule of this.validations) {
            const handler = validationHandlers[rule.name || rule];
            if (typeof handler !== "function") continue;

            const message = await handler(this.knex, this.tableName, data, rule.config || {});
            if (message) {
                return message;
            }
        }
        return null;
    }

    // Función auxiliar para construir la query
    _buildQuery({ search, isCount = false, ...queryParams }) {
        let query = this.knex(this.tableName);

        // Joins dinámicos
        if (this.joins && Array.isArray(this.joins)) {
            this.joins.forEach(j => {
                query = query.leftJoin(`${j.table} as ${j.alias}`, j.on[0], j.on[1]);
            });
        }

        // Select dinámico
        if (!isCount) {
            query = this.selectFields && Array.isArray(this.selectFields)
                ? query.select(this.selectFields)
                : query.select(`${this.tableName}.*`);
        }

        // Búsqueda por texto
        if (search && Array.isArray(this.searchFields) && this.searchFields.length > 0) {
            query = query.where(builder => {
                this.searchFields.forEach((field, index) => {
                    if (index === 0) builder.where(field, "like", `%${search}%`);
                    else builder.orWhere(field, "like", `%${search}%`);
                });
            });
        }

        // ⭐ FILTROS DINÁMICOS (aquí está la magia)
        Object.keys(queryParams).forEach(key => {
            if (["search", "page", "limit"].includes(key)) return;

            let value = queryParams[key];

            // convertir "true"/"false" a boolean
            if (value === "true") value = true;
            if (value === "false") value = false;

            query = query.where(`${this.tableName}.${key}`, value);
        });

        return query;
    }


    // Obtener todos los registros con paginación, búsqueda y filtros
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;

            const query = this._buildQuery(filters);
            const results = await query.limit(limit).offset((page - 1) * limit);

            const totalQuery = this._buildQuery({ ...filters, isCount: true });
            const totalRes = await totalQuery.count("* as count").first();

            res.json({
                data: results,
                total: totalRes.count,
                page: parseInt(page),
                limit: parseInt(limit)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving records", error });
        }
    }


    // Obtener un registro por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const record = await this.knex(this.tableName).where({ id }).first();

            if (!record) {
                return res.status(404).json({ message: `${this.tableName} record not found` });
            }

            const fieldValues = await this.knex('field_values as fv')
                .join('fields as f', 'fv.field_id', 'f.id')
                .where('fv.record_id', id)
                .select('f.name as field_name', 'fv.value');

            fieldValues.forEach(fv => {
                record[fv.field_name] = fv.value;
            });

            res.json(record);
        } catch (error) {
            console.error(`❌ Error retrieving ${this.tableName} record:`, error);
            res.status(500).json({ message: `Error retrieving ${this.tableName} record`, error });
        }
    }

    // Guardar campos personalizados 
    async saveCustomFields(recordId, data) {
        const customFields = {};

        // Filtramos los campos personalizados
        for (const key in data) {
            if (key.startsWith('cf_')) {
                customFields[key] = data[key];
            }
        }

        // Recorremos y guardamos cada campo
        for (const [name, value] of Object.entries(customFields)) {
            const field = await this.knex('fields').where({ name }).first();
            if (!field) continue;

            const existing = await this.knex('field_values')
                .where({ field_id: field.id, record_id: recordId })
                .first();

            if (existing) {
                await this.knex('field_values')
                    .where({ id: existing.id })
                    .update({ value });
            } else {
                await this.knex('field_values').insert({
                    field_id: field.id,
                    record_id: recordId,
                    value,
                });
            }
        }
    }

    // Función auxiliar para separar campos estándar y personalizados
    splitFields(data) {
        const standardFields = {};
        const customFields = {};

        for (const key in data) {
            if (key.startsWith('cf_')) {
                customFields[key] = data[key];
            } else {
                standardFields[key] = data[key];
            }
        }

        return { standardFields, customFields };
    }

    // Crear registro
    async create(req, res) {
        try {
            const data = req.body;

            const validationError = await this._runValidations(data);
            if (validationError) {
                return res.status(409).json({ message: validationError });
            }

            const { standardFields } = this.splitFields(data);

            const [recordId] = await this.knex(this.tableName).insert(standardFields);

            await this.saveCustomFields(recordId, data);

            res.status(201).json({ message: `${this.tableName} record created successfully` });
        } catch (error) {
            console.error(`❌ Error creating ${this.tableName} record:`, error);
            res.status(500).json({ message: 'Error interno', error: error.message });
        }
    }

    // Actualizar registro
    async update(req, res) {
        try {
            const data = { ...req.body, id: req.params.id };

            const validationError = await this._runValidations(data);

            if (validationError) {
                return res.status(409).json({ message: validationError });
            }

            const { standardFields } = this.splitFields(data);

            const updatedCount = await this.knex(this.tableName)
                .where({ id: data.id })
                .update(standardFields);

            if (updatedCount === 0) {
                return res.status(404).json({ message: `${this.tableName} record not found` });
            }

            await this.saveCustomFields(data.id, data);

            res.json({ message: `${this.tableName} record updated successfully` });
        } catch (error) {
            console.error(`❌ Error updating ${this.tableName} record:`, error);
            res.status(500).json({ message: `Error updating ${this.tableName} record`, error });
        }
    }

    // Eliminar un registro
    async delete(req, res) {
        try {
            const { id } = req.params;

            // Borrar los campos personalizados
            await this.knex('field_values').where({ record_id: id }).del();

            // Borrar el registro
            const deletedCount = await this.knex(this.tableName).where({ id }).del();

            if (deletedCount === 0) {
                return res.status(404).json({ message: `${this.tableName} record not found` });
            }

            res.status(204).send();
        } catch (error) {
            console.error(`❌ Error deleting ${this.tableName} record`);
            res.status(500).json({ message: `Error deleting ${this.tableName} record`, error });
        }
    }
}

module.exports = BaseController;
