import rolePermissionRepository from './rolePermission.repository.js';
import AppError from "../../../shared/utils/AppError.js";

class RolePermissionService {
    async getPermissionsByRole(role_id) {
        if (!role_id) {
            throw new AppError('role_id es requerido.', 400);
        }
        return rolePermissionRepository.getPermissionsByRoleId(role_id);
    }

    async setPermissionsForRole(role_id, permission_ids) {
        if (!role_id || !Array.isArray(permission_ids)) {
            throw new AppError('role_id y permission_ids[] son requeridos.', 400);
        }

        try {
            await rolePermissionRepository.knex.transaction(async trx => {
                await rolePermissionRepository.deleteByRoleId(role_id, trx);

                const inserts = permission_ids.map(pid => ({
                    role_id,
                    permission_id: pid,
                    created_at: rolePermissionRepository.knex.fn.now(),
                    updated_at: rolePermissionRepository.knex.fn.now()
                }));

                if (inserts.length > 0) {
                    await rolePermissionRepository.insertBatch(inserts, trx);
                }
            });
        } catch (error) {
            throw new AppError("Fallo al actualizar los permisos del rol", 500);
        }
    }

    async getAllRolesWithPermissions() {
        try {
            const roles = await rolePermissionRepository.knex("roles as r")
                .leftJoin("role_permissions as rp", "r.id", "rp.role_id")
                .leftJoin("permissions as p", "rp.permission_id", "p.id")
                .leftJoin("modules as m", "p.module_id", "m.id")
                .select(
                    "r.id as role_id",
                    "r.name as role_name",
                    rolePermissionRepository.knex.raw(`
                    COALESCE(
                        jsonb_agg(
                            jsonb_build_object(
                                'id', p.id,
                                'name', p.name,
                                'module', m.name,
                                'scope', rp.scope
                            )
                        ) FILTER (WHERE p.id IS NOT NULL),
                        '[]'::jsonb
                    ) as permissions
                `)
                )
                .groupBy("r.id");

            return roles.map(role => {
                let parsedPermissions = role.permissions;

                if (typeof role.permissions === 'string') {
                    try {
                        parsedPermissions = JSON.parse(role.permissions);
                    } catch (e) {
                        parsedPermissions = [];
                    }
                }

                const cleanedPermissions = Array.isArray(parsedPermissions)
                    ? parsedPermissions.filter(p => p !== null)
                    : [];

                return {
                    role_id: role.role_id,
                    role_name: role.role_name,
                    permissions: cleanedPermissions
                };
            });

        } catch (error) {
            throw new AppError("Error al recuperar roles con permisos", 500);
        }
    }
}

export default new RolePermissionService();