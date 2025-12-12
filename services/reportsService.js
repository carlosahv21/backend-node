import ReportsModel from '../models/reportsModel.js';

const getKpiData = async () => {
    return ReportsModel.getKpiData();
}

const getClassOccupancy = async () => {
    return ReportsModel.getClassOccupancy();
}

const getUserDistribution = async () => {
    return ReportsModel.getUserDistribution();
}

const getTeachersParticipation = async () => {
    return ReportsModel.getTeachersParticipation();
}

const getAttendanceRate = async () => {
    return ReportsModel.getAttendanceRate();
}

const getPlanProfitability = async () => {
    return ReportsModel.getPlanProfitability();
}


export default {
    getAttendanceRate,
    getClassOccupancy,
    getTeachersParticipation,
    getUserDistribution,
    getKpiData,
    getPlanProfitability
};
