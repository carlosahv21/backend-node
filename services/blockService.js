// services/blockService.js
import blockModel from '../models/blockModel.js';
import AppError from '../utils/AppError.js';

class blockService {
    /**
     * Obtiene todos los bloques (con paginación, búsqueda, filtros).
     */
    async getAllBlocks(queryParams) {
        return blockModel.findAll(queryParams);
    };

    /**
     * Crea un nuevo bloque, calculando su campo 'order' automáticamente.
     */
    async createBlock(data) {
        const { module_id, name, description } = data;

        if (!module_id || !name) {
            throw new AppError('module_id y name son campos requeridos para un bloque', 400);
        }

        const lastBlock = await blockModel.findLastBlockInModule(module_id);
        const nextOrder = lastBlock ? lastBlock.order + 1 : 0;

        const blockData = {
            module_id,
            name: name,
            description: description || '',
            order: nextOrder,
            collapsible: false, // Valores por defecto
            display_mode: 'edit', // Valores por defecto
        };

        const newBlock = await blockModel.create(blockData);

        return newBlock;
    };

    /**
     * Obtiene un bloque por ID.
     */
    async getBlockById(id) {
        return blockModel.findById(id);
    };

    /**
     * Actualiza un bloque existente.
     */
    async updateBlock(id, data) {
        return blockModel.update(id, data);
    };

    // Elimina un bloque por ID.
    async binBlock(id) {
        return blockModel.bin(id);
    };

    // Restaura un bloque por ID.
    async restoreBlock(id) {
        return blockModel.restore(id);
    };

    async deleteBlock(id) {
        return blockModel.delete(id);
    };

}

export default new blockService();
