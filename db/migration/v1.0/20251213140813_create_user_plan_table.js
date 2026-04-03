export async function up(knex) {
    const exists = await knex.schema.hasTable('user_plan');

    if (!exists) {
        await knex.schema.createTable('user_plan', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.uuid('plan_id').notNullable().references('id').inTable('plans').onDelete('CASCADE');
            table.uuid('payment_id').notNullable().references('id').inTable('payments').onDelete('CASCADE');
            table.string('status').notNullable();
            table.string('note').nullable();
            table.date('start_date').notNullable();
            table.date('end_date').notNullable();
            table.integer('max_classes').notNullable();
            table.integer('classes_used').notNullable().defaultTo(0);
            table.integer('classes_remaining').notNullable();
            table.timestamps(true, true);
        });

        const user = await knex("users").where("email", "student1@example.com").first();
        const plan = await knex("plans").where("name", "Mensualidad Ilimitada").first();
        const payment = await knex("payments").where("user_id", user?.id).first();

        if (user && plan && payment) {
            await knex('user_plan').insert([{
                user_id: user.id,
                plan_id: plan.id,
                payment_id: payment.id,
                status: 'active',
                start_date: knex.fn.now(),
                end_date: knex.raw("NOW() + INTERVAL '1 month'"),
                max_classes: 20,
                classes_used: 0,
                classes_remaining: 20
            }]);
        }
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('user_plan');
}
