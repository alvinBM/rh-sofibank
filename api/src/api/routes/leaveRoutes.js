import express from 'express';
const router = express.Router();
import leaveController from '../controllers/leaveController.js';
import validateToken from '../middlewares/validateToken.js';
import checkPermission from '../middlewares/checkPermission.js';

// All routes require authentication
router.use(validateToken);

// Leave Types
router.get('/types', leaveController.getLeaveTypes);
router.post('/types', checkPermission('manage_leave_types'), leaveController.createLeaveType);

// Leave Requests
router.get('/requests', checkPermission('view_leaves'), leaveController.getAllRequests);
router.get('/requests/:id', checkPermission('view_leaves'), leaveController.getRequestById);
router.post('/requests', checkPermission('create_leave_request'), leaveController.createRequest);
router.post('/requests/:id/submit', checkPermission('create_leave_request'), leaveController.submitRequest);
router.post('/requests/:id/process', checkPermission('approve_leave'), leaveController.processRequest);

// Leave Balances
router.get('/balances', checkPermission('view_leaves'), leaveController.getBalance);
router.post('/balances/initialize', checkPermission('manage_leave_types'), leaveController.initializeBalances);

export default router;
