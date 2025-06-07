exports.up = async function (knex) {
    // Crear la tabla de módulos
    await knex.schema.createTable('modules', function (table) {
        table.increments('id').primary(); // `id` como integer
        table.string('name').notNullable();
        table.text('description');
        table.string('tab');
        table.boolean('is_active').defaultTo(true);
        table.boolean('has_fields').defaultTo(false);
        table.timestamps(true, true);
    });

    // Insertar datos iniciales en la tabla de módulos
    await knex('modules').insert([
        {
            name: "Settings",
            tab: "General",
            description: "Módulo para la configuración de la aplicación",
            is_active: true,
            has_fields: true,
        },
        {
            name: "Dashboard",
            tab: "General",
            description: "Módulo para visualizar el panel de control principal",
            is_active: true,
            has_fields: false,
        },
        {
            name: "Profile",
            tab: "User",
            description: "Módulo para la gestión de perfil de usuario",
            is_active: true,
            has_fields: true,
        },
        {
            name: "Users",
            tab: "User",
            description: "Módulo para gestionar usuarios",
            is_active: true,
            has_fields: true,
        },
        {
            name: "Class",
            tab: "Class",
            description: "Módulo para gestionar clases",
            is_active: true,
            has_fields: true,
        },
        {
            name: "Student",
            tab: "Student",
            description: "Módulo para gestionar estudiantes",
            is_active: true,
            has_fields: true,
        },
        {
            name: "Teacher",
            tab: "Teacher",
            description: "Módulo para gestionar profesores",
            is_active: true,
            has_fields: true,
        },
        {
            name: "Assistant",
            tab: "Assistant",
            description: "Módulo para gestionar asistentes",
            is_active: true,
            has_fields: true,
        },

    ]);
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('modules');
};
