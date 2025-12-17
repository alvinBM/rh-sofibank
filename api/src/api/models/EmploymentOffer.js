import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const EmploymentOffer = sequelize.define(
    "EmploymentOffer",
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
        offer_number: {
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
        grade_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "grades",
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
        direction_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "directions",
                key: "id",
            },
        },
        salary: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        benefits: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        terms_and_conditions: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        contract_type: {
            type: DataTypes.ENUM("permanent", "fixed_term", "temporary", "internship", "consultant"),
            allowNull: false,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        offer_letter_path: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("draft", "pending_approval", "approved", "sent", "accepted", "declined", "expired", "withdrawn"),
            defaultValue: "draft",
        },
        sent_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        response_deadline: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        accepted_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        declined_reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        approved_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        approval_date: {
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
        candidate_response_notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "employment_offers",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

export default EmploymentOffer;
