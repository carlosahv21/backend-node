// middlewares/featureMiddleware.js
import ApiResponse from '../utils/apiResponse.js';
import authModel from '../models/authModel.js';
import cache from '../utils/cache.js';

/**
 * Feature Flags Middleware (SaaS Module Gatekeeper)
 * Bloquea el acceso a un módulo si el plan de la academia actual no lo permite.
 * Extrae la lista de módulos habilitados de la caché o BD usando el academy_id
 * 
 * @param {String} moduleName - Nombre del módulo a verificar (ej. 'payments')
 */
export const checkFeature = (moduleName) => {
    return async (req, res, next) => {
        try {
            const academyId = req.user?.academy_id;

            if (!academyId) {
                // Si el usuario es super admin y no tiene academy, saltamos la validación.
                if (req.user?.role === 'admin' || req.user?.role === 'superadmin') {
                    return next();
                }
                return ApiResponse.error(res, 401, 'Usuario no pertenece a ninguna academia');
            }

            const cacheKey = `academy:${academyId}:modules`;
            let enabledModules = cache.get(cacheKey);

            if (!enabledModules) {
                // Nota: En el futuro esto consultará 'plans_features'
                // Por ahora derivamos un dummy o simplemente permitimos todo 
                // mientras se termina de diseñar la DB de 'plans_features'

                // Simulación: Consultamos de algun lugar los módulos del plan PRO
                enabledModules = ["dashboard", "students", "teachers", "classes", "payments", "reports"];

                cache.set(cacheKey, enabledModules, 3600); // Cache 1 hora
            }

            if (!enabledModules.includes(moduleName)) {
                return ApiResponse.error(res, 403, `Upgrade Required: Su plan actual no incluye el módulo '${moduleName}'`);
            }

            next();
        } catch (error) {
            console.error('Error en Feature Flag Middleware:', error);
            return ApiResponse.error(res, 500, 'Error interno verificando la licencia del módulo');
        }
    };
};
