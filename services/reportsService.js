import ReportsModel from "../models/reportsModel.js";

const getKpiData = async () => {
    return ReportsModel.getKpiData();
};

const getClassOccupancy = async () => {
    return ReportsModel.getClassOccupancy();
};

const getUserDistribution = async () => {
    return ReportsModel.getUserDistribution();
};

const getTeachersParticipation = async () => {
    return ReportsModel.getTeachersParticipation();
};

const getAttendanceRate = async () => {
    return ReportsModel.getAttendanceRate();
};

const getRetentionChurnAnalysis = async () => {
    return ReportsModel.getRetentionChurnAnalysis();
};

const getRevenueOptimization = async () => {
    return ReportsModel.getRevenueOptimization();
};

const getStudentEngagement = async () => {
    return ReportsModel.getStudentEngagement();
};

const getOperationalEfficiency = async () => {
    return ReportsModel.getOperationalEfficiency();
};

const getAdminAudit = async () => {
    return ReportsModel.getAdminAudit();
};

export default {
    getAttendanceRate,
    getClassOccupancy,
    getTeachersParticipation,
    getUserDistribution,
    getKpiData,
    getRetentionChurnAnalysis,
    getRevenueOptimization,
    getStudentEngagement,
    getOperationalEfficiency,
    getAdminAudit,
};
