export async function up(knex) {
    const exists = await knex.schema.hasTable('attendances');

    if (!exists) {
        await knex.schema.createTable('attendances', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
            table.uuid('class_id').notNullable().references('id').inTable('classes').onDelete('CASCADE');
            table.uuid('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.date('date').notNullable();
            table.enum('status', ['present', 'absent']).defaultTo('present');
            table.uuid('substitute_teacher_id').nullable().references('id').inTable('users').onDelete('SET NULL');
            table.boolean('is_cancelled').defaultTo(false);
            table.string('cancelled_reason').nullable();
            table.timestamps(true, true);
            table.unique(['class_id', 'student_id', 'date']);
        });
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('attendances');
}
