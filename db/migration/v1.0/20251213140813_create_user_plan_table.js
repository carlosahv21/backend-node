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

    const startDate = knex.fn.now();
const endDate = knex.raw("DATE_ADD(NOW(), INTERVAL 1 MONTH)");
    await knex('user_plan').insert([
        {
            user_id: 2,
            plan_id: 1,
            payment_id: 1,
            status: 'active',
            start_date: startDate,
            end_date: endDate,
            max_classes: 20,
            classes_used: 0,
            classes_remaining: 20,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now()
        }
    ]);
};

export async function down(knex) {
    await knex.schema.dropTable('user_plan');
    console.log("Tabla 'user_plan' eliminada exitosamente");
};
