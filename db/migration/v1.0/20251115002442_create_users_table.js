import bcrypt from 'bcryptjs';

export async function up(knex) {
    const exists = await knex.schema.hasTable("users");

    if (!exists) {
        await knex.schema.createTable("users", function (table) {
            table.increments("id").primary(); // Primary key (auto-incremental)
            table.string("first_name", 100).notNullable(); // First name
            table.string("last_name", 100).notNullable(); // Last name
            table.string("email", 255).notNullable().unique(); // Email, unique for authentication
            table.string("password", 255).notNullable(); // Encrypted password
            table.boolean("email_verified").defaultTo(false); // Whether the email is verified
            table.timestamp("last_login").nullable(); // Last login timestamp
            table.string("push_token", 255).nullable(); // Push notification token
            table.integer("role_id").unsigned().notNullable().references("id").inTable("roles").onDelete("CASCADE"); // Role
            table.timestamp("deleted_at").nullable();
            table.integer("deleted_by").unsigned().nullable().references("id").inTable("users").onDelete("SET NULL");
            table.timestamps(true, true); // timestamps: created_at, updated_at
        });

        const adminRole = await knex("roles").select("id").where("name", "admin").first();
        const studentRole = await knex("roles").select("id").where("name", "student").first();
        const teacherRole = await knex("roles").select("id").where("name", "teacher").first();
        const receptionistRole = await knex("roles").select("id").where("name", "receptionist").first();

        // Insertar usuario admin y algunos usuarios de prueba
        const users = [
            { first_name: "Admin", last_name: "Prueba", email: "admin@example.com", password: "admin123", role_id: adminRole.id },
            { first_name: "Alumno1", last_name: "Prueba", email: "student1@example.com", password: "student123", role_id: studentRole.id },
            { first_name: "Alumno2", last_name: "Prueba", email: "student2@example.com", password: "student123", role_id: studentRole.id },
            { first_name: "Profesor1", last_name: "Prueba", email: "teacher1@example.com", password: "teacher123", role_id: teacherRole.id },
            { first_name: "Recepcionista", last_name: "Prueba", email: "receptionist@example.com", password: "recep123", role_id: receptionistRole.id },
        ];

        // Hashear contraseñas
        for (const user of users) {
            user.password = await bcrypt.hash(user.password, 10);
            user.email_verified = true;
            user.last_login = null;
            user.created_at = new Date();
            user.updated_at = new Date();
        }

        await knex("users").insert(users);

        console.log("Table 'users' created and admin/manager inserted successfully.");
    } else {
        console.log("The 'users' table already exists.");
    }
};

export async function down(knex) {
    return knex.schema
        .dropTableIfExists("users")
        .then(() => {
            console.log("Table 'users' deleted.");
        })
        .catch((err) => {
            console.error("Error deleting the 'users' table:", err);
        });
};
