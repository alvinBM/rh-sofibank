import { DataTypes } from 'sequelize';
import database from '../../config/database.js';

const Payslip = database.define('payslips', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  payslip_number: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  employee_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  payroll_period_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  base_salary: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  gross_salary: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  total_allowances: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  total_bonuses: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  total_deductions: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  taxable_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  tax_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  net_salary: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING(50),
    defaultValue: 'bank_transfer'
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  payment_reference: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'draft'
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  pdf_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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

export default Payslip;
