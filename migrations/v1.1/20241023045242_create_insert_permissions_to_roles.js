exports.up = async function (knex) {
  const adminRole = await knex("roles").where({ name: "admin" }).first();
  const managerRole = await knex("roles").where({ name: "manager" }).first();

  const permissions = await knex("permissions").select("id");

  // Asignar todos los permisos al rol de administrador
  for (const permission of permissions) {
    await knex("role_permissions").insert({
      role_id: adminRole.id,
      permission_id: permission.id,
    });

    await knex("role_permissions").insert({
      role_id: managerRole.id,
      permission_id: permission.id,
    });
  }

  await knex("user_roles").insert({
    user_id: 1, // ID del usuario
    role_id: adminRole.id, // ID del rol
  });

  await knex("user_roles").insert({
    user_id: 2, // ID del usuario
    role_id: managerRole.id, // ID del rol
  });

  console.log("Permissions assigned to roles.");
};


exports.down = async function (knex) {
  await knex("user_roles").where({ user_id: 1 }).delete();
  await knex("user_roles").where({ user_id: 2 }).delete();
  await knex("role_permissions").where({ role_id: 1 }).delete();
  await knex("role_permissions").where({ role_id: 2 }).delete();
  console.log("Permissions removed from roles.");
};