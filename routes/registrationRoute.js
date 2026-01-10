// routes/registrationRoute.js
import express from 'express';
import * as registrationController from '../controllers/registrationController.js';

const router = express.Router();

router.post('/', registrationController.createRegistration);
router.get('/', registrationController.listRegistrations);
router.patch('/:id/bin', registrationController.binRegistration);
router.patch('/:id/restore', registrationController.restoreRegistration);
router.delete('/:id', registrationController.deleteRegistration);
router.get('/available-classes', registrationController.getAvailableClasses);

export default router;
