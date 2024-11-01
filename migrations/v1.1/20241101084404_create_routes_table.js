exports.up = async function(knex) {
    // Crear la tabla de rutas
    await knex.schema.createTable('routes', (table) => {
        table.bigIncrements('id').primary();
        table.string('name').notNullable();
        table.string('path').notNullable().unique();
        table.enu('type', ['internal', 'external']).notNullable();
        table.string('icon');
        table.integer('order').defaultTo(0);
        table.bigInteger('parent_id').unsigned().references('id').inTable('routes').onDelete('SET NULL');
        table.bigInteger('module_id').unsigned().references('id').inTable('modules').onDelete('CASCADE'); // Relación con modules
        table.enu('location', ['SIDEBAR', 'HEADER', 'FOOTER']).defaultTo('SIDEBAR');
        table.string('on_click_action').defaultTo('navigate');
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    // Insertar datos iniciales en la tabla de rutas
    // Se asume que los módulos 'Settings', 'Dashboard' y 'Profile' existen en la tabla modules
    const [settingsModule, dashboardModule, profileModule] = await knex('modules')
        .whereIn('name', ['Settings', 'Dashboard', 'Profile'])
        .select('id', 'name');

    await knex('routes').insert([
        {
            name: "Settings",
            path: "/settings",
            type: "internal",
            icon: "settings",
            order: 2,
            module_id: settingsModule.id, // Asocia a Settings
            location: "HEADER",
            on_click_action: "navigate",
            is_active: true,
        },
        {
            name: "Dashboard",
            path: "/dashboard",
            type: "internal",
            icon: "dashboard",
            order: 1,
            module_id: dashboardModule.id, // Asocia a Dashboard
            location: "SIDEBAR",
            on_click_action: "navigate",
            is_active: true,
        },
        {
            name: "User Profile",
            path: "/profile",
            type: "internal",
            icon: "user",
            order: 1,
            module_id: profileModule.id, // Asocia a Profile
            location: "HEADER",
            on_click_action: "navigate",
            is_active: true,
        },
    ]);
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('routes');
};
