import { Router } from 'express';
import userAchievementsController from '../controllers/userAchievementsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.get(
    '/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('achievements', 'view'),
    userAchievementsController.getAll
);

router.get(
    '/user/:userId',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('achievements', 'view'),
    userAchievementsController.getByUser
);

router.get(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('achievements', 'view'),
    userAchievementsController.getById
);

router.post(
    '/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('achievements', 'create'),
    userAchievementsController.create
);

router.delete(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('achievements', 'delete'),
    userAchievementsController.remove
);

export default router;
