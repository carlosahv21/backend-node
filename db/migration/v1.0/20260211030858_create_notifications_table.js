export async function up(knex) {
    return knex.schema.createTable('notifications', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
        table.enum('role_target', ['ADMIN', 'STUDENT', 'TEACHER', 'RECEPTIONIST']).nullable();
        table.enum('category', ['PAYMENT', 'CLASS', 'SYSTEM', 'ATTENDANCE', 'REGISTRATION']).notNullable();
        table.string('title', 255).notNullable();
        table.text('message').notNullable();
        table.uuid('related_entity_id').nullable();
        table.string('deep_link').nullable();
        table.timestamps(true, true);
    });
}

export async function down(knex) {
    return knex.schema.dropTableIfExists('notifications');
}
