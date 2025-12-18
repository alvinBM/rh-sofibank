import express from 'express';
const router = express.Router();
import employeeController from '../controllers/employeeController.js';
import employeeDocumentsController from '../controllers/employeeDocumentsController.js';
import employeePayrollController from '../controllers/employeePayrollController.js';
import employeeAttendanceController from '../controllers/employeeAttendanceController.js';
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

// ==================== EMPLOYEE DOCUMENTS ====================
// Get all documents for an employee
router.get('/:employeeId/documents', checkPermission('view_employees'), employeeDocumentsController.getByEmployeeId);

// Upload a new document
router.post('/:employeeId/documents', checkPermission('update_employee'), employeeDocumentsController.create);

// Get document by ID
router.get('/:employeeId/documents/:id', checkPermission('view_employees'), employeeDocumentsController.getById);

// Update document metadata
router.put('/:employeeId/documents/:id', checkPermission('update_employee'), employeeDocumentsController.update);

// Delete document
router.delete('/:employeeId/documents/:id', checkPermission('delete_employee'), employeeDocumentsController.delete);

// Download document
router.get('/:employeeId/documents/:id/download', checkPermission('view_employees'), employeeDocumentsController.download);

// ==================== EMPLOYEE PAYROLL ====================
// Get payslips for an employee
router.get('/:employeeId/payslips', checkPermission('view_employees'), employeePayrollController.getPayslips);

// Get payment history summary
router.get('/:employeeId/payment-history', checkPermission('view_employees'), employeePayrollController.getPaymentHistory);

// Get specific payslip
router.get('/:employeeId/payslips/:id', checkPermission('view_employees'), employeePayrollController.getPayslipById);

// Download payslip PDF
router.get('/:employeeId/payslips/:id/download', checkPermission('view_employees'), employeePayrollController.downloadPayslip);

// ==================== EMPLOYEE ATTENDANCE ====================
// Get attendance records for an employee
router.get('/:employeeId/attendance', checkPermission('view_employees'), employeeAttendanceController.getByEmployeeId);

// Get attendance calendar data
router.get('/:employeeId/attendance/calendar', checkPermission('view_employees'), employeeAttendanceController.getCalendarData);

// Get attendance movements (entries/exits)
router.get('/:employeeId/attendance/movements', checkPermission('view_employees'), employeeAttendanceController.getMovements);

// Get monthly attendance summary
router.get('/:employeeId/attendance/summary', checkPermission('view_employees'), employeeAttendanceController.getMonthlySummary);

export default router;
