import { Router } from "express";
import reportsController from "../controllers/reportsController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

// GET /api/reports/kpi
router.get("/kpi",
    authMiddleware.authenticateToken,
    reportsController.getKpiData
);

// GET /api/reports/class-occupancy
router.get("/class-occupancy",
    authMiddleware.authenticateToken,
    reportsController.getClassOccupancy
);

// GET /api/reports/user-distribution
router.get("/user-distribution",
    authMiddleware.authenticateToken,
    reportsController.getUserDistribution
);

// GET /api/reports/teachers-participation
router.get("/teachers-participation",
    authMiddleware.authenticateToken,
    reportsController.getTeachersParticipation
);

// GET /api/reports/attendance-rate
router.get("/attendance-rate",
    authMiddleware.authenticateToken,
    reportsController.getAttendanceRate
);

// GET /api/reports/retention-churn
router.get("/retention-churn",
    authMiddleware.authenticateToken,
    reportsController.getRetentionChurnAnalysis
);

// GET /api/reports/revenue-optimization
router.get("/revenue-optimization",
    authMiddleware.authenticateToken,
    reportsController.getRevenueOptimization
);

// GET /api/reports/student-engagement
router.get("/student-engagement",
    authMiddleware.authenticateToken,
    reportsController.getStudentEngagement
);

// GET /api/reports/operational-efficiency
router.get("/operational-efficiency",
    authMiddleware.authenticateToken,
    reportsController.getOperationalEfficiency
);

// GET /api/reports/admin-audit
router.get("/admin-audit",
    authMiddleware.authenticateToken,
    reportsController.getAdminAudit
);

// GET /api/reports/users-at-risk
router.get("/users-at-risk",
    authMiddleware.authenticateToken,
    reportsController.getUsersAtRisk
);

export default router;
