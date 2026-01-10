// controllers/moduleController.js
import moduleService from '../services/moduleService.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Clase controladora para Módulos (Modules).
 */
class ModuleController {

    async getAll(req, res, next) {
        try {
            const result = await moduleService.getAllModules(req.query);
            ApiResponse.success(res, 200, "Módulos obtenidos correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const module = await moduleService.getModuleById(id);
            ApiResponse.success(res, 200, "Módulo obtenido correctamente", module);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res, next) {
        try {
            const newModule = await moduleService.createModule(req.body);
            ApiResponse.success(res, 201, "Módulo creado correctamente", newModule);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async update(req, res, next) {
        try {
            await moduleService.updateModule(req.params.id, req.body);
            ApiResponse.success(res, 200, "Módulo actualizado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res, next) {
        try {
            await moduleService.deleteModule(req.params.id);
            ApiResponse.success(res, 204, "Módulo eliminado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async bin(req, res, next) {
        try {
            const result = await moduleService.binModule(req.params.id);
            ApiResponse.success(res, 200, "Módulo movido a papelera correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async restore(req, res, next) {
        try {
            const result = await moduleService.restoreModule(req.params.id);
            ApiResponse.success(res, 200, "Módulo restaurado correctamente", result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    /**
     * Alterna el estado 'is_active' de un módulo.
     */
    async toggle(req, res, next) {
        try {
            const { id } = req.params;
            const newStatus = await moduleService.toggleModuleStatus(id);
            ApiResponse.success(res, 200, `Módulo ID ${id} ahora está ${newStatus ? 'activo' : 'inactivo'}`, { is_active: newStatus });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new ModuleController();