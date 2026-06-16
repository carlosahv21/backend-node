import { Router } from 'express';
import studentStatsController from './studentStats.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("student_stats", "view"),
    (req, res, next) => studentStatsController.getAll(req, res, next)
);

router.get("/student/:studentId",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("student_stats", "view"),
    (req, res, next) => studentStatsController.getByStudent(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("student_stats", "view"),
    (req, res, next) => studentStatsController.getById(req, res, next)
);

export default router;