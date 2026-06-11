import { z } from 'zod';
import fieldSchemaBuilder from '../utils/fieldSchemaBuilder.js';
import fieldModel from '../models/fieldModel.js';

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
