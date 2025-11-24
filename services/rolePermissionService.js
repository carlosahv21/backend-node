// services/rolePermissionService.js
import rolePermissionModel from '../models/rolePermissionModel.js';
import utilsCustomError from '../utils/utilsCustomError.js';
import knex from '../config/knex.js'; // Necesitamos Knex para la transacción y raw queries

/**
 * Obtiene los detalles de los permisos asociados a un rol.
 */
const getPermissionsByRole = async (role_id) => {
    if (!role_id) {
        throw new utilsCustomError('role_id es requerido.', 400);
    }
    return rolePermissionModel.getPermissionsByRoleId(role_id);
};

/**
 * Asigna un nuevo conjunto de permisos a un rol dentro de una transacción.
 * Borra los permisos existentes y luego inserta los nuevos.
 */
const setPermissionsForRole = async (role_id, permission_ids) => {
    if (!role_id || !Array.isArray(permission_ids)) {
        throw new utilsCustomError('role_id y permission_ids[] son requeridos.', 400);
    }

    try {
        await knex.transaction(async trx => {
            await rolePermissionModel.deleteByRoleId(role_id, trx);

            const inserts = permission_ids.map(pid => ({
                role_id,
                permission_id: pid,
                created_at: knex.fn.now(),
                updated_at: knex.fn.now()
            }));

            if (inserts.length > 0) {
                await rolePermissionModel.insertBatch(inserts, trx);
            }
        });
    } catch (error) {
        console.error("Error en transacción al asignar permisos:", error);
        throw new utilsCustomError("Fallo al actualizar los permisos del rol", 500);
    }
};

/**
 * Obtiene todos los roles junto con sus permisos asociados (agregados).
 * Nota: Esta consulta utiliza SQL Raw (JSON_ARRAYAGG/JSON_OBJECT) y es dependiente de la base de datos (MySQL, PostgreSQL, SQLite).
 */
const getAllRolesWithPermissions = async () => {
    try {
        const roles = await knex("roles as r")
            .leftJoin("role_permissions as rp", "r.id", "rp.role_id")
            .leftJoin("permissions as p", "rp.permission_id", "p.id")
            .leftJoin("modules as m", "p.module_id", "m.id")
            .select(
                "r.id as role_id",
                "r.name as role_name",
                knex.raw(`
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', p.id,
                            'name', p.name,
                            'module', m.name 
                        )
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
        console.error("Error al obtener roles con permisos:", error);
        throw new utilsCustomError("Error al recuperar roles con permisos", 500);
    }
};

export default {
    getPermissionsByRole,
    setPermissionsForRole,
    getAllRolesWithPermissions,
};