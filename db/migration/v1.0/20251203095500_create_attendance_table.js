export async function up(knex) {
    const exists = await knex.schema.hasTable('attendance');

    if (!exists) {
        await knex.schema.createTable('attendance', function (table) {
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
                .inTable('users')
                .onDelete('CASCADE');
            table.date('date').notNullable();
            table.enum('status', ['present', 'absent', 'late', 'excused']).defaultTo('present');
            table.timestamps(true, true);

            table.unique(['class_id', 'student_id', 'date']);
        });

        console.log("Table 'attendance' created successfully.");
    }
};

export async function down(knex) {
    await knex.schema.dropTableIfExists('attendance');
    console.log("Table 'attendance' dropped successfully.");
};
