import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const AnnouncementRead = sequelize.define(
    "AnnouncementRead",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        announcement_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "internal_announcements",
                key: "id",
            },
        },
        employee_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "employees",
                key: "id",
            },
        },
        read_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "announcement_reads",
        timestamps: false,
    }
);

export default AnnouncementRead;
