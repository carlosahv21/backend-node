export async function up(knex) {
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
    const roleMap = Object.fromEntries(roles.map(r => [r.name, r.id]));

    const permissions = await knex("permissions")
        .join("modules", "permissions.module_id", "modules.id")
        .select(
            "permissions.id",
            "permissions.name as action",   // create, edit, delete, view
            "modules.name as resource"      // nombre del módulo
        );

    // ADMIN → todos los permisos
    const adminPermissions = permissions.map(p => ({
        role_id: roleMap["admin"],
        permission_id: p.id,
    }));

    // RECEPTIONIST → permisos relacionados con estudiantes, pagos y asistencia
    const receptionistModules = ["students", "settings", "dashboard", "users", "roles", "classes", "attendance", "fields", "blocks", "plans", "registrations", "students", "teachers"];

    const receptionistPermissions = permissions
        .filter(p => receptionistModules.includes(p.resource) && (p.action === 'view' || p.action === 'create' || p.action === 'edit'))
        .map(p => ({
            role_id: roleMap["receptionist"],
            permission_id: p.id,
        }));

    // TEACHER → solo ver + asistencia
    const teacherModules = ["dashboard", "classes", "attendance"];

    const teacherPermissions = permissions
        .filter(p =>
            teacherModules.includes(p.resource) &&
            (p.action === 'view' || p.action === 'create')
        )
        .map(p => ({
            role_id: roleMap["teacher"],
            permission_id: p.id,
        }));

    const studentModules = ["dashboard", "classes", "registrations"];
    const studentPermissions = permissions
        .filter(p => studentModules.includes(p.resource) && p.action === 'view')
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

    // Limpieza de duplicados o nulos por seguridad
    const uniqueInserts = [...new Set(inserts.map(JSON.stringify))].map(JSON.parse);

    if (uniqueInserts.length > 0) {
        await knex("role_permissions").insert(uniqueInserts);
        console.log(`Inserted ${uniqueInserts.length} role permissions.`);
    }
};

export async function down(knex) {
    await knex("role_permissions").del();
    console.log("Role permissions deleted.");
};
