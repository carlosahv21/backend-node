// routes/attendanceRoutes.js
import { Router } from 'express';
import attendanceController from '../controllers/attendanceController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// POST /api/attendances
router.post('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("attendances", "create"),
    (req, res, next) => attendanceController.createAttendance(req, res, next)
);

// GET /api/attendances
router.get('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("attendances", "view"),
    (req, res, next) => attendanceController.getAllAttendances(req, res, next)
);

// GET /api/attendances/details
router.get('/details',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("attendances", "view"),
    (req, res, next) => attendanceController.getByClassAndDate(req, res, next)
);

// PUT /api/attendances/:id
router.put('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("attendances", "edit"),
    (req, res, next) => attendanceController.updateAttendance(req, res, next)
);

// PATCH /api/attendances/:id/bin
router.patch('/:id/bin',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("attendances", "delete"),
    (req, res, next) => attendanceController.binAttendance(req, res, next)
);

// PATCH /api/attendances/:id/restore
router.patch('/:id/restore',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("attendances", "delete"),
    (req, res, next) => attendanceController.restoreAttendance(req, res, next)
);

// DELETE /api/attendances/:id
router.delete('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("attendances", "delete"),
    (req, res, next) => attendanceController.deleteAttendance(req, res, next)
);

export default router;
