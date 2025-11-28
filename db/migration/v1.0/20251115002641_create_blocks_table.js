
import blocksModule from '../../seeds/blocksData.js';

const { getBlocksData } = blocksModule;

export async function up(knex) {
    const exists = await knex.schema.hasTable('blocks');

    if (!exists) {
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

        const blocksData = await getBlocksData(knex);
        await knex('blocks').insert(blocksData);
    }
};

export async function down(knex) {
    return knex.schema.dropTableIfExists('blocks');
};
