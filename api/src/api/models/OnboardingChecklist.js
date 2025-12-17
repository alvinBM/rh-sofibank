import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const OnboardingChecklist = sequelize.define(
    "OnboardingChecklist",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        employee_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "employees",
                key: "id",
            },
        },
        employment_offer_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "employment_offers",
                key: "id",
            },
        },
        checklist_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        target_completion_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        actual_completion_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("not_started", "in_progress", "completed", "on_hold"),
            defaultValue: "not_started",
        },
        completion_percentage: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        assigned_hr_id: {
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
    },
    {
        tableName: "onboarding_checklists",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default OnboardingChecklist;
