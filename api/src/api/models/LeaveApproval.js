import { DataTypes  } from 'sequelize';
import database from '../../config/database.js';

const LeaveApproval = database.define('leave_approvals', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    leave_request_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    approver_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    approver_role: {
        type: DataTypes.STRING,
        allowNull: false
    },
    action: {
        type: DataTypes.ENUM('approved', 'rejected', 'returned'),
        allowNull: false
    },
    comments: {
        type: DataTypes.TEXT
    },
    approval_level: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    approved_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false
});

export default LeaveApproval;
