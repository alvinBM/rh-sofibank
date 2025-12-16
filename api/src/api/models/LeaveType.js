import { DataTypes  } from 'sequelize';
import database from '../../config/database.js';

const LeaveType = database.define('leave_types', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    category: {
        type: DataTypes.ENUM('annual', 'circumstance', 'sick', 'maternity', 'paternity', 'unpaid', 'other'),
        allowNull: false
    },
    default_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    max_days_per_year: {
        type: DataTypes.INTEGER
    },
    requires_document: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    requires_handover: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    is_paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    description: {
        type: DataTypes.TEXT
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

export default LeaveType;
