import reportsService from './reports.service.js';
import ApiResponse from "../../../shared/utils/apiResponse.js";

class ReportsController {
    async getKpiData(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await reportsService.getKpiData(start_date, end_date);
            ApiResponse.success(res, 200, "KPI data retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getClassOccupancy(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await reportsService.getClassOccupancy(start_date, end_date);
            ApiResponse.success(res, 200, "Class occupancy retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getUserDistribution(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await reportsService.getUserDistribution(start_date, end_date);
            ApiResponse.success(res, 200, "User distribution retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getAttendanceRate(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await reportsService.getAttendanceRate(start_date, end_date);
            ApiResponse.success(res, 200, "Attendance rate retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getTeachersParticipation(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await reportsService.getTeachersParticipation(start_date, end_date);
            ApiResponse.success(res, 200, "Teachers participation retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getRetentionChurnAnalysis(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await reportsService.getRetentionChurnAnalysis(start_date, end_date);
            ApiResponse.success(res, 200, "Retention and churn analysis retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getRevenueOptimization(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await reportsService.getRevenueOptimization(start_date, end_date);
            ApiResponse.success(res, 200, "Revenue optimization data retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getStudentEngagement(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await reportsService.getStudentEngagement(start_date, end_date);
            ApiResponse.success(res, 200, "Student engagement data retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getOperationalEfficiency(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await reportsService.getOperationalEfficiency(start_date, end_date);
            ApiResponse.success(res, 200, "Operational efficiency data retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getAdminAudit(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await reportsService.getAdminAudit(start_date, end_date);
            ApiResponse.success(res, 200, "Admin audit data retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getUsersAtRisk(req, res, next) {
        try {
            const data = await reportsService.getUsersAtRisk();
            ApiResponse.success(res, 200, "Users at risk data retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getDashboardSidebar(req, res, next) {
        try {
            const { id: userId, role_id: roleId } = req.user;
            const data = await reportsService.getSidebarData(userId, roleId);
            ApiResponse.success(res, 200, "Dashboard sidebar data retrieved successfully", data);
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new ReportsController();