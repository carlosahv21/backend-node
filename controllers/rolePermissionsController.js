// controllers/rolePermissionsController.js
const db = require("../db/knex");
const BaseController = require('./BaseController');

class RolePermissionsController extends BaseController {
    constructor() {
        super("role_permissions");
    }

    // Obtener permisos de un rol específico
    async getPermissionsByRole(req, res) {
        try {
            const { role_id } = req.params;

            if (!role_id) {
                return res.status(400).json({ message: "Missing role_id" });
            }

            const permissions = await db("permissions as p")
                .join("role_permissions as rp", "p.id", "rp.permission_id")
                .where("rp.role_id", role_id)
                .select("p.id", "p.name", "p.description");

            res.json({ role_id, permissions });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving permissions for role", error });
        }
    }

    // Asignar permisos a un rol (sobrescribe los actuales)
    async setPermissionsForRole(req, res) {
        try {
            const { role_id } = req.params;
            const { permission_ids } = req.body;

            if (!role_id || !Array.isArray(permission_ids)) {
                return res.status(400).json({ message: "role_id and permission_ids[] are required" });
            }

            await db.transaction(async trx => {
                await trx("role_permissions").where({ role_id }).del();

                const inserts = permission_ids.map(pid => ({
                    role_id,
                    permission_id: pid,
                    created_at: new Date(),
                    updated_at: new Date()
                }));

                if (inserts.length > 0) {
                    await trx("role_permissions").insert(inserts);
                }
            });

            res.json({ message: "Permissions updated successfully", role_id, permission_ids });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error updating permissions for role", error });
        }
    }

    // Obtener todos los roles con sus permisos
    async getAllRolesWithPermissions(req, res) {
        try {
            const roles = await db("roles as r")
                .leftJoin("role_permissions as rp", "r.id", "rp.role_id")
                .leftJoin("permissions as p", "rp.permission_id", "p.id")
                .leftJoin("routes as ro", "p.route_id", "ro.id") // <-- join con la tabla de módulos
                .select(
                    "r.id as role_id",
                    "r.name as role_name",
                    db.raw(`
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', p.id,
                            'name', p.name,
                            'module', ro.name
                        )
                    ) as permissions
                `)
                )
                .groupBy("r.id");

            res.json(roles);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error retrieving roles with permissions", error });
        }
    }

}

module.exports = new RolePermissionsController();
