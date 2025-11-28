// models/registrationModel.js
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

        this.relationMaps = {
            'default': {
                joins: this.joins,
                column_map: this.filterMapping
            }
        };
    }

    async findAllClassesByStudentId(studentId, queryParams = {}) {
        const { page = 1, limit = 10, ...filters } = queryParams;

        const queryBase = this._buildQuery(filters);

        const results = await queryBase.clone().limit(limit).offset((page - 1) * limit);

        const totalQueryBase = this._buildQuery({ ...filters, isCount: true });

        const totalRes = await totalQueryBase.count("* as count").first();

        return {
            data: results,
            total: parseInt(totalRes.count),
            page: parseInt(page),
            limit: parseInt(limit)
        };
    }

    // Check if a user is already registered in a class
    async isRegistered(userId, classId) {
        const result = await this.knex(this.tableName)
            .where({ user_id: userId, class_id: classId })
            .first();
        return !!result;
    }
}

export { RegistrationModel };
export default new RegistrationModel();
