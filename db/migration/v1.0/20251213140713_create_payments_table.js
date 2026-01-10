export async function up(knex) {
    await knex.schema.createTable('payments', function (table) {
        table.increments('id').primary();

        // Relaciones
        table.integer('user_id').unsigned().notNullable()
            .references('id').inTable('users')
            .onDelete('CASCADE');
        table.integer('plan_id').unsigned().notNullable()
            .references('id').inTable('plans')
            .onDelete('CASCADE');

        // Monto original y final
        table.decimal('original_amount', 10, 2).notNullable();
        table.decimal('amount', 10, 2).notNullable();

        // Descuentos
        table.enu('discount_type', ['percentage', 'fixed']).nullable();
        table.decimal('discount_value', 10, 2).nullable();
        table.string('discount_notes').nullable();

        // Detalles de pago
        table.string('payment_method').notNullable(); // 'efectivo', 'tarjeta', etc.
        table.date('payment_date').notNullable();
        table.enu('status', ['pending', 'completed', 'failed', 'refunded']).notNullable();
        table.string('transaction_id').nullable();

        table.text('notes').nullable();
        table.boolean('deleted').defaultTo(false);

        // Timestamps
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    console.log("Tabla 'payments' creada exitosamente");
};

export async function down(knex) {
    await knex.schema.dropTable('payments');
    console.log("Tabla 'payments' eliminada exitosamente");
};
