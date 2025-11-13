// routes/users.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController.js');

// Rutas que utilizan los métodos genéricos de BaseController
router.get('/', (req, res) => usersController.getAll(req, res)); // Obtener todos los usuarios
router.get('/:id', (req, res) => usersController.getById(req, res)); // Obtener usuario por ID
router.post('/', (req, res) => usersController.create(req, res)); // Crear usuario
router.put('/:id', (req, res) => usersController.update(req, res)); // Actualizar usuario
router.delete('/:id', (req, res) => usersController.delete(req, res)); // Eliminar usuario

module.exports = router;