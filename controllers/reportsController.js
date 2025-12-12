import { log } from 'console';
import ReportsService from '../services/reportsService.js';

class ReportsController {

    async getKpiData(req, res, next) {
        try {
            const data = await ReportsService.getKpiData();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async getClassOccupancy(req, res, next) {
        try {
            const data = await ReportsService.getClassOccupancy();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async getUserDistribution(req, res, next) {
        try {
            const data = await ReportsService.getUserDistribution();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async getAttendanceRate(req, res, next) {
        try {
            const data = await ReportsService.getAttendanceRate();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async getTeachersParticipation(req, res, next) {
        try {
            const data = await ReportsService.getTeachersParticipation();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    async getPlanProfitability(req, res, next) {
        try {
            const data = await ReportsService.getPlanProfitability();
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

}

export default new ReportsController();
