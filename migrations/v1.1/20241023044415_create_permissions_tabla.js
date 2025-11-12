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

    // Insertar permisos
    await knex("permissions").insert([
      { name: "create", description: "Permission to create resources" },
      { name: "edit", description: "Permission to edit resources" },
      { name: "delete", description: "Permission to delete resources" },
      { name: "view", description: "Permission to view resources" },
      { name: "attend", description: "Mark attendance for others" },
      { name: "self_attend", description: "Mark own attendance" },
      { name: "register", description: "Inscribirse en una clase" },
      { name: "manage_payments", description: "Gestionar cobros y mensualidades" },
      { name: "view_reports", description: "Ver reportes administrativos" },
      { name: "manage_roles", description: "Crear y editar roles y permisos" }
    ]);
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("permissions");
  console.log('Table "permissions" dropped successfully.');
};
