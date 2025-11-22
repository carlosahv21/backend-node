import bcrypt from 'bcryptjs';

exports.up = async function (knex) {
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
            table.timestamps(true, true); // timestamps: created_at, updated_at
        });

        // Insertar usuario admin y algunos usuarios de prueba
        const users = [
            { first_name: "Admin", last_name: "Prueba", email: "admin@example.com", password: "admin123" },
            { first_name: "Alumno1", last_name: "Prueba", email: "student1@example.com", password: "student123" },
            { first_name: "Alumno2", last_name: "Prueba", email: "student2@example.com", password: "student123" },
            { first_name: "Profesor1", last_name: "Prueba", email: "teacher1@example.com", password: "teacher123" },
            { first_name: "Recepcionista", last_name: "Prueba", email: "receptionist@example.com", password: "recep123" },
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

        console.log('Table "users" created and admin/manager inserted successfully.');
    } else {
        console.log('The "users" table already exists.');
    }
};

exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists("users")
        .then(() => {
            console.log('Table "users" deleted.');
        })
        .catch((err) => {
            console.error('Error deleting the "users" table:', err);
        });
};
