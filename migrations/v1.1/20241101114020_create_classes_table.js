exports.up = async function (knex) {
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
        table.timestamps(true, true);
    });

    // Las clases deben ser los generos de baile ejemplo : Salsa en linea, Salsa Casino, Bachata, etc.

    await knex('classes').insert([
        {
            name: "Salsa en linea",
            level: "Basic",
            genre: "Salsa",
            description: "Clase de salsa en línea",
            duration: 60,
            date: "Monday",
            hour: "10:00",
            capacity: 10
        },
        {
            name: "Salsa Casino",
            level: "Advanced",
            genre: "Salsa",
            description: "Clase de salsa casino",
            duration: 60,
            date: "Tuesday",
            hour: "10:00",
            capacity: 10
        },
        {
            name: "Bachata",
            level: "Intermedium",
            genre: "Bachata",
            description: "Clase de bachata",
            duration: 60,
            date: "Wednesday",
            hour: "10:00",
            capacity: 10
        }
    ]);
};

exports.down = function (knex) {
    return knex.schema.dropTable('classes');
};
