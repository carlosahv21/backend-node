import { Router } from 'express';
import blockController from './block.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("blocks", "view"),
    (req, res, next) => blockController.getAll(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("blocks", "view"),
    (req, res, next) => blockController.getById(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("blocks", "create"),
    (req, res, next) => blockController.create(req, res, next)
);

router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("blocks", "edit"),
    (req, res, next) => blockController.update(req, res, next)
);

router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("blocks", "delete"),
    (req, res, next) => blockController.bin(req, res, next)
);

router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("blocks", "delete"),
    (req, res, next) => blockController.restore(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("blocks", "delete"),
    (req, res, next) => blockController.delete(req, res, next)
);

export default router;