import { DataTypes  } from 'sequelize';
import database from '../../config/database.js';

const AttendanceRecord = database.define('attendance_records', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    employee_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    check_in_time: {
        type: DataTypes.TIME
    },
    check_out_time: {
        type: DataTypes.TIME
    },
    total_hours: {
        type: DataTypes.DECIMAL(5, 2)
    },
    status: {
        type: DataTypes.ENUM('present', 'absent', 'late', 'half_day', 'on_leave', 'holiday'),
        defaultValue: 'present'
    },
    is_late: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    late_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    notes: {
        type: DataTypes.TEXT
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
            fields: ['employee_id', 'date']
        }
    ]
});

export default AttendanceRecord;
