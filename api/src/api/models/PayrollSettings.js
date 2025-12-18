import { DataTypes } from 'sequelize';
import database from '../../config/database.js';

const PayrollSettings = database.define('payroll_settings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  effective_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  irpp_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  inss_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00
  },
  pay_frequency: {
    type: DataTypes.STRING(20),
    defaultValue: 'monthly'
  },
  payment_day: {
    type: DataTypes.INTEGER,
    defaultValue: 24
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'CDF'
  },
  config: {
    type: DataTypes.JSON,
    allowNull: true
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
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default PayrollSettings;
