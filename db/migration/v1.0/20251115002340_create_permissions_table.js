export async function up(knex) {
    const exists = await knex.schema.hasTable("permissions");

    if (!exists) {
        await knex.schema.createTable("permissions", function (table) {
            table.increments("id").primary();
            table.integer("module_id").unsigned().references("id").inTable("modules").onDelete("CASCADE"); // Asociar permiso a ruta
            table.string("name", 50).notNullable(); // Nombre del permiso (create, edit, etc.)
            table.string("description", 255).nullable(); // Descripción del permiso
            table.boolean("deleted").defaultTo(false); // Indica si el permiso está eliminado
            table.timestamps(true, true);
            table.unique(["module_id", "name"]); // Un permiso único por ruta
        });

        console.log("Table 'permissions' created successfully.");
    }

    // ============================
    // Insertar permisos asociados a módulos
    // ============================
    const modules = await knex("modules").select(); // Traemos todas las rutas
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
    console.log("Permissions for all modules inserted successfully.");
};

export async function down(knex) {
    await knex.schema.dropTableIfExists("permissions");
    console.log("Table 'permissions' dropped successfully.");
};
