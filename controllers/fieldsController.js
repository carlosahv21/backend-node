// controllers/fieldsController.js
const BaseController = require('./BaseController');

class fieldsController extends BaseController {
    constructor() {
        super('fields');
    }

    /*
    * Crea un nuevo campo en la base de datos.
    */
    async create(req, res) {
        try {
            const data = req.body;

            // Validar campos mínimos
            if (!data.name || !data.label || !data.type || !data.block_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan datos obligatorios: name, label, type o block_id.'
                });
            }

            // Agregar valor por defecto para required si no se envía
            if (data.required === undefined) {
                data.required = false;
            }

            // Convertir opciones a JSON si vienen como array
            if (data.options && Array.isArray(data.options)) {
                data.options = JSON.stringify(data.options);
            }

            // Tomar el ultimo número de campo para el módulo
            const lastCfNumber = await this.knex('custom_field_counters').first();
            data.name = `cf_${lastCfNumber.last_cf_number}`;
            // Actualizar el contador de campos personalizados
            await this.knex('custom_field_counters')
                .where({ id: lastCfNumber.id })
                .update({ last_cf_number: lastCfNumber.last_cf_number + 2 });

            // ⚠️ Eliminar module_id antes de insertar
            delete data.module_id;

            // Insertar en la base de datos
            const result = await this.knex(this.tableName).insert(data);

            res.status(201).json({
                success: true,
                message: 'Campo creado correctamente',
                data: result
            });
        } catch (error) {
            console.error("❌ Error al crear campo:", error);
            res.status(500).json({
                success: false,
                message: "Error al crear el campo",
                error: error.message,
            });
        }
    }


    /*
    * Actualiza un campo en la base de datos.
    */
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;

            // Siempre eliminar module_id para no permitir cambiarlo
            delete data.module_id;

            // Actualizar en la base de datos
            const result = await this.knex(this.tableName)
                .where({ id })
                .update(data);

            res.status(200).json({
                success: true,
                message: 'Campo actualizado correctamente',
                data: result
            });
        } catch (error) {
            console.error("❌ Error al actualizar campo:", error);
            res.status(500).json({
                success: false,
                message: "Error al actualizar el campo",
                error: error.message,
            });
        }
    }

    /*
    * Obtiene todos los bloques con sus campos asociados por módulo.
    */
    async getFieldsByModule(req, res) {
        const { id: module_id } = req.params;

        try {
            // 1️⃣ Obtener información del módulo (incluido parent_module_id)
            const module = await this.knex('modules')
                .where({ id: module_id })
                .select('id', 'name', 'parent_module_id')
                .first();

            if (!module) {
                return res.status(404).json({
                    success: false,
                    message: 'Módulo no encontrado',
                });
            }

            // 2️⃣ Traer bloques propios del módulo
            let blocks = await this.knex('blocks')
                .where({ module_id })
                .select('id', 'name', 'collapsible', 'display_mode');

            // 3️⃣ Si el módulo tiene padre, traer bloques heredados
            if (module.parent_module_id) {
                const parentBlocks = await this.knex('blocks')
                    .where({ module_id: module.parent_module_id })
                    .select('id', 'name', 'collapsible', 'display_mode');

                // Marcar bloques heredados y combinar
                blocks = [
                    ...parentBlocks.map(b => ({ ...b, inherited: true })),
                    ...blocks.map(b => ({ ...b, inherited: false }))
                ];
            } else {
                blocks = blocks.map(b => ({ ...b, inherited: false }));
            }

            // 4️⃣ Para cada bloque, traer campos (heredados también)
            const blocksWithFields = await Promise.all(
                blocks.map(async (block) => {
                    let fields = await this.knex('fields')
                        .where({ block_id: block.id })
                        .select(
                            'id', 'block_id', 'name', 'label', 'type', 'options', 'required', 'order_sequence'
                        );

                    // Excepción: si hay un campo 'role', llenamos las opciones desde la tabla roles
                    fields = await Promise.all(fields.map(async field => {
                        if (field.name === 'role') {
                            const roles = await this.knex('roles').select('name');
                            field.options = roles.map(r => r.name); // ["Admin", "Manager", "User"]
                        }
                        return {
                            ...field,
                            inherited: block.inherited // campos heredan la propiedad del bloque
                        };
                    }));

                    return {
                        block_id: block.id,
                        block_name: block.name,
                        collapsible: block.collapsible,
                        display_mode: block.display_mode || 'edit',
                        inherited: block.inherited,
                        fields: fields.map(field => ({
                            field_id: field.id,
                            name: field.name,
                            label: field.label,
                            type: field.type,
                            options: field.options,
                            required: field.required,
                            order_sequence: field.order_sequence,
                            inherited: field.inherited
                        }))
                    };
                })
            );

            // 5️⃣ Responder con la estructura final
            res.json({
                success: true,
                module: {
                    module_id: module.id,
                    module_name: module.name,
                    blocks: blocksWithFields
                }
            });

        } catch (error) {
            console.error("❌ Error al obtener campos del módulo:", error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los campos del módulo.',
                error: error.message,
            });
        }
    }


}

module.exports = new fieldsController();
