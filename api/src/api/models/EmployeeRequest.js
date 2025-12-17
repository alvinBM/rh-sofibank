import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const EmployeeRequest = sequelize.define(
    "EmployeeRequest",
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
        request_type_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "request_types",
                key: "id",
            },
        },
        subject: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        priority: {
            type: DataTypes.ENUM("low", "medium", "high", "urgent"),
            defaultValue: "medium",
        },
        status: {
            type: DataTypes.ENUM("pending", "in_progress", "resolved", "rejected"),
            defaultValue: "pending",
        },
        attachment_url: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        handled_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        handled_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        response: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "employee_requests",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default EmployeeRequest;
