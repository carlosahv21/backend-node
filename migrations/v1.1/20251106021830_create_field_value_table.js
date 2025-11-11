exports.up = async function (knex) {
    await knex.schema.createTable('field_values', (table) => {
        table.increments('id').primary();

        // Relación con la tabla fields
        table
            .integer('field_id')
            .unsigned()
            .references('id')
            .inTable('fields')
            .onDelete('CASCADE')
            .index();

        // ID del registro al que pertenece el valor (ej. usuario, cliente, producto, etc.)
        table.integer('record_id').notNullable().index();

        // Valor almacenado (puede ser texto, número, booleano, JSON según tu uso)
        table.text('value').notNullable();

        table.timestamps(true, true);
    });

    console.log("Table 'field_values' created successfully.");

    await knex.schema.createTable('custom_field_counters', (table) => {
        table.increments('id').primary();
        table.integer('last_cf_number').notNullable().defaultTo(1000);
    });

    console.log("Table 'custom_field_counters' created successfully.");


    await knex('custom_field_counters').insert({ last_cf_number: 1000 });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('field_values');
};
