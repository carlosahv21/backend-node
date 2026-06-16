import { Router } from 'express';
import rolePermissionController from './rolePermission.controller.js';
import authMiddleware from '../../../shared/middlewares/authMiddleware.js';

const router = Router();

router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "view"),
    (req, res, next) => rolePermissionController.getAllRolesWithPermissions(req, res, next)
);

router.get("/:role_id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "view"),
    (req, res, next) => rolePermissionController.getPermissionsByRole(req, res, next)
);

router.post("/:role_id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "edit"),
    (req, res, next) => rolePermissionController.setPermissionsForRole(req, res, next)
);

export default router;