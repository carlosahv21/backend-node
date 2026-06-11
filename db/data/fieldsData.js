// db/seeds/fieldsData.js
async function getFieldsData(knex) {
    const classBlockInfo = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Basic Information', 'modules.name': 'classes' })
        .select('blocks.id').first();

    const usersBlockInfo = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Basic Information', 'modules.name': 'users' })
        .select('blocks.id').first();

    const blockDetails = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Class Details', 'modules.name': 'classes' })
        .select('blocks.id').first();

    const blockSchedule = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Schedule', 'modules.name': 'classes' })
        .select('blocks.id').first();

    const plansBlockInfo = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Basic Information', 'modules.name': 'plans' })
        .select('blocks.id').first();

    const paymentsBlockInfo = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Basic Information', 'modules.name': 'payments' })
        .select('blocks.id').first();

    const wellBeingBlock = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Physical Well-being', 'modules.name': 'classes' })
        .select('blocks.id').first();

    const prefsBlock = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Preferences', 'modules.name': 'users' })
        .select('blocks.id').first();

    const achieveBlock = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Achievement Catalog', 'modules.name': 'achievements' })
        .select('blocks.id').first();

    const challengeBlock = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Challenge Catalog', 'modules.name': 'challenges' })
        .select('blocks.id').first();

    const reviewBlock = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Review Details', 'modules.name': 'teacher_reviews' })
        .select('blocks.id').first();

    const statsBlock = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .where({ 'blocks.name': 'Statistics', 'modules.name': 'student_stats' })
        .select('blocks.id').first();

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
                "display_field": "CONCAT(users.first_name, ' ', users.last_name)",
                "display_alias": "full_name",
                "filters": { "role_name": "teacher" },
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
            name: "phone",
            type: "text",
            label: "Phone",
            required: false,
            order_sequence: 6,
            block_id: usersBlockInfo.id,
        },
        {
            name: "gender",
            type: "select",
            label: "Gender",
            required: false,
            order_sequence: 7,
            options: JSON.stringify(["Male", "Female", "Other"]),
            block_id: usersBlockInfo.id,
        },
        {
            name: "birthdate",
            type: "date",
            label: "Birthdate",
            required: false,
            order_sequence: 8,
            block_id: usersBlockInfo.id,
        },
        {
            name: "role",
            type: "relation",
            label: "Role",
            required: true,
            order_sequence: 9,
            relation_config: JSON.stringify({
                "table": "roles",
                "value_field": "roles.name",
                "display_field": "roles.name",
                "display_alias": "name",
                "filters": {},
                "multiple": false,
                "search": true,
                "limit": 20
            }),
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
                "display_field": "CONCAT(users.first_name, ' ', users.last_name)",
                "display_alias": "student_name",
                "filters": { "role_name": "student" },
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
                "filters": { "active": true },
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
            type: "range",
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

        // 🏋️ Physical Well-being (Clases)
        ...(wellBeingBlock ? [
            {
                name: "calories_estimate",
                type: "number",
                label: "Calorías estimadas (kcal)",
                required: false,
                order_sequence: 1,
                block_id: wellBeingBlock.id,
            },
            {
                name: "intensity_level",
                type: "select",
                label: "Nivel de intensidad",
                required: false,
                order_sequence: 2,
                options: JSON.stringify(["low", "medium", "high"]),
                block_id: wellBeingBlock.id,
            },
        ] : []),

        // 📅 Schedule extras (Clases)
        {
            name: "is_recurring",
            type: "boolean",
            label: "Clase recurrente",
            required: false,
            order_sequence: 4,
            block_id: blockSchedule.id,
        },
        {
            name: "recurrence_rule",
            type: "text",
            label: "Regla de recurrencia (RRULE)",
            required: false,
            order_sequence: 5,
            block_id: blockSchedule.id,
        },

        // ⚙️ Preferences (Users)
        ...(prefsBlock ? [
            {
                name: "push_notifications",
                type: "boolean",
                label: "Notificaciones push",
                required: false,
                order_sequence: 1,
                block_id: prefsBlock.id,
            }
        ] : []),

        // 🏆 Achievement Catalog
        ...(achieveBlock ? [
            {
                name: "name",
                type: "text",
                label: "Nombre",
                required: true,
                order_sequence: 1,
                block_id: achieveBlock.id,
            },
            {
                name: "description",
                type: "textarea",
                label: "Descripción",
                required: false,
                order_sequence: 2,
                block_id: achieveBlock.id,
            },
            {
                name: "icon_url",
                type: "text",
                label: "Ícono (URL)",
                required: false,
                order_sequence: 3,
                block_id: achieveBlock.id,
            },
            {
                name: "trigger_type",
                type: "select",
                label: "Tipo de activación",
                required: true,
                order_sequence: 4,
                options: JSON.stringify(["attendance_streak", "classes_count", "milestone"]),
                block_id: achieveBlock.id,
            },
            {
                name: "trigger_value",
                type: "number",
                label: "Valor requerido",
                required: true,
                order_sequence: 5,
                block_id: achieveBlock.id,
            },
            {
                name: "points",
                type: "number",
                label: "Puntos",
                required: true,
                order_sequence: 6,
                block_id: achieveBlock.id,
            },
        ] : []),

        // 🎯 Challenge Catalog
        ...(challengeBlock ? [
            {
                name: "title",
                type: "text",
                label: "Título",
                required: true,
                order_sequence: 1,
                block_id: challengeBlock.id,
            },
            {
                name: "description",
                type: "textarea",
                label: "Descripción",
                required: false,
                order_sequence: 2,
                block_id: challengeBlock.id,
            },
            {
                name: "type",
                type: "select",
                label: "Tipo",
                required: true,
                order_sequence: 3,
                options: JSON.stringify(["individual", "group"]),
                block_id: challengeBlock.id,
            },
            {
                name: "start_date",
                type: "date",
                label: "Fecha de inicio",
                required: true,
                order_sequence: 4,
                block_id: challengeBlock.id,
            },
            {
                name: "end_date",
                type: "date",
                label: "Fecha de fin",
                required: true,
                order_sequence: 5,
                block_id: challengeBlock.id,
            },
            {
                name: "goal_metric",
                type: "select",
                label: "Métrica de objetivo",
                required: true,
                order_sequence: 6,
                options: JSON.stringify(["classes_attended", "streak_days"]),
                block_id: challengeBlock.id,
            },
            {
                name: "goal_value",
                type: "number",
                label: "Valor objetivo",
                required: true,
                order_sequence: 7,
                block_id: challengeBlock.id,
            },
            {
                name: "reward_points",
                type: "number",
                label: "Puntos de recompensa",
                required: true,
                order_sequence: 8,
                block_id: challengeBlock.id,
            },
            {
                name: "is_active",
                type: "boolean",
                label: "Activo",
                required: false,
                order_sequence: 9,
                block_id: challengeBlock.id,
            },
        ] : []),

        // ⭐ Review Details (Teacher Reviews)
        ...(reviewBlock ? [
            {
                name: "teacher_id",
                type: "relation",
                label: "Profesor",
                required: true,
                order_sequence: 1,
                relation_config: JSON.stringify({
                    table: "users", value_field: "users.id",
                    display_field: "CONCAT(users.first_name, ' ', users.last_name)",
                    display_alias: "teacher_name",
                    filters: { role_name: "teacher" }, multiple: false, search: true, limit: 20
                }),
                block_id: reviewBlock.id,
            },
            {
                name: "student_id",
                type: "relation",
                label: "Estudiante",
                required: true,
                order_sequence: 2,
                relation_config: JSON.stringify({
                    table: "users", value_field: "users.id",
                    display_field: "CONCAT(users.first_name, ' ', users.last_name)",
                    display_alias: "student_name",
                    filters: { role_name: "student" }, multiple: false, search: true, limit: 20
                }),
                block_id: reviewBlock.id,
            },
            {
                name: "class_id",
                type: "relation",
                label: "Clase",
                required: false,
                order_sequence: 3,
                relation_config: JSON.stringify({
                    table: "classes", value_field: "classes.id",
                    display_field: "classes.name", display_alias: "class_name",
                    filters: {}, multiple: false, search: true, limit: 20
                }),
                block_id: reviewBlock.id,
            },
            {
                name: "rating",
                type: "number",
                label: "Calificación (1-5)",
                required: true,
                order_sequence: 4,
                block_id: reviewBlock.id,
            },
            {
                name: "comment",
                type: "textarea",
                label: "Comentario",
                required: false,
                order_sequence: 5,
                block_id: reviewBlock.id,
            },
            {
                name: "is_anonymous",
                type: "boolean",
                label: "Anónimo",
                required: false,
                order_sequence: 6,
                block_id: reviewBlock.id,
            },
        ] : []),

        // 📊 Statistics (Student Stats)
        ...(statsBlock ? [
            {
                name: "total_classes_attended",
                type: "number",
                label: "Total clases asistidas",
                required: false,
                order_sequence: 1,
                block_id: statsBlock.id,
            },
            {
                name: "current_streak_days",
                type: "number",
                label: "Racha actual (días)",
                required: false,
                order_sequence: 2,
                block_id: statsBlock.id,
            },
            {
                name: "longest_streak_days",
                type: "number",
                label: "Racha más larga (días)",
                required: false,
                order_sequence: 3,
                block_id: statsBlock.id,
            },
            {
                name: "total_points",
                type: "number",
                label: "Puntos totales",
                required: false,
                order_sequence: 4,
                block_id: statsBlock.id,
            },
            {
                name: "level",
                type: "select",
                label: "Nivel",
                required: false,
                order_sequence: 5,
                options: JSON.stringify(["beginner", "intermediate", "advanced", "expert"]),
                block_id: statsBlock.id,
            },
            {
                name: "last_activity_at",
                type: "date",
                label: "Última actividad",
                required: false,
                order_sequence: 6,
                block_id: statsBlock.id,
            },
        ] : []),
    ];

    return fieldsData;
}

export default { getFieldsData };
