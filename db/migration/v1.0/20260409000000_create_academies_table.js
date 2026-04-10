// db/migration/v1.0/20260409000000_create_academies_table.js
export async function up(knex) {
    const exists = await knex.schema.hasTable("academies");

    if (!exists) {
        await knex.schema.createTable("academies", (table) => {
            // [Identidad Única]
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));

            // [Identidad de Marca]
            table.string("name", 255).notNullable();
            table.string("logo_url", 500).nullable();

            // [Configuración del Plan y Core]
            table.string("plan", 50).defaultTo("free"); // Referencia a nivel de suscripción 
            table.string("currency", 10).defaultTo("USD");
            table.string("date_format", 20).defaultTo("YYYY-MM-DD");

            // [Datos de Contacto y Ubicación]
            table.string("address").nullable();

            // [Auditoría]
            table.timestamps(true, true); // created_at y updated_at automáticos
        });

        // Academia por defecto (migrada desde la antigua tabla settings)
        await knex("academies").insert({
            name: "Dance Flow",
            logo_url: null,
            plan: "free",
            currency: "USD",
            date_format: "YYYY-MM-DD",
            address: "123 Main St, City, Country",
        });
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists("academies");
}
