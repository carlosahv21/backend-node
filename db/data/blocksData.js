// db/seeds/blocksData.js

async function getBlocksData(knex) {
    // Obtener los módulos
    const [classModule] = await knex('modules')
        .where('name', 'classes')
        .select('id');

    const [usersModule] = await knex('modules')
        .where('name', 'users')
        .select('id');

    const [plansModule] = await knex('modules')
        .where('name', 'plans')
        .select('id');

    const [studentsModule] = await knex('modules')
        .where('name', 'students')
        .select('id');

    const [paymentsModule] = await knex('modules')
        .where('name', 'payments')
        .select('id');

    // Obtener módulos nuevos
    const achievementsModule = await knex('modules').where('name', 'achievements').first();
    const challengesModule = await knex('modules').where('name', 'challenges').first();
    const teacherReviewsModule = await knex('modules').where('name', 'teacher_reviews').first();
    const studentStatsModule = await knex('modules').where('name', 'student_stats').first();

    const blocks = [
        // Bloques para Class
        {
            module_id: classModule.id,
            name: "Basic Information",
            description: "Basic information block",
            order: 1,
            collapsible: true,
            display_mode: "edit",
        },
        {
            module_id: classModule.id,
            name: "Class Details",
            description: "Class details block",
            order: 2,
            collapsible: true,
            display_mode: "edit",
        },
        {
            module_id: classModule.id,
            name: "Schedule",
            description: "Schedule block",
            order: 3,
            collapsible: false,
            display_mode: "edit",
        },
        {
            module_id: classModule.id,
            name: "Physical Well-being",
            description: "Información de bienestar físico y actividad",
            order: 4,
            collapsible: true,
            display_mode: "edit",
        },

        // Bloques para Users
        {
            module_id: usersModule.id,
            name: "Basic Information",
            description: "Basic user information",
            order: 1,
            collapsible: true,
            display_mode: "edit",
        },
        {
            module_id: usersModule.id,
            name: "Preferences",
            description: "Preferencias del usuario",
            order: 2,
            collapsible: true,
            display_mode: "edit",
        },

        // Bloques para Plans
        {
            module_id: plansModule.id,
            name: "Basic Information",
            description: "Basic plan information",
            order: 1,
            collapsible: true,
            display_mode: "edit",
        },

        // Bloques para Payments
        {
            module_id: paymentsModule.id,
            name: "Basic Information",
            description: "Basic payment information",
            order: 1,
            collapsible: true,
            display_mode: "edit",
        },
    ];

    if (achievementsModule) {
        blocks.push({
            module_id: achievementsModule.id,
            name: "Achievement Catalog",
            description: "Definición del logro",
            order: 1,
            collapsible: false,
            display_mode: "edit",
        });
    }

    if (challengesModule) {
        blocks.push({
            module_id: challengesModule.id,
            name: "Challenge Catalog",
            description: "Definición del reto",
            order: 1,
            collapsible: false,
            display_mode: "edit",
        });
    }

    if (teacherReviewsModule) {
        blocks.push({
            module_id: teacherReviewsModule.id,
            name: "Review Details",
            description: "Detalles de la reseña",
            order: 1,
            collapsible: false,
            display_mode: "edit",
        });
    }

    if (studentStatsModule) {
        blocks.push({
            module_id: studentStatsModule.id,
            name: "Statistics",
            description: "Métricas de progreso del alumno",
            order: 1,
            collapsible: false,
            display_mode: "readonly",
        });
    }

    return blocks;
}

export default { getBlocksData };
