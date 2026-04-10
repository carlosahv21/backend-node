// db/migration/v1.0/20260409000001_add_academy_id_to_tables.js
/**
 * Tarea: Añadir la columna academy_id (FK a academies) a todas las tablas
 * que deben participar en el aislamiento de datos multi-tenant.
 *
 * Las tablas de catálogo genérico (roles, permissions, modules, plans) no
 * reciben academy_id: se consideran data compartida entre tenants en este sistema.
 *
 * Tablas que SÍ reciben academy_id:
 *   users, classes, attendances, payments, user_plan, user_class,
 *   user_registration_history, audit_log, settings, blocks, fields,
 *   field_values, notifications
 */

const TENANT_TABLES = [
    "users",
    "classes",
    "attendances",
    "payments",
    "user_plan",
    "user_class",
    "user_registration_history",
    "blocks",
    "audit_log",
    "fields",
    "field_values",
    "notifications",
];

export async function up(knex) {
    // Obtener el UUID de la academia por defecto para asignar a registros existentes
    const defaultAcademy = await knex("academies").first("id");
    if (!defaultAcademy) {
        throw new Error("No se encontró la academia por defecto. Ejecuta la migración anterior primero.");
    }
    const defaultAcademyId = defaultAcademy.id;

    for (const tableName of TENANT_TABLES) {
        const tableExists = await knex.schema.hasTable(tableName);
        if (!tableExists) continue;

        const hasColumn = await knex.schema.hasColumn(tableName, "academy_id");
        if (hasColumn) continue;

        // 1. Añadir nullable para no romper datos existentes
        await knex.schema.table(tableName, (table) => {
            table
                .uuid("academy_id")
                .nullable()
                .references("id")
                .inTable("academies")
                .onDelete("CASCADE");
        });

        // 2. Rellenar registros existentes con la academia por defecto
        await knex(tableName).whereNull("academy_id").update({ academy_id: defaultAcademyId });

        // 3. Alterar a NOT NULL
        await knex.schema.alterTable(tableName, (table) => {
            table.uuid("academy_id").notNullable().alter();
        });
    }
}

export async function down(knex) {
    for (const tableName of TENANT_TABLES) {
        const tableExists = await knex.schema.hasTable(tableName);
        if (!tableExists) continue;

        const hasColumn = await knex.schema.hasColumn(tableName, "academy_id");
        if (!hasColumn) continue;

        await knex.schema.table(tableName, (table) => {
            table.dropColumn("academy_id");
        });
    }
}
