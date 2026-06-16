import studentStatsRepository from './studentStats.repository.js';

class StudentStatsService {
    async getAllStudentStats(queryParams) {
        return studentStatsRepository.findAll(queryParams);
    }

    async getStudentStatsById(id) {
        return studentStatsRepository.findById(id);
    }

    async getStudentStatsByStudentId(studentId) {
        return studentStatsRepository.findByStudentId(studentId);
    }
}

export default new StudentStatsService();