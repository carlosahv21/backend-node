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
        // Columna usada por el filtro date_range. Los modelos hijos pueden sobreescribir esto.
        this.dateRangeColumn = null;
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
        const tenantId = this._getTenantId();

        for (const rule of this.validations) {
            const handler = validationHandlers[rule.name || rule];

            if (typeof handler !== "function") continue;

            const message = await handler(
                this.knex,
                this.tableName,
                data,
                rule.config || {},
                tenantId
            );

            if (message) {
                throw new AppError(message, 409);
            }
        }
    }

    // --- Helpers de Fecha ---------------------------------------------------

    /**
     * Convierte un preset de fecha (ej: "this_month") en { startDate, endDate }.
     * Retorna null si el valor no es un preset conocido.
     */
    _resolveDateRange(preset) {
        const DATE_PRESETS = new Set(["today", "yesterday", "this_week", "this_month", "last_month", "this_year"]);
        if (!DATE_PRESETS.has(preset)) return null;

        const nowTs = Date.now();
        let startDate, endDate;

        switch (preset) {
            case "today": {
                const d = new Date(nowTs);
                startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
                endDate   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
                break;
            }
            case "yesterday": {
                const d = new Date(nowTs);
                d.setDate(d.getDate() - 1);
                startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
                endDate   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
                break;
            }
            case "this_week": {
                const d = new Date(nowTs);
                const day = d.getDay();
                const diffToMonday = day === 0 ? -6 : 1 - day;
                const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diffToMonday, 0, 0, 0, 0);
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                sunday.setHours(23, 59, 59, 999);
                startDate = monday;
                endDate   = sunday;
                break;
            }
            case "this_month": {
                const d = new Date(nowTs);
                startDate = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
                endDate   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
                break;
            }
            case "last_month": {
                const d = new Date(nowTs);
                startDate = new Date(d.getFullYear(), d.getMonth() - 1, 1, 0, 0, 0, 0);
                endDate   = new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999);
                break;
            }
            case "this_year": {
                const d = new Date(nowTs);
                startDate = new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
                endDate   = new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
                break;
            }
        }

        return { startDate, endDate };
    }

    _buildQuery({
        search,
        isCount = false,
        order_by,
        order_direction = "asc",
        ...queryParams
    }) {
        let query = this.knex(this.tableName);

        // Aplicar JOINs definidos en el modelo hijo via this.joins
        if (Array.isArray(this.joins) && this.joins.length > 0) {
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
            const normalizedQuery = search.replace(/\+/g, " ").trim();
            query = query.where((builder) => {
                this.searchFields.forEach((field, index) => {
                    if (index === 0) builder.where(field, "ilike", `%${normalizedQuery}%`);
                    else builder.orWhere(field, "ilike", `%${normalizedQuery}%`);
                });
            });
        }

        Object.keys(otherQueryParams).forEach((key) => {
            if (
                ["search", "page", "limit", "order_by", "order_direction", "withDeleted", "onlyDeleted", "date_range"].includes(key)
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

            // Si el valor es un preset de fecha, aplicar lógica de rango en lugar de WHERE literal.
            // Esto permite enviar ej: payment_date=this_month y resolverlo con el columnName correcto.
            const dateRange = this._resolveDateRange(value);
            if (dateRange) {
                const { startDate, endDate } = dateRange;
                if (startDate) query = query.where(columnName, ">=", startDate);
                if (endDate)   query = query.where(columnName, "<=", endDate);
            } else {
                query = query.where(columnName, value);
            }
        });

        // ── DATE RANGE FILTERING (via ?date_range=preset) ─────────────────
        if (queryParams.date_range) {
            // Los modelos hijos pueden definir `this.dateRangeColumn` para apuntar
            // a un campo distinto de created_at (ej: "pay.payment_date").
            const dateColumn =
                this.dateRangeColumn ||
                (this.filterMapping && this.filterMapping["created_at"]) ||
                `${this.tableName}.created_at`;

            const dateRange = this._resolveDateRange(queryParams.date_range);
            if (dateRange) {
                const { startDate, endDate } = dateRange;
                if (startDate) query = query.where(dateColumn, ">=", startDate);
                if (endDate)   query = query.where(dateColumn, "<=", endDate);
            }
        }
        // ─────────────────────────────────────────────────────────────────

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

    /**
     * Guarda campos personalizados (cf_*) en la tabla field_values.
     * Recibe directamente el objeto de campos personalizados ya filtrado por splitFields.
     */
    async saveCustomFields(recordId, customFields) {
        if (!customFields || Object.keys(customFields).length === 0) return;

        await this.knex.transaction(async (trx) => {
            for (const [name, value] of Object.entries(customFields)) {
                const field = await trx("fields").where({ name }).first();
                if (!field) continue;

                await trx("field_values")
                    .insert({ field_id: field.id, record_id: recordId, value })
                    .onConflict(["field_id", "record_id"])
                    .merge({ value });
            }
        });
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

        // Construimos la query base una sola vez y clonamos para evitar
        // reconstruir desde cero (y duplicar JOINs / filtros costosos).
        const baseQuery = this._buildQuery(filters);

        const [results, totalRes] = await Promise.all([
            baseQuery.clone().limit(limit).offset((page - 1) * limit),
            baseQuery.clone().clearSelect().clearOrder().count("* as count").first(),
        ]);

        return {
            data: results,
            total: parseInt(totalRes.count),
            page: parseInt(page),
            limit: parseInt(limit),
        };
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

        const { standardFields, customFields } = this.splitFields(data);

        // ── TENANT ISOLATION ─────────────────────────────────────────────
        // Inyectar academy_id automáticamente en el insert si la tabla es scoped
        // y hay un contexto de petición activo. No sobreescribe un valor existente
        // para permitir seeds/migraciones que asignan academy_id manualmente.
        const tenantId = this._getTenantId();
        if (tenantId && !standardFields.academy_id) {
            standardFields.academy_id = tenantId;
        }
        // ─────────────────────────────────────────────────────────────────

        const [record] = await this.knex(this.tableName).insert(standardFields).returning("id");
        const recordId = typeof record === "object" ? record.id : record;

        await this.saveCustomFields(recordId, customFields);

        return this.findById(recordId);
    }

    // Actualizar registro
    async update(id, data) {
        const dataWithId = { ...data, id };

        await this._runValidations(dataWithId);

        const { standardFields, customFields } = this.splitFields(data);

        // Nunca permitir que un cliente sobreescriba el academy_id de un registro
        delete standardFields.academy_id;

        let query = this.knex(this.tableName).where({ id });
        query = this._applyTenantFilter(query);

        const updatedCount = await query.update(standardFields);

        if (updatedCount === 0) {
            throw new AppError(`${this.tableName} record not found`, 404);
        }

        await this.saveCustomFields(id, customFields);

        return this.findById(id);
    }

    // Papelera: mover a papelera (Soft Delete) con trazabilidad
    async bin(id, userId = null) {
        return this.updateBinStatus(id, {
            deleted_at: this.knex.fn.now(),
            deleted_by: userId,
        });
    }

    // Papelera: restaurar de papelera
    async restore(id) {
        return this.updateBinStatus(id, {
            deleted_at: null,
            deleted_by: null,
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
