/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('notifications', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().nullable();
        table.enum('role_target', ['ADMIN', 'STUDENT', 'TEACHER', 'RECEPTIONIST']).nullable();
        table.enum('category', ['PAYMENT', 'CLASS', 'SYSTEM', 'ATTENDANCE', 'REGISTRATION']).notNullable();
        table.string('title', 255).notNullable();
        table.text('message').notNullable();
        table.integer('related_entity_id').unsigned().nullable();
        table.string('deep_link').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('notifications');
};
