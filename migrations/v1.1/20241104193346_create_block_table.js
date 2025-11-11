exports.up = async function (knex) {
    await knex.schema.createTable('blocks', (table) => {
        table.increments('id').primary();
        table
            .integer('module_id')
            .unsigned()
            .references('id')
            .inTable('modules')
            .onDelete('CASCADE');
        table.string('name').notNullable();
        table.string('description');
        table.integer('order').defaultTo(0);
        table.boolean('collapsible').defaultTo(false); // Nuevo campo para permitir colapsar bloques
        table.string('display_mode').defaultTo('edit'); // Modo de visualización por defecto
        table.timestamps(true, true);
    });

    // Id del modulo clase
    const [classModule] = await knex('modules')
        .where('name', 'Class')
        .select('id');

    const [settingsModule] = await knex('modules')
        .where('name', 'Settings')
        .select('id');
        
    await knex('blocks').insert([
        {
            name: "Basic Information",
            description: "Basic information block",
            order: 1,
            module_id: classModule.id,
            collapsible: true, // Permitir colapsar este bloque
            display_mode: "edit", // Modo de visualización predeterminado
        },
        {
            name: "Class Details",
            description: "Class details block",
            order: 2,
            module_id: classModule.id,
            collapsible: true,
            display_mode: "edit",
        },
        {
            name: "Schedule",
            description: "Schedule block",
            order: 3,
            module_id: classModule.id,
            collapsible: false, // Este bloque no se puede colapsar
            display_mode: "edit", // Solo lectura
        },
        {
            name: "General Information",
            description: "General Information block",
            order: 1,
            module_id: settingsModule.id,
            collapsible: true,
            display_mode: "edit",
        }
    ]);

    console.log("Table 'blocks' created successfully.");
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('blocks');
};
