export async function up(knex) {
    // Crear tabla modules
    await knex.schema.createTable("modules", function (table) {
        table.increments("id").primary();
        table.string("name").notNullable().unique();
        table.text("description").nullable();
        table.boolean("is_active").defaultTo(true);
        table.integer("parent_module_id").unsigned().nullable();
        table.boolean("has_custom_fields").defaultTo(false);
        table.timestamps(true, true);
    });

    // Insertar módulos sin dependencias
    await knex("modules").insert([
        { name: "settings", description: "Configuración del sistema", has_custom_fields: false },
        { name: "dashboard", description: "Panel general", has_custom_fields: false },
        { name: "users", description: "Gestión de usuarios", has_custom_fields: true },
        { name: "roles", description: "Gestión de roles", has_custom_fields: false },
        { name: "permissions", description: "Gestión de permisos", has_custom_fields: false },
        { name: "classes", description: "Gestión de clases", has_custom_fields: true },
        { name: "assistants", description: "Gestión de asistentes", has_custom_fields: false },
        { name: "fields", description: "Campos personalizados", has_custom_fields: false },
        { name: "modules", description: "Gestión de módulos", has_custom_fields: false },
        { name: "blocks", description: "Bloques (estructura de clases)", has_custom_fields: false }
    ]);

    // Obtener ID real del módulo users
    const usersModule = await knex("modules").where("name", "users").first();

    // Insertar dependientes de users (students, teachers)
    await knex("modules").insert([
        { name: "students", description: "Gestión de estudiantes", has_custom_fields: true, parent_module_id: usersModule.id },
        { name: "teachers", description: "Gestión de profesores", has_custom_fields: true, parent_module_id: usersModule.id },
    ]);
};

export async function down(knex) {
    return knex.schema.dropTableIfExists("modules");
};
