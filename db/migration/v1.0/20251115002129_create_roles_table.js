export async function up(knex) {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    const exists = await knex.schema.hasTable("roles");

    if (!exists) {
        await knex.schema.createTable("roles", (table) => {
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            table.string("name", 50).notNullable().unique();
            table.string("description", 255).nullable();
            table.timestamps(true, true);
            table.timestamp("deleted_at").nullable();
            table.uuid("deleted_by").nullable();
        });

        await knex("roles").insert([
            { name: "admin", description: "Full access to all resources" },
            { name: "student", description: "Alumno que puede inscribirse y marcar asistencia" },
            { name: "teacher", description: "Profesor que puede ver sus clases y asistencia" },
            { name: "receptionist", description: "Gestor diario que puede crear/editar clases, alumnos, asistencia y pagos" }
        ]);
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists("roles");
}