import { getFieldsData } from '../../seeds/fieldsData.js';

exports.up = async function (knex) {
    await knex.schema.createTable('fields', (table) => {
        table.increments('id').primary();
        table
            .integer('block_id')
            .unsigned()
            .references('id')
            .inTable('blocks')
            .onDelete('CASCADE');
        table.string('name').notNullable(); // Nombre interno del campo
        table.string('label').notNullable(); // Nombre visible para el usuario
        table.string('type').notNullable(); // Tipo de campo (texto, número, fecha, opción, etc.)
        table.json('options'); // Solo si el tipo es select, radio o similar
        table.boolean('required').defaultTo(false); // Si es obligatorio
        table.integer('order_sequence').defaultTo(0); // Orden dentro del bloque
        table.timestamps(true, true);
    });

    const fieldsData = await getFieldsData();
    await knex('fields').insert(fieldsData);

    console.log("Table 'fields' created successfully.");
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('fields');
};
