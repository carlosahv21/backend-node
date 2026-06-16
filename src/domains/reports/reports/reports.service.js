import reportsRepository from './reports.repository.js';

class ReportsService {
    async getKpiData(startDate, endDate) {
        return reportsRepository.getKpiData(startDate, endDate);
    }

    async getClassOccupancy(startDate, endDate) {
        return reportsRepository.getClassOccupancy(startDate, endDate);
    }

    async getUserDistribution(startDate, endDate) {
        return reportsRepository.getUserDistribution(startDate, endDate);
    }

    async getAttendanceRate(startDate, endDate) {
        return reportsRepository.getAttendanceRate(startDate, endDate);
    }

    async getTeachersParticipation(startDate, endDate) {
        return reportsRepository.getTeachersParticipation(startDate, endDate);
    }

    async getRetentionChurnAnalysis(startDate, endDate) {
        return reportsRepository.getRetentionChurnAnalysis(startDate, endDate);
    }

    async getRevenueOptimization(startDate, endDate) {
        return reportsRepository.getRevenueOptimization(startDate, endDate);
    }

    async getStudentEngagement(startDate, endDate) {
        return reportsRepository.getStudentEngagement(startDate, endDate);
    }

    async getOperationalEfficiency(startDate, endDate) {
        return reportsRepository.getOperationalEfficiency(startDate, endDate);
    }

    async getAdminAudit(startDate, endDate) {
        return reportsRepository.getAdminAudit(startDate, endDate);
    }

    async getUsersAtRisk() {
        return reportsRepository.getUsersAtRisk();
    }

    async getSidebarData(userId, roleId) {
        return reportsRepository.getSidebarData(userId, roleId);
    }
}

export default new ReportsService();