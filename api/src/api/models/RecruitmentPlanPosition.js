import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const RecruitmentPlanPosition = sequelize.define(
    "RecruitmentPlanPosition",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        recruitment_plan_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "recruitment_plans",
                key: "id",
            },
        },
        job_position_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "job_positions",
                key: "id",
            },
        },
        grade_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "grades",
                key: "id",
            },
        },
        service_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "services",
                key: "id",
            },
        },
        quantity_needed: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        priority: {
            type: DataTypes.ENUM("low", "medium", "high", "urgent"),
            defaultValue: "medium",
        },
        expected_start_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        justification: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        budget_allocated: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("pending", "approved", "in_progress", "filled", "cancelled"),
            defaultValue: "pending",
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "recruitment_plan_positions",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default RecruitmentPlanPosition;
