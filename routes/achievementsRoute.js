import { Router } from 'express';
import achievementsController from '../controllers/achievementsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { validateModule } from '../middlewares/dynamicValidationMiddleware.js';

const router = Router();

router.get(
    '/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('achievements', 'view'),
    achievementsController.getAll
);

router.get(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('achievements', 'view'),
    achievementsController.getById
);

router.post(
    '/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('achievements', 'create'),
    validateModule('achievements'),
    achievementsController.create
);

router.put(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('achievements', 'edit'),
    achievementsController.update
);

router.patch(
    '/:id/bin',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('achievements', 'delete'),
    achievementsController.bin
);

router.patch(
    '/:id/restore',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('achievements', 'delete'),
    achievementsController.restore
);

router.delete(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('achievements', 'delete'),
    achievementsController.delete
);

export default router;
