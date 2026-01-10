// routes/attendanceRoutes.js
import express from 'express';
import attendanceController from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/', attendanceController.create);
router.get('/', attendanceController.getAll);
router.get('/details', attendanceController.getByClassAndDate);
router.put('/:id', attendanceController.update);
router.patch('/:id/bin', attendanceController.bin);
router.patch('/:id/restore', attendanceController.restore);
router.delete('/:id', attendanceController.delete);

export default router;
