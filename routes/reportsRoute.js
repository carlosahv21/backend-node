import express from "express";
import ReportsController from "../controllers/reportsController.js";

const router = express.Router();

router.get("/kpi", ReportsController.getKpiData);
router.get("/class-occupancy", ReportsController.getClassOccupancy);
router.get("/user-distribution", ReportsController.getUserDistribution);
router.get("/teachers-participation", ReportsController.getTeachersParticipation);
router.get("/attendance-rate", ReportsController.getAttendanceRate);

router.get("/retention-churn", ReportsController.getRetentionChurnAnalysis);
router.get("/revenue-optimization", ReportsController.getRevenueOptimization);
router.get("/student-engagement", ReportsController.getStudentEngagement);
router.get("/operational-efficiency", ReportsController.getOperationalEfficiency);
router.get("/admin-audit", ReportsController.getAdminAudit);

export default router;
