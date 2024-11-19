// controllers/fieldsController.js

const knex = require('../db/knex');

// Obtener todos los campos de un módulo
exports.getFieldsByModule = async (req, res) => {
    const { module_id } = req.params;

    try {
        // Obtener el nombre y el ID del módulo
        const module = await knex('modules')
            .where({ id: module_id })
            .select('id', 'name')
            .first();

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // Obtener los bloques asociados al módulo
        const blocks = await knex('blocks')
            .where({ module_id })
            .select('id', 'name', 'collapsible', 'display_mode'); // Nuevos atributos de configuración

        // Para cada bloque, obtener los campos asociados
        const blocksWithFields = await Promise.all(
            blocks.map(async (block) => {
                const fields = await knex('fields')
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
};

// Crear un nuevo campo
exports.createField = async (req, res) => {
    try {
        const { moduleId, name, type, label, required, unique, description, options } = req.body;

        // Validar que el módulo exista
        const module = await knex('modules')
            .where('id', moduleId)
            .first();

        if (!module) {
            return res.status(404).json({ message: 'Módulo no encontrado' });
        }

        // Validar que el nombre del campo no esté en uso
        const fieldExists = await knex('fields')
            .where('name', name)
            .where('module_id', moduleId)
            .first();

        if (fieldExists) {
            return res.status(400).json({ message: 'El nombre del campo ya está en uso' });
        }

        // Crear un nuevo campo en la tabla de campos
        const [newField] = await knex('fields')
            .insert({ name, type, label, required, unique, description, options, module_id: moduleId })
            .returning('*');

        res.status(201).json(newField);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el campo', error });
    }
};

// Actualizar un campo existente
exports.updateField = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, label, required, unique, description, options } = req.body;

        // Validar que el campo exista
        const field = await knex('fields')
            .where('id', id)
            .first();

        if (!field) {
            return res.status(404).json({ message: 'Campo no encontrado' });
        }

        // Actualizar el campo en la tabla de campos
        const [updatedField] = await knex('fields')
            .where('id', id)
            .update({ name, type, label, required, unique, description, options })
            .returning('*');

        if (!updatedField) {
            return res.status(404).json({ message: 'Campo no encontrado' });
        }

        res.json(updatedField);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el campo', error });
    }
};

// Eliminar un campo
exports.deleteField = async (req, res) => {
    try {
        const { id } = req.params;

        // Eliminar el campo de la tabla de campos
        const deletedCount = await knex('fields')
            .where('id', id)
            .del();

        if (deletedCount === 0) {
            return res.status(404).json({ message: 'Campo no encontrado' });
        }

        res.status(204).send(); // No retorna contenido después de eliminar
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el campo', error });
    }
};