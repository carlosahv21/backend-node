import studentStatsModel from '../models/studentStatsModel.js';

class StudentStatsService {
    async getAllStats(queryParams) {
        return studentStatsModel.findAll(queryParams);
    }

    async getStatsById(id) {
        return studentStatsModel.findById(id);
    }

    async getStatsByStudent(studentId) {
        const db = studentStatsModel.knex;
        const stats = await db('student_stats')
            .where('student_id', studentId)
            .whereNull('deleted_at')
            .first();
        return stats;
    }
}

export default new StudentStatsService();
