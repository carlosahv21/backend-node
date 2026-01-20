// routes/paymentRoute.js
import { Router } from 'express';
import paymentController from '../controllers/paymentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// GET /api/payments
router.get('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("payments", "view"),
    (req, res, next) => paymentController.getAllPayments(req, res, next)
);

// GET /api/payments/:id
router.get('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("payments", "view"),
    (req, res, next) => paymentController.getPaymentById(req, res, next)
);

// GET /api/payments/details/:id
router.get('/details/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("payments", "view"),
    (req, res, next) => paymentController.getPaymentDetails(req, res, next)
);

// POST /api/payments
router.post('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("payments", "create"),
    (req, res, next) => paymentController.createPayment(req, res, next)
);

// PUT /api/payments/:id
router.put('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("payments", "edit"),
    (req, res, next) => paymentController.updatePayment(req, res, next)
);

// PATCH /api/payments/:id/bin
router.patch('/:id/bin',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("payments", "delete"),
    (req, res, next) => paymentController.binPayment(req, res, next)
);

// PATCH /api/payments/:id/restore
router.patch('/:id/restore',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("payments", "delete"),
    (req, res, next) => paymentController.restorePayment(req, res, next)
);

// DELETE /api/payments/:id
router.delete('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorize("payments", "delete"),
    (req, res, next) => paymentController.deletePayment(req, res, next)
);

export default router;
