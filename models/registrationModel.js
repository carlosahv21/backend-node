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
            "u.first_name as user_first_name",
            "u.last_name as user_last_name",
            "u.email as user_email"
        ];

        this.searchFields = ["c.name", "u.first_name", "u.last_name", "u.email"];

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
