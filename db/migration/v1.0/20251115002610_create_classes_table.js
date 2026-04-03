export async function up(knex) {
    const exists = await knex.schema.hasTable('classes');

    if (!exists) {
        await knex.schema.createTable('classes', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
            table.string('name').notNullable();
            table.string('level');
            table.string('genre');
            table.text('description');
            table.integer('duration');
            table.string('date');
            table.string('hour');
            table.integer('capacity');
            table.uuid('teacher_id').references('id').inTable('users').onDelete('SET NULL');
            table.boolean('is_favorites').defaultTo(false);
            table.timestamp("deleted_at").nullable();
            table.uuid("deleted_by").nullable().references("id").inTable("users").onDelete("SET NULL");
            table.timestamps(true, true);
        });

        const teacher = await knex("users").where("email", "teacher1@example.com").first();
        if (teacher) {
            await knex('classes').insert([
                { name: "Clase 1", level: "Básico", genre: "Salsa", description: "Clase de Salsa para principiantes.", duration: 60, date: "Monday", hour: "18:00", capacity: 20, teacher_id: teacher.id, is_favorites: false },
                { name: "Clase 2", level: "Intermedio", genre: "Salsa", description: "Clase de Salsa para Intermedios.", duration: 60, date: "Tuesday", hour: "19:00", capacity: 20, teacher_id: teacher.id, is_favorites: false }
            ]);
        }
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists('classes');
}
