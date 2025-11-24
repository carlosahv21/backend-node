// middleware/rbacMiddleware.js
import jwt from 'jsonwebtoken';
import knex from '../config/knex.js';

/**
 * Obtiene todos los permisos (recurso:acción) para un usuario.
 */
async function getPermissionsForMiddleware(userId) {
  const rawPermissions = await knex('users')
    .join('user_roles', 'users.id', 'user_roles.user_id')
    .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
    .join('permissions', 'role_permissions.permission_id', 'permissions.id')
    .join('modules', 'permissions.module_id', 'modules.id')
    .where('users.id', userId)
    .select(
      'modules.name as resource',
      'permissions.name as action'
    );

  const permissionsList = rawPermissions.map(p =>
    `${p.resource}:${p.action}`
  );
  console.log(permissionsList);

  return [...new Set(permissionsList)];
}

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

// Chequea el Permiso Específico (Closure)
const authorize = (resourceName, actionName) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const requiredPermission = `${resourceName}:${actionName}`;

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

export default {
  authenticateToken,
  authorize
};