export async function up(knex) {
    if (!(await knex.schema.hasTable("achievements"))) {
        await knex.schema.createTable("achievements", (table) => {
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            table.string("name", 255).notNullable();
            table.text("description").nullable();
            table.string("icon_url", 500).nullable();
            table.enu("trigger_type", ["attendance_streak", "classes_count", "milestone"]).notNullable();
            table.integer("trigger_value").unsigned().notNullable();
            table.integer("points").unsigned().defaultTo(0);
            table.uuid("academy_id").notNullable().references("id").inTable("academies").onDelete("CASCADE");
            table.timestamp("deleted_at", { useTz: true }).nullable();
            table.uuid("deleted_by").nullable().references("id").inTable("users").onDelete("SET NULL");
            table.timestamps(true, true);
        });
    }

    if (!(await knex.schema.hasTable("user_achievements"))) {
        await knex.schema.createTable("user_achievements", (table) => {
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
            table.uuid("achievement_id").notNullable().references("id").inTable("achievements").onDelete("CASCADE");
            table.timestamp("unlocked_at", { useTz: true }).defaultTo(knex.fn.now());
            table.boolean("notified").defaultTo(false);
            table.timestamps(true, true);
            table.unique(["user_id", "achievement_id"]);
            table.index(["user_id"]);
            table.index(["achievement_id"]);
        });
    }

    if (!(await knex.schema.hasTable("challenges"))) {
        await knex.schema.createTable("challenges", (table) => {
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            table.string("title", 255).notNullable();
            table.text("description").nullable();
            table.enu("type", ["individual", "group"]).notNullable();
            table.date("start_date").notNullable();
            table.date("end_date").notNullable();
            table.enu("goal_metric", ["classes_attended", "streak_days"]).notNullable();
            table.integer("goal_value").unsigned().notNullable();
            table.integer("reward_points").unsigned().defaultTo(0);
            table.boolean("is_active").defaultTo(true);
            table.uuid("academy_id").notNullable().references("id").inTable("academies").onDelete("CASCADE");
            table.timestamp("deleted_at", { useTz: true }).nullable();
            table.uuid("deleted_by").nullable().references("id").inTable("users").onDelete("SET NULL");
            table.timestamps(true, true);
        });
    }

    if (!(await knex.schema.hasTable("user_challenges"))) {
        await knex.schema.createTable("user_challenges", (table) => {
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
            table.uuid("challenge_id").notNullable().references("id").inTable("challenges").onDelete("CASCADE");
            table.integer("current_progress").unsigned().defaultTo(0);
            table.timestamp("completed_at", { useTz: true }).nullable();
            table.integer("rank_position").unsigned().nullable();
            table.uuid("academy_id").notNullable().references("id").inTable("academies").onDelete("CASCADE");
            table.timestamps(true, true);
            table.unique(["user_id", "challenge_id"]);
            table.index(["user_id"]);
            table.index(["challenge_id"]);
        });
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists("user_challenges");
    await knex.schema.dropTableIfExists("challenges");
    await knex.schema.dropTableIfExists("user_achievements");
    await knex.schema.dropTableIfExists("achievements");
}
