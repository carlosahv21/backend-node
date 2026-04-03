import bcrypt from 'bcryptjs';

export async function up(knex) {
    const exists = await knex.schema.hasTable("users");

    if (!exists) {
        await knex.schema.createTable("users", function (table) {
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            table.string("avatar", 255).nullable().unique();
            table.string("first_name", 100).notNullable();
            table.string("last_name", 100).notNullable();
            table.string("email", 255).notNullable().unique();
            table.string("phone", 255).nullable();
            table.enum('gender', ['male', 'female', 'other']).nullable();
            table.date("birth_date").nullable();
            table.string("password", 255).notNullable();
            table.boolean("email_verified").defaultTo(false);
            table.timestamp("last_login", { useTz: true }).nullable();
            table.boolean("needs_password_change").defaultTo(false);
            table.string("push_token", 255).nullable();
            table.uuid("role_id").notNullable().references("id").inTable("roles").onDelete("CASCADE");
            table.timestamp("deleted_at", { useTz: true }).nullable();
            table.uuid("deleted_by").nullable().references("id").inTable("users").onDelete("SET NULL");
            table.timestamps(true, true);
        });

        const adminRole = await knex("roles").where("name", "admin").first();
        const studentRole = await knex("roles").where("name", "student").first();
        const teacherRole = await knex("roles").where("name", "teacher").first();
        const receptionistRole = await knex("roles").where("name", "receptionist").first();

        const hashedPassword = await bcrypt.hash("password123", 10);
        const users = [
            { first_name: "Admin", last_name: "Prueba", email: "admin@example.com", phone: "123456789", password: hashedPassword, role_id: adminRole.id, email_verified: true },
            { first_name: "Alumno1", last_name: "Prueba", email: "student1@example.com", phone: "123456789", password: hashedPassword, role_id: studentRole.id, email_verified: true },
            { first_name: "Alumno2", last_name: "Prueba", email: "student2@example.com", phone: "123456789", password: hashedPassword, role_id: studentRole.id, email_verified: true },
            { first_name: "Profesor1", last_name: "Prueba", email: "teacher1@example.com", phone: "123456789", password: hashedPassword, role_id: teacherRole.id, email_verified: true },
            { first_name: "Recepcionista", last_name: "Prueba", email: "receptionist@example.com", phone: "123456789", password: hashedPassword, role_id: receptionistRole.id, email_verified: true }
        ];

        await knex("users").insert(users);
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists("users");
}
