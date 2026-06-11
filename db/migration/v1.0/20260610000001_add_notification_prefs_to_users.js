export async function up(knex) {
    const hasPushNotifications = await knex.schema.hasColumn("users", "push_notifications");
    if (!hasPushNotifications) {
        await knex.schema.alterTable("users", (table) => {
            table.boolean("push_notifications").defaultTo(true);
        });
    }

    const hasLastSeenAt = await knex.schema.hasColumn("users", "last_seen_at");
    if (!hasLastSeenAt) {
        await knex.schema.alterTable("users", (table) => {
            table.timestamp("last_seen_at", { useTz: true }).nullable();
        });
    }
}

export async function down(knex) {
    await knex.schema.alterTable("users", (table) => {
        table.dropColumn("push_notifications");
        table.dropColumn("last_seen_at");
    });
}
