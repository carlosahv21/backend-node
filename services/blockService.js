// services/blockService.js
import blockModel from '../models/blockModel.js';
import utilsCustomError from '../utils/utilsCustomError.js';

/**
 * Obtiene todos los bloques (con paginación, búsqueda, filtros).
 */
const getAllBlocks = async (queryParams) => {
    return blockModel.findAll(queryParams);
};

/**
 * Crea un nuevo bloque, calculando su campo 'order' automáticamente.
 */
const createBlock = async (data) => {
    const { module_id, name, description } = data;

    if (!module_id || !name) {
        throw new utilsCustomError('module_id y name son campos requeridos para un bloque', 400);
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
const getBlockById = async (id) => {
    return blockModel.findById(id);
};

/**
 * Actualiza un bloque existente.
 */
const updateBlock = async (id, data) => {
    return blockModel.update(id, data);
};

/**
 * Elimina un bloque por ID.
 */
const deleteBlock = async (id) => {
    return blockModel.delete(id);
};


export default {
    getAllBlocks,
    createBlock,
    getBlockById,
    updateBlock,
    deleteBlock,
};