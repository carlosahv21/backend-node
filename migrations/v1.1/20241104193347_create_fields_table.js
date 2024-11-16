exports.up = async function (knex) {
    await knex.schema.createTable('fields', (table) => {
        table.increments('id').primary();
        table
            .integer('block_id')
            .unsigned()
            .references('id')
            .inTable('blocks')
            .onDelete('CASCADE');
        table.string('name').notNullable();
        table.string('type').notNullable();
        table.string('label');
        table.string('placeholder');
        table.json('options');
        table.boolean('required').defaultTo(false);
        table.boolean('visible').defaultTo(true);
        table.integer('order').defaultTo(0);
        table.string('default_value'); // Nuevo campo para el valor predeterminado
        table.string('validation_rules'); // Nuevo campo para reglas de validación
        table.string('helper_text'); // Nuevo campo para texto de ayuda
        table.boolean('editable').defaultTo(true); // Nuevo campo para indicar si es editable
        table.boolean('readonly').defaultTo(false); // Nuevo campo para indicar si es solo lectura
        table.boolean('hidden').defaultTo(false); // Nuevo campo para indicar si está oculto
        table.timestamps(true, true);
    });

    // Obtener los bloques de la tabla de bloques
    const [blockInformation] = await knex('blocks').where('name', 'Basic Information').select('id');
    const [blockDetails] = await knex('blocks').where('name', 'Class Details').select('id');
    const [blockSchedule] = await knex('blocks').where('name', 'Schedule').select('id');

    await knex('fields').insert([
        {
            name: "name",
            type: "text",
            label: "Name",
            placeholder: "Enter your name",
            required: true,
            visible: true,
            order: 1,
            block_id: blockInformation.id,
            default_value: "",
            validation_rules: "required|string|max:255",
            helper_text: "Your full name",
            editable: true,
            readonly: false,
            hidden: false,
        },
        {
            name: "level",
            type: "select",
            label: "Level",
            placeholder: "Select your level",
            required: true,
            visible: true,
            order: 2,
            options: JSON.stringify(["Basic", "Intermediate", "Advanced"]),
            block_id: blockInformation.id,
            default_value: "Basic",
            validation_rules: "required",
            helper_text: "Select your experience level",
            editable: true,
            readonly: false,
            hidden: false,
        },
        {
            name: "genre",
            type: "select",
            label: "Genre",
            placeholder: "Select your genre",
            required: true,
            visible: true,
            order: 3,
            options: JSON.stringify(["Salsa", "Bachata", "Reggaeton", "Cumbia"]),
            block_id: blockInformation.id,
            default_value: "Salsa",
            validation_rules: "required",
            helper_text: "Choose a genre",
            editable: true,
            readonly: false,
            hidden: false,
        },
        {
            name: "description",
            type: "textarea",
            label: "Description",
            placeholder: "Enter your description",
            required: true,
            visible: true,
            order: 4,
            block_id: blockDetails.id,
            default_value: "",
            validation_rules: "",
            helper_text: "Brief description of the class",
            editable: true,
            readonly: false,
            hidden: false,
        },
        {
            name: "duration",
            type: "number",
            label: "Duration",
            placeholder: "Enter your duration",
            required: true,
            visible: true,
            order: 5,
            block_id: blockDetails.id,
            default_value: "60",
            validation_rules: "required|integer|min:30|max:180",
            helper_text: "Duration in minutes",
            editable: true,
            readonly: false,
            hidden: false,
        },
        {
            name: "date",
            type: "select",
            label: "Date",
            placeholder: "Enter your date",
            required: true,
            visible: true,
            order: 6,
            options: JSON.stringify(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
            block_id: blockSchedule.id,
            default_value: "",
            validation_rules: "required|date",
            helper_text: "Select the date",
            editable: true,
            readonly: false,
            hidden: false,
        },
        {
            name: "hour",
            type: "time",
            label: "Hour",
            placeholder: "Enter your hour",
            required: true,
            visible: true,
            order: 7,
            block_id: blockSchedule.id,
            default_value: "",
            validation_rules: "required|time",
            helper_text: "Select the start time",
            editable: true,
            readonly: false,
            hidden: false,
        },
        {
            name: "capacity",
            type: "number",
            label: "Capacity",
            placeholder: "Enter your capacity",
            required: true,
            visible: true,
            order: 8,
            block_id: blockSchedule.id,
            default_value: "20",
            validation_rules: "required|integer|min:1|max:100",
            helper_text: "Max capacity of attendees",
            editable: true,
            readonly: false,
            hidden: false,
        },
    ]);
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('fields');
};
