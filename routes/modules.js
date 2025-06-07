// routes/modules.js
const express = require("express");
const ModuleController = require("../controllers/modulesController");

const router = express.Router();
const moduleController = new ModuleController();

// Rutas genéricas usando el controlador base
router.get("/", (req, res) => moduleController.getAll(req, res)); // Listar todos los módulos
router.get("/:id", (req, res) => moduleController.getById(req, res)); // Obtener un módulo por ID

// Ruta específica para activar/desactivar un módulo
router.post("/:id/toggle", (req, res) => moduleController.toggle(req, res));

module.exports = router;
