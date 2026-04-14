// routes/authRoute.js
import { Router } from "express";
import authController from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { loginLimiter, registerLimiter, passwordResetLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// POST /api/auth/login
router.post("/login",
    loginLimiter,
    (req, res, next) => authController.login(req, res, next)
);

// POST /api/auth/register (Placeholder for when registration is fully implemented)
router.post("/register",
    registerLimiter,
    (req, res) => res.status(501).json({ message: "Not implemented yet" })
);

// POST /api/auth/forgot-password
router.post("/forgot-password",
    passwordResetLimiter,
    (req, res, next) => authController.forgotPassword(req, res, next)    
);

// POST /api/auth/reset-password/:token
router.post("/reset-password/:token",
    passwordResetLimiter,
    (req, res, next) => authController.resetPassword(req, res, next)    
);

// GET /api/auth/reset-password/:token (Verificar token)
router.get("/reset-password/:token",
    (req, res, next) => authController.verifyToken(req, res, next)
);

// GET /api/auth/me
router.get("/me",
    authMiddleware.authenticateToken,
    (req, res, next) => authController.me(req, res, next)
);

export default router;