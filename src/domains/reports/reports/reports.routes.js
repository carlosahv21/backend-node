import { Router } from "express";
import reportsController from "./reports.controller.js";
import authMiddleware from "../../../shared/middlewares/authMiddleware.js";

const router = Router();

router.get("/kpi", authMiddleware.authenticateToken, reportsController.getKpiData);
router.get("/class-occupancy", authMiddleware.authenticateToken, reportsController.getClassOccupancy);
router.get("/user-distribution", authMiddleware.authenticateToken, reportsController.getUserDistribution);
router.get("/teachers-participation", authMiddleware.authenticateToken, reportsController.getTeachersParticipation);
router.get("/attendance-rate", authMiddleware.authenticateToken, reportsController.getAttendanceRate);
router.get("/retention-churn", authMiddleware.authenticateToken, reportsController.getRetentionChurnAnalysis);
router.get("/revenue-optimization", authMiddleware.authenticateToken, reportsController.getRevenueOptimization);
router.get("/student-engagement", authMiddleware.authenticateToken, reportsController.getStudentEngagement);
router.get("/operational-efficiency", authMiddleware.authenticateToken, reportsController.getOperationalEfficiency);
router.get("/admin-audit", authMiddleware.authenticateToken, reportsController.getAdminAudit);
router.get("/users-at-risk", authMiddleware.authenticateToken, reportsController.getUsersAtRisk);
router.get("/dashboard-sidebar", authMiddleware.authenticateToken, reportsController.getDashboardSidebar);

export default router;