// routes/student.route.js
import { Router } from 'express';
import studentController from '../controllers/studentController.js';

const router = Router();

/**
 * Define las rutas (endpoints) para la entidad Student.
 */

// POST /api/v1/student -> Crear nuevo elemento
router.post('/', studentController.create);

// GET /api/v1/student -> Obtener todos los elementos
router.get('/', studentController.getAll);

// GET /api/v1/student/:id -> Obtener un elemento por ID
router.get('/:id', studentController.getById);

// NOTA: Añade las rutas PUT y DELETE aquí.

export default router;