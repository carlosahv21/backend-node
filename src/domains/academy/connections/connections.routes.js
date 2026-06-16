import { Router } from 'express';
import connectionsController from './connections.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('connections', 'view'),
    connectionsController.getMyConnections
);

router.get('/all',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('connections', 'view'),
    connectionsController.getAll
);

router.get('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('connections', 'view'),
    connectionsController.getById
);

router.post('/request',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('connections', 'create'),
    connectionsController.request
);

router.patch('/:id/accept',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('connections', 'edit'),
    connectionsController.accept
);

router.patch('/:id/reject',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('connections', 'edit'),
    connectionsController.reject
);

router.delete('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize('connections', 'delete'),
    connectionsController.remove
);

export default router;