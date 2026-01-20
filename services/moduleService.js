// services/moduleService.js
import moduleModel from '../models/moduleModel.js';
import AppError from '../utils/AppError.js';

class moduleService {
    /**
     * Obtiene todos los módulos (con paginación, búsqueda, filtros).
     */
    async getAllModules(queryParams) {
        return moduleModel.findAll(queryParams);
    }

    /**
     * Obtiene un módulo por ID.
     */
    async getModuleById(id) {
        return moduleModel.findById(id);
    }

    /**
     * Crea un nuevo módulo.
     */
    async createModule(data) {
        return moduleModel.create(data);
    }

    /**
     * Actualiza un módulo por ID.
     */
    async updateModule(id, data) {
        return moduleModel.update(id, data);
    }

    /**
     * Elimina un módulo por ID.
     */
    async binModule(id, userId) {
        return moduleModel.bin(id, userId);
    }

    /**
     * Restaura un módulo por ID.
     */
    async restoreModule(id) {
        return moduleModel.restore(id);
    }

    /**
     * Elimina permanentemente un módulo por ID.
     */
    async deleteModule(id) {
        return moduleModel.delete(id);
    }

    /**
     * Activa o desactiva un módulo.
     */
    async toggleModuleStatus(id) {
        const module = await moduleModel.findById(id);

        if (!module) {
            throw new AppError('Módulo no encontrado', 404);
        }

        const newStatus = !module.is_active;

        await moduleModel.toggleStatus(id, newStatus);

        return newStatus;
    }
}

export default new moduleService();
