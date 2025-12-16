import { DataTypes  } from 'sequelize';
import database from '../../config/database.js';

const RolePermission = database.define('role_permissions', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    role_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    permission_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false
});

export default RolePermission;
