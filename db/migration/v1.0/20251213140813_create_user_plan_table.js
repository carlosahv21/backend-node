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
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('user_plan');
}
