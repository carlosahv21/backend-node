
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("role_permissions");

  if (!exists) {
    await knex.schema.createTable("role_permissions", function (table) {
      table.increments("id").primary();
      table
        .integer("role_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("roles")
        .onDelete("CASCADE");
      table
        .integer("permission_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("permissions")
        .onDelete("CASCADE");
      table.timestamps(true, true);
    });

    console.log('Table "role_permissions" created successfully.');
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("role_permissions");
  console.log('Table "role_permissions" dropped successfully.');
};
