import { Router } from 'express';
import notificationController from './notification.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    (req, res, next) => notificationController.getByUser(req, res, next)
);

router.patch("/:id/read",
    authMiddleware.authenticateToken,
    (req, res, next) => notificationController.markAsRead(req, res, next)
);

router.patch("/read-all",
    authMiddleware.authenticateToken,
    (req, res, next) => notificationController.markAllAsRead(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    (req, res, next) => notificationController.delete(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("notifications", "create"),
    (req, res, next) => notificationController.create(req, res, next)
);

export default router;