import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

// --- Constantes de Generación ---
const NUM_PROFESSORS = 10;
const NUM_STUDENTS = 100;
const NUM_CLASSES = 25;
const NUM_FAVORITE_CLASSES = 5;
const PROFESSOR_ROLE_ID = 3;
const STUDENT_ROLE_ID = 2;

const CLASS_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Detalles de planes (Simulando lo que hay en la DB)
const PLANS = {
    1: { id: 1, name: "Mensualidad Ilimitada", price: 30, max_classes: 0, type: 'monthly' }, // max_classes 0 = infinito para lógica interna
    2: { id: 2, name: "Paquete de 4 Clases", price: 12, max_classes: 1, type: 'package' }, // max_classes simultaneas
    3: { id: 3, name: "Paquete de 8 Clases", price: 20, max_classes: 2, type: 'package' },
    4: { id: 4, name: "Paquete de 16 Clases", price: 30, max_classes: 4, type: 'package' }
};

// Límites de asistencia para simulación (Cuantas clases realmente 'usaron')
const PLAN_USAGE_LIMITS = {
    1: 9999,
    2: 4,
    3: 8,
    4: 16,
};

// Límites de inscripciones simultáneas (max_classes de la tabla plans)
const PLAN_MAX_REGISTRATIONS = {
    1: 100,
    2: 1,
    3: 2,
    4: 4,
};

const createRandomUser = (roleId) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const user = {
        first_name: firstName,
        last_name: lastName,
        email: faker.internet.email({ firstName, lastName, provider: 'fakedance.com' }).toLowerCase(),
        password: bcrypt.hashSync('password123', 10),
        role_id: roleId,
        email_verified: faker.datatype.boolean(),
        last_login: faker.date.recent({ days: 60 }),
        created_at: faker.date.past({ years: 1 }),
        updated_at: faker.date.recent({ days: 1 }),
    };
    // Ya no agregamos datos de plan aquí
    return user;
};

const createRandomClass = (teacherIds) => {
    const level = faker.helpers.arrayElement(['Basic', 'Intermediate', 'Advanced']);
    const genre = faker.helpers.arrayElement(['Salsa', 'Bachata']);
    const days = faker.helpers.arrayElement(CLASS_DAYS).toString();
    const randomHour = faker.number.int({ min: 8, max: 22 }).toString().padStart(2, '0');
    const randomMinute = faker.helpers.arrayElement([0, 30]).toString().padStart(2, '0');
    const classHour = `${randomHour}:${randomMinute}`;

    return {
        name: `${genre} (${level})`,
        level: level,
        genre: genre,
        description: faker.lorem.sentence(),
        duration: faker.number.int({ min: 60, max: 90 }),
        date: days,
        hour: classHour,
        capacity: faker.number.int({ min: 15, max: 30 }),
        teacher_id: faker.helpers.arrayElement(teacherIds),
        created_at: faker.date.past({ years: 0.5 }),
        updated_at: faker.date.recent({ days: 1 }),
        is_favorites: false,
    };
};

const getDateForDay = (dayName) => {
    const today = new Date();
    const targetDayIndex = CLASS_DAYS.indexOf(dayName);

    if (targetDayIndex === -1) {
        return faker.date.past({ days: 30 });
    }

    const currentDayIndex = today.getDay();
    let currentAdjustedIndex = (currentDayIndex === 0) ? 6 : currentDayIndex - 1;
    let daysToSubtract = currentAdjustedIndex - targetDayIndex;
    if (daysToSubtract < 0) {
        daysToSubtract += 7;
    }

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - daysToSubtract - 7);
    const randomWeeksBack = faker.number.int({ min: 1, max: 4 });
    targetDate.setDate(targetDate.getDate() - (randomWeeksBack * 7));

    return targetDate;
};


/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
    // 0. Limpieza
    console.log(`\n--- Limpiando Tablas ---`);
    await knex('attendance').del();
    await knex('user_class').del();
    await knex('user_registration_history').del();
    await knex('user_plan').del();
    await knex('payments').del();
    await knex('classes').del();
    await knex('users').whereIn('role_id', [PROFESSOR_ROLE_ID, STUDENT_ROLE_ID]).del();


    console.log(`\n--- Generando datos de prueba (Faker) ---`);

    // 1. Profesores
    console.log(`- Insertando ${NUM_PROFESSORS} Profesores.`);
    const professorRecords = faker.helpers.multiple(() => createRandomUser(PROFESSOR_ROLE_ID), { count: NUM_PROFESSORS });
    await knex('users').insert(professorRecords);
    const professors = await knex('users').select('id').where('role_id', PROFESSOR_ROLE_ID);
    const professorIds = professors.map(p => p.id);

    // 2. Estudiantes
    console.log(`- Insertando ${NUM_STUDENTS} Estudiantes.`);
    const studentRecords = faker.helpers.multiple(() => createRandomUser(STUDENT_ROLE_ID), { count: NUM_STUDENTS });
    // Insertamos y recuperamos IDs
    const studentIds = await knex('users').insert(studentRecords); // SQLite/Postgres returns ids, but MySQL might not with basic insert.
    // Para asegurar compatibilidad MySQL, hacemos select.
    const students = await knex('users').select('id', 'first_name', 'last_name').where('role_id', STUDENT_ROLE_ID);

    // 3. Clases
    if (professorIds.length === 0) { console.error("¡ERROR! No hay profesores."); return; }
    let classRecords = faker.helpers.multiple(() => createRandomClass(professorIds), { count: NUM_CLASSES });
    if (NUM_FAVORITE_CLASSES <= NUM_CLASSES) {
        for (let i = 0; i < NUM_FAVORITE_CLASSES; i++) { classRecords[i].is_favorites = true; }
    }
    console.log(`- Insertando ${NUM_CLASSES} Clases.`);
    await knex('classes').insert(classRecords);
    // Recuperar clases para usar después
    const classesWithDay = await knex('classes').select('id', 'date');


    // 4. Generar Pagos, Planes de Usuario e Historial
    console.log(`- Generando Pagos y Planes para Estudiantes.`);
    const userPlansToInsert = [];
    const paymentsToInsert = [];
    const historyToInsert = [];
    const activeStudentPlans = []; // Para usar en inscripciones en memoria

    // Simulación: Iterar estudiantes 1 por 1 para mantener integridad de relaciones ID
    // NOTA: Para batch performance masiva optimo seria generar primero todos los jsons,
    // pero necesitamos el ID del payment para el user_plan.
    // Haremos inserts en batchs pequeños o individuales?
    // Para simplicidad del seeder y consistencia, generaremos los objetos payment, los insertaremos, recuperaremos sus IDs y luego user_plans.

    // Mejor enfoque: Iterar estudiante y hacer el flujo completo (aunque sea mas lento, es seguro).
    // O mejor: Pre-calcular todo asumiendo auto-inc? No seguro.
    // Enfoque híbrido: Generar data para todos, insertar payments masivo, recuperar ordenado (arriesgado si no hay orden garantizado).

    // Vamos loop por loop con await. Es un seed, no prod.
    for (const student of students) {
        const planId = faker.number.int({ min: 1, max: 4 });
        const planDetails = PLANS[planId];
        const planStatus = faker.helpers.arrayElement(['active', 'active', 'active', 'expired', 'paused', 'finished']);

        // Sincronización de fechas: Fecha de registro = Fecha de pago = Fecha inicio plan
        const registrationDate = faker.date.recent({ days: 30 });

        // --- Payment ---
        const amount = planDetails.price;
        const discountValue = faker.datatype.boolean() ? faker.number.int({ min: 0, max: 5 }) : 0;
        const finalAmount = amount - discountValue;

        // Insertamos Payment individualmente para obtener ID seguro
        const [paymentId] = await knex('payments').insert({
            user_id: student.id,
            plan_id: planId,
            original_amount: amount,
            amount: finalAmount,
            discount_type: discountValue > 0 ? 'fixed' : null,
            discount_value: discountValue > 0 ? discountValue : null,
            payment_method: faker.helpers.arrayElement(['credit_card', 'cash', 'transfer']),
            payment_date: registrationDate,
            status: 'completed', // Asumimos pagado para tener plan
            transaction_id: faker.string.uuid(),
            created_at: registrationDate,
        }); // Returns array of ids in mysql with knex usually? Check config. 
        // MySQL knex insert returns [id] usually.

        // --- User Plan ---
        const startDate = registrationDate;
        const endDate = faker.date.soon({ days: 30, refDate: startDate });

        const maxClasses = planDetails.max_classes; // Del plan
        const limitUsage = PLAN_USAGE_LIMITS[planId];
        let classesUsed = 0;

        if (planStatus === 'active') {
            // Determinar uso basado en tiempo transcurrido approx
            classesUsed = faker.number.int({ min: 0, max: limitUsage > 100 ? 50 : limitUsage }); // Max 50 para ilimitado
        } else {
            classesUsed = faker.number.int({ min: 0, max: limitUsage });
        }

        // Calcular remaining (Para ilimitados o paquetes)
        // Para ilimitados (id 1) el remaining podria ser 0 o un codigo, pero el schema pide integer.
        // Asumiremos lógica de negocio: si es ilimitado, remaining = 9999 o similar.
        let classesRemaining = 0;
        if (planId === 1) {
            classesRemaining = 9999;
        } else {
            classesRemaining = Math.max(0, PLAN_USAGE_LIMITS[planId] - classesUsed); // Usamos LIMITS simulados como el total 'comprado'
            // Ojo: En tabla PLAN el max_sessions es lo que se compra.
            // PLAN_USAGE_LIMITS coincide con PLAN.max_sessions (excepto ilimitado)
        }

        const userPlanIdArray = await knex('user_plan').insert({
            user_id: student.id,
            plan_id: planId,
            payment_id: paymentId,
            status: planStatus,
            start_date: startDate,
            end_date: endDate,
            max_classes: PLAN_USAGE_LIMITS[planId], // Total sesiones permitidas
            classes_used: classesUsed,
            classes_remaining: classesRemaining,
            created_at: startDate,
            updated_at: new Date()
        });

        // --- History ---
        await knex('user_registration_history').insert({
            user_id: student.id,
            plan_id: planId.toString(),
            payment_id: paymentId.toString(),
            action_type: 'subscribed',
            previous_plan_id: 0,
            classes_purchased: PLAN_USAGE_LIMITS[planId].toString(),
            classes_used: classesUsed.toString(), // Hasta el momento
            start_date: startDate,
            end_date: endDate,
            status: planStatus,
            created_at: startDate
        });

        // Guardar para inscripciones
        if (planStatus === 'active') {
            activeStudentPlans.push({
                student_id: student.id,
                plan_id: planId,
                classes_used: classesUsed // Objetive to match
            });
        }
    }


    // 5. Inscripciones y Asistencia (User Class & Attendance)
    console.log(`- Generando Inscripciones y Asistencias.`);
    const registrations = [];
    const attendances = [];

    for (const studentPlan of activeStudentPlans) {

        // Cuantas clases inscribir?
        const registrationLimit = PLAN_MAX_REGISTRATIONS[studentPlan.plan_id];
        const classesToMarkAttended = studentPlan.classes_used;

        // Logica para no inscribir mas de lo permitido por el plan (max_classes simultaneas)
        // Pero necesitamos cubrir las 'classes_used' (históricas).
        // En un escenario real, te desinscribes para inscribir otra si topas cupo.
        // Para simplificar: Inscribimos CURRENTLY un numero <= max_registrations.
        // Y generamos asistencias históricas que pueden ser de clases pasadas (incluso si ya no esta inscrito hoy).
        // PERO el modelo `user_class` suele representar inscripciones activas/vigentes recurrente.
        // Asumiremos que se inscribe en todas las que asiste para simplificar modelo relacional si es requerido.

        // Ajuste: Inscribir en N clases aleatorias
        let numClassesToEnroll = faker.number.int({ min: 1, max: registrationLimit });

        // Si ha asistido a más clases de las que puede inscribir simultaneamente, 
        // asumimos que asiste rotativamente.
        // Seleccionamos un pool de clases para inscripcion "Actual"
        const randomClasses = faker.helpers.shuffle(classesWithDay);
        const enrolledClasses = randomClasses.slice(0, numClassesToEnroll);

        enrolledClasses.forEach(c => {
            registrations.push({
                user_id: studentPlan.student_id,
                class_id: c.id,
                created_at: faker.date.recent({ days: 60 }),
                updated_at: faker.date.recent({ days: 1 })
            });
        });

        // Generar Asistencias (Attendance)
        // Deben sumar 'classesToMarkAttended'.
        // Pueden ser de las clases inscritas o de otras pasadas. Priorizamos inscritas.
        const poolForAttendance = faker.helpers.shuffle(randomClasses.slice(0, 20)); // Pool un poco más grande
        const classesForAttendance = poolForAttendance.slice(0, classesToMarkAttended);

        classesForAttendance.forEach(c => {
            attendances.push({
                student_id: studentPlan.student_id,
                class_id: c.id,
                status: 'present',
                date: getDateForDay(c.date)
            });
        });
    }

    console.log(`- Insertando ${registrations.length} inscripciones.`);
    await knex.batchInsert('user_class', registrations, 500);

    console.log(`- Insertando ${attendances.length} asistencias.`);
    await knex.batchInsert('attendance', attendances, 500);

    console.log(`\n✅ Proceso de siembra completado. Data normalizada creada.`);
}

export async function down(knex) {
    await knex('attendance').del();
    await knex('user_class').del();
    await knex('user_registration_history').del();
    await knex('user_plan').del();
    await knex('payments').del();
    await knex('classes').del();
    await knex('users').whereIn('role_id', [PROFESSOR_ROLE_ID, STUDENT_ROLE_ID]).del();
}