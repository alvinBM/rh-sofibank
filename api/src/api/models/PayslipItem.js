import { DataTypes } from 'sequelize';
import database from '../../config/database.js';

const PayslipItem = database.define('payslip_items', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  payslip_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  item_type_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 1.00
  },
  rate: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  is_taxable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  createdAt: 'created_at'
});

export default PayslipItem;
