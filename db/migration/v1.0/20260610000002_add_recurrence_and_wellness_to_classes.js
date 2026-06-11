export async function up(knex) {
    const hasCalories = await knex.schema.hasColumn("classes", "calories_estimate");
    if (!hasCalories) {
        await knex.schema.alterTable("classes", (table) => {
            table.integer("calories_estimate").unsigned().nullable();
        });
    }

    const hasIntensity = await knex.schema.hasColumn("classes", "intensity_level");
    if (!hasIntensity) {
        await knex.schema.alterTable("classes", (table) => {
            table.enu("intensity_level", ["low", "medium", "high"]).nullable();
        });
    }

    const hasRecurring = await knex.schema.hasColumn("classes", "is_recurring");
    if (!hasRecurring) {
        await knex.schema.alterTable("classes", (table) => {
            table.boolean("is_recurring").defaultTo(false);
        });
    }

    const hasRRule = await knex.schema.hasColumn("classes", "recurrence_rule");
    if (!hasRRule) {
        await knex.schema.alterTable("classes", (table) => {
            table.string("recurrence_rule", 255).nullable();
        });
    }
}

export async function down(knex) {
    await knex.schema.alterTable("classes", (table) => {
        table.dropColumn("calories_estimate");
        table.dropColumn("intensity_level");
        table.dropColumn("is_recurring");
        table.dropColumn("recurrence_rule");
    });
}
