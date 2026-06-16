import { Router } from 'express';
import paymentController from './payment.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("payments", "view"),
    (req, res, next) => paymentController.getAll(req, res, next)
);

router.get("/details/:id",
    authMiddleware.authenticateToken,
    (req, res, next) => paymentController.getByIdDetails(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("payments", "view"),
    (req, res, next) => paymentController.getById(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("payments", "create"),
    (req, res, next) => paymentController.create(req, res, next)
);

router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("payments", "edit"),
    (req, res, next) => paymentController.update(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("payments", "delete"),
    (req, res, next) => paymentController.delete(req, res, next)
);

export default router;