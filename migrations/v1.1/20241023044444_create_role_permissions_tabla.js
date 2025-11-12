exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("role_permissions");

  if (!exists) {
    await knex.schema.createTable("role_permissions", function (table) {
      table.increments("id").primary();
      table.integer("role_id").unsigned().notNullable().references("id").inTable("roles").onDelete("CASCADE");
      table.integer("permission_id").unsigned().notNullable().references("id").inTable("permissions").onDelete("CASCADE");
      table.timestamps(true, true);
    });

    console.log('Table "role_permissions" created successfully.');
  }

  const roles = await knex("roles").select();
  const permissions = await knex("permissions").select();

  // Mapear nombres a IDs
  const roleMap = roles.reduce((acc, r) => ({ ...acc, [r.name]: r.id }), {});
  const permMap = permissions.reduce((acc, p) => ({ ...acc, [p.name]: p.id }), {});

  const rolePermissions = [
    // Admin: todos los permisos
    ...permissions.map(p => ({ role_id: roleMap["admin"], permission_id: p.id })),

    // Receptionist: permisos administrativos y gestión diaria
    { role_id: roleMap["receptionist"], permission_id: permMap["create"] },
    { role_id: roleMap["receptionist"], permission_id: permMap["edit"] },
    { role_id: roleMap["receptionist"], permission_id: permMap["delete"] },
    { role_id: roleMap["receptionist"], permission_id: permMap["view"] },
    { role_id: roleMap["receptionist"], permission_id: permMap["attend"] },
    { role_id: roleMap["receptionist"], permission_id: permMap["manage_payments"] },
    { role_id: roleMap["receptionist"], permission_id: permMap["view_reports"] },

    // Teacher: ver clases y marcar asistencia
    { role_id: roleMap["teacher"], permission_id: permMap["view"] },
    { role_id: roleMap["teacher"], permission_id: permMap["attend"] },

    // Student: registrarse y marcar su propia asistencia
    { role_id: roleMap["student"], permission_id: permMap["view"] },
    { role_id: roleMap["student"], permission_id: permMap["self_attend"] },
    { role_id: roleMap["student"], permission_id: permMap["register"] },
  ];

  await knex("role_permissions").insert(rolePermissions);
  console.log("Role permissions inserted.");
};

exports.down = async function (knex) {
  await knex("role_permissions").del();
  console.log("Role permissions deleted.");
};
