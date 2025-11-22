exports.up = async function (knex) {
    const exists = await knex.schema.hasTable("user_roles");

    if (!exists) {
        await knex.schema.createTable("user_roles", function (table) {
            table.increments("id").primary();
            table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
            table.integer("role_id").unsigned().notNullable().references("id").inTable("roles").onDelete("CASCADE");
            table.timestamps(true, true);
        });

        console.log('Table "user_roles" created successfully.');

        const roles = await knex("roles").select();
        const users = await knex("users").select();

        const roleMap = roles.reduce((acc, r) => ({ ...acc, [r.name]: r.id }), {});
        const userMap = users.reduce((acc, u) => ({ ...acc, [u.email]: u.id }), {}); // O usar username

        const userRoles = [
            // Admin inicial
            { user_id: userMap["admin@example.com"], role_id: roleMap["admin"] },

            // Estudiante de prueba
            { user_id: userMap["student1@example.com"], role_id: roleMap["student"] },
            { user_id: userMap["student2@example.com"], role_id: roleMap["student"] },

            // Profesor de prueba
            { user_id: userMap["teacher1@example.com"], role_id: roleMap["teacher"] },

            // Recepcionista de prueba
            { user_id: userMap["receptionist@example.com"], role_id: roleMap["receptionist"] },
        ];

        await knex("user_roles").insert(userRoles);
        console.log("User roles inserted.");
    }
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("user_roles");
    console.log('Table "user_roles" dropped successfully.');
};
