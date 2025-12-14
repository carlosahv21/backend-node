export async function up(knex) {
    const exists = await knex.schema.hasTable('classes');

    if (!exists) {
        await knex.schema.createTable('classes', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('level');
            table.string('genre');
            table.text('description');
            table.integer('duration'); // en minutos
            table.string('date');
            table.string('hour');
            table.integer('capacity');
            table.integer('teacher_id').unsigned().references('id').inTable('users');
            table.boolean('is_favorites').defaultTo(false);
            table.boolean('deleted').defaultTo(false);
            table.timestamps(true, true);
        });
    }
};

export async function down(knex) {
    return knex.schema.dropTable('classes');
};
