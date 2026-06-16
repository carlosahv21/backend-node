import { Router } from 'express';
import fieldController from './field.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "view"),
    (req, res, next) => fieldController.getAll(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "view"),
    (req, res, next) => fieldController.getById(req, res, next)
);

router.get("/module/:name",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "view"),
    (req, res, next) => fieldController.getFieldsByModule(req, res, next)
);

router.post("/relation",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "view"),
    (req, res, next) => fieldController.getRelationField(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "create"),
    (req, res, next) => fieldController.create(req, res, next)
);

router.patch("/reorder",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "edit"),
    (req, res, next) => fieldController.reorder(req, res, next)
);

router.put("/:blockId/order",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "edit"),
    (req, res, next) => fieldController.reorderInBlock(req, res, next)
);

router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "edit"),
    (req, res, next) => fieldController.update(req, res, next)
);

router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "delete"),
    (req, res, next) => fieldController.bin(req, res, next)
);

router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "delete"),
    (req, res, next) => fieldController.restore(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("fields", "delete"),
    (req, res, next) => fieldController.delete(req, res, next)
);

export default router;