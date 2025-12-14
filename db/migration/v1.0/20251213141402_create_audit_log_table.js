export async function up(knex) {
    await knex.schema.createTable('audit_log', function(table) {
        table.increments('id').primary();
        table.integer('user_id').notNullable();
        table.string('action').notNullable();

        table.string('table_name').notNullable();
        table.string('record_id').notNullable();
        
        table.json('old_values').notNullable();
        table.json('new_values').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
    console.log('Tabla audit_log creada exitosamente');
};

export async function down(knex) {
    await knex.schema.dropTable('audit_log');
    console.log('Tabla audit_log eliminada exitosamente');
};
