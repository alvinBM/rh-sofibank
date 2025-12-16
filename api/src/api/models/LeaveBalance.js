import { DataTypes  } from 'sequelize';
import database from '../../config/database.js';

const LeaveBalance = database.define('leave_balances', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    employee_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    leave_type_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_days: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
    },
    used_days: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
    },
    remaining_days: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
    },
    carried_over_days: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['employee_id', 'leave_type_id', 'year']
        }
    ]
});

export default LeaveBalance;
