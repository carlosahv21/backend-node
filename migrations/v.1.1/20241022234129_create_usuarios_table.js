const bcrypt = require("bcryptjs");

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

    // Insertar el administrador y el gerente
    const hashedAdminPassword = await bcrypt.hash("admin123", 10); // Contraseña del admin encriptada
    const hashedManagerPassword = await bcrypt.hash("manager123", 10); // Contraseña del gerente encriptada

    await knex("users").insert([
      {
        first_name: "Carlos",
        last_name: "Hernández",
        email: "admin@example.com",
        password: hashedAdminPassword,
        email_verified: true,
        last_login: null, // El admin aún no ha iniciado sesión
      },
      {
        first_name: "María",
        last_name: "López",
        email: "manager@example.com",
        password: hashedManagerPassword,
        email_verified: true,
        last_login: null, // El gerente aún no ha iniciado sesión
      },
    ]);

    console.log(
      'Table "users" created and admin/manager inserted successfully.'
    );
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
