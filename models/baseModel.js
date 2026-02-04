// models/BaseModel.js

import knex from "../config/knex.js";
import { validationHandlers } from "../utils/utilsValidations.js";
import AppError from "../utils/AppError.js";

class BaseModel {
    constructor(tableName) {
        this.tableName = tableName;
        this.knex = knex;
        this.validations = [];
        this.softDelete = true;
    }

    // Ejecuta las validaciones definidas para el modelo
    async _runValidations(data) {
        for (const rule of this.validations) {
            const handler = validationHandlers[rule.name || rule];

            if (typeof handler !== "function") continue;

            const message = await handler(
                this.knex,
                this.tableName,
                data,
                rule.config || {}
            );

            if (message) {
                throw new AppError(message, 409);
            }
        }
        return null;
    }

    // Función auxiliar para construir la query base con filtros y búsqueda
    _buildQuery({
        search,
        isCount = false,
        order_by,
        order_direction = "asc",
        ...queryParams
    }) {
        let query = this.knex(this.tableName);

        if (this.joins && Array.isArray(this.joins)) {
            this.joins.forEach((j) => {
                query = query.leftJoin(`${j.table} as ${j.alias}`, j.on[0], j.on[1]);
            });
        }

        const { withDeleted = false, onlyDeleted = false, ...otherQueryParams } = queryParams;

        if (this.softDelete) {
            if (onlyDeleted) {
                query = query.whereNotNull(`${this.tableName}.deleted_at`);
            } else if (!withDeleted) {
                query = query.whereNull(`${this.tableName}.deleted_at`);
            }
        }

        if (!isCount) {
            query =
                this.selectFields && Array.isArray(this.selectFields)
                    ? query.select(this.selectFields)
                    : query.select(`${this.tableName}.*`);
        }

        if (
            search &&
            Array.isArray(this.searchFields) &&
            this.searchFields.length > 0
        ) {
            query = query.where((builder) => {
                this.searchFields.forEach((field, index) => {
                    const normalizedQuery = search.replace(/\+/g, ' ').trim();
                    if (index === 0) builder.where(field, "like", `%${normalizedQuery}%`);
                    else builder.orWhere(field, "like", `%${normalizedQuery}%`);
                });
            });
        }

        Object.keys(queryParams).forEach((key) => {
            if (
                ["search", "page", "limit", "order_by", "order_direction", "withDeleted", "onlyDeleted"].includes(key)
            )
                return;

            let value = queryParams[key];

            if (value === "true") value = true;
            if (value === "false") value = false;

            let columnName = key;
            if (this.filterMapping && this.filterMapping[key]) {
                columnName = this.filterMapping[key];
            } else {
                columnName = `${this.tableName}.${key}`;
            }

            query = query.where(columnName, value);
        });

        if (!isCount && order_by) {

            let orderByColumn = order_by;
            // Map the field if it exists in filterMapping
            if (this.filterMapping && this.filterMapping[order_by]) {
                orderByColumn = this.filterMapping[order_by];
            } else if (!order_by.includes(".")) {
                // Default to table.field if no dot notation
                orderByColumn = `${this.tableName}.${order_by}`;
            }
            query = query.orderBy(orderByColumn, order_direction);
        }

        return query;
    }

    // Guardar campos personalizados
    async saveCustomFields(recordId, data) {
        const customFields = {};

        for (const key in data) {
            if (key.startsWith("cf_")) {
                customFields[key] = data[key];
            }
        }

        for (const [name, value] of Object.entries(customFields)) {
            const field = await this.knex("fields").where({ name }).first();
            if (!field) continue;

            const existing = await this.knex("field_values")
                .where({ field_id: field.id, record_id: recordId })
                .first();

            if (existing) {
                await this.knex("field_values")
                    .where({ id: existing.id })
                    .update({ value });
            } else {
                await this.knex("field_values").insert({
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
            if (key.startsWith("cf_")) {
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
        const results = await query
            .clone()
            .limit(limit)
            .offset((page - 1) * limit);

        const totalQuery = this._buildQuery({ ...filters, isCount: true });
        const totalRes = await totalQuery.count("* as count").first();

        return {
            data: results,
            total: parseInt(totalRes.count),
            page: parseInt(page),
            limit: parseInt(limit),
        };
    }

    //Obtener el primer registro
    async findFirst() {
        return this.knex(this.tableName).first();
    }

    // Obtener un registro por ID
    async findById(id) {
        const record = await this.knex(this.tableName).where({ id }).first();

        if (!record) {
            throw new AppError(`${this.tableName} record not found`, 404);
        }

        const fieldValues = await this.knex("field_values as fv")
            .join("fields as f", "fv.field_id", "f.id")
            .where("fv.record_id", id)
            .select("f.name as field_name", "fv.value");

        fieldValues.forEach((fv) => {
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
            throw new AppError(`${this.tableName} record not found`, 404);
        }

        await this.saveCustomFields(id, data);

        return this.findById(id);
    }

    // Papelera: mover a papelera (Soft Delete) con trazabilidad
    async bin(id, userId = null) {
        return this.updateBinStatus(id, {
            deleted_at: this.knex.fn.now(),
            deleted_by: userId
        });
    }

    // Papelera: restaurar de papelera
    async restore(id) {
        return this.updateBinStatus(id, {
            deleted_at: null,
            deleted_by: null
        });
    }

    // Papelera: eliminación permanente (Hard Delete)
    async permanentDelete(id) {
        // Primero eliminamos los campos personalizados asociados
        await this.knex("field_values").where({ record_id: id }).del();

        const deletedCount = await this.knex(this.tableName).where({ id }).del();

        if (deletedCount === 0) {
            throw new AppError(`${this.tableName} record with id ${id} not found`, 404);
        }

        return deletedCount;
    }

    // Actualizar estado de papelera (Soft Delete logic)
    async updateBinStatus(id, data) {
        
        const updatedCount = await this.knex(this.tableName)
            .where({ id })
            .update(data);

        if (updatedCount === 0) {
            throw new AppError(
                `${this.tableName} record with id ${id} not found`,
                404
            );
        }

        return this.findById(id);
    }

    // Eliminar un registro (Legacy method, defaults to Hard Delete for field_values but check logic)
    async delete(id) {
        return this.permanentDelete(id);
    }
}

export default BaseModel;
