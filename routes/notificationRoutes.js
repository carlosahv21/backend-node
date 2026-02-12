// routes/notificationRoutes.js
import { Router } from 'express';
import notificationController from '../controllers/notificationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * Notification Routes
 * All routes require authentication but no role-based permissions
 * Users can only access/modify their own notifications
 */

// GET /api/notifications - Get user's notifications with optional filters
router.get('/',
    authMiddleware.authenticateToken,
    (req, res, next) => notificationController.getNotifications(req, res, next)
);

// PATCH /api/notifications/read/:id? - Mark notification(s) as read
// If id is provided: marks single notification as read
// If id is omitted: marks all user's notifications as read
router.patch('/:id/read/',
    authMiddleware.authenticateToken,
    (req, res, next) => notificationController.markAsRead(req, res, next)
);

router.patch('/read-all',
    authMiddleware.authenticateToken,
    (req, res, next) => notificationController.markAllAsRead(req, res, next)
);

// DELETE /api/notifications/:id - Soft delete a notification
router.delete('/:id',
    authMiddleware.authenticateToken,
    (req, res, next) => notificationController.deleteNotification(req, res, next)
);

export default router;
