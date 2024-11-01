exports.up = async function (knex) {
  // Crear roles
  await knex("roles").insert([
    { name: "admin", description: "Full access to all resources" },
    { name: "manager", description: "Limited access to management resources" },
    { name: "user", description: "Standard user with limited access" },
  ]);

  // Crear permisos
  await knex("permissions").insert([
    { name: "create", description: "Permission to create resources" },
    { name: "edit", description: "Permission to edit resources" },
    { name: "delete", description: "Permission to delete resources" },
    { name: "view", description: "Permission to view resources" },
  ]);

  console.log("Default roles and permissions inserted.");
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('user_roles');
  await knex.schema.dropTableIfExists('role_permissions');
  
  // Luego, eliminar las tablas principales
  await knex.schema.dropTableIfExists('roles');
  await knex.schema.dropTableIfExists('permissions');
  console.log("Default roles and permissions dropped.");
};
