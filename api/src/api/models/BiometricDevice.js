import { DataTypes } from 'sequelize';
import database from '../../config/database.js';

const BiometricDevice = database.define('biometric_devices', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    device_name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    device_code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    location: {
        type: DataTypes.STRING(200)
    },
    site: {
        type: DataTypes.STRING(100)
    },
    device_type: {
        type: DataTypes.STRING(50),
        defaultValue: 'fingerprint'
    },
    ip_address: {
        type: DataTypes.STRING(50)
    },
    protocol: {
        type: DataTypes.STRING(50)
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_sync: {
        type: DataTypes.DATE
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
            fields: ['device_code']
        },
        {
            fields: ['site']
        },
        {
            fields: ['is_active']
        }
    ]
});

export default BiometricDevice;
