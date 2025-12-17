import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const JobInterview = sequelize.define(
    "JobInterview",
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
        interview_type: {
            type: DataTypes.ENUM("phone", "video", "in_person", "technical", "panel", "final"),
            defaultValue: "in_person",
        },
        interview_round: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        scheduled_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        duration_minutes: {
            type: DataTypes.INTEGER,
            defaultValue: 60,
        },
        location: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        meeting_link: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        interviewers: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("scheduled", "completed", "cancelled", "rescheduled", "no_show"),
            defaultValue: "scheduled",
        },
        candidate_confirmed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        reminder_sent: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        scheduled_by: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
    },
    {
        tableName: "job_interviews",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default JobInterview;
