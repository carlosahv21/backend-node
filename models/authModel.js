// models/authModel.js
import knex from '../config/knex.js';
import utilsCustomError from '../utils/utilsCustomError.js';

class AuthModel {
    constructor() {
        this.knex = knex;
    }

    /**
     * Busca un usuario por email para el login.
     */
    async findUserByEmail(email) {
        return this.knex('users').where({ email }).first();
    }

    /**
     * Busca los datos del rol asociado a un usuario.
     */
    async findRoleByUserId(userId) {
        const roleData = await this.knex("user_roles")
            .join("roles", "user_roles.role_id", "roles.id")
            .where("user_roles.user_id", userId)
            .select("roles.id as role_id", "roles.name as role_name")
            .first();

        if (!roleData) {
            throw new utilsCustomError("User has no role assigned", 403);
        }
        return roleData;
    }

    /**
     * Obtiene permisos y rutas en una sola consulta JOIN.
     */
    async findPermissionsAndRoutes(roleId) {
        const rawPermissionsAndRoutes = await this.knex("role_permissions")
            .join("permissions", "role_permissions.permission_id", "permissions.id")
            .join("routes", "permissions.route_id", "routes.id")
            .where("role_permissions.role_id", roleId)
            .andWhere("routes.is_active", 1)
            .orderBy("routes.order")
            .select(
                "permissions.name as action",
                "routes.*" // Trae todos los campos de routes
            );

        return rawPermissionsAndRoutes;
    }

    /**
     * Obtiene la configuración global de la academia.
     */
    async findSettings() {
        return this.knex("settings").first();
    }
}

export default new AuthModel();