import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

// --- Constantes de Generación ---
const NUM_PROFESSORS = 10;
const NUM_STUDENTS = 100;
const NUM_CLASSES = 50;
const NUM_FAVORITE_CLASSES = 10;
const PROFESSOR_ROLE_ID = 3;
const STUDENT_ROLE_ID = 2;

const CLASS_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// 💡 LÍMITES DE CLASES POR PLAN para simular el enlace con la tabla 'plans'
// 'max_sessions' (Usado para el contador de asistencia)
const PLAN_LIMITS = {
    1: 9999, // Plan Ilimitado: Usamos un número muy grande, pero la generación de uso se limitará.
    2: 4,    // Plan Básico (4 sesiones)
    3: 8,    // Plan Intermedio (8 sesiones, como el ejemplo de Arvel)
    4: 16,   // Plan Avanzado
};

// 💡 Límite de clases en las que se pueden inscribir ('max_classes')
// Si el Plan 8 Clases (ID 3) tiene 2 clases máximas, ajustamos este valor.
const PLAN_MAX_REGISTRATIONS = {
    1: 100,  // Ilimitado (un número alto)
    2: 1,    // Básico (ejemplo: 5 inscripciones permitidas)
    3: 2,    // 🚨 CORREGIDO: Intermedio (usando tu ejemplo: 2 inscripciones permitidas)
    4: 16,   // Avanzado (ejemplo: 15 inscripciones permitidas)
};


const createRandomUser = (roleId) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const user = {
        first_name: firstName,
        last_name: lastName,
        email: faker.internet.email({ firstName, lastName, provider: 'fakedance.com' }).toLowerCase(),
        // Uso de bcrypt.hashSync para cifrar la contraseña 'password123'
        password: bcrypt.hashSync('password123', 10),
        role_id: roleId,
        email_verified: faker.datatype.boolean(),
        last_login: faker.date.recent({ days: 60 }),
        created_at: faker.date.past({ years: 1 }),
        updated_at: faker.date.recent({ days: 1 }),
    };

    // Agregar datos de plan solo para estudiantes (role_id = 2)
    if (roleId === STUDENT_ROLE_ID) {
        user.plan_id = faker.number.int({ min: 1, max: 4 });

        // 💡 CORRECCIÓN 1: Fechas de plan recientes (dentro de los últimos 30 días)
        user.plan_start_date = faker.date.recent({ days: 30 });
        // Plan end date approx 30 days after start
        user.plan_end_date = faker.date.soon({ days: 30, refDate: user.plan_start_date });

        // Status realista: mayor probabilidad de activo
        user.plan_status = faker.helpers.arrayElement(['active', 'active', 'active', 'expired', 'paused', 'finished']);

        // 💡 CORRECCIÓN 2: Inicializar plan_classes_used basado en el status
        const planLimit = PLAN_LIMITS[user.plan_id] || 16;
        const registrationLimit = PLAN_MAX_REGISTRATIONS[user.plan_id] || 5; // NUEVO: obtener límite de inscripción

        // NEW: Definir el límite máximo real para la generación aleatoria de uso
        let maxUsageForPlan = planLimit;
        if (user.plan_id === 1 && user.plan_status === 'active') {
            // Para plan ilimitado, limitamos el uso a un máximo realista de prueba (ej. 50 clases)
            maxUsageForPlan = 50;
        }

        if (user.plan_status === 'active') {
            // 🚨 FIX: El uso de clases (asistencias) nunca debe exceder el límite de INSCRIPCIONES (max_classes)
            // ya que un estudiante solo puede asistir a una clase en la que está inscrito.
            // Por lo tanto, el uso mínimo debe ser 0 y el máximo debe ser Math.max(0, registrationLimit - 1).
            user.plan_classes_used = faker.number.int({ min: 0, max: Math.max(0, registrationLimit - 1) });
        } else if (user.plan_status === 'finished') {
            // Finalizados están en el límite o por encima 
            user.plan_classes_used = planLimit;
        } else {
            // Expired/Paused tienen uso aleatorio, hasta el límite
            user.plan_classes_used = faker.number.int({ min: 0, max: planLimit });
        }
    }

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
        duration: faker.number.int({ min: 60, max: 90 }), // Minutos
        date: days, // Ejemplo: 'Monday'
        hour: classHour, // Hora en formato 24h (HH:mm)
        capacity: faker.number.int({ min: 15, max: 30 }),
        // Asignación obligatoria a un profesor
        teacher_id: faker.helpers.arrayElement(teacherIds),
        created_at: faker.date.past({ years: 0.5 }),
        updated_at: faker.date.recent({ days: 1 }),
        // is_favorites se asignará más tarde para controlar el conteo
        is_favorites: false,
    };
};

// --- Funciones de Seeder (Knex) ---

/**
 * Función auxiliar para obtener una fecha en el pasado que caiga en el día de la semana dado (en inglés)
 * @param {string} dayName - Nombre del día en inglés ('Monday', 'Tuesday', etc.)
 * @returns {Date} Una fecha en el pasado reciente.
 */
const getDateForDay = (dayName) => {
    const today = new Date();
    const targetDayIndex = CLASS_DAYS.indexOf(dayName); // CLASS_DAYS es en inglés

    if (targetDayIndex === -1) {
        // Si el nombre del día es inválido, devuelve una fecha reciente por defecto
        return faker.date.past({ days: 30 });
    }

    // Índice del día de la semana actual (0=Domingo, 1=Lunes, ...)
    const currentDayIndex = today.getDay();

    // Ajuste para que Lunes=0, Martes=1, ..., Sábado=5
    let currentAdjustedIndex = (currentDayIndex === 0) ? 6 : currentDayIndex - 1; // Domingo a 6 (fin de semana)

    // Días a retroceder para alcanzar el día objetivo
    let daysToSubtract = currentAdjustedIndex - targetDayIndex;
    if (daysToSubtract < 0) {
        // Si el día objetivo ya pasó esta semana (ej. hoy es lunes, objetivo es viernes), retrocede una semana completa
        daysToSubtract += 7;
    }

    const targetDate = new Date(today);
    // Retroceder los días necesarios y una semana adicional (7 días) para garantizar que esté en el pasado
    targetDate.setDate(today.getDate() - daysToSubtract - 7);

    // Asegurar que la fecha sea reciente, pero en el día correcto
    // Limitamos la generación a las últimas 4 semanas
    const randomWeeksBack = faker.number.int({ min: 1, max: 4 });
    targetDate.setDate(targetDate.getDate() - (randomWeeksBack * 7));

    return targetDate;
};


/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
    // 0. Limpieza: Importante para evitar conflictos de Foreign Keys
    await knex('attendance').del(); // 💡 Limpiar asistencia para evitar duplicados
    await knex('class_user').del();
    await knex('classes').del();
    // Solo borrar usuarios con los roles específicos que creamos
    await knex('users').whereIn('role_id', [PROFESSOR_ROLE_ID, STUDENT_ROLE_ID]).del();


    console.log(`\n--- Generando datos de prueba (Faker) ---`);

    // 1. Crear e insertar Profesores (necesario para las clases)
    const professorRecords = faker.helpers.multiple(() => createRandomUser(PROFESSOR_ROLE_ID), { count: NUM_PROFESSORS });
    console.log(`- Insertando ${NUM_PROFESSORS} Profesores.`);
    await knex('users').insert(professorRecords);

    // Obtener los IDs de los profesores recién creados
    const professors = await knex('users').select('id').where('role_id', PROFESSOR_ROLE_ID);
    const professorIds = professors.map(p => p.id);

    // 2. Crear e insertar Estudiantes
    const studentRecords = faker.helpers.multiple(() => createRandomUser(STUDENT_ROLE_ID), { count: NUM_STUDENTS });
    console.log(`- Insertando ${NUM_STUDENTS} Estudiantes.`);
    // Usamos knex.insert y luego recuperamos los estudiantes para la siguiente lógica.
    await knex('users').insert(studentRecords);

    // 3. Crear e insertar Clases (asignadas a los profesores)
    if (professorIds.length === 0) {
        console.error("¡ERROR! No hay profesores para asignar las clases.");
        return;
    }

    let classRecords = faker.helpers.multiple(() => createRandomClass(professorIds), { count: NUM_CLASSES });

    // LÓGICA DE FAVORITOS
    if (NUM_FAVORITE_CLASSES <= NUM_CLASSES) {
        for (let i = 0; i < NUM_FAVORITE_CLASSES; i++) {
            classRecords[i].is_favorites = true;
        }
        console.log(`- Marcando ${NUM_FAVORITE_CLASSES} clases como favoritas.`);
    } else {
        console.warn(`Advertencia: NUM_FAVORITE_CLASSES (${NUM_FAVORITE_CLASSES}) es mayor que NUM_CLASSES (${NUM_CLASSES}). Todas las clases serán favoritas.`);
    }


    console.log(`- Insertando ${NUM_CLASSES} Clases (asignadas a un profesor).`);
    await knex('classes').insert(classRecords);

    // --- 4. Crear Inscripciones (Tabla class_user) y Asistencias (Tabla attendance) ---
    // Obtener estudiantes con sus datos de plan
    const studentsWithPlan = await knex('users')
        .select('id', 'plan_status', 'plan_id', 'plan_classes_used') // Ahora seleccionamos plan_classes_used
        .where('role_id', STUDENT_ROLE_ID);

    // Obtener todas las clases con sus IDs y días asignados
    const classesWithDay = await knex('classes').select('id', 'date');

    const registrations = [];
    const attendances = [];
    let activeStudentsCount = 0;

    studentsWithPlan.forEach(student => {
        // 💡 Solo registrar estudiantes con plan activo
        if (student.plan_status === 'active') {
            activeStudentsCount++;

            // 1. Límite de clases a las que se puede inscribir (max_classes)
            const registrationLimit = PLAN_MAX_REGISTRATIONS[student.plan_id] || 5;
            const classesToMarkAttended = student.plan_classes_used;

            // 2. El número de clases a inscribir debe ser al menos igual a las que ya "usó"
            const minEnrollment = classesToMarkAttended;

            // Máximo de inscripciones para la generación aleatoria (limitado por el plan)
            let maxEnrollment = registrationLimit;

            // 🚨 FIX para el error "Max < Min" (YA ESTABA): Si las clases usadas exceden el límite de inscripción,
            // forzamos a que el máximo de inscripción sea al menos igual al uso actual.
            if (minEnrollment > maxEnrollment) {
                maxEnrollment = minEnrollment;
            }

            // 🚨 CORRECCIÓN PRINCIPAL: Aseguramos que el número aleatorio generado no exceda el límite del plan,
            // Y que no sea menor que el uso ya registrado.
            // Usamos Math.min para no pasarnos del límite del plan si el uso fue bajo.
            const effectiveMaxEnrollment = Math.min(maxEnrollment, registrationLimit);


            // Número final de inscripciones: un valor aleatorio entre el mínimo (clases asistidas) 
            // y el máximo permitido/ajustado (límite del plan o clases asistidas).
            // Si minEnrollment > effectiveMaxEnrollment, el fix previo ya lo maneja (maxEnrollment = minEnrollment).
            const numClassesToEnroll = faker.number.int({
                min: minEnrollment,
                max: effectiveMaxEnrollment // Usamos el límite ajustado
            });

            // 3. Seleccionar las clases para la inscripción
            const randomClasses = faker.helpers.shuffle(classesWithDay);
            const enrolledClasses = randomClasses.slice(0, numClassesToEnroll);

            // 4. Seleccionar las clases que fueron "asistidas" (la cantidad debe ser plan_classes_used)
            // Seleccionamos las primeras X clases de la lista de inscritas para marcar como asistidas.
            const attendedClasses = enrolledClasses.slice(0, classesToMarkAttended);

            // 5. Crear Registros de Inscripción
            enrolledClasses.forEach(classItem => {
                registrations.push({
                    user_id: student.id,
                    class_id: classItem.id,
                    created_at: faker.date.recent({ days: 60 }),
                    updated_at: faker.date.recent({ days: 1 }),
                });
            });

            // 6. Crear Registros de Asistencia (attendance)
            attendedClasses.forEach(classItem => {
                // 💡 Generar fecha de asistencia que coincida con el día de la clase
                const consistentDate = getDateForDay(classItem.date);

                attendances.push({
                    student_id: student.id,
                    class_id: classItem.id,
                    status: 'present', // Usar 'status'
                    date: consistentDate, // Fecha consistente con el día de la clase
                });
            });
        }
    });

    console.log(`- Generando ${registrations.length} inscripciones. (Solo para ${activeStudentsCount} estudiantes activos)`);
    // Insertar todas las inscripciones masivamente
    await knex.batchInsert('class_user', registrations, 500);

    // 💡 Insertar los registros de Asistencia
    console.log(`- Generando ${attendances.length} asistencias reales.`);
    await knex.batchInsert('attendance', attendances, 500);


    console.log(`\n✅ Proceso de siembra (seeding) completado exitosamente.`);
}

/**
 * @param { import("knex").Knex } knex
 */
export async function down(knex) {
    // Reverse the seed actions
    await knex('attendance').del();
    await knex('class_user').del();
    await knex('classes').del();
    await knex('users').whereIn('role_id', [PROFESSOR_ROLE_ID, STUDENT_ROLE_ID]).del();
}