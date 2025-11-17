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

    // Obtener roles y permisos reales
    const roles = await knex("roles").select();
    const permissions = await knex("permissions").select();

    const roleMap = Object.fromEntries(roles.map(r => [r.name, r.id]));

    // ---- Asignaciones dinámicas ----

    // ADMIN → todos los permisos
    const adminPermissions = permissions.map(p => ({
        role_id: roleMap["admin"],
        permission_id: p.id,
    }));

    // RECEPTIONIST → permisos relacionados con estudiantes, pagos y asistencia
    const receptionistModules = [
        "students",
        "payments",
        "attendance",
        "reports",
    ];

    const receptionistPermissions = permissions
        .filter(p => receptionistModules.some(m => p.name.startsWith(`${m}.`)))
        .map(p => ({
            role_id: roleMap["receptionist"],
            permission_id: p.id,
        }));

    // TEACHER → solo ver + asistencia
    const teacherModules = ["attendance", "classes"];

    const teacherPermissions = permissions
        .filter(p =>
            teacherModules.some(m => p.name.startsWith(`${m}.`)) &&
            (p.name.endsWith(".view") || p.name.endsWith(".attend"))
        )
        .map(p => ({
            role_id: roleMap["teacher"],
            permission_id: p.id,
        }));

    // STUDENT → permisos muy limitados
    const studentPermissions = permissions
        .filter(p => p.name.startsWith("students.self_") || p.name.startsWith("attendance.self_"))
        .map(p => ({
            role_id: roleMap["student"],
            permission_id: p.id,
        }));

    // Consolidar todo
    const inserts = [
        ...adminPermissions,
        ...receptionistPermissions,
        ...teacherPermissions,
        ...studentPermissions
    ];

    // Insertar solo permisos válidos
    const validInserts = inserts.filter(i => i.permission_id);

    await knex("role_permissions").insert(validInserts);

    console.log("Role permissions inserted.");
};

exports.down = async function (knex) {
    await knex("role_permissions").del();
    console.log("Role permissions deleted.");
};
