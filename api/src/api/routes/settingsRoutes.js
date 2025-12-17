import express from 'express';
import settingsController from '../controllers/settingsController.js';
import validateToken from '../middlewares/validateToken.js';
import checkPermission from '../middlewares/checkPermission.js';

const router = express.Router();

// ==================== DIRECTIONS ====================
router.get('/directions', validateToken, settingsController.getAllDirections);
router.post('/directions', validateToken, checkPermission(['manage_settings']), settingsController.createDirection);
router.put('/directions/:id', validateToken, checkPermission(['manage_settings']), settingsController.updateDirection);
router.delete('/directions/:id', validateToken, checkPermission(['manage_settings']), settingsController.deleteDirection);

// ==================== SERVICES ====================
router.get('/services', validateToken, settingsController.getAllServices);
router.post('/services', validateToken, checkPermission(['manage_settings']), settingsController.createService);
router.put('/services/:id', validateToken, checkPermission(['manage_settings']), settingsController.updateService);
router.delete('/services/:id', validateToken, checkPermission(['manage_settings']), settingsController.deleteService);

// ==================== GRADES ====================
router.get('/grades', validateToken, settingsController.getAllGrades);
router.post('/grades', validateToken, checkPermission(['manage_settings']), settingsController.createGrade);
router.put('/grades/:id', validateToken, checkPermission(['manage_settings']), settingsController.updateGrade);
router.delete('/grades/:id', validateToken, checkPermission(['manage_settings']), settingsController.deleteGrade);

// ==================== JOB POSITIONS ====================
router.get('/job-positions', validateToken, settingsController.getAllJobPositions);
router.post('/job-positions', validateToken, checkPermission(['manage_settings']), settingsController.createJobPosition);
router.put('/job-positions/:id', validateToken, checkPermission(['manage_settings']), settingsController.updateJobPosition);
router.delete('/job-positions/:id', validateToken, checkPermission(['manage_settings']), settingsController.deleteJobPosition);

export default router;
