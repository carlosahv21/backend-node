import BaseModel from "../../../shared/models/baseModel.js";
import { getModelInstance } from "../../../shared/utils/utilsModelRegistry.js";

class FieldRepository extends BaseModel {
    constructor() {
        super('fields');
        this.softDelete = false;
        this.joins = [];
        this.selectFields = ['fields.*'];
        this.searchFields = ['fields.name', 'fields.label'];
    }

    async findCustomFieldCounter() {
        const counter = await this.knex('custom_field_counters').first();
        if (!counter) {
            throw new Error('La tabla custom_field_counters está vacía');
        }
        return counter;
    }

    async updateCustomFieldCounter(id, newCount) {
        return this.knex('custom_field_counters').where({ id }).update({ last_cf_number: newCount });
    }

    async findModuleByName(moduleName) {
        return this.knex('modules').where({ name: moduleName }).select('id', 'name', 'parent_module_id').first();
    }

    async findBlocksByModuleId(moduleId) {
        return this.knex('blocks').where({ module_id: moduleId }).select('id', 'name', 'collapsible', 'display_mode', 'order');
    }

    async findFieldsByBlockId(blockId) {
        return this.knex('fields').where({ block_id: blockId }).select('id', 'block_id', 'name', 'label', 'type', 'options', 'relation_config', 'required', 'order_sequence').orderBy('order_sequence');
    }

    async findRoles() {
        return this.knex('roles').select('name');
    }

    async findFieldsByModuleName(moduleName) {
        return this.knex('fields').join('blocks', 'fields.block_id', 'blocks.id').join('modules', 'blocks.module_id', 'modules.id').where('modules.name', moduleName).select('fields.id', 'fields.block_id', 'fields.name', 'fields.label', 'fields.type', 'fields.options', 'fields.relation_config', 'fields.required', 'fields.order_sequence', 'blocks.name as block_name').orderBy('blocks.order').orderBy('fields.order_sequence');
    }

    async findFieldsForValidation(moduleId) {
        return this.knex('fields').join('blocks', 'fields.block_id', 'blocks.id').where('blocks.module_id', moduleId).select('fields.name', 'fields.type', 'fields.options', 'fields.relation_config', 'fields.required');
    }

    async findFieldsByBlockName(blockName, moduleName) {
        return this.knex('fields').join('blocks', 'fields.block_id', 'blocks.id').join('modules', 'blocks.module_id', 'modules.id').where({ 'blocks.name': blockName, 'modules.name': moduleName }).select('fields.name', 'fields.type', 'fields.options', 'fields.relation_config', 'fields.required').orderBy('fields.order_sequence');
    }

    async findRelationField(config, searchQuery) {
        const { table, filters, limit, value_field, display_field, display_alias } = config;

        const targetModel = getModelInstance(table);
        const relationMap = targetModel?.relationMaps?.default || {};
        const joins = relationMap.joins || [];
        const columnMap = relationMap.column_map || {};

        let query = this.knex(table);

        if (targetModel && targetModel._isTenantScoped) {
            query = this._applyTenantFilter(query, table);
        }

        if (targetModel && targetModel.softDelete) {
            query = query.whereNull(`${table}.deleted_at`);
        }

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
            query = query.whereRaw(`${display_field} ilike ?`, [`%${searchQuery}%`]);
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

        return rows.map(r => ({ value: r[valueKey], label: r[labelKey] }));
    }

    async bulkUpdateOrder(updates) {
        return this.knex.transaction(async (trx) => {
            const promises = updates.map(update => {
                return trx('fields').where({ id: update.id }).update({ order_sequence: update.order_sequence });
            });
            return Promise.all(promises);
        });
    }

    async bulkUpdateOrderInBlock(blockId, updates) {
        return this.knex.transaction(async (trx) => {
            const ids = updates.map(u => u.id);
            const existing = await trx('fields').where({ block_id: blockId }).whereIn('id', ids).select('id');

            if (existing.length !== ids.length) {
                const foundIds = new Set(existing.map(e => e.id));
                const missing = ids.filter(id => !foundIds.has(id));
                throw new Error(`Field IDs not found in block ${blockId}: ${missing.join(', ')}`);
            }

            const promises = updates.map(update => {
                return trx('fields').where({ id: update.id, block_id: blockId }).update({ order_sequence: update.order_sequence });
            });
            return Promise.all(promises);
        });
    }
}

export default new FieldRepository();