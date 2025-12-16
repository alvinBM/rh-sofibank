import express from 'express';
const router = express.Router();

// Import route modules
import authRoutes from './authRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import leaveRoutes from './leaveRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';

// Mount routes
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/leave', leaveRoutes);
router.use('/attendance', attendanceRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
router.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'RH Sofibank API v1.0',
    endpoints: {
      auth: '/api/auth',
      employees: '/api/employees',
      leave: '/api/leave',
      attendance: '/api/attendance'
    }
  });
});

export default router;
