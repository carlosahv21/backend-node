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

    /**
     * Obtiene todas las clases inscritas por un estudiante específico, con paginación y filtros.
     */
    async findAllClassesByStudentId(studentId, queryParams = {}) {
        const { page = 1, limit = 10, ...filters } = queryParams;

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        let queryBase = this._buildQuery(filters);

        queryBase = queryBase.where('class_user.user_id', studentId);

        let totalQueryBase = this._buildQuery({ ...filters, isCount: true });

        totalQueryBase = totalQueryBase.where('class_user.user_id', studentId);

        const totalRes = await totalQueryBase.count("* as count").first();
        const totalCount = parseInt(totalRes.count || 0);

        const results = await queryBase
            .clone()
            .limit(parsedLimit)
            .offset((parsedPage - 1) * parsedLimit);

        return {
            data: results,
            total: totalCount,
            page: parsedPage,
            limit: parsedLimit
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