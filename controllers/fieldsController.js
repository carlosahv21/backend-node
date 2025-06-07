// controllers/fieldsController.js
const BaseController = require('./BaseController');

class fieldsController extends BaseController {
    constructor() {
        super('fields');
    }

    async create(req, res) {
        try {
            const data = req.body;

            let rules = [];

            // Si es requerido
            if (data.required) {
                rules.push('required');
            }

            // Según tipo
            switch (data.type) {
                case 'email':
                    rules.push('email');
                    break;
                case 'number':
                case 'integer':
                    rules.push('integer');
                    // reglas opcionales
                    // enviar desde el frontend
                    break;
                case 'text':
                    rules.push('string');
                    // reglas opcionales
                    // enviar desde el frontend
                    break;
                case 'select':
                    // Revisar si hay options
                    rules.push('in:opcion1,opcion2'); // opcional, solo si manejas options
                    break;
                case 'textarea':
                    // reglas opcionales
                    // enviar desde el frontend
                    break;
                case 'image':
                    rules.push('jpg|png|jpeg|gif'); 
                    // enviar desde el frontend
                    break;
                case 'date':
                    rules.push('date');
                    break;
                case 'time':
                    rules.push('time');
                    break;
            }

            // Asignar el resultado como string con pipe
            data.validation_rules = rules.join('|');
            
            // Insertar en DB
            const result = await this.knex(this.tableName).insert(data);

            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error("Error al crear campo:", error);
            res.status(500).json({ success: false, message: "Error al crear el campo" });
        }
    };


    async getFieldsByModule (req, res) {
        const module_id = req.params.id;

        try {
            // Obtener el nombre y el ID del módulo
            const module = await this.knex('modules')
                .where({ id: module_id })
                .select('id', 'name')
                .first();

            if (!module) {
                return res.status(404).json({ success: false, message: 'Module not found' });
            }

            // Obtener los bloques asociados al módulo
            const blocks = await this.knex('blocks')
                .where({ module_id: module_id })
                .select('id', 'name', 'collapsible', 'display_mode'); // Nuevos atributos de configuración

            // Para cada bloque, obtener los campos asociados
            const blocksWithFields = await Promise.all(
                blocks.map(async (block) => {
                    const fields = await this.knex('fields')
                        .where({ block_id: block.id })
                        .select(
                            'id', 'block_id', 'name', 'label', 'type',
                            'required', 'placeholder', 'visible', 'order_sequence',
                            'options', 'default_value', 'validation_rules',
                            'helper_text', 'editable', 'readonly', 'hidden'
                        );

                    return {
                        block_id: block.id,
                        block_name: block.name,
                        collapsible: block.collapsible, // Permite que los bloques se colapsen en el frontend
                        display_mode: block.display_mode || 'edit', // Define el modo de visualización por defecto
                        fields: fields.map(field => ({
                            field_id: field.id,
                            name: field.name,
                            label: field.label,
                            type: field.type,
                            required: field.required,
                            placeholder: field.placeholder,
                            visible: field.visible,
                            order_sequence: field.order_sequence,
                            options: field.options,
                            default_value: field.default_value,
                            validation_rules: field.validation_rules,
                            helper_text: field.helper_text,
                            editable: field.editable ?? true, // Define si el campo es editable
                            readonly: field.readonly ?? false, // Define si el campo es de solo lectura
                            hidden: field.hidden ?? false // Define si el campo está oculto
                        }))
                    };
                })
            );

            res.json({
                success: true,
                module: {
                    module_id: module.id,
                    module_name: module.name,
                    blocks: blocksWithFields
                }
            });
        } catch (error) {
            console.error("Error al obtener los campos:", error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los campos del módulo.',
            });
        }
    }
}

module.exports = new fieldsController();