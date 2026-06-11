export async function up(knex) {
    const exists = await knex.schema.hasTable("teacher_reviews");

    if (!exists) {
        await knex.schema.createTable("teacher_reviews", (table) => {
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            table.uuid("teacher_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
            table.uuid("student_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
            table.uuid("class_id").nullable().references("id").inTable("classes").onDelete("SET NULL");
            table.integer("rating").unsigned().notNullable();
            table.text("comment").nullable();
            table.boolean("is_anonymous").defaultTo(false);
            table.timestamp("deleted_at", { useTz: true }).nullable();
            table.uuid("deleted_by").nullable().references("id").inTable("users").onDelete("SET NULL");
            table.uuid("academy_id").notNullable().references("id").inTable("academies").onDelete("CASCADE");
            table.timestamps(true, true);
            table.index(["teacher_id"]);
            table.index(["student_id"]);
        });

        await knex.raw(
            'ALTER TABLE teacher_reviews ADD CONSTRAINT chk_teacher_reviews_rating CHECK (rating >= 1 AND rating <= 5)'
        );
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists("teacher_reviews");
}
