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
        technical_skills: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        communication: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        problem_solving: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        cultural_fit: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        motivation: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        experience_relevance: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        overall_score: {
            type: DataTypes.DECIMAL(5, 2),
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
        detailed_notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        recommendation: {
            type: DataTypes.ENUM("strongly_recommend", "recommend", "neutral", "not_recommend", "strongly_not_recommend"),
            allowNull: true,
        },
        decision: {
            type: DataTypes.ENUM("advance", "reject", "pending"),
            allowNull: true,
        },
        submitted_date: {
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
