import fieldModel from '../models/fieldModel.js';
import utilsCustomError from '../utils/utilsCustomError.js';

const getAllFields = async (queryParams) => {
    return fieldModel.findAll(queryParams);
};

const getFieldById = async (id) => {
    return fieldModel.findById(id);
};


/**
 * Crea un nuevo campo, manejando el nombre 'cf_X' y el contador.
 */
const createField = async (data) => {
    if (!data.name || !data.label || !data.type || !data.block_id) {
        throw new utilsCustomError('Faltan datos obligatorios: name, label, type o block_id.', 400);
    }

    if (data.required === undefined) {
        data.required = false;
    }
    if (data.options && Array.isArray(data.options)) {
        data.options = JSON.stringify(data.options);
    }

    const lastCounter = await fieldModel.findCustomFieldCounter();
    const nextCfNumber = lastCounter.last_cf_number + 1;

    data.name = `cf_${nextCfNumber}`;
    await fieldModel.updateCustomFieldCounter(lastCounter.id, nextCfNumber + 1);

    delete data.module_id;

    const newField = await fieldModel.create(data);

    return newField;
};

/**
 * Actualiza un campo existente, limpiando datos no permitidos.
 */
const updateField = async (id, data) => {
    delete data.block_id;
    delete data.name;

    if (data.options && Array.isArray(data.options)) {
        data.options = JSON.stringify(data.options);
    }

    const updatedField = await fieldModel.update(id, data);

    return updatedField;
};

/**
 * Elimina un campo por ID.
 */
const deleteField = async (id) => {
    return fieldModel.delete(id);
};

/**
 * Función compleja para obtener todos los bloques y campos, incluyendo herencia.
 */
const getModuleFields = async (moduleId) => {
    const module = await fieldModel.findModuleById(moduleId);
    if (!module) {
        throw new utilsCustomError('Módulo no encontrado', 404);
    }

    let blocks = await fieldModel.findBlocksByModuleId(moduleId);
    blocks = blocks.map(b => ({ ...b, inherited: false }));

    if (module.parent_module_id) {
        const parentBlocks = await fieldModel.findBlocksByModuleId(module.parent_module_id);
        const inheritedBlocks = parentBlocks.map(b => ({ ...b, inherited: true }));

        blocks = [...inheritedBlocks, ...blocks].reduce((acc, current) => {
            const x = acc.find(item => item.id === current.id);
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);
    }

    const roles = await fieldModel.findRoles();
    const roleOptions = roles.map(r => r.name);

    const blocksWithFields = await Promise.all(
        blocks.map(async (block) => {
            let fields = await fieldModel.findFieldsByBlockId(block.id);

            fields = fields.map(field => {
                if (field.name === 'role') {
                    field.options = roleOptions;
                }

                if (typeof field.options === 'string') {
                    try {
                        field.options = JSON.parse(field.options);
                    } catch (e) {
                        field.options = [];
                    }
                }

                return {
                    ...field,
                    inherited: block.inherited
                };
            });

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
                    relation_config: field.relation_config,
                    required: field.required,
                    order_sequence: field.order_sequence,
                    inherited: field.inherited
                }))
            };
        })
    );

    return {
        module_id: module.id,
        module_name: module.name,
        blocks: blocksWithFields
    };
};

/**
 * Obtiene las opciones de una relación, aplicando los filtros y la búsqueda.
 */
const getRelationField = async (config, searchQuery) => {
    try {
        const options = await fieldModel.findRelationField(config, searchQuery);
        return options;
    } catch (error) {
        console.error('Error al obtener opciones de relación:', error);
        throw new utilsCustomError('Error de base de datos al buscar opciones de relación.', 500);
    }
};

export default {
    getAllFields,
    getFieldById,
    createField,
    updateField,
    deleteField,
    getModuleFields,
    getRelationField
};