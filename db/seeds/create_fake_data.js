import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

// --- Constantes de Generación ---
const NUM_PROFESSORS = 5;
const NUM_STUDENTS = 50;
const PROFESSOR_ROLE_ID = 3;
const STUDENT_ROLE_ID = 2;

const CLASS_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SCHEDULE_WEEKDAY = [18, 19, 20]; // 6pm-9pm
const SCHEDULE_SATURDAY = [10, 11, 12, 13, 14, 15, 16]; // 10am-5pm

const PLANS = {
    1: { id: 1, name: "Mensualidad Ilimitada", price: 30, max_classes: 0, type: 'monthly', usage_limit: 0, registration_limit: 0 },
    2: { id: 2, name: "Paquete de 4 Clases", price: 12, max_classes: 1, type: 'package', usage_limit: 4, registration_limit: 1 },
    3: { id: 3, name: "Paquete de 8 Clases", price: 20, max_classes: 2, type: 'package', usage_limit: 8, registration_limit: 2 },
    4: { id: 4, name: "Paquete de 16 Clases", price: 30, max_classes: 4, type: 'package', usage_limit: 16, registration_limit: 4 }
};

// --- Helpers ---
const getStartDateHistory = () => {
    const today = new Date();
    const date = new Date(today);
    date.setMonth(today.getMonth() - 2);
    date.setDate(date.getDate() - 15); // Un poco más atrás para asegurar ciclos completos
    return date;
};

const getDaysArray = (start, end) => {
    for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
    }
    return arr;
};

const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const selectRandomPlan = () => {
    return faker.helpers.weightedArrayElement([
        { weight: 5, value: 1 },  // Ilimitado (Raro)
        { weight: 40, value: 2 }, // 4 Clases (Común)
        { weight: 40, value: 3 }, // 8 Clases (Común)
        { weight: 15, value: 4 }  // 16 Clases (Esporádico)
    ]);
};

// --- Clean DB ---
const cleanDb = async (knex) => {
    console.log(`\n--- Limpiando Tablas ---`);
    await knex('attendances').del();
    await knex('user_class').del();
    await knex('user_registration_history').del();
    await knex('user_plan').del();
    await knex('payments').del();
    await knex('classes').del();
    await knex('users').whereIn('role_id', [PROFESSOR_ROLE_ID, STUDENT_ROLE_ID]).del();
};

// --- Seeds ---
const seedUsers = async (knex) => {
    console.log(`\n--- Generando Usuarios ---`);
    // Profesores
    const professorRecords = faker.helpers.multiple(() => ({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email({ provider: 'academy.com' }).toLowerCase(),
        phone: faker.phone.number(),
        password: bcrypt.hashSync('password123', 10),
        role_id: PROFESSOR_ROLE_ID,
        created_at: getStartDateHistory(),
        updated_at: new Date()
    }), { count: NUM_PROFESSORS });

    await knex('users').insert(professorRecords);
    const professors = await knex('users').select('id').where('role_id', PROFESSOR_ROLE_ID);
    const professorIds = professors.map(p => p.id);

    // Estudiantes
    const studentRecords = [];
    for (let i = 0; i < NUM_STUDENTS; i++) {
        const joinedDate = faker.date.between({ from: getStartDateHistory(), to: new Date() });
        studentRecords.push({
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email().toLowerCase(),
            phone: faker.phone.number(),
            password: bcrypt.hashSync('password123', 10),
            role_id: STUDENT_ROLE_ID,
            created_at: joinedDate, // Fecha base para su primer plan
            updated_at: joinedDate
        });
    }
    await knex('users').insert(studentRecords);
    const students = await knex('users').select('id', 'created_at').where('role_id', STUDENT_ROLE_ID);
    return { professorIds, students };
};

const seedClasses = async (knex, professorIds) => {
    console.log(`\n--- Generando Clases ---`);
    const genres = ['Salsa', 'Bachata', 'Kizomba', 'Hip Hop'];
    const levels = ['Básico', 'Intermedio', 'Avanzado'];
    const classes = [];

    for (const day of CLASS_DAYS) {
        const slots = day === 'Saturday' ? SCHEDULE_SATURDAY : SCHEDULE_WEEKDAY;
        for (const hour of slots) {
            const numSimultaneous = faker.number.int({ min: 1, max: 2 });
            for (let i = 0; i < numSimultaneous; i++) {
                const genre = faker.helpers.arrayElement(genres);
                const level = faker.helpers.arrayElement(levels);
                classes.push({
                    name: `${genre} ${level}`,
                    description: `Clase de ${genre} nivel ${level}`,
                    date: day,
                    hour: `${hour.toString().padStart(2, '0')}:00`,
                    teacher_id: faker.helpers.arrayElement(professorIds),
                    capacity: faker.number.int({ min: 20, max: 30 }),
                    genre: genre,
                    level: level,
                    duration: 60,
                    created_at: getStartDateHistory(),
                    updated_at: new Date()
                });
            }
        }
    }
    await knex('classes').insert(classes);
    return await knex('classes').select('*');
};

const seedLifeCycle = async (knex, students, allClasses) => {
    console.log(`\n--- Generando Ciclo de Vida del Estudiante (Historial, Pagos, Asistencias) ---`);

    const attendances = [];
    const enrollments = [];
    const history = [];
    const userPlans = [];
    const payments = [];

    // Iterar por estudiante
    for (const student of students) {
        let cycleStartDate = new Date(student.created_at);
        const today = new Date();

        // Asignamos 'Classes de Preferencia' para que el alumno mantenga consistencia en clases que atiende
        const preferredClasses = faker.helpers.shuffle(allClasses).slice(0, 10);

        let isActive = false;

        while (cycleStartDate <= today) {
            const planId = selectRandomPlan();
            const plan = PLANS[planId];

            // Determinar si este ciclo corresponde al 'Presente' (Activo)
            // Lógica: Si start + 30 dias > hoy, o si decidimos que este es el último.
            // Para simplificar y asegurar estado Activo:
            // Si la fecha de inicio es reciente (mes actual o hace poco), lo hacemos activo. 
            // O mejor: simplemente cortamos el loop cuando generamos el 'Plan Actual'.

            // Calculamos duración teórica
            const theoryEndDate = new Date(cycleStartDate);
            theoryEndDate.setDate(theoryEndDate.getDate() + 30);

            const isCurrent = theoryEndDate > today;

            // Datos del Plan para este ciclo
            const limit = plan.usage_limit;
            const isUnlimited = (limit === 0);

            // Selección de clases para 'Inscripción' en este ciclo (Respetando registration_limit del plan)
            let regLimit = plan.registration_limit;
            if (regLimit === 0) regLimit = faker.number.int({ min: 3, max: 6 });
            const cycleClasses = preferredClasses.slice(0, regLimit);

            // --- Simulación de Asistencias ---
            let usedCount = 0;
            let actualEndDate = theoryEndDate; // Por defecto dura el mes
            const cycleAttendances = [];

            // Iterar días del ciclo
            const potentialDays = getDaysArray(cycleStartDate, theoryEndDate);

            for (const d of potentialDays) {
                if (d > today) break; // No predecir futuro

                // Si es paquete y ya gastó sus clases -> Termina el ciclo anticipadamente (Renovación)
                if (!isUnlimited && usedCount >= limit) {
                    actualEndDate = new Date(d);
                    break;
                }

                const dayName = getDayName(d);
                // Buscar clases coincidentes en sus inscripciones para este día
                const dayClasses = cycleClasses.filter(c => c.date === dayName);

                for (const cls of dayClasses) {
                    if (!isUnlimited && usedCount >= limit) break; // Check doble

                    // Asistir?
                    if (faker.datatype.boolean(0.8)) { // 80% asistencia
                        const status = faker.helpers.arrayElement(['present', 'absent', 'present', 'present']);
                        cycleAttendances.push({
                            student_id: student.id,
                            class_id: cls.id,
                            date: new Date(d),
                            status: status,
                            created_at: d
                        });
                        if (status === 'present') usedCount++;
                    }
                }
            }

            // --- Registrar Datos del Ciclo ---

            if (isCurrent) {
                // Generar PAGO y PLAN ACTIVO
                const paymentDate = cycleStartDate;
                // Payment ID (Insertamos real)
                // Nota: batchInsert no devuelve IDs facil en todos los drivers. 
                // Insertaremos el pago individualmente o usaremos un ID simulado si fuera Postgres,
                // Pero para MySQL debemos insertar para obtener ID. 
                // Para optimizar seed, haremos insert directo aquí.

                const [paymentId] = await knex('payments').insert({
                    user_id: student.id,
                    plan_id: planId,
                    original_amount: plan.price,
                    amount: plan.price,
                    status: 'completed',
                    payment_method: faker.helpers.arrayElement(['cash', 'credit_card', 'transfer']),
                    created_at: paymentDate,
                    payment_date: paymentDate
                });

                // Active Plan
                const remaining = isUnlimited ? 0 : Math.max(0, limit - usedCount);
                await knex('user_plan').insert({
                    user_id: student.id,
                    plan_id: planId,
                    payment_id: paymentId,
                    status: 'active',
                    start_date: cycleStartDate,
                    end_date: actualEndDate > today ? actualEndDate : new Date(today.getTime() + 86400000), // Si terminó hoy, le damos 1 día más para que salga activo
                    max_classes: limit,
                    classes_used: usedCount,
                    classes_remaining: remaining,
                    created_at: cycleStartDate,
                    updated_at: new Date()
                });

                // Inscripciones (User Class) - Solo para el actual
                for (const c of cycleClasses) {
                    enrollments.push({
                        user_id: student.id,
                        class_id: c.id,
                        created_at: cycleStartDate,
                        updated_at: cycleStartDate
                    });
                }

                // Historial
                history.push({
                    user_id: student.id,
                    plan_id: planId.toString(),
                    payment_id: paymentId.toString(),
                    action_type: 'subscribed',
                    previous_plan_id: 0,
                    classes_purchased: limit.toString(),
                    classes_used: usedCount.toString(),
                    start_date: cycleStartDate,
                    end_date: actualEndDate,
                    status: 'active',
                    created_at: cycleStartDate
                });

                attendances.push(...cycleAttendances);
                break; // Terminamos con este estudiante (está al día)

            } else {
                // Ciclo PASADO (Historial)
                // No creamos Payment (Solo ID fake para FK si es string no-FK, o null si lo permite... 
                // El usuario dijo "Solo pago de este mes". 
                // Usaremos un string 'LEGACY' para payment_id, asumiendo que no hay FK constraint estricta en DB, 
                // o que 'payments' no es requerida para estos registros viejos.
                // Si explota, sabremos que se necesita pago real.)

                history.push({
                    user_id: student.id,
                    plan_id: planId.toString(),
                    payment_id: 'LEGACY-ARCHIVE',
                    action_type: 'renewal',
                    previous_plan_id: 0,
                    classes_purchased: limit.toString(),
                    classes_used: usedCount.toString(), // Final del ciclo
                    start_date: cycleStartDate,
                    end_date: actualEndDate,
                    status: 'finished',
                    created_at: cycleStartDate
                });

                attendances.push(...cycleAttendances);

                // Avanzar al siguiente ciclo
                const nextStart = new Date(actualEndDate);
                nextStart.setDate(nextStart.getDate() + 1);

                // Si nextStart > Today, entonces este FUE el ciclo actual pero se agotó?
                // Si se agotó ayer, hoy debería empezar uno nuevo.
                cycleStartDate = nextStart;
            }
        }
    }

    // Bulk Inserts
    if (enrollments.length) await knex.batchInsert('user_class', enrollments, 500);
    if (history.length) await knex.batchInsert('user_registration_history', history, 500);
    if (attendances.length) await knex.batchInsert('attendances', attendances, 500);

    console.log(`- Generados ${enrollments.length} inscripciones activas.`);
    console.log(`- Generados ${history.length} registros de historial.`);
    console.log(`- Generados ${attendances.length} asistencias.`);
};

// --- Main ---
export async function seed(knex) {
    await cleanDb(knex);

    const { professorIds, students } = await seedUsers(knex);
    if (professorIds.length > 0) {
        const allClasses = await seedClasses(knex, professorIds);
        await seedLifeCycle(knex, students, allClasses);
    }

    console.log(`\n✅ Seed Completo.`);
}

export async function down(knex) {
    await cleanDb(knex);
}