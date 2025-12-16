import { DataTypes  } from 'sequelize';
import database from '../../config/database.js';

const UserRole = database.define('user_roles', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    role_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    assigned_by: {
        type: DataTypes.UUID
    },
    assigned_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false
});

export default UserRole;
