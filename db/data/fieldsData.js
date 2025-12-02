// db/seeds/fieldsData.js
import knex from '../../config/knex.js';

async function getFieldsData() {
    const [classBlockInfo] = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Basic Information', 'modules.name': 'classes' })
        .select('blocks.id');

    const [usersBlockInfo] = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Basic Information', 'modules.name': 'users' })
        .select('blocks.id');

    const [blockDetails] = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Class Details', 'modules.name': 'classes' })
        .select('blocks.id');

    const [blockSchedule] = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Schedule', 'modules.name': 'classes' })
        .select('blocks.id');

    const [plansBlockInfo] = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Basic Information', 'modules.name': 'plans' })
        .select('blocks.id');

    const [studentsBlockInfo] = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Class Details', 'modules.name': 'students' })
        .select('blocks.id');

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
        {
            name: "is_favorites",
            type: "boolean",
            label: "Favorites",
            required: false,
            order_sequence: 4,
            block_id: classBlockInfo.id,
        },

        // 📄 Detalles
        {
            name: "description",
            type: "textarea",
            label: "Description",
            required: false,
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
            required: true,
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
            options: JSON.stringify(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
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
            required: false,
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
            name: "max_classes",
            type: "number",
            label: "Max Classes",
            required: true,
            order_sequence: 5,
            block_id: plansBlockInfo.id,
        },
        {
            name: "max_sessions",
            type: "number",
            label: "Max Sessions",
            required: true,
            order_sequence: 6,
            block_id: plansBlockInfo.id,
        },
        {
            name: "trial_period_days",
            type: "number",
            label: "Trial Period Days",
            required: false,
            order_sequence: 7,
            block_id: plansBlockInfo.id,
        },

        // Detalles del estudiante
        {
            name: "plan_id",
            type: "relation",
            label: "Plan",
            required: true,
            order_sequence: 1,
            relation_config: JSON.stringify({
                "table": "plans",
                "value_field": "plans.id",
                "display_field": "plans.name",
                "display_alias": "plan_name",
                "filters": {},
                "multiple": false,
                "search": true,
                "limit": 20
            }),
            block_id: studentsBlockInfo.id,
        },
        {
            name: "plan_classes_status",
            type: "select",
            label: "Plan Classes Status",
            required: true,
            options: JSON.stringify(["active", "expired", "paused"]),
            order_sequence: 2,
            block_id: studentsBlockInfo.id,
        },
    ];

    return fieldsData;
}

export default { getFieldsData };
