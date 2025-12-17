import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const EmployeeContract = sequelize.define(
    "EmployeeContract",
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
        contract_type: {
            type: DataTypes.ENUM("permanent", "fixed_term", "temporary", "internship", "consultant"),
            allowNull: false,
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        salary: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        position: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        contract_file_path: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("active", "expired", "terminated", "renewed"),
            defaultValue: "active",
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
        tableName: "employee_contracts",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default EmployeeContract;
