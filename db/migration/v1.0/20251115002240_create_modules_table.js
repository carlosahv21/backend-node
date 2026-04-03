export async function up(knex) {
    const exists = await knex.schema.hasTable("modules");

    if (!exists) {
        await knex.schema.createTable("modules", (table) => {
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            table.string("name").notNullable().unique();
            table.text("description").nullable();
            table.boolean("is_active").defaultTo(true);
            table.uuid("parent_module_id").nullable().references("id").inTable("modules").onDelete("SET NULL");
            table.boolean("has_custom_fields").defaultTo(false);
            table.boolean("has_recycle_bin").defaultTo(false);
            table.timestamps(true, true);
        });

        await knex("modules").insert([
            { name: "settings", description: "Configuración del sistema", has_custom_fields: false, has_recycle_bin: false },
            { name: "dashboard", description: "Panel general", has_custom_fields: false, has_recycle_bin: false },
            { name: "users", description: "Gestión de usuarios", has_custom_fields: true, has_recycle_bin: true },
            { name: "roles", description: "Gestión de roles", has_custom_fields: false, has_recycle_bin: true },
            { name: "permissions", description: "Gestión de permisos", has_custom_fields: false, has_recycle_bin: false },
            { name: "classes", description: "Gestión de clases", has_custom_fields: true, has_recycle_bin: true },
            { name: "attendances", description: "Gestión de asistencia", has_custom_fields: false, has_recycle_bin: false },
            { name: "fields", description: "Campos personalizados", has_custom_fields: false, has_recycle_bin: false },
            { name: "modules", description: "Gestión de módulos", has_custom_fields: false, has_recycle_bin: false },
            { name: "blocks", description: "Bloques (estructura de clases)", has_custom_fields: false, has_recycle_bin: false },
            { name: "plans", description: "Gestión de planes", has_custom_fields: true, has_recycle_bin: true },
            { name: "registrations", description: "Gestión de inscripciones", has_custom_fields: false, has_recycle_bin: true },
            { name: "payments", description: "Gestión de pagos", has_custom_fields: true, has_recycle_bin: true },
            { name: "recycle_bin", description: "Recycle Bin", has_custom_fields: false, has_recycle_bin: false }
        ]);

        const usersModule = await knex("modules").where("name", "users").first();

        await knex("modules").insert([
            { name: "students", description: "Gestión de estudiantes", has_custom_fields: true, has_recycle_bin: true, parent_module_id: usersModule.id },
            { name: "teachers", description: "Gestión de profesores", has_custom_fields: true, has_recycle_bin: true, parent_module_id: usersModule.id }
        ]);
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists("modules");
}
