import studentStatsService from '../services/studentStatsService.js';
import ApiResponse from '../utils/apiResponse.js';

class StudentStatsController {
    async getAll(req, res) {
        try {
            const result = await studentStatsService.getAllStats(req.query);
            ApiResponse.success(res, 200, 'Estadísticas obtenidas correctamente', result);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const stats = await studentStatsService.getStatsById(id);
            ApiResponse.success(res, 200, 'Estadísticas obtenidas correctamente', stats);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getByStudent(req, res) {
        try {
            const { studentId } = req.params;
            const stats = await studentStatsService.getStatsByStudent(studentId);
            ApiResponse.success(res, 200, 'Estadísticas obtenidas correctamente', stats);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new StudentStatsController();
