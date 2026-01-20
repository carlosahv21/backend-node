export async function up(knex) {
    const exists = await knex.schema.hasTable('classes');

    if (!exists) {
        await knex.schema.createTable('classes', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('level');
            table.string('genre');
            table.text('description');
            table.integer('duration'); // en minutos
            table.string('date');
            table.string('hour');
            table.integer('capacity');
            table.integer('teacher_id').unsigned().references('id').inTable('users');
            table.boolean('is_favorites').defaultTo(false);
            table.timestamp("deleted_at").nullable();
            table.integer("deleted_by").unsigned().nullable().references("id").inTable("users").onDelete("SET NULL");
            table.timestamps(true, true);
        });

        await knex('classes').insert([
            {
                name: "Clase 1",
                level: "Básico",
                genre: "Salsa",
                description: "Clase de Salsa para principiantes.",
                duration: 60,
                date: "Monday",
                hour: "18:00",
                capacity: 20,
                teacher_id: 1,
                is_favorites: false,
                deleted_at: null,
                deleted_by: null,
            },
            {
                name: "Clase 2",
                level: "Intermedio",
                genre: "Salsa",
                description: "Clase de Salsa para Intermedios.",
                duration: 60,
                date: "Tuesday",
                hour: "19:00",
                capacity: 20,
                teacher_id: 1,
                is_favorites: false,
                deleted_at: null,
                deleted_by: null,
            },
        ]);
    }
};

export async function down(knex) {
    return knex.schema.dropTable('classes');
};
