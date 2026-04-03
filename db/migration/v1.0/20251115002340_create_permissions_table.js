export async function up(knex) {
    const exists = await knex.schema.hasTable("permissions");

    if (!exists) {
        await knex.schema.createTable("permissions", (table) => {
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            table.uuid("module_id").notNullable().references("id").inTable("modules").onDelete("CASCADE");
            table.string("name", 50).notNullable();
            table.string("description", 255).nullable();
            table.timestamps(true, true);
            table.timestamp("deleted_at").nullable();
            table.uuid("deleted_by").nullable();
            table.unique(["module_id", "name"]);
        });

        const modules = await knex("modules").select("id", "name");
        const permissionsTemplate = ["create", "edit", "delete", "view"];
        const permissionsToInsert = [];

        modules.forEach(module => {
            permissionsTemplate.forEach(name => {
                permissionsToInsert.push({
                    module_id: module.id,
                    name,
                    description: `${name} permission for ${module.name}`
                });
            });
        });

        await knex("permissions").insert(permissionsToInsert);
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists("permissions");
}
