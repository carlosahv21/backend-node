import { safeValidateModuleData } from '../validators/Schemas.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * Middleware para validar dinámicamente el body contra el esquema de un módulo.
 * @param {string} moduleName - Nombre del módulo (ej: 'users', 'plans')
 */
export const validateModule = (moduleName) => async (req, res, next) => {
    try {
        const result = await safeValidateModuleData(moduleName, req.body);

        if (!result.success) {
            const error = result.error;
            let message = "Error de validación";
            let details = null;

            // Lógica de formateo de errores similar a validationMiddleware.js
            const issues = error.issues || error.errors;

            if (issues && Array.isArray(issues) && issues.length > 0) {
                // Formatear todos los errores para mejor feedback
                details = issues.map(issue => {
                    const path = issue.path.join('.');
                    return {
                        field: path,
                        message: issue.message
                    };
                });

                // Mensaje principal del primer error
                const firstError = issues[0];
                const fieldName = firstError.path.length > 0 ? firstError.path.join('.') : 'body';
                message = `${fieldName}: ${firstError.message}`;
            }

            return ApiResponse.error(res, 400, message, details);
        }

        // Reemplazar body con datos validados y parseados
        req.body = result.data;
        next();
    } catch (err) {
        console.error(`Error en validación dinámica para ${moduleName}:`, err);
        return ApiResponse.error(res, 500, "Error interno en validación");
    }
};
