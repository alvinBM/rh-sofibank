import express from "express";
import * as recruitmentController from "../controllers/recruitmentController.js";
import validateToken from "../middlewares/validateToken.js";
import checkPermission from "../middlewares/checkPermission.js";
import uploadApplicationFiles from "../helpers/uploadApplicationFiles.js";

const router = express.Router();

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================

// Get single job posting (public)
router.get("/postings/:id/public", recruitmentController.getJobPostingById);

// Submit job application (public with file upload)
router.post(
    "/applications/public",
    function (req, res, next) {
        uploadApplicationFiles(req, res, function (err) {
            console.log("EQUETTE ******** ", req);
            if (err) {
                return res.status(200).json({
                    status: 400,
                    message: "Erreur lors du téléchargement du logo de votre compte : " + err.message,
                });
            }
            next();
        });
    },
    recruitmentController.createPublicJobApplication
);

// Apply authentication to all other recruitment routes
router.use(validateToken);

// ========================================
// RECRUITMENT PLAN ROUTES (Stage 1)
// ========================================

// Get all recruitment plans
router.get("/plans", checkPermission("recruitment.view"), recruitmentController.getRecruitmentPlans);

// Get single recruitment plan
router.get("/plans/:id", checkPermission("recruitment.view"), recruitmentController.getRecruitmentPlanById);

// Create recruitment plan
router.post("/plans", checkPermission("recruitment.create"), recruitmentController.createRecruitmentPlan);

// Update recruitment plan
router.put("/plans/:id", checkPermission("recruitment.edit"), recruitmentController.updateRecruitmentPlan);

// Submit plan for approval
router.post("/plans/:id/submit", checkPermission("recruitment.edit"), recruitmentController.submitRecruitmentPlan);

// Approve/reject plan
router.post("/plans/:id/approve", checkPermission("recruitment.approve"), recruitmentController.approveRecruitmentPlan);

// Add position to plan
router.post("/plans/:id/positions", checkPermission("recruitment.edit"), recruitmentController.addPositionToPlan);

// Update plan position
router.put("/plan-positions/:positionId", checkPermission("recruitment.edit"), recruitmentController.updatePlanPosition);

// Delete plan position
router.delete("/plan-positions/:positionId", checkPermission("recruitment.delete"), recruitmentController.deletePlanPosition);

// ========================================
// JOB POSTING ROUTES (Stage 2)
// ========================================

// Get all job postings
router.get("/postings", checkPermission("recruitment.view"), recruitmentController.getJobPostings);

// Get single job posting
router.get("/postings/:id", checkPermission("recruitment.view"), recruitmentController.getJobPostingById);

// Create job posting
router.post("/postings", checkPermission("recruitment.create"), recruitmentController.createJobPosting);

// Update job posting
router.put("/postings/:id", checkPermission("recruitment.edit"), recruitmentController.updateJobPosting);

// Publish job posting
router.post("/postings/:id/publish", checkPermission("recruitment.approve"), recruitmentController.publishJobPosting);

// Close job posting
router.post("/postings/:id/close", checkPermission("recruitment.edit"), recruitmentController.closeJobPosting);

// ========================================
// JOB APPLICATION ROUTES (Stage 3)
// ========================================

// Get all applications
router.get("/applications", checkPermission("recruitment.view"), recruitmentController.getJobApplications);

// Get single application
router.get("/applications/:id", checkPermission("recruitment.view"), recruitmentController.getJobApplicationById);

// Create application (manual entry)
router.post("/applications", checkPermission("recruitment.create"), recruitmentController.createJobApplication);

// Update application
router.put("/applications/:id", checkPermission("recruitment.edit"), recruitmentController.updateJobApplication);

// Assign application to user
router.post("/applications/:id/assign", checkPermission("recruitment.edit"), recruitmentController.assignApplication);

// Rate application
router.post("/applications/:id/rate", checkPermission("recruitment.edit"), recruitmentController.rateApplication);

// ========================================
// INTERVIEW ROUTES (Stage 3)
// ========================================

// Get all interviews with filters and pagination
router.get("/interviews", checkPermission("recruitment.view"), recruitmentController.getAllInterviews);

// Get interviews for application
router.get("/applications/:applicationId/interviews", checkPermission("recruitment.view"), recruitmentController.getInterviewsForApplication);

// Schedule interview
router.post("/interviews", checkPermission("recruitment.edit"), recruitmentController.scheduleInterview);

// Update interview
router.put("/interviews/:id", checkPermission("recruitment.edit"), recruitmentController.updateInterview);

// Get evaluations for interview
router.get("/interviews/:interviewId/evaluations", checkPermission("recruitment.view"), recruitmentController.getEvaluationsForInterview);

// Submit interview evaluation
router.post("/evaluations", checkPermission("recruitment.edit"), recruitmentController.submitInterviewEvaluation);

// ========================================
// EMPLOYMENT OFFER ROUTES (Stage 4)
// ========================================

// Get all employment offers
router.get("/offers", checkPermission("recruitment.view"), recruitmentController.getEmploymentOffers);

// Get single employment offer
router.get("/offers/:id", checkPermission("recruitment.view"), recruitmentController.getEmploymentOfferById);

// Create employment offer
router.post("/offers", checkPermission("recruitment.create"), recruitmentController.createEmploymentOffer);

// Update employment offer
router.put("/offers/:id", checkPermission("recruitment.edit"), recruitmentController.updateEmploymentOffer);

// Approve employment offer
router.post("/offers/:id/approve", checkPermission("recruitment.approve"), recruitmentController.approveEmploymentOffer);

// Send employment offer
router.post("/offers/:id/send", checkPermission("recruitment.edit"), recruitmentController.sendEmploymentOffer);

// Candidate response to offer
router.post("/offers/:id/respond", checkPermission("recruitment.edit"), recruitmentController.respondToOffer);

// ========================================
// ONBOARDING ROUTES (Stage 5)
// ========================================

// Get all onboarding checklists
router.get("/onboarding", checkPermission("recruitment.view"), recruitmentController.getOnboardingChecklists);

// Get single onboarding checklist
router.get("/onboarding/:id", checkPermission("recruitment.view"), recruitmentController.getOnboardingChecklistById);

// Create onboarding checklist
router.post("/onboarding", checkPermission("recruitment.create"), recruitmentController.createOnboardingChecklist);

// Update onboarding checklist
router.put("/onboarding/:id", checkPermission("recruitment.edit"), recruitmentController.updateOnboardingChecklist);

// Add task to checklist
router.post("/onboarding/:checklistId/tasks", checkPermission("recruitment.edit"), recruitmentController.addOnboardingTask);

// Update onboarding task
router.put("/tasks/:taskId", checkPermission("recruitment.edit"), recruitmentController.updateOnboardingTask);

// Get task templates
router.get("/task-templates", checkPermission("recruitment.view"), recruitmentController.getTaskTemplates);

// Create task template
router.post("/task-templates", checkPermission("recruitment.admin"), recruitmentController.createTaskTemplate);

// ========================================
// EMAIL MANAGEMENT ROUTES
// ========================================

// Get email templates
router.get("/email-templates", checkPermission("recruitment.view"), recruitmentController.getEmailTemplates);

// Get sent emails
router.get("/sent-emails", checkPermission("recruitment.view"), recruitmentController.getSentEmails);

// Get recruitment emails (incoming)
router.get("/recruitment-emails", checkPermission("recruitment.view"), recruitmentController.getRecruitmentEmails);

// Update recruitment email status
router.put("/recruitment-emails/:id", checkPermission("recruitment.edit"), recruitmentController.updateRecruitmentEmailStatus);

// ========================================
// STATISTICS & REPORTS
// ========================================

// Get recruitment statistics
router.get("/statistics", checkPermission("recruitment.view"), recruitmentController.getRecruitmentStatistics);

export default router;
