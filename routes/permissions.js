// routes/permissions.js    
const express = require('express');
const router = express.Router();
const permissionsController = require('../controllers/permissionsController.js');

// Rutas que utilizan los métodos genéricos de BaseController
router.get('/', (req, res) => permissionsController.getAll(req, res)); // Obtener todos los perfiles
router.get('/:id', (req, res) => permissionsController.getById(req, res)); // Obtener perfil por ID
router.post('/', (req, res) => permissionsController.create(req, res)); // Crear perfil
router.put('/:id', (req, res) => permissionsController.update(req, res)); // Actualizar perfil
router.delete('/:id', (req, res) => permissionsController.delete(req, res)); // Eliminar perfil

module.exports = router;