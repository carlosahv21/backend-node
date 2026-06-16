/**
 * Script de prueba para validar el sistema de esquemas dinámicos
 * Ejecutar con: node utils/testDynamicSchemas.js
 */

import {
    generateSchemaForModule,
    safeValidateModuleData
} from '../validators/Schemas.js';

console.log('🧪 Iniciando pruebas de validación dinámica...\n');

// ============================================
// TEST 1: Validar módulo 'users'
// ============================================
async function testUsersModule() {
    console.log('📋 TEST 1: Módulo de usuarios');

    const validUser = {
        first_name: "Juan",
        last_name: "Pérez",
        email: "juan@example.com",
        password: "password123",
        role_id: 2
    };

    const result = await safeValidateModuleData('users', validUser);

    if (result.success) {
        console.log('✅ PASS: Usuario válido');
    } else {
        console.log('❌ FAIL: Debería ser válido');
        console.log('Errores:', result.error.errors);
    }

    // Probar con email inválido
    const invalidUser = {
        ...validUser,
        email: "email-invalido"
    };

    const result2 = await safeValidateModuleData('users', invalidUser);

    if (!result2.success) {
        console.log('✅ PASS: Email inválido detectado correctamente');
    } else {
        console.log('❌ FAIL: Debería fallar con email inválido');
    }

    console.log('');
}

// ============================================
// TEST 2: Validar módulo 'plans'
// ============================================
async function testPlansModule() {
    console.log('📋 TEST 2: Módulo de planes');

    const validPlan = {
        name: "Plan Mensual",
        description: "Acceso completo",
        price: 50,
        type: "monthly",
        max_classes: 20,
        max_sessions: 30
    };

    const result = await safeValidateModuleData('plans', validPlan);

    if (result.success) {
        console.log('✅ PASS: Plan válido');
    } else {
        console.log('❌ FAIL: Debería ser válido');
        console.log('Errores:', result.error.errors);
    }

    // Probar con tipo inválido
    const invalidPlan = {
        ...validPlan,
        type: "anual"  // No está en las opciones
    };

    const result2 = await safeValidateModuleData('plans', invalidPlan);

    if (!result2.success) {
        console.log('✅ PASS: Tipo de plan inválido detectado correctamente');
    } else {
        console.log('❌ FAIL: Debería fallar con tipo inválido');
    }

    console.log('');
}

// ============================================
// TEST 3: Validar módulo 'classes'
// ============================================
async function testClassesModule() {
    console.log('📋 TEST 3: Módulo de clases');

    const validClass = {
        name: "Salsa Avanzada",
        level: "Advanced",
        genre: "Salsa",
        is_favorites: true,
        description: "Clase para nivel avanzado",
        duration: 60,
        teacher_id: 1,
        date: "Monday",
        hour: "18:00",
        capacity: 20
    };

    const result = await safeValidateModuleData('classes', validClass);

    if (result.success) {
        console.log('✅ PASS: Clase válida');
    } else {
        console.log('❌ FAIL: Debería ser válido');
        console.log('Errores:', result.error.errors);
    }

    console.log('');
}

// ============================================
// TEST 4: Validar módulo 'payments'
// ============================================
async function testPaymentsModule() {
    console.log('📋 TEST 4: Módulo de pagos');

    const validPayment = {
        user_id: 5,
        plan_id: 2,
        original_amount: 100,
        amount: 90,
        discount_type: "percentage",
        discount_value: 10,
        payment_method: "card",
        payment_date: ["2026-02-17", "2026-02-17"],
        status: "completed"
    };

    const result = await safeValidateModuleData('payments', validPayment);

    if (result.success) {
        console.log('✅ PASS: Pago válido');
    } else {
        console.log('❌ FAIL: Debería ser válido');
        if (result.error?.errors) {
            console.log('Errores:', result.error.errors);
        } else if (result.error) {
            console.log('Error:', result.error);
        }
    }

    console.log('');
}

// ============================================
// TEST 5: Validar campos requeridos
// ============================================
async function testRequiredFields() {
    console.log('📋 TEST 5: Campos requeridos');

    const incompleteUser = {
        first_name: "Juan",
        // Faltan campos requeridos
    };

    const result = await safeValidateModuleData('users', incompleteUser);

    if (!result.success) {
        console.log('✅ PASS: Campos requeridos faltantes detectados');
        if (result.error?.errors) {
            console.log(`   Errores encontrados: ${result.error.errors.length}`);
        }
    } else {
        console.log('❌ FAIL: Debería fallar por campos faltantes');
    }

    console.log('');
}

// ============================================
// Ejecutar todas las pruebas
// ============================================
async function runAllTests() {
    try {
        await testUsersModule();
        await testPlansModule();
        await testClassesModule();
        await testPaymentsModule();
        await testRequiredFields();

        console.log('✨ Pruebas completadas\n');
    } catch (error) {
        console.error('💥 Error durante las pruebas:', error);
        process.exit(1);
    }
}

// Ejecutar
runAllTests();
