exports.up = async function(knex) {
    // Crear la tabla de módulos
    await knex.schema.createTable('modules', (table) => {
        table.bigIncrements('id').primary();
        table.string('name').notNullable().unique();
        table.string('tab').defaultTo('General'); // Categoría o grupo de los módulos
        table.string('description');
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    // Insertar datos iniciales en la tabla de módulos
    await knex('modules').insert([
        {
            name: "Settings",
            tab: "General",
            description: "Módulo para la configuración de la aplicación",
            is_active: true,
        },
        {
            name: "Dashboard",
            tab: "General",
            description: "Módulo para visualizar el panel de control principal",
            is_active: true,
        },
        {
            name: "Profile",
            tab: "User",
            description: "Módulo para la gestión de perfil de usuario",
            is_active: true,
        },
    ]);
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('modules');
};
