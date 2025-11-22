// controllers/blockController.js
import blockService from '../services/blockService.js';
import utilsCustomError from '../utils/utilsCustomError.js';

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
            res.status(200).json(result);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Obtiene un bloque por ID.
     */
    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const block = await blockService.getBlockById(id);
            res.status(200).json(block);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }


    /**
     * Crea un nuevo bloque, delegando la lógica de 'order' al servicio.
     */
    async create(req, res, next) {
        try {
            const newBlock = await blockService.createBlock(req.body);

            res.status(201).json({
                message: "Bloque creado correctamente",
                block: newBlock
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Actualiza un bloque.
     */
    async update(req, res, next) {
        try {
            await blockService.updateBlock(req.params.id, req.body);

            res.status(200).json({
                message: "Bloque actualizado correctamente"
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Elimina un bloque.
     */
    async delete(req, res, next) {
        try {
            await blockService.deleteBlock(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }
}

export default new BlockController();