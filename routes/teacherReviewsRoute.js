import { Router } from 'express';
import teacherReviewsController from '../controllers/teacherReviewsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { validateModule } from '../middlewares/dynamicValidationMiddleware.js';

const router = Router();

router.get(
    '/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('teacher_reviews', 'view'),
    teacherReviewsController.getAll
);

router.get(
    '/teacher/:teacherId',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('teacher_reviews', 'view'),
    teacherReviewsController.getByTeacher
);

router.get(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('teacher_reviews', 'view'),
    teacherReviewsController.getById
);

router.post(
    '/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('teacher_reviews', 'create'),
    validateModule('teacher_reviews'),
    teacherReviewsController.create
);

router.put(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('teacher_reviews', 'edit'),
    teacherReviewsController.update
);

router.patch(
    '/:id/bin',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('teacher_reviews', 'delete'),
    teacherReviewsController.bin
);

router.patch(
    '/:id/restore',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('teacher_reviews', 'delete'),
    teacherReviewsController.restore
);

router.delete(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('teacher_reviews', 'delete'),
    teacherReviewsController.delete
);

export default router;
