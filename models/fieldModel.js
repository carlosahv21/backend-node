// models/fieldModel.js
import BaseModel from './baseModel.js';
import { getModelInstance } from '../utils/utilsModelRegistry.js';

class FieldModel extends BaseModel {
    constructor() {
        super('fields'); // Usa la tabla 'fields'
        this.softDelete = false;

        // Configuración de consultas
        this.joins = [];
        this.selectFields = ['fields.*'];
        this.searchFields = ['fields.name', 'fields.label'];
    }

    /**
     * Obtiene el registro actual del contador de campos personalizados.
     */
    async findCustomFieldCounter() {
        const counter = await this.knex('custom_field_counters').first();
        if (!counter) {
            throw new Error('La tabla custom_field_counters está vacía');
        }
        return counter;
    }

    /**
     * Actualiza el contador de campos personalizados después de usarlo.
     */
    async updateCustomFieldCounter(id, newCount) {
        return this.knex('custom_field_counters')
            .where({ id })
            .update({ last_cf_number: newCount });
    }

    /**
     * Obtiene la información básica de un módulo.
     */
    async findModuleById(moduleId) {
        return this.knex('modules')
            .where({ id: moduleId })
            .select('id', 'name', 'parent_module_id')
            .first();
    }

    /**
     * Obtiene bloques por ID de módulo (usado para bloques propios y heredados).
     */
    async findBlocksByModuleId(moduleId) {
        return this.knex('blocks')
            .where({ module_id: moduleId })
            .select('id', 'name', 'collapsible', 'display_mode', 'order');
    }

    /**
     * Obtiene los campos para un bloque específico.
     */
    async findFieldsByBlockId(blockId) {
        return this.knex('fields')
            .where({ block_id: blockId })
            .select(
                'id', 'block_id', 'name', 'label', 'type', 'options', 'relation_config', 'required', 'order_sequence'
            )
            .orderBy('order_sequence'); // Ordenar por la secuencia
    }

    /**
     * Obtiene todos los roles para llenar las opciones dinámicas.
     */
    async findRoles() {
        return this.knex('roles').select('name');
    }

    /**
     * Obtiene la configuración de una relación.
     */
    async findRelationField(config, searchQuery) {
        const {
            table,
            filters,
            limit,
            value_field,
            display_field,
            display_alias
        } = config;

        const targetModel = getModelInstance(table);
        const relationMap = targetModel?.relationMaps?.default || {};

        const joins = relationMap.joins || [];
        const columnMap = relationMap.column_map || {};

        let query = this.knex(table);

        if (joins.length > 0) {
            joins.forEach(j => {
                query = query.leftJoin(`${j.table} as ${j.alias}`, j.on[0], j.on[1]);
            });
        }

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                const column = columnMap[key] || key;
                query = query.where(column, value);
            });
        }

        if (searchQuery) {
            query = query.whereRaw(`${display_field} like ?`, [`%${searchQuery}%`]);
        }

        if (limit) query = query.limit(limit);

        const selectFields = [value_field];

        const valueKey = value_field.split('.').pop();
        let labelKey;

        if (display_alias) {
            labelKey = display_alias;
            selectFields.push(this.knex.raw(`${display_field} AS ??`, [display_alias]));
        } else {
            labelKey = display_field.split('.').pop();
            selectFields.push(display_field);
        }

        query = query.select(selectFields);

        const rows = await query;

        return rows.map(r => ({
            value: r[valueKey],
            label: r[labelKey]
        }));
    }
}

export default new FieldModel();