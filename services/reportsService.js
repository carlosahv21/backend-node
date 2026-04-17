import ReportsModel from "../models/reportsModel.js";

class ReportsService {
    /**
     * Obtiene los datos de KPI.
     */
    async getKpiData(startDate, endDate) {
        return ReportsModel.getKpiData(startDate, endDate);
    }

    /**
     * Obtiene la ocupación de clases.
     */
    async getClassOccupancy(startDate, endDate) {
        return ReportsModel.getClassOccupancy(startDate, endDate);
    }

    /**
     * Obtiene la distribución de usuarios.
     */
    async getUserDistribution(startDate, endDate) {
        return ReportsModel.getUserDistribution(startDate, endDate);
    }

    /**
     * Obtiene la participación de los profesores.
     */
    async getTeachersParticipation(startDate, endDate) {
        return ReportsModel.getTeachersParticipation(startDate, endDate);
    }

    /**
     * Obtiene la tasa de asistencia.
     */
    async getAttendanceRate(startDate, endDate) {
        return ReportsModel.getAttendanceRate(startDate, endDate);
    }

    /**
     * Obtiene el análisis de retención y abandono.
     */
    async getRetentionChurnAnalysis(startDate, endDate) {
        return ReportsModel.getRetentionChurnAnalysis(startDate, endDate);
    }

    /**
     * Obtiene la optimización de ingresos.
     */
    async getRevenueOptimization(startDate, endDate) {
        return ReportsModel.getRevenueOptimization(startDate, endDate);
    }

    /**
     * Obtiene el compromiso del estudiante.
     */
    async getStudentEngagement(startDate, endDate) {
        return ReportsModel.getStudentEngagement(startDate, endDate);
    }

    /**
     * Obtiene la eficiencia operativa.
     */
    async getOperationalEfficiency(startDate, endDate) {
        return ReportsModel.getOperationalEfficiency(startDate, endDate);
    }

    /**
     * Obtiene la auditoría administrativa.
     */
    async getAdminAudit(startDate, endDate) {
        return ReportsModel.getAdminAudit(startDate, endDate);
    }

    /**
     * Obtiene los usuarios en riesgo.
     */
    async getUsersAtRisk() {
        return ReportsModel.getUsersAtRisk();
    }

    /**
     * Obtiene los datos para el sidebar del dashboard.
     */
    async getSidebarData(userId, roleId) {
        return ReportsModel.getSidebarData(userId, roleId);
    }
}

export default new ReportsService();

