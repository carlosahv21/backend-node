import moduleRepository from './module.repository.js';
import AppError from "../../../shared/utils/AppError.js";

class ModuleService {
    async getAllModules(queryParams) {
        return moduleRepository.findAll(queryParams);
    }

    async getModuleById(id) {
        return moduleRepository.findById(id);
    }

    async createModule(data) {
        return moduleRepository.create(data);
    }

    async updateModule(id, data) {
        return moduleRepository.update(id, data);
    }

    async binModule(id, userId) {
        return moduleRepository.bin(id, userId);
    }

    async restoreModule(id) {
        return moduleRepository.restore(id);
    }

    async deleteModule(id) {
        return moduleRepository.delete(id);
    }

    async toggleModuleStatus(id) {
        const module = await moduleRepository.findById(id);
        if (!module) {
            throw new AppError('Módulo no encontrado', 404);
        }
        const newStatus = !module.is_active;
        await moduleRepository.toggleStatus(id, newStatus);
        return newStatus;
    }
}

export default new ModuleService();