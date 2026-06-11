export async function up(knex) {
    const hasStreak = await knex.schema.hasColumn("attendances", "streak_count_at_moment");
    if (!hasStreak) {
        await knex.schema.alterTable("attendances", (table) => {
            table.integer("streak_count_at_moment").unsigned().defaultTo(0);
        });
    }
}

export async function down(knex) {
    await knex.schema.alterTable("attendances", (table) => {
        table.dropColumn("streak_count_at_moment");
    });
}
