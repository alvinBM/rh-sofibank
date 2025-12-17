import models from "../models/index.js";
import { Op } from "sequelize";

const {
    Employee,
    EmployeeDocument,
    EmployeeContract,
    EmployeeRequest,
    RequestType,
    InternalAnnouncement,
    AnnouncementRead,
    EmployeeFeedback,
    CareerHistory,
    EmployeeDependent,
    Direction,
    Service,
    JobPosition,
    Grade,
    User,
} = models;

// ==================== MY PROFILE ====================

export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const employee = await Employee.findOne({
            where: { user_id: userId },
            include: [
                { model: Direction, as: "direction" },
                { model: Service, as: "service" },
                { model: JobPosition, as: "job_position" },
                { model: Grade, as: "grade" },
            ],
        });

        if (!employee) {
            return res.status(404).json({
                status: 404,
                message: "Profil employé introuvable",
            });
        }

        res.status(200).json({
            status: 200,
            data: employee,
        });
    } catch (error) {
        console.error("Get my profile error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la récupération du profil",
            error: error.message,
        });
    }
};

export const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        // Fields that employees can update themselves
        const allowedFields = [
            "personal_email",
            "phone",
            "address_line1",
            "address_line2",
            "city",
            "province",
            "postal_code",
            "marital_status",
            "spouse_name",
            "number_of_children",
            "emergency_contact_name",
            "emergency_contact_phone",
            "emergency_contact_relationship",
        ];

        const filteredUpdates = {};
        allowedFields.forEach((field) => {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        });

        const employee = await Employee.findOne({
            where: { user_id: userId },
        });

        if (!employee) {
            return res.status(404).json({
                status: 404,
                message: "Profil employé introuvable",
            });
        }

        await employee.update(filteredUpdates);

        const updatedEmployee = await Employee.findByPk(employee.id, {
            include: [
                { model: Direction, as: "direction" },
                { model: Service, as: "service" },
                { model: JobPosition, as: "job_position" },
                { model: Grade, as: "grade" },
            ],
        });

        res.status(200).json({
            status: 200,
            message: "Profil mis à jour avec succès",
            data: updatedEmployee,
        });
    } catch (error) {
        console.error("Update my profile error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la mise à jour du profil",
            error: error.message,
        });
    }
};

// ==================== MY DOCUMENTS ====================

export const getMyDocuments = async (req, res) => {
    try {
        const userId = req.user.id;

        const employee = await Employee.findOne({
            where: { user_id: userId },
        });

        if (!employee) {
            return res.status(404).json({
                status: 404,
                message: "Profil employé introuvable",
            });
        }

        const documents = await EmployeeDocument.findAll({
            where: { employee_id: employee.id },
            order: [["created_at", "DESC"]],
        });

        res.status(200).json({
            status: 200,
            data: documents,
        });
    } catch (error) {
        console.error("Get my documents error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la récupération des documents",
            error: error.message,
        });
    }
};

export const getEmployeeDocuments = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const documents = await EmployeeDocument.findAll({
            where: { employee_id: employeeId },
            order: [["created_at", "DESC"]],
        });

        res.status(200).json({
            status: 200,
            data: documents,
        });
    } catch (error) {
        console.error("Get employee documents error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la récupération des documents",
            error: error.message,
        });
    }
};

export const uploadDocument = async (req, res) => {
    try {
        const { employee_id, document_type, document_name, file_path, expiry_date, notes } = req.body;

        const document = await EmployeeDocument.create({
            employee_id,
            document_type,
            document_name,
            file_path,
            expiry_date,
            notes,
            uploaded_by: req.user.id,
        });

        res.status(201).json({
            status: 201,
            message: "Document téléchargé avec succès",
            data: document,
        });
    } catch (error) {
        console.error("Upload document error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors du téléchargement du document",
            error: error.message,
        });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await EmployeeDocument.findByPk(id);

        if (!document) {
            return res.status(404).json({
                status: 404,
                message: "Document introuvable",
            });
        }

        await document.destroy();

        res.status(200).json({
            status: 200,
            message: "Document supprimé avec succès",
        });
    } catch (error) {
        console.error("Delete document error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la suppression du document",
            error: error.message,
        });
    }
};

// ==================== MY CONTRACTS ====================

export const getMyContracts = async (req, res) => {
    try {
        const userId = req.user.id;

        const employee = await Employee.findOne({
            where: { user_id: userId },
        });

        if (!employee) {
            return res.status(404).json({
                status: 404,
                message: "Profil employé introuvable",
            });
        }

        const contracts = await EmployeeContract.findAll({
            where: { employee_id: employee.id },
            order: [["start_date", "DESC"]],
        });

        res.status(200).json({
            status: 200,
            data: contracts,
        });
    } catch (error) {
        console.error("Get my contracts error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la récupération des contrats",
            error: error.message,
        });
    }
};

export const getEmployeeContracts = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const contracts = await EmployeeContract.findAll({
            where: { employee_id: employeeId },
            order: [["start_date", "DESC"]],
        });

        res.status(200).json({
            status: 200,
            data: contracts,
        });
    } catch (error) {
        console.error("Get employee contracts error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la récupération des contrats",
            error: error.message,
        });
    }
};

// ==================== EMPLOYEE REQUESTS ====================

export const getMyRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const employee = await Employee.findOne({
            where: { user_id: userId },
        });

        if (!employee) {
            return res.status(404).json({
                status: 404,
                message: "Profil employé introuvable",
            });
        }

        const requests = await EmployeeRequest.findAll({
            where: { employee_id: employee.id },
            include: [{ model: RequestType, as: "request_type" }],
            order: [["created_at", "DESC"]],
        });

        res.status(200).json({
            status: 200,
            data: requests,
        });
    } catch (error) {
        console.error("Get my requests error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la récupération des demandes",
            error: error.message,
        });
    }
};

export const getEmployeeRequests = async (req, res) => {
    try {
        const { status, employee_id } = req.query;

        const where = {};
        if (status) where.status = status;
        if (employee_id) where.employee_id = employee_id;

        const requests = await EmployeeRequest.findAll({
            where,
            include: [
                { model: RequestType, as: "request_type" },
                {
                    model: Employee,
                    as: "employee",
                    attributes: ["id", "employee_number", "first_name", "last_name"],
                },
            ],
            order: [["created_at", "DESC"]],
        });

        res.status(200).json({
            status: 200,
            data: requests,
        });
    } catch (error) {
        console.error("Get employee requests error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la récupération des demandes",
            error: error.message,
        });
    }
};

export const createRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { request_type_id, subject, description, priority, attachment_url } = req.body;

        const employee = await Employee.findOne({
            where: { user_id: userId },
        });

        if (!employee) {
            return res.status(404).json({
                status: 404,
                message: "Profil employé introuvable",
            });
        }

        const request = await EmployeeRequest.create({
            employee_id: employee.id,
            request_type_id,
            subject,
            description,
            priority: priority || "medium",
            status: "pending",
            attachment_url,
        });

        const createdRequest = await EmployeeRequest.findByPk(request.id, {
            include: [{ model: RequestType, as: "request_type" }],
        });

        res.status(201).json({
            status: 201,
            message: "Demande créée avec succès",
            data: createdRequest,
        });
    } catch (error) {
        console.error("Create request error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la création de la demande",
            error: error.message,
        });
    }
};

export const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const request = await EmployeeRequest.findByPk(id);

        if (!request) {
            return res.status(404).json({
                status: 404,
                message: "Demande introuvable",
            });
        }

        await request.update({
            ...updates,
            handled_by: updates.status === "in_progress" || updates.status === "resolved" ? req.user.id : request.handled_by,
            handled_at: updates.status === "resolved" ? new Date() : request.handled_at,
        });

        const updatedRequest = await EmployeeRequest.findByPk(id, {
            include: [{ model: RequestType, as: "request_type" }],
        });

        res.status(200).json({
            status: 200,
            message: "Demande mise à jour avec succès",
            data: updatedRequest,
        });
    } catch (error) {
        console.error("Update request error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la mise à jour de la demande",
            error: error.message,
        });
    }
};

export const getRequestTypes = async (req, res) => {
    try {
        const types = await RequestType.findAll({
            where: { is_active: true },
            order: [["name", "ASC"]],
        });

        res.status(200).json({
            status: 200,
            data: types,
        });
    } catch (error) {
        console.error("Get request types error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la récupération des types de demandes",
            error: error.message,
        });
    }
};

// ==================== ANNOUNCEMENTS ====================

export const getInternalAnnouncements = async (req, res) => {
    try {
        const userId = req.user.id;

        const announcements = await InternalAnnouncement.findAll({
            where: {
                is_published: true,
                [Op.or]: [{ expiry_date: null }, { expiry_date: { [Op.gte]: new Date() } }],
            },
            order: [["published_date", "DESC"]],
        });

        // Get read status for each announcement
        const employee = await Employee.findOne({
            where: { user_id: userId },
        });

        if (employee) {
            const readAnnouncements = await AnnouncementRead.findAll({
                where: { employee_id: employee.id },
                attributes: ["announcement_id"],
            });

            const readIds = new Set(readAnnouncements.map((r) => r.announcement_id));

            const announcementsWithReadStatus = announcements.map((announcement) => ({
                ...announcement.toJSON(),
                is_read: readIds.has(announcement.id),
            }));

            return res.status(200).json({
                status: 200,
                data: announcementsWithReadStatus,
            });
        }

        res.status(200).json({
            status: 200,
            data: announcements,
        });
    } catch (error) {
        console.error("Get internal announcements error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la récupération des annonces",
            error: error.message,
        });
    }
};

export const getAllAnnouncements = async (req, res) => {
    try {
        const { is_published, category } = req.query;

        const where = {};
        if (is_published !== undefined) where.is_published = is_published === "true";
        if (category) where.category = category;

        const announcements = await InternalAnnouncement.findAll({
            where,
            order: [["created_at", "DESC"]],
        });

        res.status(200).json({
            status: 200,
            data: announcements,
        });
    } catch (error) {
        console.error("Get all announcements error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la récupération des annonces",
            error: error.message,
        });
    }
};

export const createAnnouncement = async (req, res) => {
    try {
        const { title, content, category, priority, expiry_date, is_published } = req.body;

        const announcement = await InternalAnnouncement.create({
            title,
            content,
            category,
            priority: priority || "normal",
            expiry_date,
            is_published: is_published || false,
            published_date: is_published ? new Date() : null,
            created_by: req.user.id,
        });

        res.status(201).json({
            status: 201,
            message: "Annonce créée avec succès",
            data: announcement,
        });
    } catch (error) {
        console.error("Create announcement error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la création de l'annonce",
            error: error.message,
        });
    }
};

export const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const announcement = await InternalAnnouncement.findByPk(id);

        if (!announcement) {
            return res.status(404).json({
                status: 404,
                message: "Annonce introuvable",
            });
        }

        // If publishing for the first time
        if (!announcement.is_published && updates.is_published) {
            updates.published_date = new Date();
        }

        await announcement.update(updates);

        res.status(200).json({
            status: 200,
            message: "Annonce mise à jour avec succès",
            data: announcement,
        });
    } catch (error) {
        console.error("Update announcement error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la mise à jour de l'annonce",
            error: error.message,
        });
    }
};

export const markAnnouncementAsRead = async (req, res) => {
    try {
        const { announcementId } = req.params;
        const userId = req.user.id;

        const employee = await Employee.findOne({
            where: { user_id: userId },
        });

        if (!employee) {
            return res.status(404).json({
                status: 404,
                message: "Profil employé introuvable",
            });
        }

        await AnnouncementRead.findOrCreate({
            where: {
                announcement_id: announcementId,
                employee_id: employee.id,
            },
            defaults: {
                read_at: new Date(),
            },
        });

        res.status(200).json({
            status: 200,
            message: "Annonce marquée comme lue",
        });
    } catch (error) {
        console.error("Mark announcement as read error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors du marquage de l'annonce",
            error: error.message,
        });
    }
};

// ==================== FEEDBACK ====================

export const getMyFeedback = async (req, res) => {
    try {
        const userId = req.user.id;

        const employee = await Employee.findOne({
            where: { user_id: userId },
        });

        if (!employee) {
            return res.status(404).json({
                status: 404,
                message: "Profil employé introuvable",
            });
        }

        const feedback = await EmployeeFeedback.findAll({
            where: { employee_id: employee.id },
            order: [["created_at", "DESC"]],
        });

        res.status(200).json({
            status: 200,
            data: feedback,
        });
    } catch (error) {
        console.error("Get my feedback error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la récupération des feedbacks",
            error: error.message,
        });
    }
};

export const getAllFeedback = async (req, res) => {
    try {
        const { status, category } = req.query;

        const where = {};
        if (status) where.status = status;
        if (category) where.category = category;

        const feedback = await EmployeeFeedback.findAll({
            where,
            include: [
                {
                    model: Employee,
                    as: "employee",
                    attributes: ["id", "employee_number", "first_name", "last_name"],
                },
            ],
            order: [["created_at", "DESC"]],
        });

        res.status(200).json({
            status: 200,
            data: feedback,
        });
    } catch (error) {
        console.error("Get all feedback error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la récupération des feedbacks",
            error: error.message,
        });
    }
};

export const createFeedback = async (req, res) => {
    try {
        const userId = req.user.id;
        const { category, subject, message, is_anonymous } = req.body;

        const employee = await Employee.findOne({
            where: { user_id: userId },
        });

        if (!employee) {
            return res.status(404).json({
                status: 404,
                message: "Profil employé introuvable",
            });
        }

        const feedback = await EmployeeFeedback.create({
            employee_id: employee.id,
            category,
            subject,
            message,
            is_anonymous: is_anonymous || false,
            status: "pending",
        });

        res.status(201).json({
            status: 201,
            message: "Feedback créé avec succès",
            data: feedback,
        });
    } catch (error) {
        console.error("Create feedback error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la création du feedback",
            error: error.message,
        });
    }
};

export const updateFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const feedback = await EmployeeFeedback.findByPk(id);

        if (!feedback) {
            return res.status(404).json({
                status: 404,
                message: "Feedback introuvable",
            });
        }

        await feedback.update({
            ...updates,
            reviewed_by: updates.status === "reviewed" ? req.user.id : feedback.reviewed_by,
            reviewed_at: updates.status === "reviewed" ? new Date() : feedback.reviewed_at,
        });

        res.status(200).json({
            status: 200,
            message: "Feedback mis à jour avec succès",
            data: feedback,
        });
    } catch (error) {
        console.error("Update feedback error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la mise à jour du feedback",
            error: error.message,
        });
    }
};

// ==================== CAREER HISTORY ====================

export const getEmployeeHistory = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const history = await CareerHistory.findAll({
            where: { employee_id: employeeId },
            include: [
                { model: Direction, as: "direction" },
                { model: Service, as: "service" },
                { model: JobPosition, as: "job_position" },
                { model: Grade, as: "grade" },
            ],
            order: [["effective_date", "DESC"]],
        });

        res.status(200).json({
            status: 200,
            data: history,
        });
    } catch (error) {
        console.error("Get employee history error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la récupération de l'historique",
            error: error.message,
        });
    }
};

export const createEmployeeHistory = async (req, res) => {
    try {
        const {
            employee_id,
            change_type,
            effective_date,
            previous_direction_id,
            new_direction_id,
            previous_service_id,
            new_service_id,
            previous_job_position_id,
            new_job_position_id,
            previous_grade_id,
            new_grade_id,
            previous_salary,
            new_salary,
            reason,
            notes,
        } = req.body;

        const history = await CareerHistory.create({
            employee_id,
            change_type,
            effective_date,
            previous_direction_id,
            new_direction_id,
            previous_service_id,
            new_service_id,
            previous_job_position_id,
            new_job_position_id,
            previous_grade_id,
            new_grade_id,
            previous_salary,
            new_salary,
            reason,
            notes,
            created_by: req.user.id,
        });

        const createdHistory = await CareerHistory.findByPk(history.id, {
            include: [
                { model: Direction, as: "direction" },
                { model: Service, as: "service" },
                { model: JobPosition, as: "job_position" },
                { model: Grade, as: "grade" },
            ],
        });

        res.status(201).json({
            status: 201,
            message: "Historique de carrière créé avec succès",
            data: createdHistory,
        });
    } catch (error) {
        console.error("Create employee history error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la création de l'historique",
            error: error.message,
        });
    }
};

// ==================== DEPENDENTS ====================

export const getEmployeeDependents = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const dependents = await EmployeeDependent.findAll({
            where: { employee_id: employeeId },
            order: [["date_of_birth", "DESC"]],
        });

        res.status(200).json({
            status: 200,
            data: dependents,
        });
    } catch (error) {
        console.error("Get employee dependents error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la récupération des dépendants",
            error: error.message,
        });
    }
};

export const createEmployeeDependent = async (req, res) => {
    try {
        const { employee_id, first_name, last_name, relationship, date_of_birth, gender, is_beneficiary, notes } = req.body;

        const dependent = await EmployeeDependent.create({
            employee_id,
            first_name,
            last_name,
            relationship,
            date_of_birth,
            gender,
            is_beneficiary: is_beneficiary || false,
            notes,
        });

        res.status(201).json({
            status: 201,
            message: "Dépendant créé avec succès",
            data: dependent,
        });
    } catch (error) {
        console.error("Create employee dependent error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la création du dépendant",
            error: error.message,
        });
    }
};

export const updateEmployeeDependent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const dependent = await EmployeeDependent.findByPk(id);

        if (!dependent) {
            return res.status(404).json({
                status: 404,
                message: "Dépendant introuvable",
            });
        }

        await dependent.update(updates);

        res.status(200).json({
            status: 200,
            message: "Dépendant mis à jour avec succès",
            data: dependent,
        });
    } catch (error) {
        console.error("Update employee dependent error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la mise à jour du dépendant",
            error: error.message,
        });
    }
};

export const deleteEmployeeDependent = async (req, res) => {
    try {
        const { id } = req.params;

        const dependent = await EmployeeDependent.findByPk(id);

        if (!dependent) {
            return res.status(404).json({
                status: 404,
                message: "Dépendant introuvable",
            });
        }

        await dependent.destroy();

        res.status(200).json({
            status: 200,
            message: "Dépendant supprimé avec succès",
        });
    } catch (error) {
        console.error("Delete employee dependent error:", error);
        res.status(500).json({
            status: 500,
            message: "Erreur lors de la suppression du dépendant",
            error: error.message,
        });
    }
};
