import BaseModel from './baseModel.js';

class RegistrationModel extends BaseModel {
    constructor() {
        super('class_user');

        this.joins = [
            { table: "classes", alias: "c", on: ["class_user.class_id", "c.id"] },
            { table: "users", alias: "u", on: ["class_user.user_id", "u.id"] }
        ];

        this.selectFields = [
            "class_user.*",
            "c.name as class_name",
            "c.hour as class_hour",
            "c.date as class_date",
            "c.level as class_level",
            "c.genre as class_genre",
            "u.first_name as user_first_name",
            "u.last_name as user_last_name",
        ];

        this.searchFields = ["c.name", "c.hour", "c.date", "u.first_name", "u.last_name"];

        this.filterMapping = {
            'class_id': 'class_user.class_id',
            'user_id': 'class_user.user_id'
        };

        this.orderMapping = {
            'user_first_name': 'u.first_name',
            'user_last_name': 'u.last_name'
        };

        this.relationMaps = {
            'default': {
                joins: this.joins,
                column_map: this.filterMapping,
                order_map: this.orderMapping
            }
        };
    }

    // Check if a class has reached the maximum number of students
    async maxUserPerClass(class_id) {
        const result = await this.knex(this.tableName)
            .where({ class_id: class_id })
            .count("* as count")
            .first();

        const classes = await this.knex("classes")
            .select("classes.capacity")
            .where("classes.id", class_id)
            .first();


        return parseInt(result.count) >= parseInt(classes.capacity);
    }

    // Check if a user registered in max_classes
    async isRegisteredInMaxClasses(userId) {
        const result = await this.knex(this.tableName)
            .where({ user_id: userId })
            .count("* as count")
            .first();

        const plan = await this.knex("users")
            .join("plans", "users.plan_id", "plans.id")
            .where("users.id", userId)
            .select("plans.max_classes")
            .first();

        // Tiene clase
        if (plan.max_classes == 0) {
            return false;
        }

        return parseInt(result.count) >= parseInt(plan.max_classes);
    }

    // Check if a user is already registered in a class
    async isRegistered(userId, classId) {
        const result = await this.knex(this.tableName)
            .where({ user_id: userId, class_id: classId })
            .first();
        const response = {
            isRegistered: !!result,
            name: `${result.first_name} ${result.last_name}`
        }
        return response;
    }

    async isActive(userId) {
        const result = await this.knex("users")
            .where({ id: userId })
            .select("plan_status", "first_name", "last_name")
            .first();
        const response = {
            plan_status: result.plan_status,
            name: `${result.first_name} ${result.last_name}`
        }
        return response;
    }
}

export { RegistrationModel };
export default new RegistrationModel();