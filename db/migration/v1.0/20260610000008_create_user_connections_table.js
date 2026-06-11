export async function up(knex) {
    const exists = await knex.schema.hasTable("user_connections");

    if (!exists) {
        await knex.schema.createTable("user_connections", (table) => {
            table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
            table.uuid("requester_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
            table.uuid("receiver_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
            table.enu("status", ["pending", "accepted", "blocked"]).defaultTo("pending");
            table.uuid("academy_id").notNullable().references("id").inTable("academies").onDelete("CASCADE");
            table.timestamps(true, true);
            table.unique(["requester_id", "receiver_id"]);
            table.index(["requester_id"]);
            table.index(["receiver_id"]);
            table.index(["status"]);
        });
    }
}

export async function down(knex) {
    await knex.schema.dropTableIfExists("user_connections");
}
