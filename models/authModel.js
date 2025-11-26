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
        const roleData = await this.knex("users")
            .join("roles", "users.role_id", "roles.id")
            .where("users.id", userId)
            .select("roles.id as role_id", "roles.name as role_name")
            .first();

        if (!roleData) {
            throw new utilsCustomError("User has no role assigned", 403);
        }
        return roleData;
    }

    /**
     * Obtiene permisos
     */
    async findPermissions(roleId) {
        const rawPermissions = await this.knex("role_permissions")
            .join("permissions", "role_permissions.permission_id", "permissions.id")
            .join("modules", "permissions.module_id", "modules.id")
            .where("role_permissions.role_id", roleId)
            .select(
                "permissions.name as action",
                "modules.name as moduleName"
            );

        return rawPermissions;
    }

    /**
     * Obtiene la configuración global de la academia.
     */
    async findSettings() {
        return this.knex("settings").first();
    }
}

export default new AuthModel();