import ReportsService from '../services/reportsService.js';
import ApiResponse from '../utils/apiResponse.js';

class ReportsController {

    async getKpiData(req, res, next) {
        try {
            const data = await ReportsService.getKpiData();
            ApiResponse.success(res, 200, "KPI data retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getClassOccupancy(req, res, next) {
        try {
            const data = await ReportsService.getClassOccupancy();
            ApiResponse.success(res, 200, "Class occupancy retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getUserDistribution(req, res, next) {
        try {
            const data = await ReportsService.getUserDistribution();
            ApiResponse.success(res, 200, "User distribution retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getAttendanceRate(req, res, next) {
        try {
            const data = await ReportsService.getAttendanceRate();
            ApiResponse.success(res, 200, "Attendance rate retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getTeachersParticipation(req, res, next) {
        try {
            const data = await ReportsService.getTeachersParticipation();
            ApiResponse.success(res, 200, "Teachers participation retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

}

export default new ReportsController();
