exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("user_roles");

  if (!exists) {
    await knex.schema.createTable("user_roles", function (table) {
      table.increments("id").primary();
      table
        .integer("user_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .integer("role_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("roles")
        .onDelete("CASCADE");
      table.timestamps(true, true);
    });

    console.log('Table "user_roles" created successfully.');
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("user_roles");
  console.log('Table "user_roles" dropped successfully.');
};
