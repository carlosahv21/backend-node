import blockService from './block.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class BlockController {
    async getAll(req, res, next) {
        try {
            const result = await blockService.getAllBlocks(req.query);
            ApiResponse.success(res, 200, "Bloques obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const block = await blockService.getBlockById(id);
            ApiResponse.success(res, 200, "Bloque obtenido correctamente", block);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res, next) {
        try {
            const newBlock = await blockService.createBlock(req.body);
            ApiResponse.success(res, 201, "Bloque creado correctamente", { block: newBlock });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async update(req, res, next) {
        try {
            await blockService.updateBlock(req.params.id, req.body);
            ApiResponse.success(res, 200, "Bloque actualizado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res, next) {
        try {
            await blockService.deleteBlock(req.params.id);
            ApiResponse.success(res, 204, "Bloque eliminado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async bin(req, res, next) {
        try {
            const result = await blockService.binBlock(req.params.id);
            ApiResponse.success(res, 200, "Bloque movido a papelera correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async restore(req, res, next) {
        try {
            const result = await blockService.restoreBlock(req.params.id);
            ApiResponse.success(res, 200, "Bloque restaurado correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new BlockController();