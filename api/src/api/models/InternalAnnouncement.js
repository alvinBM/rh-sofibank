import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const InternalAnnouncement = sequelize.define(
    "InternalAnnouncement",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        category: {
            type: DataTypes.ENUM("general", "event", "policy", "alert", "celebration"),
            defaultValue: "general",
        },
        priority: {
            type: DataTypes.ENUM("low", "normal", "high", "urgent"),
            defaultValue: "normal",
        },
        is_published: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        published_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        expiry_date: {
            type: DataTypes.DATE,
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
        tableName: "internal_announcements",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default InternalAnnouncement;
