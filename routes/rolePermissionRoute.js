// routes/rolePermissionRoute.js
import { Router } from 'express';
import rolePermissionController from '../controllers/rolePermissionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/role_permissions
router.get("/",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "view"),
    (req, res, next) => rolePermissionController.getAllRolesWithPermissions(req, res, next)
);

// GET /api/role_permissions/:role_id
router.get("/:role_id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "view"),
    (req, res, next) => rolePermissionController.getPermissionsByRole(req, res, next)
);

// POST /api/:role_id
router.post("/:role_id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("permissions", "edit"),
    (req, res, next) => rolePermissionController.setPermissionsForRole(req, res, next)
);

export default router;