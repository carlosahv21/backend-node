// db/seeds/fieldsData.js
const knex = require('../knex');

async function getFieldsData() {
    const [blockInformation] = await knex('blocks').where('name', 'Basic Information').select('id');
    const [blockDetails] = await knex('blocks').where('name', 'Class Details').select('id');
    const [blockSchedule] = await knex('blocks').where('name', 'Schedule').select('id');

    const fieldsData = [
        // 🧩 Información general
        {
            name: "name",
            type: "text",
            label: "Name",
            required: true,
            order_sequence: 1,
            block_id: blockInformation.id,
        },
        {
            name: "level",
            type: "select",
            label: "Level",
            required: true,
            order_sequence: 2,
            options: JSON.stringify(["Basic", "Intermediate", "Advanced"]),
            block_id: blockInformation.id,
        },
        {
            name: "genre",
            type: "select",
            label: "Genre",
            required: true,
            order_sequence: 3,
            options: JSON.stringify(["Salsa", "Bachata", "Reggaeton", "Cumbia"]),
            block_id: blockInformation.id,
        },

        // 📄 Detalles
        {
            name: "description",
            type: "textarea",
            label: "Description",
            required: true,
            order_sequence: 1,
            block_id: blockDetails.id,
        },
        {
            name: "duration",
            type: "number",
            label: "Duration (minutes)",
            required: true,
            order_sequence: 2,
            block_id: blockDetails.id,
        },

        // 📅 Horario
        {
            name: "date",
            type: "select",
            label: "Date",
            required: true,
            order_sequence: 1,
            options: JSON.stringify(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
            block_id: blockSchedule.id,
        },
        {
            name: "hour",
            type: "time",
            label: "Hour",
            required: true,
            order_sequence: 2,
            block_id: blockSchedule.id,
        },
        {
            name: "capacity",
            type: "number",
            label: "Capacity",
            required: true,
            order_sequence: 3,
            block_id: blockSchedule.id,
        }
    ];

    await knex.destroy();
    
    return fieldsData;
}

module.exports = { getFieldsData };
