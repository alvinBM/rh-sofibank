import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const ApplicationStatusHistory = sequelize.define(
    "ApplicationStatusHistory",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        application_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "job_applications",
                key: "id",
            },
        },
        previous_status: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        new_status: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        changed_by: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "application_status_history",
        timestamps: true,
        createdAt: "changed_at",
        updatedAt: false,
    }
);

export default ApplicationStatusHistory;
