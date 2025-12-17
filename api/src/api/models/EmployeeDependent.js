import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const EmployeeDependent = sequelize.define(
    "EmployeeDependent",
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
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        relationship: {
            type: DataTypes.ENUM("spouse", "child", "parent", "sibling", "other"),
            allowNull: false,
        },
        date_of_birth: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        gender: {
            type: DataTypes.ENUM("M", "F"),
            allowNull: true,
        },
        is_beneficiary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "employee_dependents",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default EmployeeDependent;
