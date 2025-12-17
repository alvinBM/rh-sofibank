import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const SentEmail = sequelize.define(
    "SentEmail",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        template_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "email_templates",
                key: "id",
            },
        },
        recipient_email: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        recipient_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        subject: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        body_html: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        body_text: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        sent_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        status: {
            type: DataTypes.ENUM("pending", "sent", "failed", "bounced"),
            defaultValue: "pending",
        },
        error_message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        related_entity_type: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        related_entity_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        sent_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        cc_emails: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        bcc_emails: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        attachments: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "sent_emails",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default SentEmail;
