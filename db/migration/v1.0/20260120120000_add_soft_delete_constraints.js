export async function up(knex) {
    const tables = ['roles', 'permissions', 'plans'];

    for (const tableName of tables) {
        await knex.schema.alterTable(tableName, (table) => {
            table.foreign('deleted_by').references('id').inTable('users').onDelete('SET NULL');
        });
    }
}

export async function down(knex) {
    const tables = ['roles', 'permissions', 'plans'];

    for (const tableName of tables) {
        await knex.schema.alterTable(tableName, (table) => {
            table.dropForeign(['deleted_by']);
        });
    }
}
