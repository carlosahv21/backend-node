exports.up = function (knex) {
    return knex.schema.createTable('class_professors', function (table) {
        table.increments('id').primary();
        table
            .integer('class_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('classes')
            .onDelete('CASCADE');
        table
            .integer('professor_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('professors')
            .onDelete('CASCADE');
        table.timestamp('assigned_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('class_professors');
};
