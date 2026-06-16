import blockRepository from './block.repository.js';
import AppError from "../../../shared/utils/AppError.js";

class BlockService {
    async getAllBlocks(queryParams) {
        return blockRepository.findAll(queryParams);
    }

    async createBlock(data) {
        const { module_id, name, description } = data;

        if (!module_id || !name) {
            throw new AppError('module_id y name son campos requeridos para un bloque', 400);
        }

        const lastBlock = await blockRepository.findLastBlockInModule(module_id);
        const nextOrder = lastBlock ? lastBlock.order + 1 : 0;

        const blockData = {
            module_id,
            name: name,
            description: description || '',
            order: nextOrder,
            collapsible: false,
            display_mode: 'edit',
        };

        return blockRepository.create(blockData);
    }

    async getBlockById(id) {
        return blockRepository.findById(id);
    }

    async updateBlock(id, data) {
        return blockRepository.update(id, data);
    }

    async binBlock(id) {
        return blockRepository.bin(id);
    }

    async restoreBlock(id) {
        return blockRepository.restore(id);
    }

    async deleteBlock(id) {
        return blockRepository.delete(id);
    }
}

export default new BlockService();