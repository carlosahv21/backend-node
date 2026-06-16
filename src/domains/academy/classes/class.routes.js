import { Router } from 'express';
import classController from './class.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("classes", "view"),
    (req, res, next) => classController.getAll(req, res, next)
);

router.get("/next",
    authMiddleware.authenticateToken,
    (req, res, next) => classController.getNextClass(req, res, next)
);

router.get("/details/:id",
    authMiddleware.authenticateToken,
    (req, res, next) => classController.getByIdDetails(req, res, next)
);

router.get("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("classes", "view"),
    (req, res, next) => classController.getById(req, res, next)
);

router.post("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("classes", "create"),
    (req, res, next) => classController.create(req, res, next)
);

router.post("/:id/enroll",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("classes", "edit"),
    (req, res, next) => classController.enrollStudents(req, res, next)
);

router.put("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("classes", "edit"),
    (req, res, next) => classController.update(req, res, next)
);

router.patch("/:id/bin",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("classes", "delete"),
    (req, res, next) => classController.bin(req, res, next)
);

router.patch("/:id/restore",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("classes", "delete"),
    (req, res, next) => classController.restore(req, res, next)
);

router.delete("/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("classes", "delete"),
    (req, res, next) => classController.delete(req, res, next)
);

export default router;