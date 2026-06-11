export async function up(knex) {
    const hasSlogan = await knex.schema.hasColumn("academies", "slogan");
    if (!hasSlogan) {
        await knex.schema.alterTable("academies", (table) => {
            table.string("slogan", 255).nullable();
        });
    }

    const hasPrimaryColor = await knex.schema.hasColumn("academies", "primary_color");
    if (!hasPrimaryColor) {
        await knex.schema.alterTable("academies", (table) => {
            table.string("primary_color", 7).nullable();
        });
    }

    const hasSecondaryColor = await knex.schema.hasColumn("academies", "secondary_color");
    if (!hasSecondaryColor) {
        await knex.schema.alterTable("academies", (table) => {
            table.string("secondary_color", 7).nullable();
        });
    }

    const hasInstagram = await knex.schema.hasColumn("academies", "social_instagram");
    if (!hasInstagram) {
        await knex.schema.alterTable("academies", (table) => {
            table.string("social_instagram", 255).nullable();
        });
    }

    const hasFacebook = await knex.schema.hasColumn("academies", "social_facebook");
    if (!hasFacebook) {
        await knex.schema.alterTable("academies", (table) => {
            table.string("social_facebook", 255).nullable();
        });
    }

    const hasTimezone = await knex.schema.hasColumn("academies", "timezone");
    if (!hasTimezone) {
        await knex.schema.alterTable("academies", (table) => {
            table.string("timezone", 100).defaultTo("America/Bogota");
        });
    }
}

export async function down(knex) {
    await knex.schema.alterTable("academies", (table) => {
        table.dropColumn("slogan");
        table.dropColumn("primary_color");
        table.dropColumn("secondary_color");
        table.dropColumn("social_instagram");
        table.dropColumn("social_facebook");
        table.dropColumn("timezone");
    });
}
