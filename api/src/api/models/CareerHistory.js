import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const CareerHistory = sequelize.define(
    "CareerHistory",
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
        change_type: {
            type: DataTypes.ENUM("promotion", "transfer", "salary_increase", "position_change", "grade_change", "demotion"),
            allowNull: false,
        },
        effective_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        previous_direction_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "directions",
                key: "id",
            },
        },
        new_direction_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "directions",
                key: "id",
            },
        },
        previous_service_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "services",
                key: "id",
            },
        },
        new_service_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "services",
                key: "id",
            },
        },
        previous_job_position_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "job_positions",
                key: "id",
            },
        },
        new_job_position_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "job_positions",
                key: "id",
            },
        },
        previous_grade_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "grades",
                key: "id",
            },
        },
        new_grade_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "grades",
                key: "id",
            },
        },
        previous_salary: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        new_salary: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
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
        tableName: "career_history",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default CareerHistory;
