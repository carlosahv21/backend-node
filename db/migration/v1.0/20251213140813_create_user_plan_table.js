export async function up(knex) {
    await knex.schema.createTable('user_plan', function(table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE');
        table.integer('plan_id').unsigned().notNullable()
                .references('id')
                .inTable('plans')
                .onDelete('CASCADE');
        table.integer('payment_id').unsigned().notNullable()
                .references('id')
                .inTable('payments')
                .onDelete('CASCADE');
        table.string('status').notNullable();
        table.date('start_date').notNullable();
        table.date('end_date').notNullable();
        table.integer('max_classes').notNullable();
        table.integer('classes_used').notNullable().defaultTo(0);
        table.integer('classes_remaining').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
    console.log("Tabla 'user_plan' creada exitosamente");
};

export async function down(knex) {
    await knex.schema.dropTable('user_plan');
    console.log("Tabla 'user_plan' eliminada exitosamente");
};
