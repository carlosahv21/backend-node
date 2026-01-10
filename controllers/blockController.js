// controllers/blockController.js
import blockService from '../services/blockService.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Clase controladora para Bloques.
 */
class BlockController {

    /**
     * Obtiene todos los bloques.
     */
    async getAll(req, res, next) {
        try {
            const result = await blockService.getAllBlocks(req.query);
            ApiResponse.success(res, 200, "Bloques obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Obtiene un bloque por ID.
     */
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


    /**
     * Crea un nuevo bloque, delegando la lógica de 'order' al servicio.
     */
    async create(req, res, next) {
        try {
            const newBlock = await blockService.createBlock(req.body);
            ApiResponse.success(res, 201, "Bloque creado correctamente", { block: newBlock });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Actualiza un bloque.
     */
    async update(req, res, next) {
        try {
            await blockService.updateBlock(req.params.id, req.body);
            ApiResponse.success(res, 200, "Bloque actualizado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Elimina un bloque.
     */
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