// db/seeds/fieldsData.js
const knex = require('../knex');

async function getFieldsData() {
    const [classBlockInfo] = await knex('blocks')
        .where({ name: 'Basic Information', module_id: 6 })
        .select('id');

    const [usersBlockInfo] = await knex('blocks')
        .where({ name: 'Basic Information', module_id: 3 })
        .select('id');

    const [blockDetails] = await knex('blocks')
        .where({ name: 'Class Details', module_id: 6 })
        .select('id');

    const [blockSchedule] = await knex('blocks')
        .where({ name: 'Schedule', module_id: 6 })
        .select('id');


    const fieldsData = [
        // 🧩 Información general (Clases)
        {
            name: "name",
            type: "text",
            label: "Name",
            required: true,
            order_sequence: 1,
            block_id: classBlockInfo.id,
        },
        {
            name: "level",
            type: "select",
            label: "Level",
            required: true,
            order_sequence: 2,
            options: JSON.stringify(["Basic", "Intermediate", "Advanced"]),
            block_id: classBlockInfo.id,
        },
        {
            name: "genre",
            type: "select",
            label: "Genre",
            required: true,
            order_sequence: 3,
            options: JSON.stringify(["Salsa", "Bachata", "Reggaeton", "Cumbia"]),
            block_id: classBlockInfo.id,
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
        },

        // 🧩 Información Usuarios
        {
            name: "first_name",
            type: "text",
            label: "First Name",
            required: true,
            order_sequence: 1,
            block_id: usersBlockInfo.id,
        },
        {
            name: "last_name",
            type: "text",
            label: "Last Name",
            required: true,
            order_sequence: 2,
            block_id: usersBlockInfo.id,
        },
        {
            name: "email",
            type: "text",
            label: "Email",
            required: true,
            order_sequence: 3,
            block_id: usersBlockInfo.id,
        },
        {
            name: "password",
            type: "password",
            label: "Password",
            required: true,
            order_sequence: 4,
            block_id: usersBlockInfo.id,
        },
        {
            name: "role",
            type: "select",
            label: "Role",
            required: true,
            order_sequence: 4,
            block_id: usersBlockInfo.id,
        }
    ];

    return fieldsData;
}

module.exports = { getFieldsData };
