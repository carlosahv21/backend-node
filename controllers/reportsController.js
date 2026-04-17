import ReportsService from "../services/reportsService.js";
import ApiResponse from "../utils/apiResponse.js";

class reportsController {
    async getKpiData(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await ReportsService.getKpiData(start_date, end_date);
            ApiResponse.success(
                res,
                200,
                "KPI data retrieved successfully",
                data
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getClassOccupancy(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await ReportsService.getClassOccupancy(start_date, end_date);
            ApiResponse.success(
                res,
                200,
                "Class occupancy retrieved successfully",
                data
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getUserDistribution(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await ReportsService.getUserDistribution(start_date, end_date);
            ApiResponse.success(
                res,
                200,
                "User distribution retrieved successfully",
                data
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getAttendanceRate(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await ReportsService.getAttendanceRate(start_date, end_date);
            ApiResponse.success(
                res,
                200,
                "Attendance rate retrieved successfully",
                data
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getTeachersParticipation(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await ReportsService.getTeachersParticipation(start_date, end_date);
            ApiResponse.success(
                res,
                200,
                "Teachers participation retrieved successfully",
                data
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    // New BI Reports

    async getRetentionChurnAnalysis(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await ReportsService.getRetentionChurnAnalysis(start_date, end_date);
            ApiResponse.success(
                res,
                200,
                "Retention and churn analysis retrieved successfully",
                data
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getRevenueOptimization(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await ReportsService.getRevenueOptimization(start_date, end_date);
            ApiResponse.success(
                res,
                200,
                "Revenue optimization data retrieved successfully",
                data
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getStudentEngagement(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await ReportsService.getStudentEngagement(start_date, end_date);
            ApiResponse.success(
                res,
                200,
                "Student engagement data retrieved successfully",
                data
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getOperationalEfficiency(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await ReportsService.getOperationalEfficiency(start_date, end_date);
            ApiResponse.success(
                res,
                200,
                "Operational efficiency data retrieved successfully",
                data
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getAdminAudit(req, res, next) {
        try {
            const { start_date, end_date } = req.query;
            const data = await ReportsService.getAdminAudit(start_date, end_date);
            ApiResponse.success(
                res,
                200,
                "Admin audit data retrieved successfully",
                data
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getUsersAtRisk(req, res, next) {
        try {
            const data = await ReportsService.getUsersAtRisk();
            ApiResponse.success(
                res,
                200,
                "Users at risk data retrieved successfully",
                data
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }

    async getDashboardSidebar(req, res, next) {
        try {
            const { id: userId, role_id: roleId } = req.user;
            const data = await ReportsService.getSidebarData(userId, roleId);

            ApiResponse.success(
                res,
                200,
                "Dashboard sidebar data retrieved successfully",
                data
            );
        } catch (error) {
            const status = error.statusCode || 500;
            ApiResponse.error(res, status, error.message);
        }
    }
}

export default new reportsController();
