const knex = require("../db/knex");

function checkPermission(permissionName) {
  return async function(req, res, next) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const permission = await knex('permissions').where({ name: permissionName }).first();
    if (!permission) return res.status(403).json({ message: "Permission not found" });

    const hasPermission = await knex('user_roles')
      .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
      .where('user_roles.user_id', userId)
      .where('role_permissions.permission_id', permission.id)
      .first();

    if (!hasPermission) return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });

    next();
  };
}

module.exports = { checkPermission };
