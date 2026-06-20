import permissionService from './permission.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class PermissionController {
    async getAll(req, res, next) {
        try {
            const result = await permissionService.getAllPermissions(req.query);
            ApiResponse.success(res, 200, "Permisos obtenidos correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const permission = await permissionService.getPermissionById(id);
            ApiResponse.success(res, 200, "Permiso obtenido correctamente", permission);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newPermission = await permissionService.createPermission(req.body);
            ApiResponse.success(res, 201, "Permiso creado correctamente", newPermission);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            await permissionService.updatePermission(req.params.id, req.body);
            ApiResponse.success(res, 200, "Permiso actualizado correctamente");
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await permissionService.deletePermission(req.params.id);
            ApiResponse.success(res, 204, "Permiso eliminado correctamente");
        } catch (error) {
            next(error);
        }
    }

    async bin(req, res, next) {
        try {
            const result = await permissionService.binPermission(req.params.id);
            ApiResponse.success(res, 200, "Permiso movido a papelera correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async restore(req, res, next) {
        try {
            const result = await permissionService.restorePermission(req.params.id);
            ApiResponse.success(res, 200, "Permiso restaurado correctamente", result);
        } catch (error) {
            next(error);
        }
    }
}

export default new PermissionController();