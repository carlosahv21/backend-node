export async function up(knex) {
    return knex.schema.createTable('user_notifications_interactions', function (table) {
        table.increments('id').primary();

        // Foreign Keys
        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('users').onDelete('CASCADE');

        table.integer('notification_id').unsigned().notNullable()
            .references('id').inTable('notifications').onDelete('CASCADE');

        // Status flags
        table.boolean('is_read').defaultTo(false);
        table.boolean('is_deleted').defaultTo(false);

        // Timestamps
        table.timestamp('deleted_at').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        // Unique constraint to avoid duplicates per user/notification
        table.unique(['user_id', 'notification_id']);

        // Index for performance
        table.index(['user_id', 'notification_id']);
        table.index(['user_id', 'is_read']);
        table.index(['user_id', 'is_deleted']);
    });
};

export async function down(knex) {
    return knex.schema.dropTable('user_notifications_interactions');
};
