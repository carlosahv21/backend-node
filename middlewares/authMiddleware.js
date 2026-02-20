// middlewares/rbacMiddleware.js
import jwt from 'jsonwebtoken';
import knex from '../config/knex.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Obtiene un permiso específico (recurso + acción) para un usuario.
 * Evita traer todos los permisos innecesariamente.
 */
async function getSpecificPermission(userId, resourceName, actionName) {
  const permission = await knex('users')
    .join('roles', 'users.role_id', 'roles.id')
    .join('role_permissions', 'roles.id', 'role_permissions.role_id')
    .join('permissions', 'role_permissions.permission_id', 'permissions.id')
    .join('modules', 'permissions.module_id', 'modules.id')
    .where('users.id', userId)
    .andWhere('modules.name', resourceName)
    .andWhere('permissions.name', actionName)
    .select(
      'modules.name as resource',
      'permissions.name as action',
      'role_permissions.scope as scope'
    )
    .first(); // Solo necesitamos uno

  return permission;
}

/**
 * Middleware de Autenticación JWT
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return ApiResponse.error(res, 401, 'Token de autenticación no proporcionado');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return ApiResponse.error(res, 403, 'Sesión expirada o token inválido');
    }

    req.user = decoded;
    next();
  });
};

/**
 * Middleware de Autorización (RBAC + Scope injection)
 * Solo valida permiso funcional.
 * El scope será aplicado en el service.
 */
const authorize = (resourceName, actionName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      const permission = await getSpecificPermission(
        userId,
        resourceName,
        actionName
      );

      if (!permission) {
        return ApiResponse.error(
          res,
          403,
          `Acceso denegado. Permiso requerido: ${resourceName}:${actionName}`
        );
      }

      // Inyectamos el permiso completo para uso en controllers/services
      req.permission = permission;

      next();
    } catch (error) {
      console.error('Error en middleware RBAC:', error);
      return ApiResponse.error(res, 500, 'Error interno de autorización');
    }
  };
};

export default {
  authenticateToken,
  authorize
};