export async function up(knex) {
    const exists = await knex.schema.hasTable('class_user');

    if (!exists) {
        await knex.schema.createTable('class_user', function (table) {
            table.increments('id').primary();

            table.integer('class_id').unsigned().notNullable()
                .references('id')
                .inTable('classes')
                .onDelete('CASCADE');

            table.integer('user_id').unsigned().notNullable()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE');

            table.unique(['class_id', 'user_id']);

            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        });

        console.log("Table 'class_user' created successfully.");
    }
};

export async function down(knex) {
    await knex.schema.dropTable('class_user');
    console.log("Table 'class_user' dropped successfully.");
};
