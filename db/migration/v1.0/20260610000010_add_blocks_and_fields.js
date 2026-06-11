export async function up(knex) {
    const academy = await knex('academies').first();
    if (!academy) throw new Error('No academy found');
    const academyId = academy.id;

    // ==================== BLOQUES NUEVOS ====================

    const newBlocks = [];

    const classModule = await knex('modules').where('name', 'classes').first();
    if (classModule) {
        const exists = await knex('blocks')
            .where({ module_id: classModule.id, name: 'Physical Well-being' }).first();
        if (!exists) {
            newBlocks.push({
                module_id: classModule.id, name: 'Physical Well-being',
                description: 'Información de bienestar físico y actividad',
                order: 4, collapsible: true, display_mode: 'edit', academy_id: academyId,
            });
        }
    }

    const usersModule = await knex('modules').where('name', 'users').first();
    if (usersModule) {
        const exists = await knex('blocks')
            .where({ module_id: usersModule.id, name: 'Preferences' }).first();
        if (!exists) {
            newBlocks.push({
                module_id: usersModule.id, name: 'Preferences',
                description: 'Preferencias del usuario',
                order: 2, collapsible: true, display_mode: 'edit', academy_id: academyId,
            });
        }
    }

    const achievementsModule = await knex('modules').where('name', 'achievements').first();
    if (achievementsModule) {
        const exists = await knex('blocks')
            .where({ module_id: achievementsModule.id, name: 'Achievement Catalog' }).first();
        if (!exists) {
            newBlocks.push({
                module_id: achievementsModule.id, name: 'Achievement Catalog',
                description: 'Definición del logro',
                order: 1, collapsible: false, display_mode: 'edit', academy_id: academyId,
            });
        }
    }

    const challengesModule = await knex('modules').where('name', 'challenges').first();
    if (challengesModule) {
        const exists = await knex('blocks')
            .where({ module_id: challengesModule.id, name: 'Challenge Catalog' }).first();
        if (!exists) {
            newBlocks.push({
                module_id: challengesModule.id, name: 'Challenge Catalog',
                description: 'Definición del reto',
                order: 1, collapsible: false, display_mode: 'edit', academy_id: academyId,
            });
        }
    }

    const teacherReviewsModule = await knex('modules').where('name', 'teacher_reviews').first();
    if (teacherReviewsModule) {
        const exists = await knex('blocks')
            .where({ module_id: teacherReviewsModule.id, name: 'Review Details' }).first();
        if (!exists) {
            newBlocks.push({
                module_id: teacherReviewsModule.id, name: 'Review Details',
                description: 'Detalles de la reseña',
                order: 1, collapsible: false, display_mode: 'edit', academy_id: academyId,
            });
        }
    }

    const studentStatsModule = await knex('modules').where('name', 'student_stats').first();
    if (studentStatsModule) {
        const exists = await knex('blocks')
            .where({ module_id: studentStatsModule.id, name: 'Statistics' }).first();
        if (!exists) {
            newBlocks.push({
                module_id: studentStatsModule.id, name: 'Statistics',
                description: 'Métricas de progreso del alumno',
                order: 1, collapsible: false, display_mode: 'readonly', academy_id: academyId,
            });
        }
    }

    if (newBlocks.length) await knex('blocks').insert(newBlocks);

    // ==================== CAMPOS NUEVOS ====================

    const insertField = async (blockId, field) => {
        const exists = await knex('fields').where({ block_id: blockId, name: field.name }).first();
        if (!exists) {
            await knex('fields').insert({ ...field, block_id: blockId, academy_id: academyId });
        }
    };

    const getBlockId = async (blockName, moduleName) => {
        const row = await knex('blocks')
            .join('modules', 'blocks.module_id', 'modules.id')
            .where({ 'blocks.name': blockName, 'modules.name': moduleName })
            .select('blocks.id').first();
        return row?.id;
    };

    // Clases: Physical Well-being
    const wellBeingBlockId = await getBlockId('Physical Well-being', 'classes');
    if (wellBeingBlockId) {
        await insertField(wellBeingBlockId, { name: 'calories_estimate', type: 'number', label: 'Calorías estimadas (kcal)', required: false, order_sequence: 1 });
        await insertField(wellBeingBlockId, { name: 'intensity_level', type: 'select', label: 'Nivel de intensidad', required: false, order_sequence: 2, options: JSON.stringify(['low', 'medium', 'high']) });
    }

    // Clases: Schedule extras
    const scheduleBlockId = await getBlockId('Schedule', 'classes');
    if (scheduleBlockId) {
        await insertField(scheduleBlockId, { name: 'is_recurring', type: 'boolean', label: 'Clase recurrente', required: false, order_sequence: 4 });
        await insertField(scheduleBlockId, { name: 'recurrence_rule', type: 'text', label: 'Regla de recurrencia (RRULE)', required: false, order_sequence: 5 });
    }

    // Users: Preferences
    const prefsBlockId = await getBlockId('Preferences', 'users');
    if (prefsBlockId) {
        await insertField(prefsBlockId, { name: 'push_notifications', type: 'boolean', label: 'Notificaciones push', required: false, order_sequence: 1 });
    }

    // Achievements
    const achieveBlockId = await getBlockId('Achievement Catalog', 'achievements');
    if (achieveBlockId) {
        await insertField(achieveBlockId, { name: 'name', type: 'text', label: 'Nombre', required: true, order_sequence: 1 });
        await insertField(achieveBlockId, { name: 'description', type: 'textarea', label: 'Descripción', required: false, order_sequence: 2 });
        await insertField(achieveBlockId, { name: 'icon_url', type: 'text', label: 'Ícono (URL)', required: false, order_sequence: 3 });
        await insertField(achieveBlockId, { name: 'trigger_type', type: 'select', label: 'Tipo de activación', required: true, order_sequence: 4, options: JSON.stringify(['attendance_streak', 'classes_count', 'milestone']) });
        await insertField(achieveBlockId, { name: 'trigger_value', type: 'number', label: 'Valor requerido', required: true, order_sequence: 5 });
        await insertField(achieveBlockId, { name: 'points', type: 'number', label: 'Puntos', required: true, order_sequence: 6 });
    }

    // Challenges
    const challengeBlockId = await getBlockId('Challenge Catalog', 'challenges');
    if (challengeBlockId) {
        await insertField(challengeBlockId, { name: 'title', type: 'text', label: 'Título', required: true, order_sequence: 1 });
        await insertField(challengeBlockId, { name: 'description', type: 'textarea', label: 'Descripción', required: false, order_sequence: 2 });
        await insertField(challengeBlockId, { name: 'type', type: 'select', label: 'Tipo', required: true, order_sequence: 3, options: JSON.stringify(['individual', 'group']) });
        await insertField(challengeBlockId, { name: 'start_date', type: 'date', label: 'Fecha de inicio', required: true, order_sequence: 4 });
        await insertField(challengeBlockId, { name: 'end_date', type: 'date', label: 'Fecha de fin', required: true, order_sequence: 5 });
        await insertField(challengeBlockId, { name: 'goal_metric', type: 'select', label: 'Métrica de objetivo', required: true, order_sequence: 6, options: JSON.stringify(['classes_attended', 'streak_days']) });
        await insertField(challengeBlockId, { name: 'goal_value', type: 'number', label: 'Valor objetivo', required: true, order_sequence: 7 });
        await insertField(challengeBlockId, { name: 'reward_points', type: 'number', label: 'Puntos de recompensa', required: true, order_sequence: 8 });
        await insertField(challengeBlockId, { name: 'is_active', type: 'boolean', label: 'Activo', required: false, order_sequence: 9 });
    }

    // Teacher Reviews
    const reviewBlockId = await getBlockId('Review Details', 'teacher_reviews');
    if (reviewBlockId) {
        await insertField(reviewBlockId, {
            name: 'teacher_id', type: 'relation', label: 'Profesor', required: true, order_sequence: 1,
            relation_config: JSON.stringify({ table: 'users', value_field: 'users.id', display_field: "CONCAT(users.first_name, ' ', users.last_name)", display_alias: 'teacher_name', filters: { role_name: 'teacher' }, multiple: false, search: true, limit: 20 })
        });
        await insertField(reviewBlockId, {
            name: 'student_id', type: 'relation', label: 'Estudiante', required: true, order_sequence: 2,
            relation_config: JSON.stringify({ table: 'users', value_field: 'users.id', display_field: "CONCAT(users.first_name, ' ', users.last_name)", display_alias: 'student_name', filters: { role_name: 'student' }, multiple: false, search: true, limit: 20 })
        });
        await insertField(reviewBlockId, {
            name: 'class_id', type: 'relation', label: 'Clase', required: false, order_sequence: 3,
            relation_config: JSON.stringify({ table: 'classes', value_field: 'classes.id', display_field: 'classes.name', display_alias: 'class_name', filters: {}, multiple: false, search: true, limit: 20 })
        });
        await insertField(reviewBlockId, { name: 'rating', type: 'number', label: 'Calificación (1-5)', required: true, order_sequence: 4 });
        await insertField(reviewBlockId, { name: 'comment', type: 'textarea', label: 'Comentario', required: false, order_sequence: 5 });
        await insertField(reviewBlockId, { name: 'is_anonymous', type: 'boolean', label: 'Anónimo', required: false, order_sequence: 6 });
    }

    // Student Stats
    const statsBlockId = await getBlockId('Statistics', 'student_stats');
    if (statsBlockId) {
        await insertField(statsBlockId, { name: 'total_classes_attended', type: 'number', label: 'Total clases asistidas', required: false, order_sequence: 1 });
        await insertField(statsBlockId, { name: 'current_streak_days', type: 'number', label: 'Racha actual (días)', required: false, order_sequence: 2 });
        await insertField(statsBlockId, { name: 'longest_streak_days', type: 'number', label: 'Racha más larga (días)', required: false, order_sequence: 3 });
        await insertField(statsBlockId, { name: 'total_points', type: 'number', label: 'Puntos totales', required: false, order_sequence: 4 });
        await insertField(statsBlockId, { name: 'level', type: 'select', label: 'Nivel', required: false, order_sequence: 5, options: JSON.stringify(['beginner', 'intermediate', 'advanced', 'expert']) });
        await insertField(statsBlockId, { name: 'last_activity_at', type: 'date', label: 'Última actividad', required: false, order_sequence: 6 });
    }
}

export async function down(knex) {
    const blocksToDelete = await knex('blocks')
        .join('modules', 'blocks.module_id', 'modules.id')
        .whereIn('modules.name', ['student_stats', 'teacher_reviews', 'achievements', 'challenges'])
        .select('blocks.id');

    if (blocksToDelete.length) {
        await knex('fields').whereIn('block_id', blocksToDelete.map(b => b.id)).del();
        await knex('blocks').whereIn('id', blocksToDelete.map(b => b.id)).del();
    }

    await knex('modules').whereIn('name', [
        'student_stats', 'teacher_reviews', 'achievements', 'challenges', 'user_connections'
    ]).del();
}
