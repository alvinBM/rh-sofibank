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
        status: {
            type: DataTypes.ENUM("pending", "in_progress", "completed"),
            defaultValue: "pending",
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        expected_completion_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        actual_completion_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        assigned_mentor_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
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
