// middleware/rbacMiddleware.js
const jwt = require('jsonwebtoken');
const knex = require('../db/knex'); 

// 1. Middleware de Autenticación: Verifica y Adjunta el Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Esperamos: "Bearer TOKEN_AQUÍ"
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    // 401: Unauthorized (Token no existe)
    return res.status(401).json({ message: 'Token de autenticación no proporcionado.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // 403: Forbidden (Token inválido o expirado)
      return res.status(403).json({ message: 'Sesión expirada o token inválido.' });
    }
    // El token es válido, adjuntamos la info (id, email, role) a req.user
    req.user = user;
    next();
  });
};

// 2. Middleware de Autorización (RBAC): Chequea el Permiso Específico
/**
 * @param {string} resourceName - El nombre de la ruta/recurso (ej: 'students', 'classes')
 * @param {string} actionName - La acción a realizar (ej: 'view', 'create', 'delete')
 */
const authorize = (resourceName, actionName) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const requiredPermission = `${resourceName}:${actionName}`; // ej: 'students:create'

    try {
      // NOTA: Usamos getOptimizedUserData para obtener los permisos,
      // pero solo necesitamos el array de permisos para esta verificación.

      // Es más eficiente crear una función que SOLO traiga los permisos para el middleware:
      const userPermissionsList = await getPermissionsForMiddleware(userId);
      console.log(userPermissionsList);
      

      // Si el usuario tiene el permiso requerido, pasa
      if (userPermissionsList.includes(requiredPermission)) {
        next();
      } else {
        // 403: Forbidden (El token es válido, pero el rol no tiene el permiso)
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

// Pequeña función eficiente para el middleware (si no quieres llamar a getOptimizedUserData entera)
async function getPermissionsForMiddleware(userId) {
  // Usamos el mismo JOIN de la Super Query, pero solo seleccionamos los nombres
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