import { Router } from 'express';
import userChallengesController from '../controllers/userChallengesController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.get(
    '/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('challenges', 'view'),
    userChallengesController.getAll
);

router.get(
    '/user/:userId',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('challenges', 'view'),
    userChallengesController.getByUser
);

router.get(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('challenges', 'view'),
    userChallengesController.getById
);

router.post(
    '/join',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('challenges', 'create'),
    userChallengesController.join
);

router.delete(
    '/leave/:challengeId',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('challenges', 'delete'),
    userChallengesController.leave
);

router.delete(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('challenges', 'delete'),
    userChallengesController.remove
);

export default router;
