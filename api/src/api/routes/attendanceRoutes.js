import express from 'express';
const router = express.Router();
import attendanceController from '../controllers/attendanceController.js';
import validateToken from '../middlewares/validateToken.js';
import checkPermission from '../middlewares/checkPermission.js';

// All routes require authentication
router.use(validateToken);

// Get all attendance records
router.get('/', checkPermission('view_attendance'), attendanceController.getAll);

// Get attendance statistics
router.get('/statistics', checkPermission('view_attendance'), attendanceController.getStatistics);

// Get employee attendance summary
router.get('/summary', checkPermission('view_attendance'), attendanceController.getEmployeeSummary);

// Get attendance record by ID
router.get('/:id', checkPermission('view_attendance'), attendanceController.getById);

// Check in
router.post('/check-in', checkPermission('record_attendance'), attendanceController.checkIn);

// Check out
router.post('/check-out', checkPermission('record_attendance'), attendanceController.checkOut);

// Create or update attendance record
router.post('/', checkPermission('record_attendance'), attendanceController.createOrUpdate);

// Update attendance record
router.put('/:id', checkPermission('update_attendance'), attendanceController.createOrUpdate);

// Delete attendance record
router.delete('/:id', checkPermission('update_attendance'), attendanceController.delete);

export default router;
