import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const OnboardingTaskTemplate = sequelize.define(
    "OnboardingTaskTemplate",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
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
        days_from_start: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        responsible_role: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        order_index: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "onboarding_task_templates",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default OnboardingTaskTemplate;
