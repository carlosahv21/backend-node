import rolePermissionService from './rolePermission.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class RolePermissionController {
    async getPermissionsByRole(req, res, next) {
        try {
            const { role_id } = req.params;
            const permissions = await rolePermissionService.getPermissionsByRole(role_id);

            ApiResponse.success(res, 200, "Permisos obtenidos correctamente", {
                role_id: parseInt(role_id, 10),
                permissions
            });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async setPermissionsForRole(req, res, next) {
        try {
            const { role_id } = req.params;
            const { permission_ids } = req.body;

            await rolePermissionService.setPermissionsForRole(role_id, permission_ids);

            ApiResponse.success(res, 200, "Permisos actualizados correctamente para el rol", {
                role_id: parseInt(role_id, 10),
                permission_ids
            });
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getAllRolesWithPermissions(req, res, next) {
        try {
            const roles = await rolePermissionService.getAllRolesWithPermissions();
            ApiResponse.success(res, 200, "Roles obtenidos correctamente", roles);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new RolePermissionController();