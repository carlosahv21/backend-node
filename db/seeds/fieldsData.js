// db/seeds/fieldsData.js
import knex from '../../config/knex.js';

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

    const [plansBlockInfo] = await knex('blocks')
        .where({ name: 'Basic Information', module_id: 11 })
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
        {
            name: "teacher_id",
            type: "relation",
            label: "Teacher",
            required: false,
            order_sequence: 3,
            relation_config: JSON.stringify({
                "table": "users",
                "value_field": "users.id",
                "display_field": "CONCAT(`users`.`first_name`, ' ', `users`.`last_name`)",
                "display_alias": "full_name", 
                "filters": {
                    "role": "teacher"
                },
                "multiple": false,
                "search": true,
                "limit": 20
            }),
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
            name: "role_id",
            type: "select",
            label: "Role",
            required: true,
            order_sequence: 4,
            block_id: usersBlockInfo.id,
        },

        // 🧩 Información Planes
        {
            name: "name",
            type: "text",
            label: "Name",
            required: true,
            order_sequence: 1,
            block_id: plansBlockInfo.id,
        },
        {
            name: "description",
            type: "textarea",
            label: "Description",
            required: true,
            order_sequence: 2,
            block_id: plansBlockInfo.id,
        },
        {
            name: "price",
            type: "number",
            label: "Price",
            required: true,
            order_sequence: 3,
            block_id: plansBlockInfo.id,
        },
        {
            name: "type",
            type: "select",
            label: "Type",
            required: true,
            options: JSON.stringify(["monthly", "package"]),
            order_sequence: 4,
            block_id: plansBlockInfo.id,
        },
        {
            name: "max_sessions",
            type: "select",
            label: "Max Sessions",
            required: true,
            options: JSON.stringify(["Ilimitadas", "4", "8", "16"]),
            order_sequence: 7,
            block_id: plansBlockInfo.id,
        },
        {
            name: "trial_period_days",
            type: "number",
            label: "Trial Period Days",
            required: true,
            order_sequence: 8,
            block_id: plansBlockInfo.id,
        }
    ];

    return fieldsData;
}

export default { getFieldsData };
