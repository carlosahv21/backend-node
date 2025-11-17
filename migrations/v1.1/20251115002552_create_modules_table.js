exports.up = async function (knex) {
    // Crear tabla modules
    await knex.schema.createTable("modules", function (table) {
        table.increments("id").primary();
        table.string("name").notNullable().unique();  // nombre del módulo
        table.text("description").nullable();         // descripción corta
        table.boolean("is_active").defaultTo(true);   // activo/inactivo
        table.timestamps(true, true);
    });

    // Insertar los módulos iniciales según la estructura deseada
    await knex("modules").insert([
        { name: "settings", description: "Configuración del sistema", is_active: true },
        { name: "dashboard", description: "Panel general", is_active: true },
        { name: "users", description: "Gestión de usuarios", is_active: true },
        { name: "roles", description: "Gestión de roles", is_active: true },
        { name: "permissions", description: "Gestión de permisos", is_active: true },
        { name: "classes", description: "Gestión de clases", is_active: true },
        { name: "students", description: "Gestión de estudiantes", is_active: true },
        { name: "teachers", description: "Gestión de profesores", is_active: true },
        { name: "assistants", description: "Gestión de asistentes", is_active: true },
        { name: "fields", description: "Campos personalizados", is_active: true },
        { name: "modules", description: "Gestión de módulos", is_active: true },
        { name: "blocks", description: "Bloques (estructura de clases)", is_active: true },
        { name: "routes", description: "Gestión de rutas", is_active: true },
    ]);
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("modules");
};
