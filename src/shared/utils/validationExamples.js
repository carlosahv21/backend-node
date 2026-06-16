/**
 * EJEMPLOS DE USO - Sistema de Validación Dinámica
 * 
 * Este archivo demuestra cómo usar el nuevo sistema de validación dinámica
 * basado en la tabla 'fields' de la base de datos.
 */

import {
    generateSchemaForModule,
    generatePartialSchemaForModule,
    generateSchemaForBlock,
    validateModuleData,
    safeValidateModuleData
} from '../validators/Schemas.js';

// ============================================
// EJEMPLO 1: Validar datos de un módulo completo
// ============================================

async function ejemploValidarUsuario() {
    try {
        // Datos a validar
        const userData = {
            first_name: "Carlos",
            last_name: "Hernández",
            email: "carlos@example.com",
            password: "miPassword123",
            role_id: 2
        };

        // Validar contra el esquema dinámico del módulo 'users'
        const validatedData = await validateModuleData('users', userData);
        console.log('✅ Datos de usuario válidos:', validatedData);
    } catch (error) {
        console.error('❌ Error de validación:', error.errors);
    }
}

// ============================================
// EJEMPLO 2: Validación segura (sin lanzar error)
// ============================================

async function ejemploValidacionSegura() {
    const planData = {
        name: "Plan Mensual",
        description: "Acceso ilimitado por un mes",
        price: 50,
        type: "monthly",
        max_classes: 20,
        max_sessions: 30,
        trial_period_days: 7
    };

    // Validación segura - retorna objeto con success/error
    const result = await safeValidateModuleData('plans', planData);

    if (result.success) {
        console.log('✅ Datos válidos:', result.data);
    } else {
        console.error('❌ Errores de validación:', result.error.errors);
    }
}

// ============================================
// EJEMPLO 3: Generar esquema para un bloque específico
// ============================================

async function ejemploValidarBloque() {
    try {
        // Obtener esquema solo para el bloque 'Basic Information' de 'classes'
        const schema = await generateSchemaForBlock('Basic Information', 'classes');

        const classBasicData = {
            name: "Salsa Avanzada",
            level: "Advanced",
            genre: "Salsa",
            is_favorites: true
        };

        const validated = schema.parse(classBasicData);
        console.log('✅ Datos de clase válidos:', validated);
    } catch (error) {
        console.error('❌ Error:', error.errors);
    }
}

// ============================================
// EJEMPLO 4: Validación parcial para actualizaciones
// ============================================

async function ejemploActualizacionParcial() {
    try {
        // Para actualizaciones, no todos los campos son requeridos
        const schema = await generatePartialSchemaForModule('plans');

        // Solo actualizar el precio
        const updateData = {
            price: 60
        };

        const validated = schema.parse(updateData);
        console.log('✅ Actualización válida:', validated);
    } catch (error) {
        console.error('❌ Error:', error.errors);
    }
}

// ============================================
// EJEMPLO 5: Validar pagos con relaciones
// ============================================

async function ejemploValidarPago() {
    try {
        const paymentData = {
            user_id: 5,              // Relación con users
            plan_id: 2,              // Relación con plans
            original_amount: 100,
            amount: 90,
            discount_type: "percentage",
            discount_value: 10,
            discount_notes: "Descuento estudiante",
            payment_method: "card",
            payment_date: ["2026-02-17", "2026-02-17"],
            status: "completed",
            notes: "Pago procesado correctamente"
        };

        const validated = await validateModuleData('payments', paymentData);
        console.log('✅ Pago válido:', validated);
    } catch (error) {
        console.error('❌ Error de validación:', error.errors);
    }
}

// ============================================
// EJEMPLO 6: Manejo de errores específicos
// ============================================

async function ejemploManejoErrores() {
    const invalidData = {
        name: "",  // Inválido: campo requerido vacío
        level: "Expert",  // Inválido: no está en las opciones
        genre: "Salsa",
        is_favorites: "yes"  // Inválido: debe ser boolean
    };

    const result = await safeValidateModuleData('classes', invalidData);

    if (!result.success) {
        // Iterar sobre los errores
        result.error.errors.forEach(err => {
            console.error(`❌ Campo '${err.path.join('.')}': ${err.message}`);
        });
    }
}

// ============================================
// EJEMPLO 7: Uso en un controlador/middleware
// ============================================

/**
 * Middleware de validación genérico para cualquier módulo
 */
export function validateMiddleware(moduleName) {
    return async (req, res, next) => {
        try {
            const validated = await validateModuleData(moduleName, req.body);
            req.validatedData = validated;
            next();
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: error.errors
            });
        }
    };
}

/**
 * Uso en rutas:
 *
 * import { validateMiddleware } from './utils/validationExamples.js';
 *
 * router.post('/users', validateMiddleware('users'), userController.create);
 * router.post('/classes', validateMiddleware('classes'), classController.create);
 * router.post('/plans', validateMiddleware('plans'), planController.create);
 */


// ============================================
// EJECUTAR EJEMPLOS (descomentar para probar)
// ============================================

// await ejemploValidarUsuario();
// await ejemploValidacionSegura();
// await ejemploValidarBloque();
// await ejemploActualizacionParcial();
// await ejemploValidarPago();
// await ejemploManejoErrores();
