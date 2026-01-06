// controllers/roleController.js
import roleService from '../services/roleService.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Clase controladora para Roles.
 */
class RoleController {
    async getAll(req, res, next) {
        try {
            const result = await roleService.getAllRoles(req.query);
            ApiResponse.success(res, 200, "Roles obtenidos correctamente", result); 
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const role = await roleService.getRoleById(id);
            ApiResponse.success(res, 200, "Rol obtenido correctamente", role);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async create(req, res, next) {
        try {
            const newRole = await roleService.createRole(req.body);
            ApiResponse.success(res, 201, "Rol creado correctamente", newRole);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
    
    async update(req, res, next) {
        try {
            await roleService.updateRole(req.params.id, req.body);
            ApiResponse.success(res, 200, "Rol actualizado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async delete(req, res, next) {
        try {
            await roleService.deleteRole(req.params.id);
            ApiResponse.success(res, 200, "Rol eliminado correctamente");
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new RoleController();