import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const EmployeeDocument = sequelize.define(
    "EmployeeDocument",
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
        document_type: {
            type: DataTypes.ENUM("id_card", "passport", "birth_certificate", "diploma", "certificate", "contract", "other"),
            allowNull: false,
        },
        document_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        file_path: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        file_size: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        mime_type: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        expiry_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        uploaded_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
    },
    {
        tableName: "employee_documents",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default EmployeeDocument;
