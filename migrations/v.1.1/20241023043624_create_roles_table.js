exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("roles");

  if (!exists) {
    await knex.schema.createTable("roles", function (table) {
      table.increments("id").primary();
      table.string("name", 50).notNullable().unique(); // Nombre del rol (admin, manager, etc.)
      table.string("description", 255).nullable(); // Descripción opcional del rol
      table.timestamps(true, true); // Timestamps para created_at y updated_at
    });

    console.log('Table "roles" created successfully.');
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("roles");
  console.log('Table "roles" dropped successfully.');
};
