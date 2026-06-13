import { Router } from 'express';
import challengesController from '../controllers/challengesController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { validateModule } from '../middlewares/dynamicValidationMiddleware.js';

const router = Router();

router.get(
    '/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('challenges', 'view'),
    challengesController.getAll
);

router.get(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('challenges', 'view'),
    challengesController.getById
);

router.post(
    '/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('challenges', 'create'),
    validateModule('challenges'),
    challengesController.create
);

router.put(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('challenges', 'edit'),
    challengesController.update
);

router.patch(
    '/:id/bin',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('challenges', 'delete'),
    challengesController.bin
);

router.patch(
    '/:id/restore',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('challenges', 'delete'),
    challengesController.restore
);

router.delete(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('challenges', 'delete'),
    challengesController.delete
);

export default router;
