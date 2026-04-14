import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

// --- Constantes de Generación ---
const NUM_PROFESSORS = 5;
const NUM_STUDENTS = 50;

const CLASS_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SCHEDULE_WEEKDAY = [18, 19, 20]; // 6pm-9pm
const SCHEDULE_SATURDAY = [10, 11, 12, 13, 14, 15, 16]; // 10am-5pm

// --- Helpers ---
const getStartDateHistory = () => {
    const today = new Date();
    const date = new Date(today);
    date.setMonth(today.getMonth() - 2);
    date.setDate(date.getDate() - 15);
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

// --- Clean DB ---
const cleanDb = async (knex, academyId, studentRoleId, teacherRoleId) => {
    console.log(`\n--- Limpiando Tablas para Academia: ${academyId} ---`);
    
    // El orden es importante por las Foreign Keys
    await knex('attendances').where({ academy_id: academyId }).del();
    await knex('user_class').where({ academy_id: academyId }).del();
    await knex('user_registration_history').where({ academy_id: academyId }).del();
    await knex('user_plan').where({ academy_id: academyId }).del();
    await knex('payments').where({ academy_id: academyId }).del();
    await knex('classes').where({ academy_id: academyId }).del();
    
    // Borrar usuarios con roles específicos en esta academia
    await knex('users')
        .where({ academy_id: academyId })
        .whereIn('role_id', [studentRoleId, teacherRoleId])
        .del();
        
    // Finalmente los planes
    await knex('plans').where({ academy_id: academyId }).del();
};

// --- Main Seed Logic ---
export async function seed(knex) {
    // 1. Obtener datos base (Academia y Roles)
    const academy = await knex('academies').first();
    if (!academy) {
        console.error("❌ Error: No se encontró ninguna academia. Crea una primero para poder generar datos.");
        return;
    }
    const academyId = academy.id;

    const roles = await knex('roles').select('id', 'name');
    const studentRole = roles.find(r => r.name === 'student');
    const teacherRole = roles.find(r => r.name === 'teacher');

    if (!studentRole || !teacherRole) {
        console.error("❌ Error: Faltan roles 'student' o 'teacher'. Revisa tus migraciones.");
        return;
    }

    const STUDENT_ROLE_ID = studentRole.id;
    const TEACHER_ROLE_ID = teacherRole.id;

    // 2. Limpieza previa del tenant
    await cleanDb(knex, academyId, STUDENT_ROLE_ID, TEACHER_ROLE_ID);

    // 3. Asegurar/Crear Planes para esta academia
    console.log(`\n--- Creando Planes para Academia: ${academy.name} ---`);
    const planDefinitions = [
        { name: "Mensualidad Ilimitada", description: "Acceso ilimitado a todas las clases.", price: 30, type: 'monthly', max_sessions: 0, max_classes: 0, academy_id: academyId },
        { name: "Paquete 4 clases", description: "4 clases para usar en el mes.", price: 12, type: 'package', max_sessions: 4, max_classes: 1, academy_id: academyId },
        { name: "Paquete 8 clases", description: "8 clases ideales para dos veces por semana.", price: 20, type: 'package', max_sessions: 8, max_classes: 2, academy_id: academyId },
        { name: "Paquete 16 clases", description: "16 clases para estudiantes intensivos.", price: 30, type: 'package', max_sessions: 16, max_classes: 4, academy_id: academyId }
    ];
    
    await knex('plans').insert(planDefinitions);
    const dbPlans = await knex('plans').where({ academy_id: academyId });
    
    // Mapeo por nombre para selección aleatoria ponderada
    const PLANS_MAP = {};
    dbPlans.forEach(p => PLANS_MAP[p.name] = p);

    const selectRandomPlan = () => {
        return faker.helpers.weightedArrayElement([
            { weight: 5, value: PLANS_MAP["Mensualidad Ilimitada"] },
            { weight: 40, value: PLANS_MAP["Paquete 4 clases"] },
            { weight: 40, value: PLANS_MAP["Paquete 8 clases"] },
            { weight: 15, value: PLANS_MAP["Paquete 16 clases"] }
        ]);
    };

    // 4. Generar Profesores
    console.log(`\n--- Generando ${NUM_PROFESSORS} Profesores ---`);
    const professorIds = [];
    for (let i = 0; i < NUM_PROFESSORS; i++) {
        const [prof] = await knex('users').insert({
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            email: faker.internet.email({ provider: 'academy.com' }).toLowerCase(),
            phone: faker.phone.number(),
            password: bcrypt.hashSync('password123', 10),
            role_id: TEACHER_ROLE_ID,
            academy_id: academyId,
            created_at: getStartDateHistory(),
            updated_at: new Date()
        }).returning('id');
        professorIds.push(typeof prof === 'object' ? prof.id : prof);
    }

    // 5. Generar Estudiantes
    console.log(`--- Generando ${NUM_STUDENTS} Estudiantes ---`);
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
            academy_id: academyId,
            created_at: joinedDate,
            updated_at: joinedDate
        });
    }
    await knex('users').insert(studentRecords);
    const students = await knex('users').select('id', 'created_at').where({ role_id: STUDENT_ROLE_ID, academy_id: academyId });

    // 6. Generar Clases
    console.log(`\n--- Generando Horarios de Clases ---`);
    const genres = ['Salsa', 'Bachata', 'Kizomba', 'Hip Hop'];
    const levels = ['Básico', 'Intermedio', 'Avanzado'];
    const classesData = [];

    for (const day of CLASS_DAYS) {
        const slots = day === 'Saturday' ? SCHEDULE_SATURDAY : SCHEDULE_WEEKDAY;
        for (const hour of slots) {
            const numSimultaneous = faker.number.int({ min: 1, max: 2 });
            for (let i = 0; i < numSimultaneous; i++) {
                const genre = faker.helpers.arrayElement(genres);
                const level = faker.helpers.arrayElement(levels);
                classesData.push({
                    name: `${genre} ${level}`,
                    description: `Clase de ${genre} nivel ${level}`,
                    date: day,
                    hour: `${hour.toString().padStart(2, '0')}:00`,
                    teacher_id: faker.helpers.arrayElement(professorIds),
                    academy_id: academyId,
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
    await knex('classes').insert(classesData);
    const allClasses = await knex('classes').where({ academy_id: academyId });

    // 7. Simular Ciclo de Vida del Estudiante
    console.log(`\n--- Generando Lifecycle (Pagos, Historial, Asistencias) ---`);
    const attendances = [];
    const enrollments = [];
    const history = [];

    for (const student of students) {
        let cycleStartDate = new Date(student.created_at);
        const today = new Date();
        const preferredClasses = faker.helpers.shuffle(allClasses).slice(0, 10);

        while (cycleStartDate <= today) {
            const plan = selectRandomPlan();
            const theoryEndDate = new Date(cycleStartDate);
            theoryEndDate.setDate(theoryEndDate.getDate() + 30);
            const isCurrent = theoryEndDate > today;

            const limit = plan.max_sessions || 0;
            const isUnlimited = (limit === 0);

            let regLimit = plan.max_classes || 0;
            if (regLimit === 0) regLimit = faker.number.int({ min: 3, max: 6 });
            const cycleClasses = preferredClasses.slice(0, regLimit);

            let usedCount = 0;
            let actualEndDate = theoryEndDate;
            const potentialDays = getDaysArray(cycleStartDate, theoryEndDate);

            for (const d of potentialDays) {
                if (d > today) break;
                if (!isUnlimited && usedCount >= limit) {
                    actualEndDate = new Date(d);
                    break;
                }
                const dayClasses = cycleClasses.filter(c => c.date === getDayName(d));
                for (const cls of dayClasses) {
                    if (!isUnlimited && usedCount >= limit) break;
                    if (faker.datatype.boolean(0.8)) { // 80% asistencia
                        const status = faker.helpers.arrayElement(['present', 'absent', 'present', 'present']);
                        attendances.push({
                            student_id: student.id,
                            class_id: cls.id,
                            academy_id: academyId,
                            date: new Date(d),
                            status: status,
                            created_at: d
                        });
                        if (status === 'present') usedCount++;
                    }
                }
            }

            // Siempre crear un Pago para cumplir con la restricción NOT NULL de la historia
            const [paymentId] = await knex('payments').insert({
                user_id: student.id,
                plan_id: plan.id,
                academy_id: academyId,
                original_amount: plan.price,
                amount: plan.price,
                status: 'completed',
                payment_method: faker.helpers.arrayElement(['cash', 'credit_card', 'transfer']),
                created_at: cycleStartDate,
                payment_date: cycleStartDate
            }).returning('id');

            const realPaymentId = typeof paymentId === 'object' ? paymentId.id : paymentId;

            if (isCurrent) {
                await knex('user_plan').insert({
                    user_id: student.id,
                    plan_id: plan.id,
                    academy_id: academyId,
                    payment_id: realPaymentId,
                    status: 'active',
                    start_date: cycleStartDate,
                    end_date: actualEndDate > today ? actualEndDate : new Date(today.getTime() + 86400000),
                    max_classes: limit,
                    classes_used: usedCount,
                    classes_remaining: isUnlimited ? 0 : Math.max(0, limit - usedCount),
                    created_at: cycleStartDate,
                    updated_at: new Date()
                });

                for (const c of cycleClasses) {
                    enrollments.push({
                        user_id: student.id,
                        class_id: c.id,
                        academy_id: academyId,
                        created_at: cycleStartDate,
                        updated_at: cycleStartDate
                    });
                }

                history.push({
                    user_id: student.id,
                    plan_id: plan.id,
                    academy_id: academyId,
                    payment_id: realPaymentId,
                    action_type: 'subscribed',
                    previous_plan_id: null,
                    classes_purchased: limit.toString(),
                    classes_used: usedCount.toString(),
                    start_date: cycleStartDate,
                    end_date: actualEndDate,
                    status: 'active',
                    created_at: cycleStartDate
                });
                break;
            } else {
                history.push({
                    user_id: student.id,
                    plan_id: plan.id,
                    academy_id: academyId,
                    payment_id: realPaymentId,
                    action_type: 'renewal',
                    previous_plan_id: null,
                    classes_purchased: limit.toString(),
                    classes_used: usedCount.toString(),
                    start_date: cycleStartDate,
                    end_date: actualEndDate,
                    status: 'finished',
                    created_at: cycleStartDate
                });
                
                cycleStartDate = new Date(actualEndDate);
                cycleStartDate.setDate(cycleStartDate.getDate() + 1);
            }
        }
    }

    // Inserciones masivas finales
    if (enrollments.length) await knex.batchInsert('user_class', enrollments, 500);
    if (history.length) await knex.batchInsert('user_registration_history', history, 500);
    if (attendances.length) await knex.batchInsert('attendances', attendances, 500);

    console.log(`\n✅ Seed Finalizado con éxito para: ${academy.name} (${academyId})`);
}