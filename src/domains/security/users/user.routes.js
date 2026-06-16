import { Router } from "express";
import userController from "./user.controller.js";
import authMiddleware from "../../../shared/middlewares/authMiddleware.js";

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("users", "view"),
    (req, res, next) => userController.getAll(req, res, next)
);

router.get("/details/:id",
    authMiddleware.authenticateToken,
    (req, res, next) => userController.getByIdDetails(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("users", "view"),
    (req, res, next) => userController.getById(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("users", "create"),
    (req, res, next) => userController.create(req, res, next)
);

router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("users", "edit"),
    (req, res, next) => userController.update(req, res, next)
);

router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("users", "delete"),
    (req, res, next) => userController.bin(req, res, next)
);

router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("users", "delete"),
    (req, res, next) => userController.restore(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("users", "delete"),
    (req, res, next) => userController.delete(req, res, next)
);

router.patch("/:userId/push-token",
    authMiddleware.authenticateToken,
    (req, res, next) => userController.savePushToken(req, res, next)
);

router.get("/:userId/push-token",
    authMiddleware.authenticateToken,
    (req, res, next) => userController.getPushToken(req, res, next)
);

router.post("/:userId/send-notification",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("users", "edit"),
    (req, res, next) => userController.sendPushNotification(req, res, next)
);

router.post("/check-notification-receipts",
    authMiddleware.authenticateToken,
    (req, res, next) => userController.checkNotificationReceipts(req, res, next)
);

export default router;