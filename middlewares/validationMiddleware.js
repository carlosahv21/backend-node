import { z } from 'zod';
import utilsCustomError from '../utils/utilsCustomError.js';

/**
 * Middleware para validar el body de la solicitud contra un esquema Zod.
 * @param {z.ZodSchema} schema - El esquema de Zod para validar.
 */
const validateSchema = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const error = result.error;
        let message = "Error de validación";

        // Intentar obtener los detalles del error (Zod v3 usa .issues)
        const issues = error.issues || error.errors;

        if (issues && Array.isArray(issues) && issues.length > 0) {
            const firstError = issues[0];

            // Personalizar mensaje para campos requeridos
            // Zod 'required' check fails usually give invalid_type with received: undefined
            if (firstError.code === 'invalid_type' && firstError.received === 'undefined') {
                // Si path está vacío, es el root object
                const fieldName = firstError.path.length > 0 ? firstError.path[0] : 'body';
                message = `El campo ${fieldName} es obligatorio`;
            } else if (firstError.code === 'invalid_type') {
                const fieldName = firstError.path.length > 0 ? firstError.path[0] : 'body';
                message = `El campo ${fieldName} debe ser de tipo ${firstError.expected}`;
            } else {
                message = firstError.message;
            }
        } else {
            // Fallback si no hay issues, evitar usar error.message si parece JSON
            try {
                const parsed = JSON.parse(error.message);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    message = parsed[0].message; // Intentar sacar algo útil del JSON
                } else {
                    message = "Error de validación desconocido";
                }
            } catch (e) {
                message = error.message || "Error de validación";
            }
        }

        next(new utilsCustomError(message, 400));
    } else {
        req.body = result.data;
        next();
    }
};

export default validateSchema;
