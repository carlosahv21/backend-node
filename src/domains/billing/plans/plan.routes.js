import { Router } from 'express';
import planController from './plan.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "view"),
    (req, res, next) => planController.getAll(req, res, next)
);

router.get("/student/:studentId",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "view"),
    (req, res, next) => planController.getStudentPlan(req, res, next)
);

router.get("/details/:id",
    authMiddleware.authenticateToken,
    (req, res, next) => planController.getByIdDetails(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "view"),
    (req, res, next) => planController.getById(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "create"),
    (req, res, next) => planController.create(req, res, next)
);

router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "edit"),
    (req, res, next) => planController.update(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "delete"),
    (req, res, next) => planController.delete(req, res, next)
);

export default router;