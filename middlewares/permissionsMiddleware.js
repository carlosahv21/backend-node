const knex = require('../db/knex'); // Asegúrate de usar tu conexión de Knex aquí

// Middleware para verificar permisos
function checkPermission(permissionName) {
  return async function (req, res, next) {
    const userId = req.user.id; // Asume que el ID del usuario ya está disponible en req.user
    const permission = await knex('permissions').where({ name: permissionName }).first();

    const hasPermission = await knex('user_roles')
      .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
      .where('user_roles.user_id', userId)
      .where('role_permissions.permission_id', permission.id)
      .first();

    if (!hasPermission) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next(); // El usuario tiene el permiso, continuar con la solicitud
  };
}

module.exports = { checkPermission };
