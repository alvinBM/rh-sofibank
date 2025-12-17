import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const RecruitmentPlan = sequelize.define(
    "RecruitmentPlan",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        direction_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "directions",
                key: "id",
            },
        },
        status: {
            type: DataTypes.ENUM("draft", "submitted", "approved", "rejected"),
            defaultValue: "draft",
        },
        submitted_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        approved_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        approved_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        rejection_reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
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
        tableName: "recruitment_plans",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default RecruitmentPlan;
