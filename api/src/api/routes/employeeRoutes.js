import express from 'express';
const router = express.Router();
import employeeController from '../controllers/employeeController.js';
import validateToken from '../middlewares/validateToken.js';
import checkPermission from '../middlewares/checkPermission.js';

// All routes require authentication
router.use(validateToken);

// Get all employees (with pagination and filters)
router.get('/', checkPermission('view_employees'), employeeController.getAll);

// Get employee statistics
router.get('/statistics', checkPermission('view_employees'), employeeController.getStatistics);

// Get employee by ID
router.get('/:id', checkPermission('view_employees'), employeeController.getById);

// Get employee subordinates
router.get('/:id/subordinates', checkPermission('view_employees'), employeeController.getSubordinates);

// Create new employee
router.post('/', checkPermission('create_employee'), employeeController.create);

// Update employee
router.put('/:id', checkPermission('update_employee'), employeeController.update);

// Delete employee (soft delete)
router.delete('/:id', checkPermission('delete_employee'), employeeController.delete);

export default router;
