export async function up(knex) {
    const exists = await knex.schema.hasTable('user_registration_history');

    if (!exists) {
        await knex.schema.createTable('user_registration_history', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.uuid('plan_id').notNullable().references('id').inTable('plans').onDelete('CASCADE');
            table.uuid('payment_id').notNullable().references('id').inTable('payments').onDelete('CASCADE');
            table.string('action_type').notNullable();
            table.uuid('previous_plan_id').nullable().references('id').inTable('plans').onDelete('SET NULL');
            table.string('classes_purchased').notNullable();
            table.string('classes_used').notNullable();
            table.date('start_date').notNullable();
            table.date('end_date').notNullable();
            table.string('status').notNullable();
            table.timestamps(true, true);
        });

        const user = await knex("users").where("email", "student1@example.com").first();
        const plan = await knex("plans").where("name", "Mensualidad Ilimitada").first();
        const payment = await knex("payments").where("user_id", user?.id).first();

        if (user && plan && payment) {
            await knex('user_registration_history').insert([{
                user_id: user.id,
                plan_id: plan.id,
                payment_id: payment.id,
                action_type: 'create',
                previous_plan_id: null,
                classes_purchased: '20',
                classes_used: '0',
                start_date: knex.fn.now(),
                end_date: knex.raw("NOW() + INTERVAL '1 month'"),
                status: 'active'
            }]);
        }
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('user_registration_history');
}
