export async function up(knex) {
    await knex.schema.createTable('user_registration_history', function(table) {
        table.increments('id').primary();
        table.integer('user_id').notNullable();
        table.string('plan_id').notNullable();
        table.string('payment_id').notNullable();
        table.string('action_type').notNullable();
        table.integer('previous_plan_id').notNullable();
        table.string('classes_purchased').notNullable();
        table.string('classes_used').notNullable();
        table.date('start_date').notNullable();
        table.date('end_date').notNullable();
        table.string('status').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
    console.log('Tabla user_registration_history creada exitosamente');
};

export async function down(knex) {
    await knex.schema.dropTable('user_registration_history');
    console.log('Tabla user_registration_history eliminada exitosamente');
};
