exports.up = async function (knex) {
    const exists = await knex.schema.hasTable("settings");

    if (!exists) {
        await knex.schema
            .createTable("settings", function (table) {
                table.increments("id").primary(); // ID autoincremental
                table.string("academy_name").notNullable(); // Nombre de la academia
                table.string("logo_url").nullable(); // URL del logo
                table.string("currency", 10).defaultTo("USD"); // Moneda (ejemplo: USD, EUR)
                table.string("date_format", 20).defaultTo("YYYY-MM-DD"); // Formato de fecha
                table.string("theme", 50).defaultTo("light"); // Tema (light/dark)
                table.string("language", 10).defaultTo("en"); // Idioma de la aplicación
                table.string("contact_email").notNullable(); // Correo electrónico de contacto
                table.string("phone_number", 20).nullable(); // Número de teléfono de contacto
                table.string("address").nullable(); // Dirección física de la academia
                table.timestamps(true, true); // Timestamps: created_at, updated_at
            })
            .then(function () {
                // Insertar datos por defecto
                return knex("settings").insert([
                    {
                        academy_name: "Default Academy",
                        logo_url: "tu_logo.png",
                        currency: "USD",
                        date_format: "YYYY-MM-DD",
                        theme: "light",
                        language: "en",
                        contact_email: "contact@academy.com",
                        phone_number: "1234567890",
                        address: "123 Main St, City, Country",
                        created_at: knex.fn.now(),
                        updated_at: knex.fn.now(),
                    },
                ]);
            });
    }

    console.log("Table 'settings' created successfully.");
};

exports.down = function (knex) {
    return knex.schema.dropTable("settings");
};
