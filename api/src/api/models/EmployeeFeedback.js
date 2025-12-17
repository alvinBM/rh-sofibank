import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const EmployeeFeedback = sequelize.define(
    "EmployeeFeedback",
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
        category: {
            type: DataTypes.ENUM("suggestion", "complaint", "compliment", "question", "other"),
            allowNull: false,
        },
        subject: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        is_anonymous: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        status: {
            type: DataTypes.ENUM("pending", "reviewed", "archived"),
            defaultValue: "pending",
        },
        response: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        reviewed_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        reviewed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "employee_feedback",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default EmployeeFeedback;
