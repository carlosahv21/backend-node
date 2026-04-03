export async function up(knex) {
    const tables = ['roles', 'permissions', 'plans'];

    for (const tableName of tables) {
        await knex.schema.alterTable(tableName, (table) => {
            table.uuid('deleted_by').nullable().references('id').inTable('users').onDelete('SET NULL').alter();
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
