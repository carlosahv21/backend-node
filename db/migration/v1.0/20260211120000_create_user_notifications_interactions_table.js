export async function up(knex) {
    return knex.schema.createTable('user_notifications_interactions', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.uuid('notification_id').notNullable().references('id').inTable('notifications').onDelete('CASCADE');
        table.boolean('is_read').defaultTo(false);
        table.boolean('is_deleted').defaultTo(false);
        table.timestamp('deleted_at', { useTz: true }).nullable();
        table.timestamps(true, true);
        table.unique(['user_id', 'notification_id']);
        table.index(['user_id', 'notification_id']);
        table.index(['user_id', 'is_read']);
        table.index(['user_id', 'is_deleted']);
    });
}

export async function down(knex) {
    return knex.schema.dropTableIfExists('user_notifications_interactions');
}
