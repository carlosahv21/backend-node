import bcrypt from 'bcryptjs';

export async function up(knex) {
    const exists = await knex.schema.hasTable("users");

    if (!exists) {
        await knex.schema.createTable("users", function (table) {
            // [Identidad y contacto principal]
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            table.string("first_name", 100).notNullable();
            table.string("last_name", 100).notNullable();
            table.string("email", 255).notNullable().unique();
            table.string("phone", 255).nullable();
            table.string("avatar", 255).nullable().unique();

            // [Datos Demográficos]
            table.enum('gender', ['male', 'female', 'other']).nullable();
            table.date("birth_date").nullable();

            // [Seguridad y Auth]
            table.string("password", 255).notNullable(); // Siempre oculta en tus Models
            table.boolean("email_verified").defaultTo(false);
            table.timestamp("last_login", { useTz: true }).nullable();
            table.boolean("needs_password_change").defaultTo(false);

            // [Preferencias y Push (App Mobile)]
            table.string("push_token", 255).nullable(); // Para expo-server-sdk
            table.boolean("tour_completed").defaultTo(false);
            table.boolean("skip_tour").defaultTo(false);
            table.string("theme", 50).defaultTo("light");
            table.string("language", 10).defaultTo("es");

            // [Relaciones / FKs]
            table.uuid("role_id").notNullable().references("id").inTable("roles").onDelete("CASCADE");

            // [Auditoría y Soft Delete]
            table.timestamp("deleted_at", { useTz: true }).nullable();
            table.uuid("deleted_by").nullable().references("id").inTable("users").onDelete("SET NULL");
            table.timestamps(true, true);
        });

        const adminRole = await knex("roles").where("name", "admin").first();

        const hashedPassword = await bcrypt.hash("admin123", 10);

        await knex("users").insert({
            first_name: "Admin",
            last_name: "Prueba",
            email: "admin@danceflow.com",
            phone: "123456789",
            password: hashedPassword,
            role_id: adminRole.id,
            email_verified: true,
            tour_completed: true,
            skip_tour: true,
            needs_password_change: false,
            gender: "male",
            birth_date: "1990-01-01"
        });
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists("users");
}
