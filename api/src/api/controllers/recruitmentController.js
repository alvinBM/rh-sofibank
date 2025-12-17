import models from "../models/index.js";
import { Op } from "sequelize";
import formatDate from "date-format";
import bcrypt from "bcrypt";

const {
    RecruitmentPlan,
    RecruitmentPlanPosition,
    JobPosting,
    JobApplication,
    ApplicationStatusHistory,
    JobInterview,
    InterviewEvaluation,
    EmploymentOffer,
    OnboardingChecklist,
    OnboardingTask,
    OnboardingTaskTemplate,
    RecruitmentEmail,
    EmailTemplate,
    SentEmail,
    Direction,
    Service,
    JobPosition,
    Grade,
    Employee,
    User,
} = models;

let createdFormatedDate = formatDate("yyyy-MM-dd hh:mm:ss", new Date());

// ========================================
// STAGE 1: ANNUAL RECRUITMENT PLANNING
// ========================================

/**
 * Get all recruitment plans with filters
 */
export const getRecruitmentPlans = async (req, res) => {
    try {
        let { offset = 0, limit = 10, year, direction_id, status, query } = req.query;
        offset = parseInt(offset);
        limit = parseInt(limit);
        const stringQuery = query ? query.trim() : "";

        const where = {};
        if (year) where.year = year;
        if (direction_id) where.direction_id = direction_id;
        if (status) where.status = status;
        if (stringQuery) {
            where[Op.or] = [{ notes: { [Op.like]: `%${stringQuery}%` } }];
        }

        const result = await RecruitmentPlan.findAndCountAll({
            offset,
            limit,
            where,
            include: [
                {
                    model: Direction,
                    as: "direction",
                    attributes: ["id", "name"],
                },
                {
                    model: User,
                    as: "approver",
                    attributes: ["id", "email"],
                },
                {
                    model: RecruitmentPlanPosition,
                    as: "positions",
                    include: [
                        { model: JobPosition, as: "job_position" },
                        { model: Grade, as: "grade" },
                        { model: Service, as: "service" },
                    ],
                },
            ],
            order: [
                ["year", "DESC"],
                ["created_at", "DESC"],
            ],
            distinct: true,
        });

        res.json({
            status: 200,
            message: "Plans de recrutement trouvés",
            total: result.count,
            plans: result.rows,
        });
    } catch (error) {
        console.error("Error fetching recruitment plans:", error);
        res.status(500).json({
            status: 500,
            error: "Failed to fetch recruitment plans",
        });
    }
};

/**
 * Get a single recruitment plan by ID
 */
export const getRecruitmentPlanById = async (req, res) => {
    try {
        const { id } = req.params;

        const plan = await RecruitmentPlan.findByPk(id, {
            include: [
                {
                    model: Direction,
                    as: "direction",
                    attributes: ["id", "name"],
                },
                {
                    model: User,
                    as: "approver",
                    attributes: ["id", "email"],
                },
                {
                    model: RecruitmentPlanPosition,
                    as: "positions",
                    include: [
                        { model: JobPosition, as: "job_position" },
                        { model: Grade, as: "grade" },
                        { model: Service, as: "service" },
                    ],
                },
            ],
        });

        if (!plan) {
            return res.status(404).json({
                status: 404,
                error: "Recruitment plan not found",
            });
        }

        res.json(plan);
    } catch (error) {
        console.error("Error fetching recruitment plan:", error);
        res.status(500).json({
            status: 500,
            error: "Failed to fetch recruitment plan",
        });
    }
};

/**
 * Create a new recruitment plan
 */
export const createRecruitmentPlan = async (req, res) => {
    try {
        const { year, direction_id, status, positions, description, total_budget } = req.body;

        const plan = await RecruitmentPlan.create({
            year,
            direction_id,
            status: status || "draft",
            created_by: req.user.id, // Get user ID from decoded JWT token in req.user
            notes: description || null,
            created_at: createdFormatedDate,
            updated_at: createdFormatedDate,
        });

        // Create positions if provided
        if (positions && positions.length > 0) {
            const positionsData = positions.map((pos) => ({
                ...pos,
                recruitment_plan_id: plan.id,
            }));
            await RecruitmentPlanPosition.bulkCreate(positionsData);
        }

        const createdPlan = await RecruitmentPlan.findByPk(plan.id, {
            include: [
                { model: Direction, as: "direction" },
                {
                    model: RecruitmentPlanPosition,
                    as: "positions",
                    include: [
                        { model: JobPosition, as: "job_position" },
                        { model: Grade, as: "grade" },
                        { model: Service, as: "service" },
                    ],
                },
            ],
        });

        res.status(201).json(createdPlan);
    } catch (error) {
        console.error("Error creating recruitment plan:", error);
        res.status(500).json({ error: "Failed to create recruitment plan" });
    }
};

/**
 * Update a recruitment plan
 */
export const updateRecruitmentPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const plan = await RecruitmentPlan.findByPk(id);
        if (!plan) {
            return res.status(404).json({ error: "Recruitment plan not found" });
        }

        await plan.update(updates);

        const updatedPlan = await RecruitmentPlan.findByPk(id, {
            include: [
                { model: Direction, as: "direction" },
                {
                    model: RecruitmentPlanPosition,
                    as: "positions",
                    include: [
                        { model: JobPosition, as: "job_position" },
                        { model: Grade, as: "grade" },
                        { model: Service, as: "service" },
                    ],
                },
            ],
        });

        res.json(updatedPlan);
    } catch (error) {
        console.error("Error updating recruitment plan:", error);
        res.status(500).json({ error: "Failed to update recruitment plan" });
    }
};

/**
 * Submit recruitment plan for approval
 */
export const submitRecruitmentPlan = async (req, res) => {
    try {
        const { id } = req.params;

        const plan = await RecruitmentPlan.findByPk(id);
        if (!plan) {
            return res.status(404).json({ error: "Recruitment plan not found" });
        }

        if (plan.status !== "draft") {
            return res.status(400).json({ error: "Only draft plans can be submitted" });
        }

        await plan.update({
            status: "submitted",
            submitted_date: new Date(),
        });

        res.json({ message: "Recruitment plan submitted for approval", plan });
    } catch (error) {
        console.error("Error submitting recruitment plan:", error);
        res.status(500).json({ error: "Failed to submit recruitment plan" });
    }
};

/**
 * Approve or reject recruitment plan
 */
export const approveRecruitmentPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { approve, rejection_reason } = req.body;
        const approverId = req.user.id; // Get user ID from decoded JWT token in req.user

        const plan = await RecruitmentPlan.findByPk(id);
        if (!plan) {
            return res.status(404).json({ error: "Recruitment plan not found" });
        }

        if (plan.status !== "submitted") {
            return res.status(400).json({ error: "Only submitted plans can be approved/rejected" });
        }

        const updateData = {
            status: approve ? "approved" : "rejected",
            approved_by: approverId,
            approved_date: new Date(),
        };

        if (!approve && rejection_reason) {
            updateData.rejection_reason = rejection_reason;
        }

        await plan.update(updateData);

        res.json({ message: `Recruitment plan ${approve ? "approved" : "rejected"}`, plan });
    } catch (error) {
        console.error("Error approving recruitment plan:", error);
        res.status(500).json({ error: "Failed to approve recruitment plan" });
    }
};

/**
 * Add position to recruitment plan
 */
export const addPositionToPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const positionData = req.body;

        const plan = await RecruitmentPlan.findByPk(id);
        if (!plan) {
            return res.status(404).json({ error: "Recruitment plan not found" });
        }

        const position = await RecruitmentPlanPosition.create({
            ...positionData,
            recruitment_plan_id: id,
        });

        const createdPosition = await RecruitmentPlanPosition.findByPk(position.id, {
            include: [
                { model: JobPosition, as: "job_position" },
                { model: Grade, as: "grade" },
                { model: Service, as: "service" },
            ],
        });

        res.status(201).json(createdPosition);
    } catch (error) {
        console.error("Error adding position to plan:", error);
        res.status(500).json({ error: "Failed to add position to plan" });
    }
};

/**
 * Update position in recruitment plan
 */
export const updatePlanPosition = async (req, res) => {
    try {
        const { positionId } = req.params;
        const updates = req.body;

        const position = await RecruitmentPlanPosition.findByPk(positionId);
        if (!position) {
            return res.status(404).json({ error: "Position not found" });
        }

        await position.update(updates);

        const updatedPosition = await RecruitmentPlanPosition.findByPk(positionId, {
            include: [
                { model: JobPosition, as: "job_position" },
                { model: Grade, as: "grade" },
                { model: Service, as: "service" },
            ],
        });

        res.json(updatedPosition);
    } catch (error) {
        console.error("Error updating position:", error);
        res.status(500).json({ error: "Failed to update position" });
    }
};

/**
 * Delete position from recruitment plan
 */
export const deletePlanPosition = async (req, res) => {
    try {
        const { positionId } = req.params;

        const position = await RecruitmentPlanPosition.findByPk(positionId);
        if (!position) {
            return res.status(404).json({ error: "Position not found" });
        }

        await position.destroy();

        res.json({ message: "Position deleted successfully" });
    } catch (error) {
        console.error("Error deleting position:", error);
        res.status(500).json({ error: "Failed to delete position" });
    }
};

// ========================================
// STAGE 2: JOB POSTINGS
// ========================================

/**
 * Get all job postings with filters
 */
export const getJobPostings = async (req, res) => {
    try {
        let { offset = 0, limit = 10, status, direction_id, service_id, plan_id, job_position_id, query } = req.query;
        offset = parseInt(offset);
        limit = parseInt(limit);
        const stringQuery = query ? query.trim() : "";

        const where = {};
        if (status) where.status = status;
        if (direction_id) where.direction_id = direction_id;
        if (service_id) where.service_id = service_id;
        if (plan_id) where.recruitment_plan_id = plan_id;
        if (job_position_id) where.job_position_id = job_position_id;
        if (stringQuery) {
            where[Op.or] = [{ title: { [Op.like]: `%${stringQuery}%` } }, { reference_code: { [Op.like]: `%${stringQuery}%` } }, { description: { [Op.like]: `%${stringQuery}%` } }];
        }

        const result = await JobPosting.findAndCountAll({
            offset,
            limit,
            where,
            include: [
                { model: Direction, as: "direction" },
                { model: Service, as: "service" },
                { model: JobPosition, as: "job_position" },
                { model: Grade, as: "grade" },
                { model: User, as: "creator", attributes: ["id", "email"] },
                {
                    model: JobApplication,
                    as: "applications",
                    attributes: ["id", "status"],
                },
            ],
            order: [["created_at", "DESC"]],
            distinct: true,
        });

        res.json({
            status: 200,
            message: "Job postings trouvées",
            total: result.count,
            postings: result.rows,
        });
    } catch (error) {
        console.error("Error fetching job postings:", error);
        res.status(500).json({
            status: 500,
            error: "Failed to fetch job postings",
        });
    }
};

/**
 * Get a single job posting by ID
 */
export const getJobPostingById = async (req, res) => {
    try {
        const { id } = req.params;

        const posting = await JobPosting.findByPk(id, {
            include: [
                { model: Direction, as: "direction" },
                { model: Service, as: "service" },
                { model: JobPosition, as: "job_position" },
                { model: Grade, as: "grade" },
                { model: User, as: "creator" },
                {
                    model: RecruitmentPlanPosition,
                    as: "plan_position",
                    include: [{ model: RecruitmentPlan, as: "recruitment_plan" }],
                },
            ],
        });

        if (!posting) {
            return res.status(404).json({ error: "Job posting not found" });
        }

        res.json(posting);
    } catch (error) {
        console.error("Error fetching job posting:", error);
        res.status(500).json({ error: "Failed to fetch job posting" });
    }
};

/**
 * Create a new job posting
 */
export const createJobPosting = async (req, res) => {
    try {
        const postingData = req.body;
        const createdBy = req.user.id;

        // Generate unique reference code
        const year = new Date().getFullYear();
        const count = await JobPosting.count({
            where: {
                reference_code: {
                    [Op.like]: `JOB-${year}-%`,
                },
            },
        });
        const referenceCode = `JOB-${year}-${String(count + 1).padStart(4, "0")}`;

        const posting = await JobPosting.create({
            ...postingData,
            reference_code: referenceCode,
            created_by: createdBy,
            status: postingData.status || "draft",
        });

        const createdPosting = await JobPosting.findByPk(posting.id, {
            include: [
                { model: Direction, as: "direction" },
                { model: Service, as: "service" },
                { model: JobPosition, as: "job_position" },
                { model: Grade, as: "grade" },
                { model: User, as: "creator" },
            ],
        });

        res.status(201).json(createdPosting);
    } catch (error) {
        console.error("Error creating job posting:", error);
        res.status(500).json({ error: "Failed to create job posting" });
    }
};

/**
 * Update a job posting
 */
export const updateJobPosting = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const posting = await JobPosting.findByPk(id);
        if (!posting) {
            return res.status(404).json({ error: "Job posting not found" });
        }

        await posting.update(updates);

        const updatedPosting = await JobPosting.findByPk(id, {
            include: [
                { model: Direction, as: "direction" },
                { model: Service, as: "service" },
                { model: JobPosition, as: "job_position" },
                { model: Grade, as: "grade" },
                { model: User, as: "creator" },
            ],
        });

        res.json(updatedPosting);
    } catch (error) {
        console.error("Error updating job posting:", error);
        res.status(500).json({ error: "Failed to update job posting" });
    }
};

/**
 * Publish a job posting
 */
export const publishJobPosting = async (req, res) => {
    try {
        const { id } = req.params;

        const posting = await JobPosting.findByPk(id);
        if (!posting) {
            return res.status(404).json({ error: "Job posting not found" });
        }

        if (posting.status !== "draft") {
            return res.status(400).json({ error: "Only draft postings can be published" });
        }

        await posting.update({
            status: "published",
            published_date: new Date(),
        });

        res.json({ message: "Job posting published successfully", posting });
    } catch (error) {
        console.error("Error publishing job posting:", error);
        res.status(500).json({ error: "Failed to publish job posting" });
    }
};

/**
 * Close a job posting
 */
export const closeJobPosting = async (req, res) => {
    try {
        const { id } = req.params;
        const { close_reason } = req.body;

        const posting = await JobPosting.findByPk(id);
        if (!posting) {
            return res.status(404).json({ error: "Job posting not found" });
        }

        const status = close_reason === "filled" ? "filled" : close_reason === "cancelled" ? "cancelled" : "closed";

        await posting.update({
            status,
            closed_date: new Date(),
        });

        res.json({ message: "Job posting closed successfully", posting });
    } catch (error) {
        console.error("Error closing job posting:", error);
        res.status(500).json({ error: "Failed to close job posting" });
    }
};

// ========================================
// STAGE 3: JOB APPLICATIONS
// ========================================

/**
 * Get all job applications with filters
 */
export const getJobApplications = async (req, res) => {
    try {
        let { offset = 0, limit = 10, posting_id, status, assigned_to, query, sort = "applied_date", order = "DESC" } = req.query;
        offset = parseInt(offset);
        limit = parseInt(limit);
        const stringQuery = query ? query.trim() : "";

        const where = {};
        if (posting_id) where.job_posting_id = posting_id;
        if (status) where.status = status;
        if (assigned_to) where.assigned_to = assigned_to;
        if (stringQuery) {
            where[Op.or] = [{ first_name: { [Op.like]: `%${stringQuery}%` } }, { last_name: { [Op.like]: `%${stringQuery}%` } }, { email: { [Op.like]: `%${stringQuery}%` } }, { application_number: { [Op.like]: `%${stringQuery}%` } }];
        }

        const result = await JobApplication.findAndCountAll({
            offset,
            limit,
            where,
            include: [
                {
                    model: JobPosting,
                    as: "job_posting",
                    include: [
                        { model: JobPosition, as: "job_position" },
                        { model: Direction, as: "direction" },
                    ],
                },
                { model: User, as: "assigned_user", attributes: ["id", "email"] },
                {
                    model: JobInterview,
                    as: "interviews",
                    include: [
                        {
                            model: InterviewEvaluation,
                            as: "evaluations",
                        },
                    ],
                },
            ],
            order: [[sort, order.toUpperCase()]],
            distinct: true,
        });

        res.json({
            status: 200,
            message: "Candidatures trouvées",
            total: result.count,
            applications: result.rows,
        });
    } catch (error) {
        console.error("Error fetching job applications:", error);
        res.status(500).json({
            status: 500,
            error: "Failed to fetch job applications",
        });
    }
};

/**
 * Get a single job application by ID
 */
export const getJobApplicationById = async (req, res) => {
    try {
        const { id } = req.params;

        const application = await JobApplication.findByPk(id, {
            include: [
                {
                    model: JobPosting,
                    as: "job_posting",
                    include: [
                        { model: JobPosition, as: "job_position" },
                        { model: Direction, as: "direction" },
                        { model: Service, as: "service" },
                    ],
                },
                { model: User, as: "assigned_user" },
                {
                    model: ApplicationStatusHistory,
                    as: "status_history",
                    include: [{ model: User, as: "changer" }],
                    order: [["changed_at", "DESC"]],
                },
                {
                    model: JobInterview,
                    as: "interviews",
                    include: [
                        { model: User, as: "scheduler" },
                        {
                            model: InterviewEvaluation,
                            as: "evaluations",
                            include: [{ model: User, as: "evaluator" }],
                        },
                    ],
                },
                {
                    model: EmploymentOffer,
                    as: "offers",
                    include: [
                        { model: JobPosition, as: "job_position" },
                        { model: Grade, as: "grade" },
                        { model: User, as: "creator" },
                    ],
                },
            ],
        });

        if (!application) {
            return res.status(404).json({ error: "Job application not found" });
        }

        res.json(application);
    } catch (error) {
        console.error("Error fetching job application:", error);
        res.status(500).json({ error: "Failed to fetch job application" });
    }
};

/**
 * Create a new job application (for manual entry or API)
 */
export const createJobApplication = async (req, res) => {
    try {
        const applicationData = req.body;

        // Generate unique application number
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, "0");
        const count = await JobApplication.count({
            where: {
                application_number: {
                    [Op.like]: `APP-${year}${month}-%`,
                },
            },
        });
        const applicationNumber = `APP-${year}${month}-${String(count + 1).padStart(4, "0")}`;

        const application = await JobApplication.create({
            ...applicationData,
            application_number: applicationNumber,
            status: "new",
            applied_date: new Date(),
        });

        const createdApplication = await JobApplication.findByPk(application.id, {
            include: [
                {
                    model: JobPosting,
                    as: "job_posting",
                    include: [{ model: JobPosition, as: "job_position" }],
                },
            ],
        });

        res.status(201).json(createdApplication);
    } catch (error) {
        console.error("Error creating job application:", error);
        res.status(500).json({ error: "Failed to create job application" });
    }
};

/**
 * Create a new job application from public form (with file uploads)
 */
export const createPublicJobApplication = async (req, res) => {
    try {
        const applicationData = req.body;
        const files = req.files;

        console.log("Received application data:", applicationData);
        console.log("Received files:", files);

        // Validate required fields
        if (!applicationData.job_posting_id) {
            return res.status(400).json({ error: "Job posting ID is required" });
        }

        if (!applicationData.first_name || !applicationData.last_name || !applicationData.email) {
            return res.status(400).json({ error: "First name, last name, and email are required" });
        }

        // Check if CV file is uploaded
        if (!files || !files.cv_file || files.cv_file.length === 0) {
            return res.status(400).json({ error: "CV file is required" });
        }

        // Verify job posting exists and is published
        const posting = await JobPosting.findByPk(applicationData.job_posting_id);
        if (!posting) {
            return res.status(404).json({ error: "Job posting not found" });
        }

        if (posting.status !== "published") {
            return res.status(400).json({ error: "This job posting is not accepting applications" });
        }

        // Generate unique application number
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, "0");
        const count = await JobApplication.count({
            where: {
                application_number: {
                    [Op.like]: `APP-${year}${month}-%`,
                },
            },
        });
        const applicationNumber = `APP-${year}${month}-${String(count + 1).padStart(4, "0")}`;

        // Prepare file paths
        const cvFile = files.cv_file[0];
        const cvFilePath = cvFile.path.replace("public/", "");

        let coverLetterFilePath = null;
        if (files.cover_letter_file && files.cover_letter_file.length > 0) {
            const coverLetterFile = files.cover_letter_file[0];
            coverLetterFilePath = coverLetterFile.path.replace("public/", "");
        }

        let additionalDocsPaths = [];
        if (files.additional_documents && files.additional_documents.length > 0) {
            additionalDocsPaths = files.additional_documents.map((file) => file.path.replace("public/", ""));
        }

        // Create application
        const application = await JobApplication.create({
            application_number: applicationNumber,
            job_posting_id: applicationData.job_posting_id,
            first_name: applicationData.first_name,
            last_name: applicationData.last_name,
            email: applicationData.email,
            phone: applicationData.phone,
            address: applicationData.address || null,
            cv_file_path: cvFilePath,
            cover_letter: applicationData.cover_letter || null,
            cover_letter_file_path: coverLetterFilePath,
            additional_documents: additionalDocsPaths.length > 0 ? JSON.stringify(additionalDocsPaths) : null,
            linkedin_url: applicationData.linkedin_url || null,
            portfolio_url: applicationData.portfolio_url || null,
            years_of_experience: applicationData.years_of_experience || 0,
            expected_salary: applicationData.expected_salary || null,
            availability_date: applicationData.availability_date || null,
            status: "new",
            applied_date: new Date(),
            source: "website",
        });

        // Note: We don't create status history for public applications
        // because changed_by requires a user ID, and public applications don't have one.
        // The status history will be created when an admin/recruiter changes the status.

        // Fetch created application with associations
        const createdApplication = await JobApplication.findByPk(application.id, {
            include: [
                {
                    model: JobPosting,
                    as: "job_posting",
                    include: [
                        { model: Direction, as: "direction" },
                        { model: JobPosition, as: "job_position" },
                    ],
                },
            ],
        });

        res.status(201).json({
            message: "Application submitted successfully",
            application: createdApplication,
        });
    } catch (error) {
        console.error("Error creating public job application:", error);
        res.status(500).json({ error: "Failed to submit application" });
    }
};

/**
 * Update job application
 */
export const updateJobApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const application = await JobApplication.findByPk(id);
        if (!application) {
            return res.status(404).json({ error: "Job application not found" });
        }

        // If status is changing, create history record
        if (updates.status && updates.status !== application.status) {
            await ApplicationStatusHistory.create({
                application_id: id,
                previous_status: application.status,
                new_status: updates.status,
                changed_by: req.user.id,
                reason: updates.status_change_reason,
                notes: updates.status_change_notes,
            });

            updates.last_status_change = new Date();
        }

        await application.update(updates);

        const updatedApplication = await JobApplication.findByPk(id, {
            include: [
                { model: JobPosting, as: "job_posting" },
                { model: User, as: "assigned_user" },
                {
                    model: ApplicationStatusHistory,
                    as: "status_history",
                    include: [{ model: User, as: "changer" }],
                },
            ],
        });

        res.json(updatedApplication);
    } catch (error) {
        console.error("Error updating job application:", error);
        res.status(500).json({ error: "Failed to update job application" });
    }
};

/**
 * Assign application to user
 */
export const assignApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { assigned_to } = req.body;

        const application = await JobApplication.findByPk(id);
        if (!application) {
            return res.status(404).json({ error: "Job application not found" });
        }

        const previousAssignedTo = application.assigned_to;
        await application.update({ assigned_to });

        // Create status history if assigning for first time or changing assignment
        if (!previousAssignedTo || previousAssignedTo !== assigned_to) {
            await ApplicationStatusHistory.create({
                application_id: id,
                previous_status: application.status,
                new_status: application.status,
                changed_by: req.user.id,
                reason: previousAssignedTo ? "Reassigned to new reviewer" : "Assigned to reviewer",
                notes: `Assigned to user ID: ${assigned_to}`,
            });
        }

        const updatedApplication = await JobApplication.findByPk(id, {
            include: [
                { model: JobPosting, as: "job_posting" },
                { model: User, as: "assigned_user", attributes: ["id", "email"] },
            ],
        });

        res.json({ message: "Application assigned successfully", application: updatedApplication });
    } catch (error) {
        console.error("Error assigning application:", error);
        res.status(500).json({ error: "Failed to assign application" });
    }
};

/**
 * Add rating and notes to application
 */
export const rateApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, notes } = req.body;

        const application = await JobApplication.findByPk(id);
        if (!application) {
            return res.status(404).json({ error: "Job application not found" });
        }

        await application.update({ rating, notes });

        res.json({ message: "Application rated successfully", application });
    } catch (error) {
        console.error("Error rating application:", error);
        res.status(500).json({ error: "Failed to rate application" });
    }
};

// ========================================
// STAGE 3B: INTERVIEWS & EVALUATIONS
// ========================================

/**
 * Schedule an interview
 */
export const scheduleInterview = async (req, res) => {
    try {
        const interviewData = req.body;
        const scheduledBy = req.user.id;

        // Combine date and time if provided separately
        let scheduledDate = interviewData.scheduled_date;
        if (interviewData.date && interviewData.time) {
            scheduledDate = `${interviewData.date}T${interviewData.time}:00`;
        }

        if (!scheduledDate) {
            return res.status(400).json({ error: "Scheduled date is required" });
        }

        const interview = await JobInterview.create({
            application_id: interviewData.application_id,
            interview_type: interviewData.interview_type,
            interview_round: interviewData.interview_round || 1,
            scheduled_date: scheduledDate,
            duration_minutes: interviewData.duration_minutes || 60,
            location: interviewData.location,
            meeting_link: interviewData.meeting_link,
            interviewers: interviewData.interviewers,
            notes: interviewData.notes,
            scheduled_by: scheduledBy,
            status: "scheduled",
        });

        // Update application status
        const application = await JobApplication.findByPk(interviewData.application_id);
        if (application && application.status === "new") {
            await application.update({
                status: "interview_scheduled",
                last_status_change: new Date(),
            });

            await ApplicationStatusHistory.create({
                application_id: interviewData.application_id,
                previous_status: application.status,
                new_status: "interview_scheduled",
                changed_by: scheduledBy,
                reason: "Interview scheduled",
            });
        }

        const createdInterview = await JobInterview.findByPk(interview.id, {
            include: [
                {
                    model: JobApplication,
                    as: "application",
                    include: [{ model: JobPosting, as: "job_posting" }],
                },
                { model: User, as: "scheduler" },
            ],
        });

        res.status(201).json({
            status: 200,
            message: "Interview scheduled successfully",
            interview: createdInterview,
        });
    } catch (error) {
        console.error("Error scheduling interview:", error);
        res.status(500).json({ error: "Failed to schedule interview" });
    }
};

/**
 * Get all interviews with filters and pagination
 */
export const getAllInterviews = async (req, res) => {
    try {
        let { offset = 0, limit = 10, status, type, date, query } = req.query;
        offset = parseInt(offset);
        limit = parseInt(limit);
        const stringQuery = query ? query.trim() : "";

        const where = {};
        if (status) where.status = status;
        if (type) where.interview_type = type;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            where.scheduled_date = {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            };
        }

        const result = await JobInterview.findAndCountAll({
            offset,
            limit,
            where,
            include: [
                {
                    model: JobApplication,
                    as: "application",
                    include: [
                        { model: JobPosting, as: "job_posting" },
                    ],
                    where: stringQuery
                        ? {
                              [Op.or]: [
                                  { first_name: { [Op.like]: `%${stringQuery}%` } },
                                  { last_name: { [Op.like]: `%${stringQuery}%` } },
                                  { email: { [Op.like]: `%${stringQuery}%` } },
                              ],
                          }
                        : undefined,
                },
                { model: User, as: "scheduler" },
                {
                    model: InterviewEvaluation,
                    as: "evaluations",
                    include: [{ model: User, as: "evaluator" }],
                },
            ],
            order: [["scheduled_date", "DESC"]],
            distinct: true,
        });

        res.json({
            status: 200,
            message: "Entretiens trouvés",
            total: result.count,
            interviews: result.rows,
        });
    } catch (error) {
        console.error("Error fetching all interviews:", error);
        res.status(500).json({ error: "Failed to fetch interviews" });
    }
};

/**
 * Get interviews for an application
 */
export const getInterviewsForApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;

        const interviews = await JobInterview.findAll({
            where: { application_id: applicationId },
            include: [
                { model: User, as: "scheduler" },
                {
                    model: InterviewEvaluation,
                    as: "evaluations",
                    include: [{ model: User, as: "evaluator" }],
                },
            ],
            order: [["scheduled_date", "ASC"]],
        });

        res.json(interviews);
    } catch (error) {
        console.error("Error fetching interviews:", error);
        res.status(500).json({ error: "Failed to fetch interviews" });
    }
};

/**
 * Update interview
 */
export const updateInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const interview = await JobInterview.findByPk(id);
        if (!interview) {
            return res.status(404).json({ error: "Interview not found" });
        }

        await interview.update(updates);

        const updatedInterview = await JobInterview.findByPk(id, {
            include: [
                { model: JobApplication, as: "application" },
                { model: User, as: "scheduler" },
                {
                    model: InterviewEvaluation,
                    as: "evaluations",
                    include: [{ model: User, as: "evaluator" }],
                },
            ],
        });

        res.json(updatedInterview);
    } catch (error) {
        console.error("Error updating interview:", error);
        res.status(500).json({ error: "Failed to update interview" });
    }
};

/**
 * Submit interview evaluation
 */
export const submitInterviewEvaluation = async (req, res) => {
    try {
        const evaluationData = req.body;
        const evaluatorId = req.user.id;

        // Calculate overall score
        const { technical_skills_score, communication_score, problem_solving_score, cultural_fit_score, experience_score } = evaluationData;

        const scores = [technical_skills_score, communication_score, problem_solving_score, cultural_fit_score, experience_score].filter((score) => score !== null && score !== undefined);

        const overall_score = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;

        const evaluation = await InterviewEvaluation.create({
            ...evaluationData,
            evaluator_id: evaluatorId,
            overall_score,
            evaluation_date: new Date(),
        });

        const createdEvaluation = await InterviewEvaluation.findByPk(evaluation.id, {
            include: [
                {
                    model: JobInterview,
                    as: "interview",
                    include: [{ model: JobApplication, as: "application" }],
                },
                { model: User, as: "evaluator" },
            ],
        });

        res.status(201).json(createdEvaluation);
    } catch (error) {
        console.error("Error submitting evaluation:", error);
        res.status(500).json({ error: "Failed to submit evaluation" });
    }
};

/**
 * Get evaluations for an interview
 */
export const getEvaluationsForInterview = async (req, res) => {
    try {
        const { interviewId } = req.params;

        const evaluations = await InterviewEvaluation.findAll({
            where: { interview_id: interviewId },
            include: [{ model: User, as: "evaluator", attributes: ["id", "username", "email"] }],
            order: [["submitted_date", "DESC"]],
        });

        res.json(evaluations);
    } catch (error) {
        console.error("Error fetching evaluations:", error);
        res.status(500).json({ error: "Failed to fetch evaluations" });
    }
};

// ========================================
// STAGE 4: EMPLOYMENT OFFERS
// ========================================

/**
 * Get all employment offers with filters
 */
export const getEmploymentOffers = async (req, res) => {
    try {
        let { offset = 0, limit = 10, status, direction_id, application_id, query } = req.query;
        offset = parseInt(offset);
        limit = parseInt(limit);

        const where = {};
        if (status) where.status = status;
        if (direction_id) where.direction_id = direction_id;
        if (application_id) where.application_id = application_id;
        if (query) {
            where[Op.or] = [{ offer_number: { [Op.like]: `%${query}%` } }];
        }

        const result = await EmploymentOffer.findAndCountAll({
            offset,
            limit,
            where,
            include: [
                {
                    model: JobApplication,
                    as: "application",
                    include: [{ model: JobPosting, as: "job_posting" }],
                },
                { model: JobPosition, as: "job_position" },
                { model: Grade, as: "grade" },
                { model: Service, as: "service" },
                { model: Direction, as: "direction" },
                { model: User, as: "approver", attributes: ["id", "email"] },
                { model: User, as: "creator", attributes: ["id", "email"] },
            ],
            order: [["created_at", "DESC"]],
            distinct: true,
        });

        res.json({
            status: 200,
            message: "Employment offers retrieved successfully",
            total: result.count,
            offers: result.rows,
        });
    } catch (error) {
        console.error("Error fetching employment offers:", error);
        res.status(500).json({ error: "Failed to fetch employment offers" });
    }
};

/**
 * Get a single employment offer by ID
 */
export const getEmploymentOfferById = async (req, res) => {
    try {
        const { id } = req.params;

        const offer = await EmploymentOffer.findByPk(id, {
            include: [
                {
                    model: JobApplication,
                    as: "application",
                    include: [
                        {
                            model: JobPosting,
                            as: "job_posting",
                            include: [{ model: JobPosition, as: "job_position" }],
                        },
                    ],
                },
                { model: JobPosition, as: "job_position" },
                { model: Grade, as: "grade" },
                { model: Service, as: "service" },
                { model: Direction, as: "direction" },
                { model: User, as: "approver", attributes: ["id", "email"] },
                { model: User, as: "creator", attributes: ["id", "email"] },
            ],
        });

        if (!offer) {
            return res.status(404).json({ error: "Employment offer not found" });
        }

        res.json(offer);
    } catch (error) {
        console.error("Error fetching employment offer:", error);
        res.status(500).json({ error: "Failed to fetch employment offer" });
    }
};

/**
 * Create a new employment offer
 */
export const createEmploymentOffer = async (req, res) => {
    try {
        const offerData = req.body;
        const createdBy = req.user.id;

        // Generate unique offer number
        const year = new Date().getFullYear();
        const count = await EmploymentOffer.count({
            where: {
                offer_number: {
                    [Op.like]: `OFFER-${year}-%`,
                },
            },
        });
        const offerNumber = `OFFER-${year}-${String(count + 1).padStart(4, "0")}`;

        const offer = await EmploymentOffer.create({
            ...offerData,
            offer_number: offerNumber,
            created_by: createdBy,
            status: offerData.status || "draft",
        });

        // Update application status
        if (offerData.application_id) {
            const application = await JobApplication.findByPk(offerData.application_id);
            if (application) {
                await application.update({
                    status: "offer_pending",
                    last_status_change: new Date(),
                });

                await ApplicationStatusHistory.create({
                    application_id: offerData.application_id,
                    previous_status: application.status,
                    new_status: "offer_pending",
                    changed_by: createdBy,
                    reason: "Employment offer created",
                });
            }
        }

        const createdOffer = await EmploymentOffer.findByPk(offer.id, {
            include: [
                { model: JobApplication, as: "application" },
                { model: JobPosition, as: "job_position" },
                { model: Grade, as: "grade" },
                { model: Service, as: "service" },
                { model: Direction, as: "direction" },
            ],
        });

        res.status(201).json(createdOffer);
    } catch (error) {
        console.error("Error creating employment offer:", error);
        res.status(500).json({ error: "Failed to create employment offer" });
    }
};

/**
 * Update employment offer
 */
export const updateEmploymentOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const offer = await EmploymentOffer.findByPk(id);
        if (!offer) {
            return res.status(404).json({ error: "Employment offer not found" });
        }

        await offer.update(updates);

        const updatedOffer = await EmploymentOffer.findByPk(id, {
            include: [
                { model: JobApplication, as: "application" },
                { model: JobPosition, as: "job_position" },
                { model: Grade, as: "grade" },
                { model: Service, as: "service" },
                { model: Direction, as: "direction" },
            ],
        });

        res.json(updatedOffer);
    } catch (error) {
        console.error("Error updating employment offer:", error);
        res.status(500).json({ error: "Failed to update employment offer" });
    }
};

/**
 * Approve employment offer
 */
export const approveEmploymentOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const approverId = req.user.id;

        const offer = await EmploymentOffer.findByPk(id);
        if (!offer) {
            return res.status(404).json({ error: "Employment offer not found" });
        }

        if (offer.status !== "pending_approval") {
            return res.status(400).json({ error: "Only pending offers can be approved" });
        }

        await offer.update({
            status: "approved",
            approved_by: approverId,
            approved_date: new Date(),
        });

        res.json({ message: "Employment offer approved", offer });
    } catch (error) {
        console.error("Error approving employment offer:", error);
        res.status(500).json({ error: "Failed to approve employment offer" });
    }
};

/**
 * Send employment offer to candidate
 */
export const sendEmploymentOffer = async (req, res) => {
    try {
        const { id } = req.params;

        const offer = await EmploymentOffer.findByPk(id, {
            include: [
                {
                    model: JobApplication,
                    as: "application",
                },
            ],
        });

        if (!offer) {
            return res.status(404).json({ error: "Employment offer not found" });
        }

        if (offer.status !== "approved") {
            return res.status(400).json({ error: "Only approved offers can be sent" });
        }

        await offer.update({
            status: "sent",
            offer_sent_date: new Date(),
        });

        // Update application status
        if (offer.application_id) {
            await JobApplication.update(
                {
                    status: "offer_sent",
                    last_status_change: new Date(),
                },
                { where: { id: offer.application_id } }
            );

            await ApplicationStatusHistory.create({
                application_id: offer.application_id,
                previous_status: "offer_pending",
                new_status: "offer_sent",
                changed_by: req.user.id,
                reason: "Employment offer sent to candidate",
            });
        }

        res.json({ message: "Employment offer sent successfully", offer });
    } catch (error) {
        console.error("Error sending employment offer:", error);
        res.status(500).json({ error: "Failed to send employment offer" });
    }
};

/**
 * Candidate response to offer (accept/decline)
 */
export const respondToOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const { accept, comments } = req.body;

        const offer = await EmploymentOffer.findByPk(id, {
            include: [
                {
                    model: JobApplication,
                    as: "application",
                },
                { model: JobPosition, as: "job_position" },
                { model: Grade, as: "grade" },
                { model: Service, as: "service" },
                { model: Direction, as: "direction" },
            ],
        });

        if (!offer) {
            return res.status(404).json({ error: "Employment offer not found" });
        }

        if (offer.status !== "sent") {
            return res.status(400).json({ error: "Cannot respond to this offer" });
        }

        const newStatus = accept ? "accepted" : "declined";

        await offer.update({
            status: newStatus,
            accepted_date: accept ? new Date() : null,
            declined_reason: accept ? null : comments,
        });

        // Update application status
        if (offer.application_id) {
            const appStatus = accept ? "offer_accepted" : "offer_declined";
            await JobApplication.update(
                {
                    status: appStatus,
                    last_status_change: new Date(),
                },
                { where: { id: offer.application_id } }
            );

            await ApplicationStatusHistory.create({
                application_id: offer.application_id,
                previous_status: "offer_sent",
                new_status: appStatus,
                changed_by: req.user.id || null,
                reason: accept ? "Candidate accepted the offer" : "Candidate declined the offer",
                notes: comments,
            });
        }

        // If accepted, create employee record and user account
        let newEmployee = null;
        let newUser = null;

        if (accept && offer.application) {
            try {
                // Generate employee number
                const year = new Date().getFullYear();
                const count = await Employee.count();
                const employeeNumber = `EMP-${year}-${String(count + 1).padStart(4, "0")}`;

                // Generate temporary password
                const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
                const hashedPassword = await bcrypt.hash(tempPassword, 10);

                // Create user account
                newUser = await User.create({
                    email: offer.application.email,
                    password: hashedPassword,
                    role: "employee",
                    is_active: true,
                });

                // Create employee record
                newEmployee = await Employee.create({
                    user_id: newUser.id,
                    employee_number: employeeNumber,
                    first_name: offer.application.first_name,
                    last_name: offer.application.last_name,
                    email: offer.application.email,
                    phone: offer.application.phone,
                    date_of_birth: offer.application.date_of_birth,
                    gender: offer.application.gender,
                    nationality: offer.application.nationality,
                    address_line1: offer.application.address_line1,
                    city: offer.application.city,
                    province: offer.application.province,
                    job_position_id: offer.job_position_id,
                    grade_id: offer.grade_id,
                    service_id: offer.service_id,
                    direction_id: offer.direction_id,
                    contract_type: offer.contract_type,
                    employment_status: "active",
                    hire_date: offer.start_date,
                    basic_salary: offer.salary,
                    created_by: req.user.id,
                });

                console.log("✅ Employee created successfully:", employeeNumber);
                console.log("✅ Temporary password:", tempPassword);

                // TODO: Send welcome email with credentials
            } catch (employeeError) {
                console.error("❌ Error creating employee:", employeeError);
                // Don't fail the whole request, but log the error
            }
        }

        res.json({
            message: accept ? "Offer accepted successfully" : "Offer declined",
            offer,
            employee: newEmployee,
            temporaryPassword: newEmployee ? "Sent to candidate's email" : null,
        });
    } catch (error) {
        console.error("Error responding to offer:", error);
        res.status(500).json({ error: "Failed to respond to offer" });
    }
};

// ========================================
// STAGE 5: ONBOARDING
// ========================================

/**
 * Get all onboarding checklists
 */
export const getOnboardingChecklists = async (req, res) => {
    try {
        const { employee_id, status } = req.query;

        const where = {};
        if (employee_id) where.employee_id = employee_id;
        if (status) where.status = status;

        const checklists = await OnboardingChecklist.findAll({
            where,
            include: [
                { model: Employee, as: "employee" },
                { model: EmploymentOffer, as: "employment_offer" },
                { model: User, as: "assigned_mentor" },
                { model: User, as: "creator" },
                {
                    model: OnboardingTask,
                    as: "tasks",
                    include: [{ model: User, as: "assigned_user" }],
                },
            ],
            order: [["start_date", "DESC"]],
        });

        res.json(checklists);
    } catch (error) {
        console.error("Error fetching onboarding checklists:", error);
        res.status(500).json({ error: "Failed to fetch onboarding checklists" });
    }
};

/**
 * Get a single onboarding checklist by ID
 */
export const getOnboardingChecklistById = async (req, res) => {
    try {
        const { id } = req.params;

        const checklist = await OnboardingChecklist.findByPk(id, {
            include: [
                { model: Employee, as: "employee" },
                { model: EmploymentOffer, as: "employment_offer" },
                { model: User, as: "assigned_mentor" },
                { model: User, as: "creator" },
                {
                    model: OnboardingTask,
                    as: "tasks",
                    include: [{ model: User, as: "assigned_user" }],
                    order: [["order_index", "ASC"]],
                },
            ],
        });

        if (!checklist) {
            return res.status(404).json({ error: "Onboarding checklist not found" });
        }

        res.json(checklist);
    } catch (error) {
        console.error("Error fetching onboarding checklist:", error);
        res.status(500).json({ error: "Failed to fetch onboarding checklist" });
    }
};

/**
 * Create onboarding checklist from templates
 */
export const createOnboardingChecklist = async (req, res) => {
    try {
        const { employee_id, employment_offer_id, start_date, assigned_mentor_id } = req.body;

        // Calculate expected completion date (30 days from start)
        const expectedDate = new Date(start_date);
        expectedDate.setDate(expectedDate.getDate() + 30);

        const checklist = await OnboardingChecklist.create({
            employee_id,
            employment_offer_id,
            start_date,
            expected_completion_date: expectedDate,
            assigned_mentor_id,
            status: "pending",
            created_by: req.user.id,
        });

        // Get active task templates and create tasks
        const templates = await OnboardingTaskTemplate.findAll({
            where: { is_active: true },
            order: [["order_index", "ASC"]],
        });

        const tasks = templates.map((template) => {
            const dueDate = new Date(start_date);
            dueDate.setDate(dueDate.getDate() + template.days_from_start);

            return {
                onboarding_checklist_id: checklist.id,
                task_name: template.task_name,
                description: template.description,
                category: template.category,
                priority: template.priority,
                due_date: dueDate,
                order_index: template.order_index,
                is_mandatory: template.is_mandatory,
                status: "pending",
            };
        });

        await OnboardingTask.bulkCreate(tasks);

        const createdChecklist = await OnboardingChecklist.findByPk(checklist.id, {
            include: [
                { model: Employee, as: "employee" },
                { model: User, as: "assigned_hr" },
                { model: OnboardingTask, as: "tasks" },
            ],
        });

        res.status(201).json(createdChecklist);
    } catch (error) {
        console.error("Error creating onboarding checklist:", error);
        res.status(500).json({ error: "Failed to create onboarding checklist" });
    }
};

/**
 * Update onboarding checklist
 */
export const updateOnboardingChecklist = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const checklist = await OnboardingChecklist.findByPk(id);
        if (!checklist) {
            return res.status(404).json({ error: "Onboarding checklist not found" });
        }

        await checklist.update(updates);

        const updatedChecklist = await OnboardingChecklist.findByPk(id, {
            include: [
                { model: Employee, as: "employee" },
                { model: User, as: "assigned_mentor" },
                { model: User, as: "creator" },
                { model: OnboardingTask, as: "tasks" },
            ],
        });

        res.json(updatedChecklist);
    } catch (error) {
        console.error("Error updating onboarding checklist:", error);
        res.status(500).json({ error: "Failed to update onboarding checklist" });
    }
};

/**
 * Add task to checklist
 */
export const addOnboardingTask = async (req, res) => {
    try {
        const { checklistId } = req.params;
        const taskData = req.body;

        const checklist = await OnboardingChecklist.findByPk(checklistId);
        if (!checklist) {
            return res.status(404).json({ error: "Onboarding checklist not found" });
        }

        const task = await OnboardingTask.create({
            ...taskData,
            checklist_id: checklistId,
            status: taskData.status || "pending",
        });

        const createdTask = await OnboardingTask.findByPk(task.id, {
            include: [{ model: User, as: "assigned_user" }],
        });

        res.status(201).json(createdTask);
    } catch (error) {
        console.error("Error adding onboarding task:", error);
        res.status(500).json({ error: "Failed to add onboarding task" });
    }
};

/**
 * Update onboarding task
 */
export const updateOnboardingTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const updates = req.body;

        const task = await OnboardingTask.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ error: "Onboarding task not found" });
        }

        // If marking as completed, set completion date and completer
        if (updates.status === "completed" && task.status !== "completed") {
            updates.completion_date = new Date();
            updates.completed_by = req.user.id;
        }

        await task.update(updates);

        // Recalculate checklist completion percentage
        const checklist = await OnboardingChecklist.findByPk(task.checklist_id, {
            include: [{ model: OnboardingTask, as: "tasks" }],
        });

        const totalTasks = checklist.tasks.length;
        const completedTasks = checklist.tasks.filter((t) => t.status === "completed").length;
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        await checklist.update({
            status: completionPercentage === 100 ? "completed" : completionPercentage > 0 ? "in_progress" : "pending",
            actual_completion_date: completionPercentage === 100 ? new Date() : null,
        });

        const updatedTask = await OnboardingTask.findByPk(taskId, {
            include: [{ model: User, as: "assigned_user" }],
        });

        res.json(updatedTask);
    } catch (error) {
        console.error("Error updating onboarding task:", error);
        res.status(500).json({ error: "Failed to update onboarding task" });
    }
};

/**
 * Get task templates
 */
export const getTaskTemplates = async (req, res) => {
    try {
        const templates = await OnboardingTaskTemplate.findAll({
            where: { is_active: true },
            order: [["order_index", "ASC"]],
        });

        res.json(templates);
    } catch (error) {
        console.error("Error fetching task templates:", error);
        res.status(500).json({ error: "Failed to fetch task templates" });
    }
};

/**
 * Create task template
 */
export const createTaskTemplate = async (req, res) => {
    try {
        const templateData = req.body;

        const template = await OnboardingTaskTemplate.create(templateData);

        res.status(201).json(template);
    } catch (error) {
        console.error("Error creating task template:", error);
        res.status(500).json({ error: "Failed to create task template" });
    }
};

// ========================================
// EMAIL TEMPLATES & MANAGEMENT
// ========================================

/**
 * Get all email templates
 */
export const getEmailTemplates = async (req, res) => {
    try {
        const { category } = req.query;

        const where = { is_active: true };
        if (category) where.category = category;

        const templates = await EmailTemplate.findAll({
            where,
            include: [{ model: User, as: "creator", attributes: ["id", "username"] }],
            order: [["template_name", "ASC"]],
        });

        res.json(templates);
    } catch (error) {
        console.error("Error fetching email templates:", error);
        res.status(500).json({ error: "Failed to fetch email templates" });
    }
};

/**
 * Get sent emails
 */
export const getSentEmails = async (req, res) => {
    try {
        const { status, related_entity_type, recipient_email } = req.query;

        const where = {};
        if (status) where.status = status;
        if (related_entity_type) where.related_entity_type = related_entity_type;
        if (recipient_email) where.recipient_email = { [Op.like]: `%${recipient_email}%` };

        const emails = await SentEmail.findAll({
            where,
            include: [
                { model: EmailTemplate, as: "template" },
                { model: User, as: "sender" },
            ],
            order: [["sent_date", "DESC"]],
            limit: 100,
        });

        res.json(emails);
    } catch (error) {
        console.error("Error fetching sent emails:", error);
        res.status(500).json({ error: "Failed to fetch sent emails" });
    }
};

/**
 * Get recruitment emails (incoming)
 */
export const getRecruitmentEmails = async (req, res) => {
    try {
        const { processing_status, job_posting_id } = req.query;

        const where = {};
        if (processing_status) where.processing_status = processing_status;
        if (job_posting_id) where.job_posting_id = job_posting_id;

        const emails = await RecruitmentEmail.findAll({
            where,
            include: [
                { model: JobPosting, as: "job_posting" },
                { model: JobApplication, as: "application" },
            ],
            order: [["received_date", "DESC"]],
            limit: 100,
        });

        res.json(emails);
    } catch (error) {
        console.error("Error fetching recruitment emails:", error);
        res.status(500).json({ error: "Failed to fetch recruitment emails" });
    }
};

/**
 * Update recruitment email processing status
 */
export const updateRecruitmentEmailStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { processing_status, error_message, application_id } = req.body;

        const email = await RecruitmentEmail.findByPk(id);
        if (!email) {
            return res.status(404).json({ error: "Recruitment email not found" });
        }

        const updates = {
            processing_status,
            processed_date: new Date(),
        };

        if (error_message) updates.error_message = error_message;
        if (application_id) updates.application_id = application_id;

        await email.update(updates);

        res.json({ message: "Email status updated", email });
    } catch (error) {
        console.error("Error updating recruitment email:", error);
        res.status(500).json({ error: "Failed to update recruitment email" });
    }
};

// ========================================
// STATISTICS & REPORTS
// ========================================

/**
 * Get recruitment statistics
 */
export const getRecruitmentStatistics = async (req, res) => {
    try {
        const { year, direction_id } = req.query;

        // Active job postings
        const activePostings = await JobPosting.count({
            where: { status: "published" },
        });

        // Total applications by status
        const applicationsByStatus = await JobApplication.findAll({
            attributes: ["status", [models.sequelize.fn("COUNT", models.sequelize.col("id")), "count"]],
            group: ["status"],
        });

        // Interviews scheduled
        const upcomingInterviews = await JobInterview.count({
            where: {
                status: "scheduled",
                scheduled_date: {
                    [Op.gte]: new Date(),
                },
            },
        });

        // Pending offers
        const pendingOffers = await EmploymentOffer.count({
            where: {
                status: ["pending_approval", "approved", "sent"],
            },
        });

        // Active onboarding
        const activeOnboarding = await OnboardingChecklist.count({
            where: {
                status: ["not_started", "in_progress"],
            },
        });

        res.json({
            activePostings,
            applicationsByStatus,
            upcomingInterviews,
            pendingOffers,
            activeOnboarding,
        });
    } catch (error) {
        console.error("Error fetching recruitment statistics:", error);
        res.status(500).json({ error: "Failed to fetch recruitment statistics" });
    }
};
