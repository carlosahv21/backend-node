export async function up(knex) {
    const exists = await knex.schema.hasTable("settings");

    if (!exists) {
        await knex.schema.createTable("settings", (table) => {
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            table.string("academy_name").notNullable();
            table.string("logo_url").nullable();
            table.string("currency", 10).defaultTo("USD");
            table.string("date_format", 20).defaultTo("YYYY-MM-DD");
            table.string("theme", 50).defaultTo("light");
            table.string("language", 10).defaultTo("en");
            table.string("contact_email").notNullable();
            table.string("phone_number", 20).nullable();
            table.string("address").nullable();
            table.timestamps(true, true);
        });

        await knex("settings").insert({
            academy_name: "Default Academy",
            logo_url: "tu_logo.png",
            currency: "USD",
            date_format: "YYYY-MM-DD",
            theme: "light",
            language: "en",
            contact_email: "contact@academy.com",
            phone_number: "1234567890",
            address: "123 Main St, City, Country"
        });
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists("settings");
}
