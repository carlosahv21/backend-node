import { z } from 'zod';
import fieldSchemaBuilder from '../utils/fieldSchemaBuilder.js';
import fieldModel from '../models/fieldModel.js';

// ============================================
// STATIC SCHEMAS (Legacy - Backward Compatibility)
// ============================================

/**
 * NOTA DE SEGURIDAD MULTITENANCY:
 * El campo `academy_id` se acepta en los schemas como `optional()` para no
 * romper cualquier cliente que lo envíe. Sin embargo, NUNCA se usa el valor
 * recibido del cliente: los Services siempre lo eliminan del payload y BaseModel
 * inyecta el academy_id correcto desde el AsyncLocalStorage (tenantContext).
 * Esto hace que la "inyección de tenant" sea imposible a nivel de capa de datos.
 */

export const createUserSchema = z.object({
    email: z.string().email("El formato del email no es válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    academy_id: z.string().uuid().optional(), // Aceptado pero ignorado — ver nota de seguridad
});

export const createPlanSchema = z.object({
    name: z.string().min(1, "El campo 'name' es requerido"),
    max_sessions: z.number().min(1, "El campo 'max_sessions' es requerido"),
    price: z.number().min(1, "El campo 'price' es requerido"),
    academy_id: z.string().uuid().optional(), // Aceptado pero ignorado — ver nota de seguridad
});

// Notification Schemas
export const createNotificationSchema = z.object({
    user_id: z.number().int().positive().optional(),
    role_target: z.enum(['ADMIN', 'STUDENT', 'TEACHER', 'RECEPTIONIST']).optional(),
    category: z.enum(['PAYMENT', 'CLASS', 'SYSTEM', 'ATTENDANCE', 'REGISTRATION']),
    title: z.string().min(1, "El título es requerido").max(255, "El título no puede exceder 255 caracteres"),
    message: z.string().min(1, "El mensaje es requerido"),
    related_entity_id: z.number().int().positive().optional(),
    deep_link: z.string().optional(),
    academy_id: z.string().uuid().optional(), // Aceptado pero ignorado — ver nota de seguridad
}).refine(
    (data) => data.user_id || data.role_target,
    { message: "Debe proporcionar user_id o role_target" }
);

export const markAsReadSchema = z.object({
    id: z.string().regex(/^\d+$/, "El ID debe ser un número").optional()
});

// Academy Schemas
export const registerAcademySchema = z.object({
    academy: z.object({
        name: z.string().min(3, "El nombre de la academia debe tener al menos 3 caracteres"),
        address: z.string().optional(),
        logo_url: z.string().url("El logo debe ser una URL válida").optional().or(z.literal("")),
    }),
    user: z.object({
        first_name: z.string().min(2, "El nombre es requerido"),
        last_name: z.string().min(2, "El apellido es requerido"),
        email: z.string().email("Email inválido"),
        password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    })
});

// ============================================
// DYNAMIC SCHEMA GENERATION
// ============================================

/**
 * Genera un esquema de validación dinámico basado en los campos de un módulo
 * @param {string} moduleName - Nombre del módulo (ej: 'users', 'classes', 'plans')
 * @returns {Promise<z.ZodObject>} - Esquema Zod generado dinámicamente
 */
export async function generateSchemaForModule(moduleName) {
    const fields = await fieldModel.findFieldsByModuleName(moduleName);

    if (!fields || fields.length === 0) {
        throw new Error(`No se encontraron campos para el módulo: ${moduleName}`);
    }

    return fieldSchemaBuilder.buildSchema(fields);
}

/**
 * Genera un esquema de validación parcial (todos los campos opcionales)
 * Útil para operaciones de actualización
 * @param {string} moduleName - Nombre del módulo
 * @returns {Promise<z.ZodObject>} - Esquema Zod parcial
 */
export async function generatePartialSchemaForModule(moduleName) {
    const fields = await fieldModel.findFieldsByModuleName(moduleName);

    if (!fields || fields.length === 0) {
        throw new Error(`No se encontraron campos para el módulo: ${moduleName}`);
    }

    return fieldSchemaBuilder.buildPartialSchema(fields);
}

/**
 * Genera un esquema de validación para un bloque específico
 * @param {string} blockName - Nombre del bloque
 * @param {string} moduleName - Nombre del módulo
 * @returns {Promise<z.ZodObject>} - Esquema Zod para el bloque
 */
export async function generateSchemaForBlock(blockName, moduleName) {
    const fields = await fieldModel.findFieldsByBlockName(blockName, moduleName);

    if (!fields || fields.length === 0) {
        throw new Error(`No se encontraron campos para el bloque: ${blockName} en el módulo: ${moduleName}`);
    }

    return fieldSchemaBuilder.buildSchema(fields);
}

/**
 * Valida datos contra el esquema de un módulo
 * @param {string} moduleName - Nombre del módulo
 * @param {Object} data - Datos a validar
 * @returns {Promise<Object>} - Datos validados y parseados
 */
export async function validateModuleData(moduleName, data) {
    const schema = await generateSchemaForModule(moduleName);
    return schema.parse(data);
}

/**
 * Valida datos de forma segura (no lanza error, retorna resultado)
 * @param {string} moduleName - Nombre del módulo
 * @param {Object} data - Datos a validar
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
export async function safeValidateModuleData(moduleName, data) {
    const schema = await generateSchemaForModule(moduleName);
    return schema.safeParse(data);
}
