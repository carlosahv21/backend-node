import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

// --- Constantes de Generación ---
const NUM_PROFESSORS = 5;
const NUM_STUDENTS = 50;

const CLASS_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SCHEDULE_WEEKDAY = [18, 19, 20]; // 6pm-9pm
const SCHEDULE_SATURDAY = [10, 11, 12, 13, 14, 15, 16]; // 10am-5pm

// Mapa de calorías por género (basado en bienestar.md para persona de 70kg)
const CALORIES_BY_GENRE = {
    'Salsa': { min: 300, max: 450 },
    'Bachata': { min: 250, max: 400 },
    'Kizomba': { min: 250, max: 400 },
    'Hip Hop': { min: 400, max: 600 },
};

const INTENSITY_BY_GENRE = {
    'Salsa': 'medium',
    'Bachata': 'medium',
    'Kizomba': 'low',
    'Hip Hop': 'high',
};

const LEVEL_POINTS_THRESHOLD = {
    beginner: 0,
    intermediate: 30,
    advanced: 80,
    expert: 150,
};

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

const calculateStreaks = (dates) => {
    if (!dates.length) return { current: 0, longest: 0 };

    const sorted = [...new Set(dates.map(d => new Date(d).toDateString()))].sort();
    let longest = 1;
    let currentRun = 1;

    for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
            currentRun++;
            longest = Math.max(longest, currentRun);
        } else {
            currentRun = 1;
        }
    }

    const today = new Date().toDateString();
    const lastDate = sorted[sorted.length - 1];
    const daysSinceLast = Math.round((new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24));

    let current = 0;
    if (daysSinceLast <= 1) {
        current = currentRun;
    } else if (daysSinceLast === 0 || daysSinceLast === 1) {
        current = currentRun;
    }

    if (sorted.length === 1) {
        return { current: 1, longest: 1 };
    }

    return { current, longest };
};

const getLevelFromClasses = (totalClasses) => {
    if (totalClasses >= LEVEL_POINTS_THRESHOLD.expert) return 'expert';
    if (totalClasses >= LEVEL_POINTS_THRESHOLD.advanced) return 'advanced';
    if (totalClasses >= LEVEL_POINTS_THRESHOLD.intermediate) return 'intermediate';
    return 'beginner';
};

// --- Clean DB ---
const cleanDb = async (knex, academyId, studentRoleId, teacherRoleId) => {
    console.log(`\n--- Limpiando Tablas para Academia: ${academyId} ---`);

    const order = [
        'connections',
        'user_challenges',
        'user_achievements',
        'challenges',
        'achievements',
        'teacher_reviews',
        'student_stats',
        'attendances',
        'user_class',
        'user_registration_history',
        'user_plan',
        'payments',
        'classes',
        'plans',
    ];


    // Borrar usuarios con roles específicos en esta academia
    await knex('users')
        .where({ academy_id: academyId })
        .whereIn('role_id', [studentRoleId, teacherRoleId])
        .del();


    for (const table of order) {
        try {
            const hasAcademyId = await knex.schema.hasColumn(table, 'academy_id');
            if (hasAcademyId) {
                await knex(table).where({ academy_id: academyId }).del();
            }
        } catch {
        }
    }
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
    const receptionistRole = roles.find(r => r.name === 'receptionist');

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

    // 6. Generar Clases con datos de bienestar
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
                const calRange = CALORIES_BY_GENRE[genre];
                const dayCode = day.substring(0, 2).toUpperCase();

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
                    calories_estimate: faker.number.int({ min: calRange.min, max: calRange.max }),
                    intensity_level: INTENSITY_BY_GENRE[genre],
                    is_recurring: true,
                    recurrence_rule: `FREQ=WEEKLY;BYDAY=${dayCode}`,
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
                    if (faker.datatype.boolean(0.8)) {
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

    if (enrollments.length) await knex.batchInsert('user_class', enrollments, 500);
    if (history.length) await knex.batchInsert('user_registration_history', history, 500);
    if (attendances.length) await knex.batchInsert('attendances', attendances, 500);

    // 8. Generar datos de bienestar: Calcular student_stats desde asistencias
    console.log(`\n--- Generando Student Stats ---`);
    const allAttendances = await knex('attendances').select('student_id', 'date', 'status').where({ academy_id: academyId });
    const attendanceByStudent = {};

    for (const att of allAttendances) {
        if (att.status !== 'present') continue;
        if (!attendanceByStudent[att.student_id]) attendanceByStudent[att.student_id] = [];
        attendanceByStudent[att.student_id].push(att.date);
    }

    const studentStatsData = [];
    for (const student of students) {
        const dates = attendanceByStudent[student.id] || [];
        const totalClasses = dates.length;
        const streaks = calculateStreaks(dates);
        const lastDate = dates.length ? new Date(Math.max(...dates.map(d => new Date(d)))) : null;

        studentStatsData.push({
            user_id: student.id,
            total_classes_attended: totalClasses,
            current_streak_days: streaks.current,
            longest_streak_days: streaks.longest,
            total_points: totalClasses * 10,
            level: getLevelFromClasses(totalClasses),
            last_activity_at: lastDate,
            calculated_at: new Date(),
            academy_id: academyId,
        });
    }
    await knex.batchInsert('student_stats', studentStatsData, 500);

    // 9. Crear catálogo de achievements
    console.log(`--- Creando Achievements ---`);
    const achievementDefs = [
        { name: "Primera Clase", description: "Asististe a tu primera clase", trigger_type: "classes_count", trigger_value: 1, points: 10 },
        { name: "Dedicado", description: "Asististe a 10 clases", trigger_type: "classes_count", trigger_value: 10, points: 50 },
        { name: "Apasionado", description: "Asististe a 30 clases", trigger_type: "classes_count", trigger_value: 30, points: 150 },
        { name: "Veterano", description: "Asististe a 50 clases", trigger_type: "classes_count", trigger_value: 50, points: 300 },
        { name: "Leyenda", description: "Asististe a 100 clases", trigger_type: "classes_count", trigger_value: 100, points: 500 },
        { name: "Racha de 3", description: "Asististe 3 días consecutivos", trigger_type: "attendance_streak", trigger_value: 3, points: 30 },
        { name: "Racha de 7", description: "Asististe 7 días consecutivos", trigger_type: "attendance_streak", trigger_value: 7, points: 100 },
        { name: "Racha de 14", description: "Asististe 14 días consecutivos", trigger_type: "attendance_streak", trigger_value: 14, points: 250 },
        { name: "Racha de 30", description: "Asististe 30 días consecutivos", trigger_type: "attendance_streak", trigger_value: 30, points: 500 },
        { name: "Primer Mes", description: "Completaste tu primer mes en la academia", trigger_type: "milestone", trigger_value: 1, points: 20 },
        { name: "Tres Meses", description: "Completaste 3 meses en la academia", trigger_type: "milestone", trigger_value: 3, points: 80 },
        { name: "Medio Año", description: "Completaste 6 meses en la academia", trigger_type: "milestone", trigger_value: 6, points: 200 },
        { name: "Un Año", description: "Completaste 1 año en la academia", trigger_type: "milestone", trigger_value: 12, points: 500 },
    ];

    const achievementsWithAcademy = achievementDefs.map(a => ({ ...a, academy_id: academyId }));
    await knex('achievements').insert(achievementsWithAcademy);
    const allAchievements = await knex('achievements').where({ academy_id: academyId });

    // 10. Desbloquear achievements según student_stats
    console.log(`--- Generando User Achievements ---`);
    const studentStatsMap = {};
    for (const stats of studentStatsData) {
        studentStatsMap[stats.user_id] = stats;
    }

    const userAchievementsData = [];
    for (const achievement of allAchievements) {
        for (const student of students) {
            const stats = studentStatsMap[student.id];
            if (!stats) continue;

            let earned = false;
            if (achievement.trigger_type === 'classes_count') {
                earned = stats.total_classes_attended >= achievement.trigger_value;
            } else if (achievement.trigger_type === 'attendance_streak') {
                earned = stats.longest_streak_days >= achievement.trigger_value;
            } else if (achievement.trigger_type === 'milestone') {
                const monthsSinceJoin = student.created_at
                    ? Math.floor((new Date() - new Date(student.created_at)) / (30 * 24 * 60 * 60 * 1000))
                    : 0;
                earned = monthsSinceJoin >= achievement.trigger_value;
            }

            if (earned) {
                userAchievementsData.push({
                    user_id: student.id,
                    achievement_id: achievement.id,
                    unlocked_at: faker.date.recent({ days: 30 }),
                    notified: faker.datatype.boolean(0.7),
                });
            }
        }
    }
    if (userAchievementsData.length) await knex.batchInsert('user_achievements', userAchievementsData, 500);

    // 11. Crear challenges y asignar participantes
    console.log(`--- Creando Challenges ---`);
    const challengeDefs = [
        {
            title: "Reto de la Semana",
            description: "Asiste al menos a 3 clases esta semana",
            type: "individual", goal_metric: "classes_attended", goal_value: 3, reward_points: 50,
            is_active: true,
        },
        {
            title: "Racha de la Academia",
            description: "Todos juntos: mantengamos una racha de 5 días asistiendo",
            type: "group", goal_metric: "streak_days", goal_value: 5, reward_points: 100,
            is_active: true,
        },
        {
            title: "Desafío Mensual",
            description: "Completa 10 clases en el mes",
            type: "individual", goal_metric: "classes_attended", goal_value: 10, reward_points: 200,
            is_active: true,
        },
    ];

    const now = new Date();
    const challengesData = challengeDefs.map(c => ({
        ...c,
        start_date: new Date(now.getTime() - 15 * 86400000),
        end_date: new Date(now.getTime() + 15 * 86400000),
        academy_id: academyId,
    }));
    await knex('challenges').insert(challengesData);
    const allChallenges = await knex('challenges').where({ academy_id: academyId });

    // 12. Asignar estudiantes a challenges
    console.log(`--- Generando User Challenges ---`);
    const userChallengesData = [];
    for (const challenge of allChallenges) {
        const participants = faker.helpers.shuffle(students).slice(0, faker.number.int({ min: 10, max: NUM_STUDENTS }));

        for (const student of participants) {
            const stats = studentStatsMap[student.id];
            const progress = stats ? faker.number.int({ min: 0, max: Math.min(challenge.goal_value, stats.total_classes_attended) }) : 0;
            const completed = progress >= challenge.goal_value;

            userChallengesData.push({
                user_id: student.id,
                challenge_id: challenge.id,
                current_progress: progress,
                completed_at: completed ? faker.date.recent({ days: 7 }) : null,
                rank_position: completed ? faker.number.int({ min: 1, max: 20 }) : null,
                academy_id: academyId,
            });
        }
    }
    if (userChallengesData.length) await knex.batchInsert('user_challenges', userChallengesData, 500);

    // 13. Generar teacher_reviews
    console.log(`--- Generando Teacher Reviews ---`);
    const reviewData = [];
    const reviewStudents = faker.helpers.shuffle(students).slice(0, Math.floor(NUM_STUDENTS * 0.7));

    for (const student of reviewStudents) {
        const classesTaken = await knex('attendances')
            .select('class_id')
            .where({ student_id: student.id, status: 'present', academy_id: academyId })
            .groupBy('class_id');

        const teacherIds = new Set();
        for (const ct of classesTaken) {
            const cls = allClasses.find(c => c.id === ct.class_id);
            if (cls) teacherIds.add(cls.teacher_id);
        }

        for (const teacherId of teacherIds) {
            if (faker.datatype.boolean(0.6)) {
                reviewData.push({
                    teacher_id: teacherId,
                    student_id: student.id,
                    class_id: faker.helpers.arrayElement(classesTaken).class_id,
                    rating: faker.number.int({ min: 1, max: 5 }),
                    comment: faker.datatype.boolean(0.7)
                        ? faker.helpers.arrayElement([
                            "Excelente profesor, muy paciente",
                            "Las clases son muy dinámicas y entretenidas",
                            "Aprendí mucho en poco tiempo",
                            "Muy buen instructor, recomiendo sus clases",
                            "La clase fue clara y bien estructurada",
                            "Podría mejorar la comunicación de los pasos",
                            "Buena vibra en clase, se aprende bailando",
                            "Me gusta su forma de enseñar, muy didáctica",
                        ])
                        : null,
                    is_anonymous: faker.datatype.boolean(0.2),
                    academy_id: academyId,
                    created_at: faker.date.recent({ days: 60 }),
                    updated_at: new Date(),
                });
            }
        }
    }
    if (reviewData.length) await knex.batchInsert('teacher_reviews', reviewData, 500);

    // 14. Generar connections
    console.log(`--- Generando Conexiones entre Alumnos ---`);
    const connectionsData = [];
    const pairSet = new Set();

    for (let i = 0; i < NUM_STUDENTS; i++) {
        const requester = students[i];
        const numConnections = faker.number.int({ min: 1, max: 5 });

        const candidates = students.filter(s => s.id !== requester.id);
        const selectedReceivers = faker.helpers.shuffle(candidates).slice(0, numConnections);

        for (const receiver of selectedReceivers) {
            const key = [requester.id, receiver.id].sort().join(':');
            if (pairSet.has(key)) continue;
            pairSet.add(key);

            connectionsData.push({
                requester_id: requester.id,
                receiver_id: receiver.id,
                status: faker.helpers.arrayElement(['pending', 'accepted', 'pending', 'accepted', 'accepted']),
                academy_id: academyId,
                created_at: faker.date.recent({ days: 45 }),
                updated_at: new Date(),
            });
        }
    }
    if (connectionsData.length) await knex.batchInsert('connections', connectionsData, 500);

    console.log(`\n✅ Seed Finalizado con éxito para: ${academy.name} (${academyId})`);
}
