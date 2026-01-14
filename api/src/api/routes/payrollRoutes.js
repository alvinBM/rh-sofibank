import express from "express";
import payrollController from "../controllers/payrollController.js";
import employeePayrollController from "../controllers/employeePayrollController.js";

const router = express.Router();

// ==================== PAYROLL RUNS (PERIODS) ====================
router.get("/runs", payrollController.getPayrollRuns);
router.get("/runs/:id", payrollController.getPayrollRunById);
router.post("/runs", payrollController.createPayrollRun);
router.post("/runs/:id/process", payrollController.processPayrollRun);
router.post("/runs/:id/approve", payrollController.approvePayrollRun);
router.post("/runs/:id/distribute", payrollController.distributePayslips);

// ==================== PAYROLL VARIABLES ====================
router.get("/variables", payrollController.getPayrollVariables);
router.post("/variables", payrollController.createPayrollVariable);
router.put("/variables/:id", payrollController.updatePayrollVariable);
router.delete("/variables/:id", payrollController.deletePayrollVariable);

// ==================== PAYROLL SETTINGS ====================
router.get("/settings", payrollController.getPayrollSettings);
router.put("/settings", payrollController.updatePayrollSettings);

// ==================== PAYROLL ITEM TYPES ====================
router.get("/item-types", payrollController.getPayrollItemTypes);

// ==================== EMPLOYEE PAYROLL (ESS) ====================
router.get("/employees/:employeeId/payslips", employeePayrollController.getPayslips);
router.get("/employees/:employeeId/payslips/:id", employeePayrollController.getPayslipById);
router.get("/employees/:employeeId/payslips/:id/download", employeePayrollController.downloadPayslip);
router.get("/employees/:employeeId/payment-history", employeePayrollController.getPaymentHistory);

export default router;
