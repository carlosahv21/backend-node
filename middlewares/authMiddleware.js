// middleware/rbacMiddleware.js
const jwt = require('jsonwebtoken');
const knex = require('../db/knex'); 

// Middleware de Autenticación

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Token de autenticación no proporcionado.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Sesión expirada o token inválido.' });
    }
    req.user = user;
    next();
  });
};

// Chequea el Permiso Específico
/**
 * @param {string} resourceName - El nombre de la ruta/recurso (ej: 'students', 'classes')
 * @param {string} actionName - La acción a realizar (ej: 'view', 'create', 'delete')
 */
const authorize = (resourceName, actionName) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const requiredPermission = `${resourceName}:${actionName}`; // ej: 'students:create'

    try {
      const userPermissionsList = await getPermissionsForMiddleware(userId);

      if (userPermissionsList.includes(requiredPermission)) {
        next();
      } else {
        res.status(403).json({
          message: `Acceso denegado. Permiso requerido: ${requiredPermission}`
        });
      }
    } catch (error) {
      console.error('Error en middleware RBAC:', error);
      res.status(500).json({ message: 'Error interno de autorización.' });
    }
  };
};

async function getPermissionsForMiddleware(userId) {
  const rawPermissions = await knex('users')
    .join('user_roles', 'users.id', 'user_roles.user_id')
    .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
    .join('permissions', 'role_permissions.permission_id', 'permissions.id')
    .join('routes', 'permissions.route_id', 'routes.id')
    .where('users.id', userId)
    .select(
      'routes.name as resource',
      'permissions.name as action'
    );

  const permissionsList = rawPermissions.map(p =>
    `${p.resource}:${p.action}`
  );
  return [...new Set(permissionsList)];
}

module.exports = {
  authenticateToken,
  authorize
};