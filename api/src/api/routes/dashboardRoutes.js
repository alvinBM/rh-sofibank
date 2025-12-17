import express from 'express';
import {
    getDashboardStats,
    getEmployeeStatistics,
    getLeaveStatistics,
    getAttendanceStatistics
} from '../controllers/dashboardController.js';
import validateToken from '../middlewares/validateToken.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(validateToken);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get all dashboard statistics
 * @access  Private
 */
router.get('/stats', getDashboardStats);

/**
 * @route   GET /api/dashboard/employee-stats
 * @desc    Get employee statistics
 * @access  Private
 */
router.get('/employee-stats', getEmployeeStatistics);

/**
 * @route   GET /api/dashboard/leave-stats
 * @desc    Get leave statistics
 * @access  Private
 */
router.get('/leave-stats', getLeaveStatistics);

/**
 * @route   GET /api/dashboard/attendance-stats
 * @desc    Get attendance statistics
 * @access  Private
 */
router.get('/attendance-stats', getAttendanceStatistics);

export default router;
