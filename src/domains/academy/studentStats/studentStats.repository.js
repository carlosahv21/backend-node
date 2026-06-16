import BaseModel from "../../../shared/models/baseModel.js";

class StudentStatsRepository extends BaseModel {
    constructor() {
        super('student_stats');
        this.selectFields = ['student_stats.*', 'u.first_name', 'u.last_name', 'u.avatar'];
        this.searchFields = ['u.first_name', 'u.last_name'];
        this.joins = [{ table: 'users', alias: 'u', on: ['student_stats.student_id', 'u.id'] }];
        this.filterMapping = { student_id: 'student_stats.student_id' };
    }

    async findByStudentId(studentId) {
        return this.knex(this.tableName).where({ student_id: studentId }).first();
    }
}

export default new StudentStatsRepository();