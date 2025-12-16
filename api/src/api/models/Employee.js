import { DataTypes  } from 'sequelize';
import database from '../../config/database.js';

const Employee = database.define('employees', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
    },
    employee_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    maiden_name: {
        type: DataTypes.STRING
    },
    date_of_birth: {
        type: DataTypes.DATEONLY
    },
    place_of_birth: {
        type: DataTypes.STRING
    },
    gender: {
        type: DataTypes.ENUM('M', 'F', 'Other')
    },
    nationality: {
        type: DataTypes.STRING,
        defaultValue: 'Congolaise'
    },
    national_id: {
        type: DataTypes.STRING,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: DataTypes.STRING
    },
    personal_email: {
        type: DataTypes.STRING
    },
    emergency_contact_name: {
        type: DataTypes.STRING
    },
    emergency_contact_phone: {
        type: DataTypes.STRING
    },
    emergency_contact_relationship: {
        type: DataTypes.STRING
    },
    address_line1: {
        type: DataTypes.STRING
    },
    address_line2: {
        type: DataTypes.STRING
    },
    city: {
        type: DataTypes.STRING
    },
    province: {
        type: DataTypes.STRING
    },
    postal_code: {
        type: DataTypes.STRING
    },
    country: {
        type: DataTypes.STRING,
        defaultValue: 'RDC'
    },
    marital_status: {
        type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed')
    },
    spouse_name: {
        type: DataTypes.STRING
    },
    number_of_children: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    direction_id: {
        type: DataTypes.UUID
    },
    service_id: {
        type: DataTypes.UUID
    },
    job_position_id: {
        type: DataTypes.UUID
    },
    grade_id: {
        type: DataTypes.UUID
    },
    hire_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    contract_type: {
        type: DataTypes.ENUM('permanent', 'temporary', 'intern', 'consultant')
    },
    employment_status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'terminated'),
        defaultValue: 'active'
    },
    termination_date: {
        type: DataTypes.DATEONLY
    },
    termination_reason: {
        type: DataTypes.TEXT
    },
    direct_supervisor_id: {
        type: DataTypes.UUID
    },
    secondary_supervisor_id: {
        type: DataTypes.UUID
    },
    bank_name: {
        type: DataTypes.STRING
    },
    bank_account_number: {
        type: DataTypes.STRING
    },
    bank_account_holder: {
        type: DataTypes.STRING
    },
    tax_id: {
        type: DataTypes.STRING
    },
    social_security_number: {
        type: DataTypes.STRING
    },
    profile_photo_url: {
        type: DataTypes.STRING
    },
    notes: {
        type: DataTypes.TEXT
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    created_by: {
        type: DataTypes.UUID
    },
    updated_by: {
        type: DataTypes.UUID
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Employee;
