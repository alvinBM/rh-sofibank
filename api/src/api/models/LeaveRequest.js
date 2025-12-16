import { DataTypes  } from 'sequelize';
import database from '../../config/database.js';

const LeaveRequest = database.define('leave_requests', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    request_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    employee_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    leave_type_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    total_days: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    return_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT
    },
    contact_during_leave: {
        type: DataTypes.STRING
    },
    emergency_contact: {
        type: DataTypes.STRING
    },
    attachment_urls: {
        type: DataTypes.JSON
    },
    backup_employee_id: {
        type: DataTypes.UUID
    },
    backup_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    backup_approved_at: {
        type: DataTypes.DATE
    },
    backup_notes: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('draft', 'pending_backup', 'pending_supervisor', 'pending_hr', 'pending_dg', 'approved', 'rejected', 'cancelled'),
        defaultValue: 'draft'
    },
    submitted_at: {
        type: DataTypes.DATE
    },
    current_approver_id: {
        type: DataTypes.UUID
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
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default LeaveRequest;
