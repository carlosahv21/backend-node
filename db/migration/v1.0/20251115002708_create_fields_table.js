import fieldsModule from '../../data/fieldsData.js';
const { getFieldsData } = fieldsModule;

export async function up(knex) {
    const exists = await knex.schema.hasTable('fields');

    if (!exists) {
        await knex.schema.createTable('fields', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
            table.uuid('block_id').references('id').inTable('blocks').onDelete('CASCADE');
            table.string('name').notNullable();
            table.string('label').notNullable();
            table.string('type').notNullable();
            table.jsonb('options');
            table.jsonb('relation_config');
            table.boolean('required').defaultTo(false);
            table.integer('order_sequence').defaultTo(0);
            table.timestamps(true, true);
        });

        const fieldsData = await getFieldsData(knex);
        if (fieldsData.length > 0) await knex('fields').insert(fieldsData);
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('fields');
}
