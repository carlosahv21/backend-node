export async function up(knex) {
    const exists = await knex.schema.hasTable('audit_log');

    if (!exists) {
        await knex.schema.createTable('audit_log', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.string('action').notNullable();
            table.string('table_name').notNullable();
            table.string('record_id').notNullable();
            table.jsonb('old_values').notNullable();
            table.jsonb('new_values').notNullable();
            table.timestamps(true, true);
        });
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('audit_log');
}
