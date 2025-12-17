import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const EmailTemplate = sequelize.define(
    "EmailTemplate",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        template_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        template_code: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
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
        category: {
            type: DataTypes.ENUM("recruitment", "onboarding", "general", "birthday", "anniversary"),
            defaultValue: "recruitment",
        },
        available_variables: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
    },
    {
        tableName: "email_templates",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default EmailTemplate;
