// controllers/permissionController.js
import permissionService from '../services/permissionService.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Clase controladora para Permisos (Permissions). 
 */
class PermissionController {
    async getAll(req, res, next) {
        try {
            const result = await permissionService.getAllPermissions(req.query);
            ApiResponse.success(res, 200, "Permisos obtenidos correctamente", result); 
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const permission = await permissionService.getPermissionById(id);
            ApiResponse.success(res, 200, "Permiso obtenido correctamente", permission);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res, next) {
        try {
            const newPermission = await permissionService.createPermission(req.body);
            ApiResponse.success(res, 201, "Permiso creado correctamente", newPermission);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
    
    async update(req, res, next) {
        try {
            await permissionService.updatePermission(req.params.id, req.body);
            ApiResponse.success(res, 200, "Permiso actualizado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res, next) {
        try {
            await permissionService.deletePermission(req.params.id);
            ApiResponse.success(res, 200, "Permiso eliminado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new PermissionController();