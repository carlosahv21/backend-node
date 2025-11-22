// models/BaseModel.js (Anteriormente BaseController)

import knex from '../config/knex.js';
import { validationHandlers } from '../utils/utilsValidations.js';
import utilsCustomError from '../utils/utilsCustomError.js';

class BaseModel {
    constructor(tableName) {
        this.tableName = tableName;
        this.knex = knex;
        this.validations = [];
    }

    // Ejecuta las validaciones definidas para el modelo
    async _runValidations(data) {
        for (const rule of this.validations) {
            const handler = validationHandlers[rule.name || rule];

            if (typeof handler !== "function") continue;

            const message = await handler(data, rule.config || {});

            if (message) {
                throw new utilsCustomError(message, 409);
            }
        }
        return null;
    }

    // Función auxiliar para construir la query base con filtros y búsqueda
    _buildQuery({ search, isCount = false, ...queryParams }) {
        let query = this.knex(this.tableName);

        if (this.joins && Array.isArray(this.joins)) {
            this.joins.forEach(j => {
                query = query.leftJoin(`${j.table} as ${j.alias}`, j.on[0], j.on[1]);
            });
        }

        if (!isCount) {
            query = this.selectFields && Array.isArray(this.selectFields)
                ? query.select(this.selectFields)
                : query.select(`${this.tableName}.*`);
        }


        if (search && Array.isArray(this.searchFields) && this.searchFields.length > 0) {
            query = query.where(builder => {
                this.searchFields.forEach((field, index) => {
                    if (index === 0) builder.where(field, "like", `%${search}%`);
                    else builder.orWhere(field, "like", `%${search}%`);
                });
            });
        }

        Object.keys(queryParams).forEach(key => {
            if (["search", "page", "limit"].includes(key)) return;

            let value = queryParams[key];

            if (value === "true") value = true;
            if (value === "false") value = false;

            query = query.where(`${this.tableName}.${key}`, value);
        });

        return query;
    }

    // Guardar campos personalizados
    async saveCustomFields(recordId, data) {
        const customFields = {};

        for (const key in data) {
            if (key.startsWith('cf_')) {
                customFields[key] = data[key];
            }
        }

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

    // Obtener todos los registros con paginación y filtros
    async findAll(queryParams = {}) {
        const { page = 1, limit = 10, ...filters } = queryParams;

        const query = this._buildQuery(filters);
        const results = await query.clone().limit(limit).offset((page - 1) * limit);

        const totalQuery = this._buildQuery({ ...filters, isCount: true });
        const totalRes = await totalQuery.count("* as count").first();

        return {
            data: results,
            total: parseInt(totalRes.count),
            page: parseInt(page),
            limit: parseInt(limit)
        };
    }


    // Obtener un registro por ID
    async findById(id) {
        const record = await this.knex(this.tableName).where({ id }).first();

        if (!record) {
            throw new utilsCustomError(`${this.tableName} record not found`, 404);
        }

        const fieldValues = await this.knex('field_values as fv')
            .join('fields as f', 'fv.field_id', 'f.id')
            .where('fv.record_id', id)
            .select('f.name as field_name', 'fv.value');

        fieldValues.forEach(fv => {
            record[fv.field_name] = fv.value;
        });

        return record;
    }

    // Crear registro
    async create(data) {
        await this._runValidations(data);

        const { standardFields } = this.splitFields(data);

        const [recordId] = await this.knex(this.tableName).insert(standardFields);

        await this.saveCustomFields(recordId, data);

        return this.findById(recordId);
    }

    // Actualizar registro
    async update(id, data) {
        const dataWithId = { ...data, id: id };

        await this._runValidations(dataWithId);

        const { standardFields } = this.splitFields(data);

        const updatedCount = await this.knex(this.tableName)
            .where({ id })
            .update(standardFields);

        if (updatedCount === 0) {
            throw new utilsCustomError(`${this.tableName} record not found`, 404);
        }

        await this.saveCustomFields(id, data);

        return this.findById(id);
    }

    // Eliminar un registro
    async delete(id) {
        await this.knex('field_values').where({ record_id: id }).del();

        const deletedCount = await this.knex(this.tableName).where({ id }).del();

        if (deletedCount === 0) {
            throw new utilsCustomError(`${this.tableName} record not found`, 404);
        }

        return deletedCount;
    }
}

export default BaseModel;