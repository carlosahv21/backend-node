import fieldRepository from './field.repository.js';
import AppError from "../../../shared/utils/AppError.js";

class FieldService {
    async getAllFields(queryParams) {
        return fieldRepository.findAll(queryParams);
    }

    async getFieldById(id) {
        return fieldRepository.findById(id);
    }

    async createField(data) {
        if (!data.name || !data.label || !data.type || !data.block_id) {
            throw new AppError('Faltan datos obligatorios: name, label, type o block_id.', 400);
        }

        if (data.required === undefined) {
            data.required = false;
        }
        if (data.options && Array.isArray(data.options)) {
            data.options = JSON.stringify(data.options);
        }

        const lastCounter = await fieldRepository.findCustomFieldCounter();
        const nextCfNumber = lastCounter.last_cf_number + 1;

        data.name = `cf_${nextCfNumber}`;
        await fieldRepository.updateCustomFieldCounter(lastCounter.id, nextCfNumber + 1);

        delete data.module_id;

        return fieldRepository.create(data);
    }

    async updateField(id, data) {
        delete data.block_id;
        delete data.name;

        if (data.options && Array.isArray(data.options)) {
            data.options = JSON.stringify(data.options);
        }

        return fieldRepository.update(id, data);
    }

    async deleteField(id) {
        return fieldRepository.delete(id);
    }

    async getModuleFields(moduleName) {
        const module = await fieldRepository.findModuleByName(moduleName);
        if (!module) {
            throw new AppError('Módulo no encontrado', 404);
        }

        let blocks = await fieldRepository.findBlocksByModuleId(module.id);
        blocks = blocks.map(b => ({ ...b, inherited: false }));

        if (module.parent_module_id) {
            const parentBlocks = await fieldRepository.findBlocksByModuleId(module.parent_module_id);
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

        const roles = await fieldRepository.findRoles();
        const roleOptions = roles.map(r => r.name);

        const blocksWithFields = await Promise.all(
            blocks.map(async (block) => {
                let fields = await fieldRepository.findFieldsByBlockId(block.id);
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
                    return { ...field, inherited: block.inherited };
                });

                return {
                    block_id: block.id, block_name: block.name, collapsible: block.collapsible,
                    display_mode: block.display_mode || 'edit', inherited: block.inherited,
                    fields: fields.map(field => ({
                        field_id: field.id, name: field.name, label: field.label, type: field.type,
                        options: field.options, relation_config: field.relation_config,
                        required: field.required, order_sequence: field.order_sequence, inherited: field.inherited
                    }))
                };
            })
        );

        return { module_id: module.id, module_name: module.name, blocks: blocksWithFields };
    }

    async getRelationField(config, searchQuery) {
        try {
            return await fieldRepository.findRelationField(config, searchQuery);
        } catch (error) {
            throw new AppError('Error de base de datos al buscar opciones de relación.', 500);
        }
    }

    async binField(id, userId) {
        return fieldRepository.bin(id, userId);
    }

    async restoreField(id) {
        return fieldRepository.restore(id);
    }

    async reorderFields(updates) {
        if (!Array.isArray(updates) || updates.length === 0) {
            throw new AppError('Se requiere un array de actualizaciones válido.', 400);
        }
        updates.forEach(u => {
            if (!u.id || u.order_sequence === undefined) {
                throw new AppError('Cada actualización debe contener id y order_sequence.', 400);
            }
        });
        return fieldRepository.bulkUpdateOrder(updates);
    }

    async reorderFieldsInBlock(blockId, fieldIds) {
        if (!Array.isArray(fieldIds) || fieldIds.length === 0) {
            throw new AppError('Se requiere un array field_ids válido.', 400);
        }
        const updates = fieldIds.map((id, index) => ({ id, order_sequence: index + 1 }));
        return fieldRepository.bulkUpdateOrderInBlock(blockId, updates);
    }
}

export default new FieldService();