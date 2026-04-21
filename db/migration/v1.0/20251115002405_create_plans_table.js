export async function up(knex) {
    const exists = await knex.schema.hasTable('plans');

    if (!exists) {
        await knex.schema.createTable('plans', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
            table.string('name').notNullable();
            table.string('description').nullable();
            table.decimal('price', 10, 2).notNullable();
            table.enum('type', ['monthly', 'package']).notNullable();
            table.integer('max_sessions').defaultTo(0).nullable();
            table.integer('max_classes').defaultTo(0).nullable();
            table.integer('trial_period_days').defaultTo(0);
            table.boolean('active').defaultTo(true);
            table.string('status').defaultTo('active');
            table.text('notes').nullable();
            table.jsonb('metadata').nullable();
            table.timestamp("deleted_at").nullable();
            table.uuid("deleted_by").nullable();
            table.timestamps(true, true);
        });
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('plans');
}
