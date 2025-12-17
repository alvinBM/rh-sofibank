import { DataTypes } from 'sequelize';
import database from '../../config/database.js';

const SystemParameter = database.define('system_settings', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    setting_key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    setting_value: {
        type: DataTypes.TEXT
    },
    setting_type: {
        type: DataTypes.STRING(50),
        defaultValue: 'string'
    },
    module: {
        type: DataTypes.STRING(50)
    },
    description: {
        type: DataTypes.TEXT
    },
    is_encrypted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
            fields: ['setting_key']
        },
        {
            fields: ['module']
        }
    ]
});

export default SystemParameter;
