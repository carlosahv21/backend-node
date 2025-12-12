import express from 'express';
import ReportsController from '../controllers/reportsController.js';

const router = express.Router();

router.get('/kpi', ReportsController.getKpiData);
router.get('/class-occupancy', ReportsController.getClassOccupancy);
router.get('/user-distribution', ReportsController.getUserDistribution);
router.get('/teachers-participation', ReportsController.getTeachersParticipation);
router.get('/plan-profitability', ReportsController.getPlanProfitability);

export default router;
