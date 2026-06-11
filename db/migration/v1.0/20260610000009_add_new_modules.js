export async function up(knex) {
    const studentsModule = await knex('modules').where('name', 'students').first();

    const newModules = [
        { name: 'student_stats', description: 'Estadísticas de progreso del estudiante', has_custom_fields: true, has_recycle_bin: false, parent_module_id: studentsModule?.id },
        { name: 'teacher_reviews', description: 'Calificaciones y reseñas de profesores', has_custom_fields: true, has_recycle_bin: true, parent_module_id: studentsModule?.id },
        { name: 'achievements', description: 'Logros y recompensas', has_custom_fields: true, has_recycle_bin: false },
        { name: 'challenges', description: 'Retos y clasificaciones', has_custom_fields: true, has_recycle_bin: false },
        { name: 'user_connections', description: 'Conexiones entre alumnos', has_custom_fields: false, has_recycle_bin: false },
    ];

    for (const mod of newModules) {
        const exists = await knex('modules').where('name', mod.name).first();
        if (!exists) {
            await knex('modules').insert(mod);
        }
    }
}

export async function down(knex) {
    await knex('modules').whereIn('name', [
        'student_stats', 'teacher_reviews', 'achievements', 'challenges', 'user_connections'
    ]).del();
}
