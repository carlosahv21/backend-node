export async function up(knex) {
    const exists = await knex.schema.hasTable('user_class');

    if (!exists) {
        await knex.schema.createTable('user_class', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
            table.uuid('class_id').notNullable().references('id').inTable('classes').onDelete('CASCADE');
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.unique(['class_id', 'user_id']);
            table.timestamps(true, true);
        });

        const student = await knex("users").where("email", "student1@example.com").first();
        const class1 = await knex("classes").where("name", "Clase 1").first();
        if (student && class1) {
            await knex('user_class').insert([{ class_id: class1.id, user_id: student.id }]);
        }
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('user_class');
}
