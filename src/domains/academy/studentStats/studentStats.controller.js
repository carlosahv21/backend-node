import studentStatsService from './studentStats.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class StudentStatsController {
    async getAll(req, res, next) {
        try {
            const result = await studentStatsService.getAllStudentStats(req.query);
            ApiResponse.success(res, 200, "Estadísticas obtenidas correctamente", result);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;
            const stats = await studentStatsService.getStudentStatsById(id);
            ApiResponse.success(res, 200, "Estadística obtenida correctamente", stats);
        } catch (error) {
            next(error);
        }
    }

    async getByStudent(req, res, next) {
        try {
            const { studentId } = req.params;
            const stats = await studentStatsService.getStudentStatsByStudentId(studentId);
            ApiResponse.success(res, 200, "Estadísticas del estudiante obtenidas correctamente", stats);
        } catch (error) {
            next(error);
        }
    }
}

export default new StudentStatsController();