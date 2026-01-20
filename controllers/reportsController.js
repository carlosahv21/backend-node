import ReportsService from "../services/reportsService.js";
import ApiResponse from "../utils/apiResponse.js";

class reportsController {
    async getKpiData(req, res, next) {
        try {
            const data = await ReportsService.getKpiData();
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
            const data = await ReportsService.getClassOccupancy();
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
            const data = await ReportsService.getUserDistribution();
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
            const data = await ReportsService.getAttendanceRate();
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
            const data = await ReportsService.getTeachersParticipation();
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
            const data = await ReportsService.getRetentionChurnAnalysis();
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
            const data = await ReportsService.getRevenueOptimization();
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
            const data = await ReportsService.getStudentEngagement();
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
            const data = await ReportsService.getOperationalEfficiency();
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
            const data = await ReportsService.getAdminAudit();
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
}

export default new reportsController();
