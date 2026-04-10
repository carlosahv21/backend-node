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
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('user_registration_history');
}
