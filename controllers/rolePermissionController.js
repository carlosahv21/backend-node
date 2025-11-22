// controllers/rolePermissionController.js
import rolePermissionService from '../services/rolePermissionService.js';
import utilsCustomError from '../utils/utilsCustomError.js';

/**
 * Clase controladora para la gestión de relaciones Rol-Permiso.
 */
class RolePermissionController {

    /**
     * Obtener permisos de un rol específico
     */
    async getPermissionsByRole(req, res, next) {
        try {
            const { role_id } = req.params;
            const permissions = await rolePermissionService.getPermissionsByRole(role_id);

            res.status(200).json({
                role_id: parseInt(role_id, 10),
                permissions
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status));
        }
    }

    /**
     * Asignar permisos a un rol (sobrescribe los actuales)
     */
    async setPermissionsForRole(req, res, next) {
        try {
            const { role_id } = req.params;
            const { permission_ids } = req.body; // Array de IDs

            await rolePermissionService.setPermissionsForRole(role_id, permission_ids);

            res.status(200).json({
                success: true,
                message: "Permisos actualizados correctamente para el rol",
                role_id: parseInt(role_id, 10),
                permission_ids
            });
        } catch (error) {
            next(new utilsCustomError(error.message, error.status || 500));
        }
    }

    /**
     * Obtener todos los roles con sus permisos agregados
     */
    async getAllRolesWithPermissions(req, res, next) {
        try {
            const roles = await rolePermissionService.getAllRolesWithPermissions();
            res.status(200).json(roles);
        } catch (error) {
            next(new utilsCustomError(error.message, error.status || 500));
        }
    }
}

export default new RolePermissionController();