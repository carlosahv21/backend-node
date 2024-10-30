exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("permissions");

  if (!exists) {
    await knex.schema.createTable("permissions", function (table) {
      table.increments("id").primary();
      table.string("name", 50).notNullable().unique(); // Nombre del permiso (crear, editar, eliminar)
      table.string("description", 255).nullable(); // Descripción del permiso
      table.timestamps(true, true);
    });

    console.log('Table "permissions" created successfully.');
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("permissions");
  console.log('Table "permissions" dropped successfully.');
};
