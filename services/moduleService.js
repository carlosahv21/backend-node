// services/moduleService.js
const moduleModel = require('../models/moduleModel');
const utilsCustomError = require('../utils/utilsCustomError');


const getAllModules = async (queryParams) => {
    return moduleModel.findAll(queryParams); 
};

const getModuleById = async (id) => {
    return moduleModel.findById(id);
};

const createModule = async (data) => {
    return moduleModel.create(data); 
};

const updateModule = async (id, data) => {
    return moduleModel.update(id, data);
};

const deleteModule = async (id) => {
    return moduleModel.delete(id);
};

// --- Lógica de Negocio Específica: Toggle Status ---

/**
 * Activa o desactiva un módulo.
 */
const toggleModuleStatus = async (id) => {
    const module = await moduleModel.findById(id);

    if (!module) {
        throw new utilsCustomError('Módulo no encontrado', 404);
    }
    
    const newStatus = !module.is_active;

    await moduleModel.toggleStatus(id, newStatus);
    
    return newStatus;
};

module.exports = {
    getAllModules,
    getModuleById,
    createModule,
    updateModule,
    deleteModule,
    toggleModuleStatus,
};