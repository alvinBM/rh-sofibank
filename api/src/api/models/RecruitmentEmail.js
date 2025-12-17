import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const RecruitmentEmail = sequelize.define(
    "RecruitmentEmail",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        message_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        from_email: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        from_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        subject: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        body_text: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        body_html: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        received_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        attachments: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        job_posting_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "job_postings",
                key: "id",
            },
        },
        application_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "job_applications",
                key: "id",
            },
        },
        processing_status: {
            type: DataTypes.ENUM("pending", "processing", "processed", "failed", "ignored"),
            defaultValue: "pending",
        },
        error_message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        processed_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        raw_email_path: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
    },
    {
        tableName: "recruitment_emails",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default RecruitmentEmail;
