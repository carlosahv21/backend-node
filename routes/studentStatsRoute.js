import { Router } from 'express';
import studentStatsController from '../controllers/studentStatsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.get(
    '/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('student_stats', 'view'),
    studentStatsController.getAll
);

router.get(
    '/student/:studentId',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('student_stats', 'view'),
    studentStatsController.getByStudent
);

router.get(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('student_stats', 'view'),
    studentStatsController.getById
);

export default router;
