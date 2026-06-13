import { Router } from 'express';
import ConnectionsController from '../controllers/ConnectionsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

router.get(
    '/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('connections', 'view'),
    ConnectionsController.getMyConnections
);

router.get(
    '/all',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('connections', 'view'),
    ConnectionsController.getAll
);

router.get(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('connections', 'view'),
    ConnectionsController.getById
);

router.post(
    '/request',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('connections', 'create'),
    ConnectionsController.request
);

router.patch(
    '/:id/accept',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('connections', 'edit'),
    ConnectionsController.accept
);

router.patch(
    '/:id/reject',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('connections', 'edit'),
    ConnectionsController.reject
);

router.delete(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('connections', 'delete'),
    ConnectionsController.remove
);

export default router;
