// routes/blocks.js
const express = require('express');
const router = express.Router();
const blockController = require('../controllers/blockController');
const { authenticateToken, authorize } = require('../middlewares/authMiddleware');

// GET /api/blocks
router.get("/", 
    authenticateToken, 
    authorize("blocks", "view"),
    (req, res, next) => blockController.getAll(req, res, next)
);

// GET /api/blocks/:id
router.get("/:id", 
    authenticateToken, 
    authorize("blocks", "view"),
    (req, res, next) => blockController.getById(req, res, next)
);

// POST /api/blocks
router.post("/", 
    authenticateToken, 
    authorize("blocks", "create"),
    (req, res, next) => blockController.create(req, res, next)
);

// PUT /api/blocks/:id
router.put("/:id", 
    authenticateToken, 
    authorize("blocks", "edit"),
    (req, res, next) => blockController.update(req, res, next)
);

// DELETE /api/blocks/:id
router.delete("/:id", 
    authenticateToken, 
    authorize("blocks", "delete"),
    (req, res, next) => blockController.delete(req, res, next)
);

module.exports = router;