// models/fieldModel.js
const BaseModel = require('./BaseModel');

class FieldModel extends BaseModel {
    constructor() {
        super('fields'); // Usa la tabla 'fields'

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
            throw new Error('La tabla custom_field_counters está vacía.');
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
            .where({ block_id })
            .select(
                'id', 'block_id', 'name', 'label', 'type', 'options', 'required', 'order_sequence'
            )
            .orderBy('order_sequence'); // Ordenar por la secuencia
    }

    /**
     * Obtiene todos los roles para llenar las opciones dinámicas.
     */
    async findRoles() {
        return this.knex('roles').select('name');
    }
}

module.exports = new FieldModel();