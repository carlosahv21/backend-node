// routes/users.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, authorize } = require('../middlewares/authMiddleware'); 

// 1. OBTENER todos (users:view)
router.get("/",
    authenticateToken,
    authorize("users", "view"),
    (req, res) => usersController.getAll(req, res)
);

// 2. OBTENER por ID (users:view)
router.get("/:id",
    authenticateToken,
    authorize("users", "view"),
    (req, res) => usersController.getById(req, res)
);

// 3. CREAR (users:create)
router.post("/",
    authenticateToken,
    authorize("users", "create"),
    (req, res) => usersController.create(req, res)
);

// 4. ACTUALIZAR (users:edit)
router.put("/:id",
    authenticateToken,
    authorize("users", "edit"),
    (req, res) => usersController.update(req, res)
);

// 5. ELIMINAR (users:delete)
router.delete("/:id",
    authenticateToken,
    authorize("users", "delete"),
    (req, res) => usersController.delete(req, res)
);

module.exports = router;