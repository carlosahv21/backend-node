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

        const VALID_SCOPES = ['all', 'own', 'assigned'];

        // El frontend envía cada permiso como objeto { permission_id, scope }.
        // Se conserva compatibilidad con el formato antiguo (UUID plano → scope 'all').
        const normalized = permission_ids.map((entry) => {
            const permission_id = typeof entry === 'string' ? entry : entry?.permission_id;
            const scope = typeof entry === 'string' ? 'all' : (entry?.scope ?? 'all');

            if (!permission_id) {
                throw new AppError('Cada permiso debe incluir permission_id.', 400);
            }
            if (!VALID_SCOPES.includes(scope)) {
                throw new AppError(`Scope inválido '${scope}'. Valores permitidos: ${VALID_SCOPES.join(', ')}.`, 400);
            }

            return { permission_id, scope };
        });

        try {
            await rolePermissionRepository.knex.transaction(async trx => {
                await rolePermissionRepository.deleteByRoleId(role_id, trx);

                const inserts = normalized.map(({ permission_id, scope }) => ({
                    role_id,
                    permission_id,
                    scope,
                    created_at: rolePermissionRepository.knex.fn.now(),
                    updated_at: rolePermissionRepository.knex.fn.now()
                }));

                if (inserts.length > 0) {
                    await rolePermissionRepository.insertBatch(inserts, trx);
                }
            });
        } catch (error) {
            if (error instanceof AppError) throw error;
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