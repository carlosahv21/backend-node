import BaseModel from "../../../shared/models/baseModel.js";

class RegistrationRepository extends BaseModel {
    constructor() {
        super('user_class');
        this.softDelete = false;

        this.joins = [
            { table: "classes", alias: "c", on: ["user_class.class_id", "c.id"] },
            { table: "users", alias: "u", on: ["user_class.user_id", "u.id"] },
        ];

        this.selectFields = [
            "user_class.*", "c.name as class_name", "c.hour as class_hour", "c.date as class_date",
            "c.level as class_level", "c.genre as class_genre", "u.first_name as user_first_name", "u.last_name as user_last_name",
        ];

        this.searchFields = ["c.name", "c.hour", "c.date", "u.first_name", "u.last_name"];
        this.filterMapping = {
            'class_id': 'user_class.class_id',
            'user_id': 'user_class.user_id',
            'payment_date': 'c.date'
        };
    }

    async findGroupedByStudent(queryParams = {}) {
        const { page = 1, limit = 10, ...filters } = queryParams;
        const offset = (page - 1) * limit;

        const baseQuery = this._buildQuery({ ...filters, isCount: false });

        const studentPage = await baseQuery.clone().clearSelect().distinct("user_class.user_id", "u.first_name", "u.last_name", "user_class.academy_id").orderBy("u.first_name", "asc").limit(limit).offset(offset);

        const countResult = await baseQuery.clone().clearSelect().countDistinct("user_class.user_id as count").first();
        const totalStudents = parseInt(countResult?.count || 0);

        if (studentPage.length === 0) {
            return { data: [], pagination: { total_students: 0, page: parseInt(page), limit: parseInt(limit) } };
        }

        const studentIds = studentPage.map((s) => s.user_id);

        const allRegistrations = await this._buildQuery({ ...filters, isCount: false }).clearSelect().whereIn("user_class.user_id", studentIds).select("user_class.id as registration_id", "user_class.user_id", "user_class.class_id", "user_class.academy_id", "u.first_name as user_first_name", "u.last_name as user_last_name", "c.name as class_name", "c.hour as class_hour", "c.date as class_date", "c.level as class_level", "c.genre as class_genre");

        const studentMap = new Map();
        for (const row of allRegistrations) {
            if (!studentMap.has(row.user_id)) {
                studentMap.set(row.user_id, { user_id: row.user_id, first_name: row.user_first_name, last_name: row.user_last_name, academy_id: row.academy_id, classes: [] });
            }
            studentMap.get(row.user_id).classes.push({ registration_id: row.registration_id, class_id: row.class_id, name: row.class_name, hour: row.class_hour, date: row.class_date, level: row.class_level, genre: row.class_genre });
        }

        const data = studentIds.map((id) => studentMap.get(id)).filter(Boolean);

        return { data, pagination: { total_students: totalStudents, page: parseInt(page), limit: parseInt(limit) } };
    }

    async havePlan(userId) {
        const result = await this._applyTenantFilter(this.knex("user_plan"), "user_plan").join("users", "user_plan.user_id", "users.id").where({ "users.id": userId }).select("user_plan.plan_id").first();
        return !!result;
    }

    async maxUserPerClass(class_id) {
        const result = await this._applyTenantFilter(this.knex(this.tableName)).where({ class_id: class_id }).count("* as count").first();
        const classes = await this._applyTenantFilter(this.knex("classes"), "classes").select("classes.capacity").where("classes.id", class_id).first();
        return parseInt(result.count) >= parseInt(classes.capacity);
    }

    async isRegisteredInMaxClasses(userId) {
        const result = await this._applyTenantFilter(this.knex(this.tableName)).where({ user_id: userId }).count("* as count").first();
        const plan = await this._applyTenantFilter(this.knex("users"), "users").join("user_plan", "users.id", "user_plan.user_id").join("plans", "user_plan.plan_id", "plans.id").where("users.id", userId).first();
        if (plan.max_classes == 0) return false;
        return parseInt(result.count) >= parseInt(plan.max_classes);
    }

    async isRegistered(userId, classId) {
        const result = await this._applyTenantFilter(this.knex(this.tableName)).where({ user_id: userId, class_id: classId }).first();
        return !!result;
    }

    async isActive(userId) {
        const result = await this._applyTenantFilter(this.knex("users"), "users").where({ id: userId }).select("plan_status", "first_name", "last_name").first();
        return { plan_status: result.plan_status, name: `${result.first_name} ${result.last_name}` };
    }
}

export default new RegistrationRepository();