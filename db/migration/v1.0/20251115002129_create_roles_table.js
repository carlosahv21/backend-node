export async function up(knex) {

    const exists = await knex.schema.hasTable("roles");

    if (!exists) {
        await knex.schema.createTable("roles", function (table) {
            table.increments("id").primary();
            table.string("name", 50).notNullable().unique(); // Nombre del rol (admin, manager, etc.)
            table.string("description", 255).nullable(); // Descripción opcional del rol
            table.timestamps(true, true); // Timestamps para created_at y updated_at
        });

        console.log('Table "roles" created successfully.');

        // Roles
        await knex("roles").insert([
            { name: "admin", description: "Full access to all resources" },
            { name: "student", description: "Alumno que puede inscribirse y marcar asistencia" },
            { name: "teacher", description: "Profesor que puede ver sus clases y asistencia" },
            { name: "receptionist", description: "Gestor diario que puede crear/editar clases, alumnos, asistencia y pagos" }
        ]);

        console.log("Default roles inserted.");

    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists("roles");
    console.log('Table "roles" dropped successfully.');
}