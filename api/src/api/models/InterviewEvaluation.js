import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const InterviewEvaluation = sequelize.define(
    "InterviewEvaluation",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        interview_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "job_interviews",
                key: "id",
            },
        },
        evaluator_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        technical_skills_score: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        communication_score: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        problem_solving_score: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        cultural_fit_score: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        experience_score: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        overall_score: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        strengths: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        weaknesses: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        recommendation: {
            type: DataTypes.ENUM("highly_recommended", "recommended", "maybe", "not_recommended", "reject"),
            allowNull: false,
        },
        comments: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        evaluation_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "interview_evaluations",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default InterviewEvaluation;
