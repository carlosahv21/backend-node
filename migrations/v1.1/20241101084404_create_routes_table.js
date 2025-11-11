exports.up = async function(knex) {
    // Crear la tabla de rutas
    await knex.schema.createTable('routes', (table) => {
        table.increments('id').primary(); // Usar `increments` en lugar de `bigIncrements` para `id`
        table.string('name').notNullable();
        table.string('path').notNullable().unique();
        table.enu('type', ['internal', 'external']).notNullable();
        table.string('icon');
        table.integer('order').defaultTo(0);
        table.integer('parent_id').unsigned().references('id').inTable('routes').onDelete('SET NULL'); // Usar `integer` en lugar de `bigInteger`
        table.integer('module_id').unsigned().references('id').inTable('modules').onDelete('CASCADE'); // Usar `integer` en lugar de `bigInteger`
        table.enu('location', ['SIDEBAR', 'HEADER', 'FOOTER', 'ACTIONS']).defaultTo('SIDEBAR');
        table.string('on_click_action').defaultTo('navigate');
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    // Insertar datos iniciales en la tabla de rutas
    // Se asume que los módulos 'Settings', 'Dashboard' y 'Profile' existen en la tabla modules
    const [settingsModule, dashboardModule, profileModule, usersModule, classModule, studentModule, teacherModule, assistantModule] = await knex('modules')
        .whereIn('name', ['Settings', 'Dashboard', 'Profile', 'Users', 'Class', 'Student', 'Teacher', 'Assistant'])
        .select('id', 'name');

    await knex('routes').insert([
        {
            name: "Settings",
            path: "/settings",
            type: "internal",
            icon: "Setting",
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
            icon: "Dashboard",
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
            icon: "User",
            order: 1,
            module_id: profileModule.id, // Asocia a Profile
            location: "HEADER",
            on_click_action: "navigate",
            is_active: true,
        },
        {
            name: "Users",
            path: "/users",
            type: "internal",
            icon: "Team",
            order: 1,
            module_id: usersModule.id, // Asocia a Users
            location: "SIDEBAR",
            on_click_action: "navigate",
            is_active: true,
        },
        {
            name: "Classes",
            path: "/classes",
            type: "internal",
            icon: "Contacts",
            order: 1,
            module_id: classModule.id, // Asocia a Class
            location: "SIDEBAR",
            on_click_action: "navigate",
            is_active: true,
        },
        {
            name: "Student",
            path: "/student",
            type: "internal",
            icon: "Team",
            order: 1,
            module_id: studentModule.id, // Asocia a Student
            location: "SIDEBAR",
            on_click_action: "navigate",
            is_active: true,
        },
        {
            name: "Teacher",
            path: "/teacher",
            type: "internal",
            icon: "Crown",
            order: 1,
            module_id: teacherModule.id, // Asocia a Teacher
            location: "SIDEBAR",
            on_click_action: "navigate",
            is_active: true,
        },
        {
            name: "Assistant",
            path: "/assistant",
            type: "internal",
            icon: "Calendar",
            order: 1,
            module_id: assistantModule.id, // Asocia a Assistant
            location: "SIDEBAR",
            on_click_action: "navigate",
            is_active: true,
        },
    ]);
    
    console.log("Table 'routes' created successfully.");
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('routes');
};
