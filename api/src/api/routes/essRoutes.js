import express from "express";
import * as essController from "../controllers/essController.js";
import validateToken from "../middlewares/validateToken.js";
import checkPermission from "../middlewares/checkPermission.js";

const router = express.Router();

// ==================== MY PROFILE ====================
router.get("/my-profile", validateToken, essController.getMyProfile);
router.put("/my-profile", validateToken, essController.updateMyProfile);

// ==================== MY DOCUMENTS ====================
router.get("/my-documents", validateToken, essController.getMyDocuments);
router.get("/employees/:employeeId/documents", validateToken, essController.getEmployeeDocuments);
router.post("/documents", validateToken, essController.uploadDocument);
router.delete("/documents/:id", validateToken, essController.deleteDocument);

// ==================== MY CONTRACTS ====================
router.get("/my-contracts", validateToken, essController.getMyContracts);
router.get("/employees/:employeeId/contracts", validateToken, essController.getEmployeeContracts);

// ==================== EMPLOYEE REQUESTS ====================
router.get("/my-requests", validateToken, essController.getMyRequests);
router.get("/requests", validateToken, checkPermission("manage_settings"), essController.getEmployeeRequests);
router.post("/requests", validateToken, essController.createRequest);
router.put("/requests/:id", validateToken, essController.updateRequest);
router.get("/request-types", validateToken, essController.getRequestTypes);

// ==================== ANNOUNCEMENTS ====================
router.get("/announcements", validateToken, essController.getInternalAnnouncements);
router.get("/announcements/all", validateToken, checkPermission("manage_settings"), essController.getAllAnnouncements);
router.post("/announcements", validateToken, checkPermission("manage_settings"), essController.createAnnouncement);
router.put("/announcements/:id", validateToken, checkPermission("manage_settings"), essController.updateAnnouncement);
router.post("/announcements/:announcementId/read", validateToken, essController.markAnnouncementAsRead);

// ==================== FEEDBACK ====================
router.get("/my-feedback", validateToken, essController.getMyFeedback);
router.get("/feedback", validateToken, checkPermission("manage_settings"), essController.getAllFeedback);
router.post("/feedback", validateToken, essController.createFeedback);
router.put("/feedback/:id", validateToken, checkPermission("manage_settings"), essController.updateFeedback);

// ==================== CAREER HISTORY ====================
router.get("/employees/:employeeId/history", validateToken, essController.getEmployeeHistory);
router.post("/history", validateToken, checkPermission("update_employee"), essController.createEmployeeHistory);

// ==================== DEPENDENTS ====================
router.get("/employees/:employeeId/dependents", validateToken, essController.getEmployeeDependents);
router.post("/dependents", validateToken, essController.createEmployeeDependent);
router.put("/dependents/:id", validateToken, essController.updateEmployeeDependent);
router.delete("/dependents/:id", validateToken, essController.deleteEmployeeDependent);

export default router;
