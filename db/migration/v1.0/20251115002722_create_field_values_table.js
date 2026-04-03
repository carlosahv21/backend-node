export async function up(knex) {
    const exists = await knex.schema.hasTable('field_values');

    if (!exists) {
        await knex.schema.createTable('field_values', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
            table.uuid('field_id').references('id').inTable('fields').onDelete('CASCADE').index();
            table.uuid('record_id').notNullable().index();
            table.text('value').notNullable();
            table.timestamps(true, true);
        });
    }

    const existsCounters = await knex.schema.hasTable('custom_field_counters');

    if (!existsCounters) {
        await knex.schema.createTable('custom_field_counters', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
            table.integer('last_cf_number').notNullable().defaultTo(1000);
        });
        await knex('custom_field_counters').insert({ last_cf_number: 1000 });
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('field_values');
    await knex.schema.dropTableIfExists('custom_field_counters');
}
