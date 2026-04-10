// models/BaseModel.js

import knex from "../config/knex.js";
import { validationHandlers } from "../utils/utilsValidations.js";
import AppError from "../utils/AppError.js";
import { getCurrentTenantId } from "../utils/tenantContext.js";

/**
 * Tablas de catálogo global que NO pertenecen a un tenant específico.
 * Estas tablas son compartidas entre todas las academias del sistema.
 */
const GLOBAL_TABLES = new Set([
    "roles",
    "permissions",
    "modules",
    "plans",
    "role_permissions",
    "knex_migrations",
    "knex_migrations_lock",
    "database_version",
]);

class BaseModel {
    constructor(tableName) {
        this.tableName = tableName;
        this.knex = knex;
        this.validations = [];
        this.softDelete = true;
        // Si la tabla es global, no aplicar filtro de tenant automáticamente
        this._isTenantScoped = !GLOBAL_TABLES.has(tableName);
    }

    // --- Helpers de Tenant ----------------------------------------------

    /**
     * Obtiene el academy_id del contexto de la petición actual.
     * Retorna null si estamos fuera de una petición HTTP (cron, seeds, etc.)
     */
    _getTenantId() {
        return this._isTenantScoped ? getCurrentTenantId() : null;
    }

    /**
     * Aplica el filtro de tenant a una query si corresponde.
     * Acepta un alias de tabla para queries con JOIN (ej: "c" para "classes as c").
     * @param {object} query - Knex query builder
     * @param {string} [tableAlias] - Alias de tabla (opcional)
     */
    _applyTenantFilter(query, tableAlias = null) {
        const tenantId = this._getTenantId();
        if (!tenantId) return query;

        const prefix = tableAlias || this.tableName;
        return query.where(`${prefix}.academy_id`, tenantId);
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

        // ── TENANT ISOLATION ─────────────────────────────────────────────
        // Aplicar el filtro de tenant automáticamente si la tabla es tenant-scoped
        // y existe un contexto de petición activo.
        query = this._applyTenantFilter(query);
        // ─────────────────────────────────────────────────────────────────

        if (
            search &&
            Array.isArray(this.searchFields) &&
            this.searchFields.length > 0
        ) {
            query = query.where((builder) => {
                this.searchFields.forEach((field, index) => {
                    const normalizedQuery = search.replace(/\+/g, ' ').trim();
                    if (index === 0) builder.where(field, "ilike", `%${normalizedQuery}%`);
                    else builder.orWhere(field, "ilike", `%${normalizedQuery}%`);
                });
            });
        }

        Object.keys(otherQueryParams).forEach((key) => {
            if (
                ["search", "page", "limit", "order_by", "order_direction", "withDeleted", "onlyDeleted"].includes(key)
            )
                return;

            let value = otherQueryParams[key];

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
    async findAll(queryParams = {}, queryModifier = null) {
        const { page = 1, limit = 10, ...filters } = queryParams;

        const query = this._buildQuery(filters);

        if (queryModifier) {
            await queryModifier(query);
        }

        const results = await query
            .clone()
            .limit(limit)
            .offset((page - 1) * limit);

        const totalQuery = this._buildQuery({ ...filters, isCount: true });

        if (queryModifier) {
            await queryModifier(totalQuery);
        }

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
        let query = this.knex(this.tableName);
        query = this._applyTenantFilter(query);
        return query.first();
    }

    // Obtener un registro por ID
    // El filtro de tenant asegura que un tenant no pueda acceder a registros de otro tenant
    // aunque conozca el UUID exacto del registro.
    async findById(id) {
        let query = this.knex(this.tableName).where({ id });
        query = this._applyTenantFilter(query);
        const record = await query.first();

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
    // Inyecta el academy_id automáticamente desde el contexto del tenant
    async create(data) {
        await this._runValidations(data);

        const { standardFields } = this.splitFields(data);
        console.log(standardFields);

        // ── TENANT ISOLATION ─────────────────────────────────────────────
        // Inyectar academy_id automáticamente en el insert si la tabla es scoped
        // y hay un contexto de petición activo. No sobreescribe un valor existente
        // para permitir seeds/migraciones que asignan academy_id manualmente.
        const tenantId = this._getTenantId();
        if (tenantId && !standardFields.academy_id) {
            standardFields.academy_id = tenantId;
        }
        // ─────────────────────────────────────────────────────────────────

        const [record] = await this.knex(this.tableName).insert(standardFields).returning('id');
        const recordId = typeof record === 'object' ? record.id : record;

        await this.saveCustomFields(recordId, data);

        return this.findById(recordId);
    }

    // Actualizar registro
    async update(id, data) {
        const dataWithId = { ...data, id: id };

        await this._runValidations(dataWithId);

        const { standardFields } = this.splitFields(data);

        // Nunca permitir que un cliente sobreescriba el academy_id de un registro
        delete standardFields.academy_id;

        let query = this.knex(this.tableName).where({ id });
        query = this._applyTenantFilter(query);

        const updatedCount = await query.update(standardFields);

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

        let query = this.knex(this.tableName).where({ id });
        query = this._applyTenantFilter(query);
        const deletedCount = await query.del();

        if (deletedCount === 0) {
            throw new AppError(`${this.tableName} record with id ${id} not found`, 404);
        }

        return deletedCount;
    }

    // Actualizar estado de papelera (Soft Delete logic)
    async updateBinStatus(id, data) {
        let query = this.knex(this.tableName).where({ id });
        query = this._applyTenantFilter(query);

        const updatedCount = await query.update(data);

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
