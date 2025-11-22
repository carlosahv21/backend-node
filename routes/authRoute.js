import { Router } from "express";
import authController from "../controllers/authController.js";
import rbacMiddleware from "../middlewares/authMiddleware.js"; 

const router = Router();

/**
 * Rutas de Autenticación.
 */

// POST /api/auth/login
router.post("/login", 
    (req, res, next) => authController.login(req, res, next)
);

// GET /api/auth/me
router.get("/me", 
    // Usar la función authenticateToken del objeto importado
    rbacMiddleware.authenticateToken, 
    (req, res, next) => authController.me(req, res, next)
);

export default router;