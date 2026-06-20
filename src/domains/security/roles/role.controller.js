import roleService from './role.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class RoleController {
    async getAll(req, res, next) {
        try {
            const result = await roleService.getAllRoles(req.query);
            ApiResponse.success(res, 200, "Roles obtenidos correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const role = await roleService.getRoleById(id);
            ApiResponse.success(res, 200, "Rol obtenido correctamente", role);
        } catch (error) {
            next(error);
        }
    }

    async getByIdDetails(req, res, next) {
        try {
            const { id } = req.params;
            const role = await roleService.getRoleByIdDetails(id);
            ApiResponse.success(res, 200, "Rol obtenido correctamente", role);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const newRole = await roleService.createRole(req.body);
            ApiResponse.success(res, 201, "Rol creado correctamente", newRole);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            await roleService.updateRole(req.params.id, req.body);
            ApiResponse.success(res, 200, "Rol actualizado correctamente");
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await roleService.deleteRole(req.params.id);
            ApiResponse.success(res, 204, "Rol eliminado correctamente");
        } catch (error) {
            next(error);
        }
    }

    async bin(req, res, next) {
        try {
            const result = await roleService.binRole(req.params.id);
            ApiResponse.success(res, 200, "Rol movido a papelera correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async restore(req, res, next) {
        try {
            const result = await roleService.restoreRole(req.params.id);
            ApiResponse.success(res, 200, "Rol restaurado correctamente", result);
        } catch (error) {
            next(error);
        }
    }
}

export default new RoleController();