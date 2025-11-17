exports.up = async function (knex) {
    await knex.schema.createTable('routes', (table) => {
        table.increments('id').primary();

        // Identificador interno único (ej: settings.roles)
        table.string('name').notNullable().unique();

        // Nombre visible en el menú
        table.string('label').notNullable();

        // Ruta relativa y ruta completa
        table.string('path').notNullable();
        table.string('full_path').notNullable().unique();

        // Jerarquía
        table
            .integer('parent_id')
            .unsigned()
            .references('id')
            .inTable('routes')
            .onDelete('SET NULL');

        // UI
        table.string('icon');
        table.boolean('is_menu').defaultTo(true);
        table.integer('order').defaultTo(0);

        // Control
        table.boolean('is_active').defaultTo(true);

        table.timestamps(true, true);
    });

    console.log("Table 'routes' created successfully!");

    // ============================
    // Insertar rutas principales
    // ============================

    await knex('routes').insert([
        { name: 'dashboard', label: 'Dashboard', path: '/', full_path: '/', icon: 'Dashboard', is_menu: true, order: 1 },
        { name: 'classes', label: 'Classes', path: 'classes', full_path: '/classes', icon: 'Contacts', is_menu: true, order: 2 },
        { name: 'students', label: 'Students', path: 'students', full_path: '/students', icon: 'Team', is_menu: true, order: 3 },
        { name: 'teachers', label: 'Teachers', path: 'teachers', full_path: '/teachers', icon: 'Crown', is_menu: true, order: 4 },
        { name: 'settings', label: 'Settings', path: 'settings', full_path: '/settings', icon: 'Setting', is_menu: false, order: 99 }
    ]);


    // ============================
    // Obtener el ID de Settings
    // ============================
    const settingsRow = await knex('routes').where('name', 'settings').first();
    const settingsId = settingsRow.id;

    // ============================
    // Insertar subrutas de Settings
    // ============================
    await knex('routes').insert([
        { name: 'settings.general', label: 'General Information', path: 'general', full_path: '/settings/general', parent_id: settingsId, is_menu: true, order: 1 },
        { name: 'settings.activeModules', label: 'Active Modules', path: 'activeModules', full_path: '/settings/activeModules', parent_id: settingsId, is_menu: true, order: 2 },
        { name: 'settings.roles', label: 'Roles', path: 'roles', full_path: '/settings/roles', parent_id: settingsId, is_menu: true, order: 3 },
        { name: 'settings.permissions', label: 'Permissions', path: 'permissions', full_path: '/settings/permissions', parent_id: settingsId, is_menu: true, order: 4 },
        { name: 'settings.users', label: 'Users', path: 'users', full_path: '/settings/users', parent_id: settingsId, is_menu: true, order: 5 },
        { name: 'settings.customFields', label: 'Custom Fields', path: 'customFields', full_path: '/settings/customFields', parent_id: settingsId, is_menu: true, order: 6 },
        { name: 'settings.payments', label: 'Payments', path: 'payments', full_path: '/settings/payments', parent_id: settingsId, is_menu: true, order: 7 }
    ]);

    console.log("Routes seeded successfully!");
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('routes');
    console.log("Table 'routes' dropped successfully!");
};
