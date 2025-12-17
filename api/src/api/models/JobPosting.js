import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const JobPosting = sequelize.define(
    "JobPosting",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        recruitment_plan_position_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "recruitment_plan_positions",
                key: "id",
            },
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        reference_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        job_position_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "job_positions",
                key: "id",
            },
        },
        direction_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "directions",
                key: "id",
            },
        },
        service_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "services",
                key: "id",
            },
        },
        grade_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "grades",
                key: "id",
            },
        },
        contract_type: {
            type: DataTypes.ENUM("permanent", "fixed_term", "temporary", "internship", "consultant"),
            allowNull: false,
        },
        employment_type: {
            type: DataTypes.ENUM("full_time", "part_time", "contract"),
            defaultValue: "full_time",
        },
        location: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        salary_range_min: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        salary_range_max: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        responsibilities: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        requirements: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        qualifications: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        benefits: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        application_deadline: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        positions_available: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        status: {
            type: DataTypes.ENUM("draft", "published", "closed", "cancelled", "filled"),
            defaultValue: "draft",
        },
        published_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        closed_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        publish_on_website: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        publish_on_social_media: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        receiving_email: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        auto_process_emails: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
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
        tableName: "job_postings",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default JobPosting;
