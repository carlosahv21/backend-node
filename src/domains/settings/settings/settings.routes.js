import { Router } from "express";
import settingsController from "./settings.controller.js";
import authMiddleware from "../../../shared/middlewares/authMiddleware.js";

const router = Router();

router.get("/me", authMiddleware.authenticateToken, settingsController.getMySettings);
router.get("/", authMiddleware.authenticateToken, authMiddleware.authorize("academies", "view"), settingsController.getAllSettings);
router.get("/:id", authMiddleware.authenticateToken, authMiddleware.authorize("academies", "view"), settingsController.getSettingsById);
router.put("/:id", authMiddleware.authenticateToken, authMiddleware.authorize("academies", "edit"), settingsController.updateSettings);
router.delete("/:id", authMiddleware.authenticateToken, authMiddleware.authorize("academies", "delete"), settingsController.deleteSettings);

export default router;