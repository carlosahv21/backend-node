import { Router } from "express";
import authController from "./auth.controller.js";
import authMiddleware from "../../../shared/middlewares/authMiddleware.js";
import { loginLimiter, registerLimiter, passwordResetLimiter } from "../../../shared/middlewares/rateLimiter.js";

const router = Router();

router.post("/login",
    loginLimiter,
    (req, res, next) => authController.login(req, res, next)
);

router.post("/register",
    registerLimiter,
    (req, res) => res.status(501).json({ message: "Not implemented yet" })
);

router.post("/forgot-password",
    passwordResetLimiter,
    (req, res, next) => authController.forgotPassword(req, res, next)    
);

router.post("/change-password",
    authMiddleware.authenticateToken,
    (req, res, next) => authController.changePassword(req, res, next)
);

router.post("/reset-password/:token",
    passwordResetLimiter,
    (req, res, next) => authController.resetPassword(req, res, next)    
);

router.get("/reset-password/:token",
    (req, res, next) => authController.verifyToken(req, res, next)
);

router.get("/me",
    authMiddleware.authenticateToken,
    (req, res, next) => authController.me(req, res, next)
);

export default router;