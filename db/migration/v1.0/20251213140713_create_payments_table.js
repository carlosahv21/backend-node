export async function up(knex) {
    const exists = await knex.schema.hasTable('payments');

    if (!exists) {
        await knex.schema.createTable('payments', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.uuid('plan_id').notNullable().references('id').inTable('plans').onDelete('CASCADE');
            table.decimal('original_amount', 10, 2).notNullable();
            table.decimal('amount', 10, 2).notNullable();
            table.enu('discount_type', ['percentage', 'fixed']).nullable();
            table.decimal('discount_value', 10, 2).nullable();
            table.string('discount_notes').nullable();
            table.string('payment_method').notNullable();
            table.date('payment_date').notNullable();
            table.enu('status', ['pending', 'completed', 'failed', 'refunded']).notNullable();
            table.string('transaction_id').nullable();
            table.text('notes').nullable();
            table.timestamp("deleted_at").nullable();
            table.uuid("deleted_by").nullable().references("id").inTable("users").onDelete("SET NULL");
            table.timestamps(true, true);
        });
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('payments');
}
