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

    return [
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

        // Bloques para Users
        {
            module_id: usersModule.id,
            name: "Basic Information",
            description: "Basic user information",
            order: 1,
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

        // Bloques para Students
        {
            module_id: studentsModule.id,
            name: "Class Details",
            description: "Class details block",
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
        }
    ];
}

export default { getBlocksData };
