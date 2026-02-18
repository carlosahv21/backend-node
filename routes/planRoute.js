import { Router } from "express";
import planController from "../controllers/planController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validateModule } from "../middlewares/dynamicValidationMiddleware.js";

const router = Router();

// GET /api/plans
router.get(
    "/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "view"),
    planController.getAll
);

// GET /api/plans/details/:id
router.get(
    "/details/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "view"),
    planController.getByIdDetails
);

// GET /api/plans/:id
router.get(
    "/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "view"),
    planController.getById
);

// GET /api/plans/student/:student_id
router.get(
    "/student/:student_id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "view"),
    planController.getStudentPlan
);

// POST /api/plans
router.post(
    "/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "create"),
    validateModule('plans'),
    planController.create
);

// PATCH /api/plans/:id/bin
router.patch(
    "/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "delete"),
    planController.bin
);

// PATCH /api/plans/:id/restore
router.patch(
    "/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "delete"),
    planController.restore
);

// PUT /api/plans/:id
router.put(
    "/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "edit"),
    planController.update
);

// DELETE /api/plans/:id
router.delete(
    "/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "delete"),
    planController.delete
);

export default router;
