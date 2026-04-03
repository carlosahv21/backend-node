export async function up(knex) {
    const exists = await knex.schema.hasTable("role_permissions");

    if (!exists) {
        await knex.schema.createTable("role_permissions", (table) => {
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            table.uuid("role_id").notNullable().references("id").inTable("roles").onDelete("CASCADE");
            table.uuid("permission_id").notNullable().references("id").inTable("permissions").onDelete("CASCADE");
            table.enum('scope', ['all', 'own', 'assigned']).notNullable().defaultTo('all');
            table.timestamps(true, true);
        });

        const roles = await knex("roles").select("id", "name");
        const roleMap = Object.fromEntries(roles.map(r => [r.name, r.id]));

        const permissions = await knex("permissions")
            .join("modules", "permissions.module_id", "modules.id")
            .select("permissions.id", "permissions.name as action", "modules.name as resource");

        const adminPermissions = permissions.map(p => ({ role_id: roleMap["admin"], permission_id: p.id, scope: 'all' }));
        const receptionistModules = ["students", "settings", "dashboard", "users", "roles", "classes", "attendances", "payments", "fields", "blocks", "plans", "registrations", "teachers"];
        const receptionistPermissions = permissions.filter(p => receptionistModules.includes(p.resource) && (p.action === 'view' || p.action === 'create' || p.action === 'edit'))
            .map(p => ({ role_id: roleMap["receptionist"], permission_id: p.id, scope: 'all' }));

        const teacherModules = ["dashboard", "classes", "attendances"];
        const teacherPermissions = permissions.filter(p => teacherModules.includes(p.resource) && (p.action === 'view' || p.action === 'create'))
            .map(p => ({ role_id: roleMap["teacher"], permission_id: p.id, scope: 'assigned' }));

        const studentModules = ["dashboard", "classes", "registrations", "students"];
        const studentPermissions = permissions.filter(p => (studentModules.includes(p.resource) && p.action === 'view') || (p.resource === 'students' && p.action === 'edit'))
            .map(p => ({ role_id: roleMap["student"], permission_id: p.id, scope: 'own' }));

        const inserts = [...adminPermissions, ...receptionistPermissions, ...teacherPermissions, ...studentPermissions];
        if (inserts.length > 0) await knex("role_permissions").insert(inserts);
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists("role_permissions");
}
