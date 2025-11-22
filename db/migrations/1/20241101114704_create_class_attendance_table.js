exports.up = function (knex) {
    return knex.schema.createTable('class_attendance', function (table) {
        table.increments('id').primary();
        table
            .integer('class_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('classes')
            .onDelete('CASCADE');
        table
            .integer('student_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('students')
            .onDelete('CASCADE');
        table.date('attendance_date').notNullable();
        table.string('status').defaultTo('asistió');
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('class_attendance');
};
