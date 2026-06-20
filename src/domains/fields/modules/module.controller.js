import moduleService from './module.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class ModuleController {
    async getAll(req, res, next) {
        try {
            const result = await moduleService.getAllModules(req.query);
            ApiResponse.success(res, 200, "Módulos obtenidos correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const module = await moduleService.getModuleById(id);
            ApiResponse.success(res, 200, "Módulo obtenido correctamente", module);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newModule = await moduleService.createModule(req.body);
            ApiResponse.success(res, 201, "Módulo creado correctamente", newModule);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            await moduleService.updateModule(req.params.id, req.body);
            ApiResponse.success(res, 200, "Módulo actualizado correctamente");
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await moduleService.deleteModule(req.params.id);
            ApiResponse.success(res, 204, "Módulo eliminado correctamente");
        } catch (error) {
            next(error);
        }
    }

    async bin(req, res, next) {
        try {
            const result = await moduleService.binModule(req.params.id);
            ApiResponse.success(res, 200, "Módulo movido a papelera correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async restore(req, res, next) {
        try {
            const result = await moduleService.restoreModule(req.params.id);
            ApiResponse.success(res, 200, "Módulo restaurado correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async toggle(req, res, next) {
        try {
            const { id } = req.params;
            const newStatus = await moduleService.toggleModuleStatus(id);
            ApiResponse.success(res, 200, `Módulo ID ${id} ahora está ${newStatus ? 'activo' : 'inactivo'}`, { is_active: newStatus });
        } catch (error) {
            next(error);
        }
    }
}

export default new ModuleController();