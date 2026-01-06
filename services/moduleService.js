// services/moduleService.js
import moduleModel from '../models/moduleModel.js';
import AppError from '../utils/AppError.js';

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
        throw new AppError('Módulo no encontrado', 404);
    }
    
    const newStatus = !module.is_active;

    await moduleModel.toggleStatus(id, newStatus);
    
    return newStatus;
};

export default {
    getAllModules,
    getModuleById,
    createModule,
    updateModule,
    deleteModule,
    toggleModuleStatus,
};