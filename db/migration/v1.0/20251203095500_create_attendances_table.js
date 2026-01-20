export async function up(knex) {
    const exists = await knex.schema.hasTable('attendances');

    if (!exists) {
        await knex.schema.createTable('attendances', function (table) {
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
            table.enum('status', ['present', 'absent']).defaultTo('present');
            table.integer('substitute_teacher_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
            table.boolean('is_cancelled').defaultTo(false);
            table.string('cancelled_reason').nullable();
            table.timestamps(true, true);

            table.unique(['class_id', 'student_id', 'date']);
        });

        console.log("Table 'attendances' created successfully.");
    }
};

export async function down(knex) {
    await knex.schema.dropTableIfExists('attendances');
    console.log("Table 'attendances' dropped successfully.");
};
