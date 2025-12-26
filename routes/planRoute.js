import { Router } from 'express';
import planController from '../controllers/planController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/plans
router.get('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "view"),
    planController.getAll
);

// GET /api/plans/details/:id
router.get("/details/:id",
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "view"),
    planController.getByIdDetails
);

// POST /api/plans
router.post('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "create"),
    planController.create
);

// GET /api/plans/:id
router.get('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "view"),
    planController.getById
);

// PUT /api/plans/:id
router.put('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "edit"),
    planController.update
);

// DELETE /api/plans/:id
router.delete('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "delete"),
    planController.delete
);

router.get('/student/:student_id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("plans", "view"),
    planController.getStudentPlan
);

export default router;