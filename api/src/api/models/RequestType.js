import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const RequestType = sequelize.define(
    "RequestType",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        category: {
            type: DataTypes.ENUM("administrative", "technical", "hr", "it", "other"),
            defaultValue: "other",
        },
        requires_approval: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "request_types",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default RequestType;
