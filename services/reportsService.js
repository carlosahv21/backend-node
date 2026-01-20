import ReportsModel from "../models/reportsModel.js";

class ReportsService {
    /**
     * Obtiene los datos de KPI.
     */
    async getKpiData() {
        return ReportsModel.getKpiData();
    }

    /**
     * Obtiene la ocupación de clases.
     */
    async getClassOccupancy() {
        return ReportsModel.getClassOccupancy();
    }

    /**
     * Obtiene la distribución de usuarios.
     */
    async getUserDistribution() {
        return ReportsModel.getUserDistribution();
    }

    /**
     * Obtiene la participación de los profesores.
     */
    async getTeachersParticipation() {
        return ReportsModel.getTeachersParticipation();
    }

    /**
     * Obtiene la tasa de asistencia.
     */
    async getAttendanceRate() {
        return ReportsModel.getAttendanceRate();
    }

    /**
     * Obtiene el análisis de retención y abandono.
     */
    async getRetentionChurnAnalysis() {
        return ReportsModel.getRetentionChurnAnalysis();
    }

    /**
     * Obtiene la optimización de ingresos.
     */
    async getRevenueOptimization() {
        return ReportsModel.getRevenueOptimization();
    }

    /**
     * Obtiene el compromiso del estudiante.
     */
    async getStudentEngagement() {
        return ReportsModel.getStudentEngagement();
    }

    /**
     * Obtiene la eficiencia operativa.
     */
    async getOperationalEfficiency() {
        return ReportsModel.getOperationalEfficiency();
    }

    /**
     * Obtiene la auditoría administrativa.
     */
    async getAdminAudit() {
        return ReportsModel.getAdminAudit();
    }
}

export default new ReportsService();

