// routes/registrationRoute.js
import { Router } from 'express';
import registrationController from '../controllers/registrationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/registrations
router.get('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("registrations", "view"),
    (req, res, next) => registrationController.listRegistrations(req, res, next)
);

// GET /api/registrations/available-classes
router.get('/available-classes',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("registrations", "view"),
    (req, res, next) => registrationController.getAvailableClasses(req, res, next)
);

// POST /api/registrations
router.post('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("registrations", "create"),
    (req, res, next) => registrationController.createRegistration(req, res, next)
);

// PATCH /api/registrations/:id/bin
router.patch('/:id/bin',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("registrations", "delete"),
    (req, res, next) => registrationController.binRegistration(req, res, next)
);

// PATCH /api/registrations/:id/restore
router.patch('/:id/restore',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("registrations", "delete"),
    (req, res, next) => registrationController.restoreRegistration(req, res, next)
);

// DELETE /api/registrations/:id
router.delete('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("registrations", "delete"),
    (req, res, next) => registrationController.deleteRegistration(req, res, next)
);

export default router;
