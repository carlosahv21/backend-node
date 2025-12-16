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

    const [paymentsBlockInfo] = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Basic Information', 'modules.name': 'payments' })
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
        // 💰 Campos de Payments
        {
            name: "user_id",
            type: "relation",
            label: "Student",
            required: true,
            order_sequence: 1,
            relation_config: JSON.stringify({
                "table": "users",
                "value_field": "users.id",
                "display_field": "CONCAT(`users`.`first_name`, ' ', `users`.`last_name`)",
                "display_alias": "student_name",
                "filters": { "role_id": 2 },
                "multiple": false,
                "search": true,
                "limit": 20
            }),
            block_id: paymentsBlockInfo.id,
        },
        {
            name: "plan_id",
            type: "relation",
            label: "Plan",
            required: true,
            order_sequence: 2,
            relation_config: JSON.stringify({
                "table": "plans",
                "value_field": "plans.id",
                "display_field": "plans.name",
                "display_alias": "plan_name",
                "filters": { "active": 1 },
                "multiple": false,
                "search": true,
                "limit": 20
            }),
            block_id: paymentsBlockInfo.id,
        },
        {
            name: "original_amount",
            type: "number",
            label: "Original Amount",
            required: true,
            order_sequence: 3,
            block_id: paymentsBlockInfo.id,
        },
        {
            name: "amount",
            type: "number",
            label: "Amount",
            required: true,
            order_sequence: 4,
            block_id: paymentsBlockInfo.id,
        },
        {
            name: "discount_type",
            type: "select",
            label: "Discount Type",
            required: false,
            order_sequence: 5,
            options: JSON.stringify(["percentage", "fixed"]),
            block_id: paymentsBlockInfo.id,
        },
        {
            name: "discount_value",
            type: "number",
            label: "Discount Value",
            required: false,
            order_sequence: 6,
            block_id: paymentsBlockInfo.id,
        },
        {
            name: "discount_notes",
            type: "textarea",
            label: "Discount Notes",
            required: false,
            order_sequence: 7,
            block_id: paymentsBlockInfo.id,
        },
        {
            name: "payment_method",
            type: "select",
            label: "Payment Method",
            required: true,
            order_sequence: 8,
            options: JSON.stringify(["cash", "card", "transfer"]),
            block_id: paymentsBlockInfo.id,
        },
        {
            name: "payment_date",
            type: "date",
            label: "Date",
            required: true,
            order_sequence: 9,
            block_id: paymentsBlockInfo.id,
        },
        {
            name: "status",
            type: "select",
            label: "Status",
            required: true,
            order_sequence: 10,
            options: JSON.stringify(["pending", "completed", "failed", "refunded"]),
            block_id: paymentsBlockInfo.id,
        },
        {
            name: "notes",
            type: "textarea",
            label: "Notes",
            required: false,
            order_sequence: 11,
            block_id: paymentsBlockInfo.id,
        },
    ];

    return fieldsData;
}

export default { getFieldsData };
