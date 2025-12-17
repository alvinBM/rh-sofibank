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
        manager_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "employees",
                key: "id",
            },
        },
        offered_salary: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING(10),
            defaultValue: "XAF",
        },
        salary_frequency: {
            type: DataTypes.ENUM("hourly", "monthly", "annual"),
            defaultValue: "monthly",
        },
        benefits_package: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        contract_type: {
            type: DataTypes.ENUM("cdi", "cdd", "stage", "prestation", "apprentissage"),
            defaultValue: "cdi",
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        probation_period_months: {
            type: DataTypes.INTEGER,
            defaultValue: 3,
        },
        work_schedule: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        remote_work_policy: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        offer_letter_path: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        offer_sent_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        offer_expiry_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("draft", "pending_approval", "approved", "sent", "accepted", "declined", "expired", "cancelled"),
            defaultValue: "draft",
        },
        candidate_response_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        candidate_comments: {
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
        approved_date: {
            type: DataTypes.DATE,
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
