const { getBlocksData } = require('../../seeds/blocksData');

exports.up = async function (knex) {
    await knex.schema.createTable('blocks', (table) => {
        table.increments('id').primary();
        table
            .integer('module_id')
            .unsigned()
            .references('id')
            .inTable('modules')
            .onDelete('CASCADE');
        table.string('name').notNullable();
        table.string('description');
        table.integer('order').defaultTo(0);
        table.boolean('collapsible').defaultTo(false);
        table.string('display_mode').defaultTo('edit');
        table.timestamps(true, true);
    });

    console.log("Table 'blocks' created successfully.");

    const blocksData = await getBlocksData(knex); // <-- PASAS knex AQUÍ
    await knex('blocks').insert(blocksData);
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('blocks');
};
