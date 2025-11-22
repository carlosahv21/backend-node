exports.up = async function (knex) {
    const exists = await knex.schema.hasTable("permissions");

    if (!exists) {
        await knex.schema.createTable("permissions", function (table) {
            table.increments("id").primary();
            table.integer("route_id").unsigned().references("id").inTable("routes").onDelete("CASCADE"); // Asociar permiso a ruta
            table.string("name", 50).notNullable(); // Nombre del permiso (create, edit, etc.)
            table.string("description", 255).nullable(); // Descripción del permiso
            table.timestamps(true, true);
            table.unique(["route_id", "name"]); // Un permiso único por ruta
        });

        console.log('Table "permissions" created successfully.');
    }

    // ============================
    // Insertar permisos asociados a módulos
    // ============================
    const routes = await knex("routes").select(); // Traemos todas las rutas
    const permissionsTemplate = ["create", "edit", "delete", "view"];

    const permissionsToInsert = [];

    routes.forEach(route => {
        permissionsTemplate.forEach(name => {
            permissionsToInsert.push({
                route_id: route.id,
                name,
                description: `${name} permission for ${route.label}`
            });
        });
    });

    await knex("permissions").insert(permissionsToInsert);
    console.log("Permissions for all routes inserted successfully.");
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists("permissions");
    console.log('Table "permissions" dropped successfully.');
};
