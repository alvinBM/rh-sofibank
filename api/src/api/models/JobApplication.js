import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const JobApplication = sequelize.define(
    "JobApplication",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        job_posting_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "job_postings",
                key: "id",
            },
        },
        application_number: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        date_of_birth: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        nationality: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        address_line1: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        address_line2: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        province: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        postal_code: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        linkedin_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        portfolio_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        cv_file_path: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        cover_letter_file_path: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        other_documents_path: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        application_source: {
            type: DataTypes.ENUM("website", "email", "linkedin", "referral", "job_board", "other"),
            defaultValue: "website",
        },
        source_email_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        raw_email_data: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(
                "new",
                "screening",
                "shortlisted",
                "interview_scheduled",
                "interviewed",
                "assessment",
                "offer_pending",
                "offer_sent",
                "offer_accepted",
                "offer_declined",
                "rejected",
                "withdrawn",
                "hired"
            ),
            defaultValue: "new",
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        applied_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        last_status_change: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        assigned_to: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
    },
    {
        tableName: "job_applications",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default JobApplication;
