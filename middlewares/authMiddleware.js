// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import knex from "../config/knex.js";
import ApiResponse from "../utils/apiResponse.js";
import cache from "../utils/cache.js";
import { buildPermissionMap } from "../utils/permissionMapper.js";

/**
 * Obtiene todos los permisos de un usuario y los estructura en un Map O(1).
 * Esta función solo es llamada si no existe el caché para el usuario.
 */
async function loadUserPermissions(userId) {
	const rawPermissions = await knex("users")
		.join("roles", "users.role_id", "roles.id")
		.join("role_permissions", "roles.id", "role_permissions.role_id")
		.join("permissions", "role_permissions.permission_id", "permissions.id")
		.join("modules", "permissions.module_id", "modules.id")
		.where("users.id", userId)
		.select(
			"modules.name as moduleName",
			"permissions.name as action",
			"role_permissions.scope as scope",
		);

	return buildPermissionMap(rawPermissions);
}

/**
 * Middleware de Autenticación JWT
 * Decodifica el token ({ id, role, academy_id }) y lo inyecta en req.user
 */
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return ApiResponse.error(
			res,
			401,
			"Token de autenticación no proporcionado",
		);
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			return ApiResponse.error(res, 401, "Sesión expirada o token inválido");
		}

		req.user = decoded;
		next();
	});
};

/**
 * Middleware de Autorización (SaaS RBAC O(1) Cached)
 * 1. Intenta cargar el permissionsMap de caché
 * 2. Si no existe, lo carga de la DB y lo guarda en caché por 10 minutos
 * 3. Valida acceso en O(1) tiempo.
 *
 * Inyecta req.permission = { resource, action, scope } para uso en policies/services.
 */
const authorize = (resourceName, actionName) => {
	return async (req, res, next) => {
		try {
			const userId = req.user?.id;
			if (!userId) {
				return ApiResponse.error(res, 401, "Usuario no autenticado");
			}

			const cacheKey = `permissions:user:${userId}`;
			let permissionMap = cache.get(cacheKey);

			if (!permissionMap) {
				permissionMap = await loadUserPermissions(userId);
				cache.set(cacheKey, permissionMap, 600); // Guardamos 10 minutos (600s)
			}

			// Adjuntamos el mapa al req.user en caso algún controlador lo quiera revisar libremente
			req.user.permissionsMap = permissionMap;

			const modulePerms = permissionMap[resourceName];

			if (!modulePerms || !modulePerms.actions.includes(actionName)) {
				return ApiResponse.error(
					res,
					403,
					`Acceso denegado. Permiso requerido: ${resourceName}:${actionName}`,
				);
			}

			// Inyectamos el permiso resuelto completo (con scope) para uso en policyEngine / applyScope
			req.permission = {
				resource: resourceName,
				action: actionName,
				scope: modulePerms.scope,
			};

			next();
		} catch (error) {
			console.error("Error en middleware RBAC:", error);
			return ApiResponse.error(res, 500, "Error interno de autorización");
		}
	};
};

export default {
	authenticateToken,
	authorize,
};
