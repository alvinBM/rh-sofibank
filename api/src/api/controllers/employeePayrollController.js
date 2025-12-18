import models from '../models/index.js';
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const employeePayrollController = {
  /**
   * Get payslips for an employee
   */
  getPayslips: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { year, month, status } = req.query;

      const where = { employee_id: employeeId };

      // Build filters
      const periodWhere = {};
      if (year) periodWhere.year = parseInt(year);
      if (month) periodWhere.month = parseInt(month);

      if (status) {
        where.status = status;
      }

      const payslips = await models.Payslip.findAll({
        where,
        include: [
          {
            model: models.PayrollPeriod,
            as: 'payroll_period',
            where: Object.keys(periodWhere).length > 0 ? periodWhere : undefined,
            attributes: ['id', 'period_name', 'year', 'month', 'payment_date', 'start_date', 'end_date']
          },
          {
            model: models.PayslipItem,
            as: 'items',
            include: [
              {
                model: models.PayrollItemType,
                as: 'item_type',
                attributes: ['id', 'name', 'code', 'category']
              }
            ]
          }
        ],
        order: [[{ model: models.PayrollPeriod, as: 'payroll_period' }, 'year', 'DESC'], 
                [{ model: models.PayrollPeriod, as: 'payroll_period' }, 'month', 'DESC']]
      });

      return res.status(200).json({
        status: 200,
        data: payslips
      });
    } catch (error) {
      console.error('Get payslips error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération des bulletins de paie',
        error: error.message
      });
    }
  },

  /**
   * Get a specific payslip
   */
  getPayslipById: async (req, res) => {
    try {
      const { id } = req.params;

      const payslip = await models.Payslip.findByPk(id, {
        include: [
          {
            model: models.Employee,
            as: 'employee',
            attributes: ['id', 'first_name', 'last_name', 'employee_number'],
            include: [
              { model: models.Grade, as: 'grade', attributes: ['id', 'name', 'code'] },
              { model: models.JobPosition, as: 'job_position', attributes: ['id', 'title', 'code'] },
              { model: models.Direction, as: 'direction', attributes: ['id', 'name', 'code'] },
              { model: models.Service, as: 'service', attributes: ['id', 'name', 'code'] }
            ]
          },
          {
            model: models.PayrollPeriod,
            as: 'payroll_period'
          },
          {
            model: models.PayslipItem,
            as: 'items',
            include: [
              {
                model: models.PayrollItemType,
                as: 'item_type'
              }
            ]
          }
        ]
      });

      if (!payslip) {
        return res.status(200).json({
          status: 404,
          message: 'Bulletin de paie non trouvé'
        });
      }

      return res.status(200).json({
        status: 200,
        data: payslip
      });
    } catch (error) {
      console.error('Get payslip error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération du bulletin',
        error: error.message
      });
    }
  },

  /**
   * Download payslip PDF
   */
  downloadPayslip: async (req, res) => {
    try {
      const { id } = req.params;

      const payslip = await models.Payslip.findByPk(id, {
        include: [
          {
            model: models.Employee,
            as: 'employee',
            attributes: ['id', 'first_name', 'last_name', 'employee_number']
          },
          {
            model: models.PayrollPeriod,
            as: 'payroll_period'
          }
        ]
      });

      if (!payslip) {
        return res.status(404).json({
          status: 404,
          message: 'Bulletin de paie non trouvé'
        });
      }

      // Check if PDF exists
      if (payslip.pdf_url) {
        const filePath = path.join(__dirname, '../../../public', payslip.pdf_url);
        
        if (fs.existsSync(filePath)) {
          const fileName = `Bulletin_${payslip.employee.first_name}_${payslip.employee.last_name}_${payslip.payroll_period.period_name}.pdf`;
          return res.download(filePath, fileName);
        }
      }

      return res.status(200).json({
        status: 404,
        message: 'PDF du bulletin non disponible'
      });
    } catch (error) {
      console.error('Download payslip error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Erreur lors du téléchargement du bulletin',
        error: error.message
      });
    }
  },

  /**
   * Get payment history summary for an employee
   */
  getPaymentHistory: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { startYear, endYear } = req.query;

      const periodWhere = {};
      if (startYear) periodWhere.year = { [Op.gte]: parseInt(startYear) };
      if (endYear) {
        periodWhere.year = periodWhere.year 
          ? { ...periodWhere.year, [Op.lte]: parseInt(endYear) }
          : { [Op.lte]: parseInt(endYear) };
      }

      const payslips = await models.Payslip.findAll({
        where: { 
          employee_id: employeeId,
          status: 'paid'
        },
        include: [
          {
            model: models.PayrollPeriod,
            as: 'payroll_period',
            where: Object.keys(periodWhere).length > 0 ? periodWhere : undefined,
            attributes: ['id', 'period_name', 'year', 'month', 'payment_date']
          }
        ],
        attributes: [
          'id',
          'payslip_number',
          'gross_salary',
          'net_salary',
          'total_deductions',
          'tax_amount',
          'payment_date',
          'pdf_url'
        ],
        order: [[{ model: models.PayrollPeriod, as: 'payroll_period' }, 'year', 'DESC'], 
                [{ model: models.PayrollPeriod, as: 'payroll_period' }, 'month', 'DESC']]
      });

      // Calculate summary
      const summary = {
        total_payments: payslips.length,
        total_gross: payslips.reduce((sum, p) => sum + parseFloat(p.gross_salary), 0),
        total_net: payslips.reduce((sum, p) => sum + parseFloat(p.net_salary), 0),
        total_deductions: payslips.reduce((sum, p) => sum + parseFloat(p.total_deductions), 0),
        total_tax: payslips.reduce((sum, p) => sum + parseFloat(p.tax_amount), 0)
      };

      return res.status(200).json({
        status: 200,
        data: {
          payslips,
          summary
        }
      });
    } catch (error) {
      console.error('Get payment history error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération de l\'historique des paiements',
        error: error.message
      });
    }
  }
};

export default employeePayrollController;
