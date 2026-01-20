export async function up(knex) {
    await knex.schema.createTable('user_registration_history', function(table) {
        table.increments('id').primary();
        table.integer('user_id').notNullable();
        table.string('plan_id').notNullable();
        table.string('payment_id').notNullable();
        table.string('action_type').notNullable();
        table.integer('previous_plan_id').nullable();
        table.string('classes_purchased').notNullable();
        table.string('classes_used').notNullable();
        table.date('start_date').notNullable();
        table.date('end_date').notNullable();
        table.string('status').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
    console.log("Tabla 'user_registration_history' creada exitosamente");

    const startDate = knex.fn.now();
    const endDate = knex.raw("DATE_ADD(NOW(), INTERVAL 1 MONTH)");
    await knex('user_registration_history').insert([
        {
            user_id: 2,
            plan_id: 1,
            payment_id: 1,
            action_type: 'create',
            previous_plan_id: null,
            classes_purchased: '20',
            classes_used: '0',
            start_date: startDate,
            end_date: endDate,
            status: 'active',
            created_at: knex.fn.now()
        }
    ]);
};

export async function down(knex) {
    await knex.schema.dropTable('user_registration_history');
    console.log("Tabla 'user_registration_history' eliminada exitosamente");
};
