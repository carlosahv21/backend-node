// routes/academyRoute.js
import { Router } from 'express';
import academyController from '../controllers/academyController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { registerLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

/**
 * PUBLIC ENDPOINTS (No requiere token)
 */

// Registro público desde Landing Page
router.post("/register",
    registerLimiter,
    (req, res, next) => academyController.registerAcademy(req, res, next)
);

/**
 * PROTECTED ENDPOINTS (Requiere token)
 */

// Endpoint para que el usuario logueado consulte su propia academia
router.get("/me",
    authMiddleware.authenticateToken,
    (req, res, next) => academyController.getMyAcademy(req, res, next)
);

// CRUD General (Protegido por permisos de Admin Global)
router.get("/", 
    authMiddleware.authenticateToken,
    authMiddleware.authorize("academies", "view"), 
    (req, res, next) => academyController.getAllAcademies(req, res, next)
);

router.get("/:id", 
    authMiddleware.authenticateToken,
    authMiddleware.authorize("academies", "view"), 
    (req, res, next) => academyController.getAcademyById(req, res, next)
);

router.put("/:id", 
    authMiddleware.authenticateToken,
    authMiddleware.authorize("academies", "edit"), 
    (req, res, next) => academyController.updateAcademy(req, res, next)
);

router.delete("/:id", 
    authMiddleware.authenticateToken,
    authMiddleware.authorize("academies", "delete"), 
    (req, res, next) => academyController.deleteAcademy(req, res, next)
);

export default router;
