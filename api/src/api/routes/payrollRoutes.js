import express from 'express';
import payrollController from '../controllers/payrollController.js';
import employeePayrollController from '../controllers/employeePayrollController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ==================== PAYROLL RUNS (PERIODS) ====================
router.get('/runs', verifyToken, payrollController.getPayrollRuns);
router.get('/runs/:id', verifyToken, payrollController.getPayrollRunById);
router.post('/runs', verifyToken, payrollController.createPayrollRun);
router.post('/runs/:id/process', verifyToken, payrollController.processPayrollRun);
router.post('/runs/:id/approve', verifyToken, payrollController.approvePayrollRun);
router.post('/runs/:id/distribute', verifyToken, payrollController.distributePayslips);

// ==================== PAYROLL VARIABLES ====================
router.get('/variables', verifyToken, payrollController.getPayrollVariables);
router.post('/variables', verifyToken, payrollController.createPayrollVariable);
router.put('/variables/:id', verifyToken, payrollController.updatePayrollVariable);
router.delete('/variables/:id', verifyToken, payrollController.deletePayrollVariable);

// ==================== PAYROLL SETTINGS ====================
router.get('/settings', verifyToken, payrollController.getPayrollSettings);
router.put('/settings', verifyToken, payrollController.updatePayrollSettings);

// ==================== PAYROLL ITEM TYPES ====================
router.get('/item-types', verifyToken, payrollController.getPayrollItemTypes);

// ==================== EMPLOYEE PAYROLL (ESS) ====================
router.get('/employees/:employeeId/payslips', verifyToken, employeePayrollController.getPayslips);
router.get('/employees/:employeeId/payslips/:id', verifyToken, employeePayrollController.getPayslipById);
router.get('/employees/:employeeId/payslips/:id/download', verifyToken, employeePayrollController.downloadPayslip);
router.get('/employees/:employeeId/payment-history', verifyToken, employeePayrollController.getPaymentHistory);

export default router;
