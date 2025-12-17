import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const OnboardingTask = sequelize.define(
    "OnboardingTask",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        checklist_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "onboarding_checklists",
                key: "id",
            },
        },
        task_template_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "onboarding_task_templates",
                key: "id",
            },
        },
        task_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        category: {
            type: DataTypes.ENUM("administrative", "equipment", "training", "team_introduction", "system_access", "documentation", "other"),
            defaultValue: "other",
        },
        priority: {
            type: DataTypes.ENUM("low", "medium", "high", "critical"),
            defaultValue: "medium",
        },
        due_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        assigned_to: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        status: {
            type: DataTypes.ENUM("pending", "in_progress", "completed", "skipped", "blocked"),
            defaultValue: "pending",
        },
        completion_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        completed_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        attachments: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        order_index: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        tableName: "onboarding_tasks",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default OnboardingTask;
