export async function up(knex) {
    const exists = await knex.schema.hasTable("student_stats");

    if (!exists) {
        await knex.schema.createTable("student_stats", (table) => {
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            table.uuid("user_id").notNullable().unique().references("id").inTable("users").onDelete("CASCADE");
            table.integer("total_classes_attended").unsigned().defaultTo(0);
            table.integer("current_streak_days").unsigned().defaultTo(0);
            table.integer("longest_streak_days").unsigned().defaultTo(0);
            table.integer("total_points").unsigned().defaultTo(0);
            table.enu("level", ["beginner", "intermediate", "advanced", "expert"]).defaultTo("beginner");
            table.timestamp("last_activity_at", { useTz: true }).nullable();
            table.timestamp("calculated_at", { useTz: true }).nullable();
            table.uuid("academy_id").notNullable().references("id").inTable("academies").onDelete("CASCADE");
            table.timestamps(true, true);
        });
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists("student_stats");
}
