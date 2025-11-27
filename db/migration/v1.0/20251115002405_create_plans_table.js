export async function up(knex) {
    await knex.schema.createTable('plans', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('description').nullable();

        table.decimal('price', 10, 2).notNullable();

        table.enum('type', ['monthly', 'package']).notNullable();
        table.integer('max_sessions').defaultTo(0).nullable();

        table.integer('trial_period_days').defaultTo(0);

        table.boolean('active').defaultTo(true);

        table.timestamps(true, true);
    });

    await knex('plans').insert([
        {
            name: "Mensualidad Ilimitada",
            description: "Acceso ilimitado a las clases mensuales.",
            price: 30,
            type: "monthly",
            max_sessions: 0,
            trial_period_days: 0,
        },
        {
            name: "Paquete de 4 Clases",
            description: "Bono de 4 clases que el alumno puede consumir en cualquier momento.",
            price: 12,
            type: "package",
            max_sessions: 4,
            trial_period_days: 0,
        },
        {
            name: "Paquete de 8 Clases",
            description: "Bono de 8 clases ideal para estudiantes frecuentes.",
            price: 20,
            type: "package",
            max_sessions: 8,
            trial_period_days: 0,
        },
        {
            name: "Paquete de 16 Clases",
            description: "Bono de 16 clases ideal para estudiantes frecuentes.",
            price: 30,
            type: "package",
            max_sessions: 16,
            trial_period_days: 0,
        }
    ]);
}

export async function down(knex) {
    await knex.schema.dropTable('plans');
}
