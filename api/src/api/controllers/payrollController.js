import { Op } from 'sequelize';
import models from '../models/index.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const payrollController = {
  // ==================== PAYROLL RUNS (PERIODS) ====================

  /**
   * Get all payroll runs with filters
   */
  getPayrollRuns: async (req, res) => {
    try {
      const { offset = 0, limit = 10, query = '', status = '', year = '', month = '' } = req.query;

      const where = {};
      
      if (status) where.status = status;
      if (year) where.year = parseInt(year);
      if (month) where.month = parseInt(month);

      if (query) {
        where.period_name = { [Op.like]: `%${query}%` };
      }

      const { rows: runs, count: total } = await models.PayrollPeriod.findAndCountAll({
        where,
        include: [
          {
            model: models.User,
            as: 'processor',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: models.User,
            as: 'approver',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['year', 'DESC'], ['month', 'DESC']]
      });

      return res.status(200).json({
        status: 200,
        data: {
          runs,
          total
        }
      });
    } catch (error) {
      console.error('Get payroll runs error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Erreur lors de la récupération des exécutions de paie',
        error: error.message
      });
    }
  },

  /**
   * Get a single payroll run by ID
   */
  getPayrollRunById: async (req, res) => {
    try {
      const { id } = req.params;

      const run = await models.PayrollPeriod.findByPk(id, {
        include: [
          {
            model: models.User,
            as: 'processor',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: models.User,
            as: 'approver',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: models.Payslip,
            as: 'payslips',
            include: [
              {
                model: models.Employee,
                as: 'employee',
                attributes: ['id', 'first_name', 'last_name', 'employee_number']
              }
            ]
          }
        ]
      });

      if (!run) {
        return res.status(404).json({
          status: 404,
          message: 'Exécution de paie non trouvée'
        });
      }

      return res.status(200).json({
        status: 200,
        data: run
      });
    } catch (error) {
      console.error('Get payroll run error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Erreur lors de la récupération de l\'exécution de paie',
        error: error.message
      });
    }
  },

  /**
   * Create a new payroll run
   */
  createPayrollRun: async (req, res) => {
    const transaction = await models.database.transaction();
    
    try {
      const { period, payment_date, year, month } = req.body;
      const userId = req.user?.id;

      // Check if period already exists
      const existingRun = await models.PayrollPeriod.findOne({
        where: { year, month }
      });

      if (existingRun) {
        await transaction.rollback();
        return res.status(400).json({
          status: 400,
          message: 'Une exécution de paie existe déjà pour cette période'
        });
      }

      // Calculate period dates
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      // Create the payroll period
      const run = await models.PayrollPeriod.create({
        period_name: `Paie ${getMonthName(month)} ${year}`,
        year,
        month,
        start_date: startDate,
        end_date: endDate,
        payment_date,
        status: 'draft'
      }, { transaction });

      await transaction.commit();

      return res.status(201).json({
        status: 201,
        message: 'Exécution de paie créée avec succès',
        data: run
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Create payroll run error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Erreur lors de la création de l\'exécution de paie',
        error: error.message
      });
    }
  },

  /**
   * Process a payroll run (calculate payslips for all active employees)
   */
  processPayrollRun: async (req, res) => {
    const transaction = await models.database.transaction();
    
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const run = await models.PayrollPeriod.findByPk(id);

      if (!run) {
        await transaction.rollback();
        return res.status(404).json({
          status: 404,
          message: 'Exécution de paie non trouvée'
        });
      }

      if (run.status !== 'draft') {
        await transaction.rollback();
        return res.status(400).json({
          status: 400,
          message: 'Cette exécution de paie a déjà été traitée'
        });
      }

      // Get all active employees
      const employees = await models.Employee.findAll({
        where: { 
          employment_status: 'active',
          is_active: true
        },
        include: [
          { model: models.Grade, as: 'grade' },
          { model: models.JobPosition, as: 'job_position' }
        ]
      });

      // Get payroll settings
      const settings = await models.PayrollSettings.findOne({
        where: { is_active: true },
        order: [['effective_date', 'DESC']]
      });

      const irppRate = settings ? parseFloat(settings.irpp_rate) : 30;
      const inssRate = settings ? parseFloat(settings.inss_rate) : 5;

      // Get payroll item types
      const itemTypes = await models.PayrollItemType.findAll({
        where: { is_active: true }
      });

      const itemTypeMap = {};
      itemTypes.forEach(type => {
        itemTypeMap[type.code] = type;
      });

      // Get variables for this period
      const periodKey = `${run.year}-${String(run.month).padStart(2, '0')}`;
      const variables = await models.PayrollVariable.findAll({
        where: { 
          period: periodKey,
          status: 'approved'
        }
      });

      // Group variables by employee
      const employeeVariables = {};
      variables.forEach(v => {
        if (!employeeVariables[v.employee_id]) {
          employeeVariables[v.employee_id] = [];
        }
        employeeVariables[v.employee_id].push(v);
      });

      let totalGross = 0;
      let totalNet = 0;
      let totalTax = 0;
      let totalDeductions = 0;
      let processedCount = 0;

      // Process each employee
      for (const employee of employees) {
        // Get base salary from grade or job position
        const baseSalary = parseFloat(employee.grade?.base_salary || employee.job_position?.base_salary || 0);

        if (baseSalary === 0) continue;

        const empVariables = employeeVariables[employee.id] || [];

        // Calculate totals
        let totalAllowances = 0;
        let totalBonuses = 0;
        let deductions = 0;

        empVariables.forEach(v => {
          const amount = parseFloat(v.amount);
          if (v.variable_type === 'allowance') {
            totalAllowances += amount;
          } else if (v.variable_type === 'bonus' || v.variable_type === 'commission') {
            totalBonuses += amount;
          } else if (v.variable_type === 'deduction') {
            deductions += amount;
          }
        });

        const grossSalary = baseSalary + totalAllowances + totalBonuses;
        const taxableAmount = grossSalary;
        const taxAmount = (taxableAmount * irppRate) / 100;
        const inssAmount = (grossSalary * inssRate) / 100;
        const totalDed = taxAmount + inssAmount + deductions;
        const netSalary = grossSalary - totalDed;

        // Generate payslip number
        const payslipNumber = `PAY-${run.year}${String(run.month).padStart(2, '0')}-${employee.employee_number}`;

        // Create payslip
        const payslip = await models.Payslip.create({
          payslip_number: payslipNumber,
          employee_id: employee.id,
          payroll_period_id: run.id,
          base_salary: baseSalary,
          gross_salary: grossSalary,
          total_allowances: totalAllowances,
          total_bonuses: totalBonuses,
          total_deductions: totalDed,
          taxable_amount: taxableAmount,
          tax_amount: taxAmount,
          net_salary: netSalary,
          status: 'draft',
          payment_method: 'bank_transfer'
        }, { transaction });

        // Create payslip items
        const items = [];

        // Base salary item
        if (itemTypeMap['BASE_SALARY']) {
          items.push({
            payslip_id: payslip.id,
            item_type_id: itemTypeMap['BASE_SALARY'].id,
            description: 'Salaire de base',
            amount: baseSalary,
            is_taxable: true
          });
        }

        // Allowances
        empVariables.forEach(v => {
          if (v.variable_type === 'allowance' && itemTypeMap['ALLOWANCE']) {
            items.push({
              payslip_id: payslip.id,
              item_type_id: itemTypeMap['ALLOWANCE'].id,
              description: v.description || 'Indemnité',
              amount: parseFloat(v.amount),
              is_taxable: true
            });
          }
        });

        // Bonuses
        empVariables.forEach(v => {
          if ((v.variable_type === 'bonus' || v.variable_type === 'commission') && itemTypeMap['BONUS']) {
            items.push({
              payslip_id: payslip.id,
              item_type_id: itemTypeMap['BONUS'].id,
              description: v.description || 'Bonus',
              amount: parseFloat(v.amount),
              is_taxable: true
            });
          }
        });

        // Tax
        if (itemTypeMap['TAX']) {
          items.push({
            payslip_id: payslip.id,
            item_type_id: itemTypeMap['TAX'].id,
            description: `IRPP (${irppRate}%)`,
            amount: -taxAmount,
            is_taxable: false
          });
        }

        // INSS
        if (itemTypeMap['INSS']) {
          items.push({
            payslip_id: payslip.id,
            item_type_id: itemTypeMap['INSS'].id,
            description: `INSS (${inssRate}%)`,
            amount: -inssAmount,
            is_taxable: false
          });
        }

        // Other deductions
        empVariables.forEach(v => {
          if (v.variable_type === 'deduction' && itemTypeMap['DEDUCTION']) {
            items.push({
              payslip_id: payslip.id,
              item_type_id: itemTypeMap['DEDUCTION'].id,
              description: v.description || 'Déduction',
              amount: -parseFloat(v.amount),
              is_taxable: false
            });
          }
        });

        if (items.length > 0) {
          await models.PayslipItem.bulkCreate(items, { transaction });
        }

        totalGross += grossSalary;
        totalNet += netSalary;
        totalTax += taxAmount;
        totalDeductions += totalDed;
        processedCount++;
      }

      // Update payroll period
      await run.update({
        status: 'processing',
        total_employees: processedCount,
        total_gross_amount: totalGross,
        total_net_amount: totalNet,
        total_tax_amount: totalTax,
        total_deductions: totalDeductions,
        processed_by: userId,
        processed_at: new Date()
      }, { transaction });

      await transaction.commit();

      return res.status(200).json({
        status: 200,
        message: `Paie traitée avec succès pour ${processedCount} employés`,
        data: {
          processed_count: processedCount,
          total_gross: totalGross,
          total_net: totalNet
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Process payroll error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Erreur lors du traitement de la paie',
        error: error.message
      });
    }
  },

  /**
   * Approve a payroll run
   */
  approvePayrollRun: async (req, res) => {
    const transaction = await models.database.transaction();
    
    try {
      const { id } = req.params;
      const { approved_by } = req.body;

      const run = await models.PayrollPeriod.findByPk(id);

      if (!run) {
        await transaction.rollback();
        return res.status(404).json({
          status: 404,
          message: 'Exécution de paie non trouvée'
        });
      }

      if (run.status !== 'processing') {
        await transaction.rollback();
        return res.status(400).json({
          status: 400,
          message: 'Cette exécution de paie ne peut pas être approuvée'
        });
      }

      // Update all payslips to approved
      await models.Payslip.update(
        { status: 'approved' },
        { 
          where: { payroll_period_id: id },
          transaction 
        }
      );

      // Update payroll period
      await run.update({
        status: 'approved',
        approved_by,
        approved_at: new Date()
      }, { transaction });

      await transaction.commit();

      return res.status(200).json({
        status: 200,
        message: 'Paie approuvée avec succès',
        data: run
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Approve payroll error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Erreur lors de l\'approbation de la paie',
        error: error.message
      });
    }
  },

  /**
   * Distribute payslips (generate PDFs and send)
   */
  distributePayslips: async (req, res) => {
    try {
      const { id } = req.params;
      const { distribution_method = 'email' } = req.body;

      const run = await models.PayrollPeriod.findByPk(id);

      if (!run) {
        return res.status(404).json({
          status: 404,
          message: 'Exécution de paie non trouvée'
        });
      }

      if (run.status !== 'approved') {
        return res.status(400).json({
          status: 400,
          message: 'La paie doit être approuvée avant distribution'
        });
      }

      // Get all payslips for this run
      const payslips = await models.Payslip.findAll({
        where: { payroll_period_id: id },
        include: [
          {
            model: models.Employee,
            as: 'employee',
            include: [
              { model: models.Grade, as: 'grade' },
              { model: models.JobPosition, as: 'job_position' },
              { model: models.Direction, as: 'direction' },
              { model: models.Service, as: 'service' }
            ]
          },
          {
            model: models.PayslipItem,
            as: 'items',
            include: [
              { model: models.PayrollItemType, as: 'item_type' }
            ]
          }
        ]
      });

      let distributedCount = 0;

      // Generate PDFs for each payslip
      for (const payslip of payslips) {
        try {
          const pdfPath = await generatePayslipPDF(payslip, run);
          
          await payslip.update({
            pdf_url: pdfPath,
            status: 'paid',
            sent_at: new Date(),
            payment_date: run.payment_date
          });

          distributedCount++;
        } catch (pdfError) {
          console.error(`Error generating PDF for payslip ${payslip.id}:`, pdfError);
        }
      }

      // Update run status
      await run.update({ status: 'paid' });

      return res.status(200).json({
        status: 200,
        message: `${distributedCount} bulletins distribués avec succès`,
        data: { distributed_count: distributedCount }
      });
    } catch (error) {
      console.error('Distribute payslips error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Erreur lors de la distribution des bulletins',
        error: error.message
      });
    }
  },

  // ==================== PAYROLL VARIABLES ====================

  /**
   * Get payroll variables
   */
  getPayrollVariables: async (req, res) => {
    try {
      const { offset = 0, limit = 10, query = '', employee_id = '', type = '', period = '', status = '' } = req.query;

      const where = {};
      
      if (employee_id) where.employee_id = employee_id;
      if (type) where.variable_type = type;
      if (period) where.period = period;
      if (status) where.status = status;

      const { rows: variables, count: total } = await models.PayrollVariable.findAndCountAll({
        where,
        include: [
          {
            model: models.Employee,
            as: 'employee',
            attributes: ['id', 'first_name', 'last_name', 'employee_number']
          },
          {
            model: models.User,
            as: 'approver',
            attributes: ['id', 'first_name', 'last_name']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        status: 200,
        data: {
          variables,
          total
        }
      });
    } catch (error) {
      console.error('Get payroll variables error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Erreur lors de la récupération des éléments variables',
        error: error.message
      });
    }
  },

  /**
   * Create payroll variable
   */
  createPayrollVariable: async (req, res) => {
    try {
      const { employee_id, variable_type, amount, period, description } = req.body;
      const userId = req.user?.id;

      const variable = await models.PayrollVariable.create({
        employee_id,
        variable_type,
        amount,
        period,
        description,
        status: 'pending',
        created_by: userId
      });

      return res.status(201).json({
        status: 201,
        message: 'Élément variable créé avec succès',
        data: variable
      });
    } catch (error) {
      console.error('Create payroll variable error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Erreur lors de la création de l\'élément variable',
        error: error.message
      });
    }
  },

  /**
   * Update payroll variable
   */
  updatePayrollVariable: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const variable = await models.PayrollVariable.findByPk(id);

      if (!variable) {
        return res.status(404).json({
          status: 404,
          message: 'Élément variable non trouvé'
        });
      }

      await variable.update(updateData);

      return res.status(200).json({
        status: 200,
        message: 'Élément variable mis à jour avec succès',
        data: variable
      });
    } catch (error) {
      console.error('Update payroll variable error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Erreur lors de la mise à jour de l\'élément variable',
        error: error.message
      });
    }
  },

  /**
   * Delete payroll variable
   */
  deletePayrollVariable: async (req, res) => {
    try {
      const { id } = req.params;

      const variable = await models.PayrollVariable.findByPk(id);

      if (!variable) {
        return res.status(404).json({
          status: 404,
          message: 'Élément variable non trouvé'
        });
      }

      await variable.destroy();

      return res.status(200).json({
        status: 200,
        message: 'Élément variable supprimé avec succès'
      });
    } catch (error) {
      console.error('Delete payroll variable error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Erreur lors de la suppression de l\'élément variable',
        error: error.message
      });
    }
  },

  // ==================== PAYROLL SETTINGS ====================

  /**
   * Get payroll settings
   */
  getPayrollSettings: async (req, res) => {
    try {
      const settings = await models.PayrollSettings.findOne({
        where: { is_active: true },
        order: [['effective_date', 'DESC']]
      });

      return res.status(200).json({
        status: 200,
        data: settings
      });
    } catch (error) {
      console.error('Get payroll settings error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Erreur lors de la récupération des paramètres',
        error: error.message
      });
    }
  },

  /**
   * Update payroll settings
   */
  updatePayrollSettings: async (req, res) => {
    try {
      const updateData = req.body;

      let settings = await models.PayrollSettings.findOne({
        where: { is_active: true },
        order: [['effective_date', 'DESC']]
      });

      if (settings) {
        await settings.update(updateData);
      } else {
        settings = await models.PayrollSettings.create({
          ...updateData,
          effective_date: new Date(),
          is_active: true
        });
      }

      return res.status(200).json({
        status: 200,
        message: 'Paramètres mis à jour avec succès',
        data: settings
      });
    } catch (error) {
      console.error('Update payroll settings error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Erreur lors de la mise à jour des paramètres',
        error: error.message
      });
    }
  },

  // ==================== PAYROLL ITEM TYPES ====================

  /**
   * Get payroll item types
   */
  getPayrollItemTypes: async (req, res) => {
    try {
      const itemTypes = await models.PayrollItemType.findAll({
        where: { is_active: true },
        order: [['display_order', 'ASC'], ['name', 'ASC']]
      });

      return res.status(200).json({
        status: 200,
        data: itemTypes
      });
    } catch (error) {
      console.error('Get payroll item types error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Erreur lors de la récupération des types d\'éléments',
        error: error.message
      });
    }
  }
};

// ==================== HELPER FUNCTIONS ====================

function getMonthName(month) {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[month - 1];
}

async function generatePayslipPDF(payslip, run) {
  return new Promise(async (resolve, reject) => {
    try {
      const uploadsDir = path.join(__dirname, '../../../public/uploads/payslips');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `payslip_${payslip.payslip_number}.pdf`;
      const filepath = path.join(uploadsDir, filename);

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('SOFIBANK RDC', { align: 'center' });
      doc.fontSize(16).text('BULLETIN DE PAIE', { align: 'center' });
      doc.moveDown();

      // Period info
      doc.fontSize(10).font('Helvetica');
      doc.text(`Période: ${run.period_name}`, 50, doc.y);
      doc.text(`Date de paiement: ${new Date(run.payment_date).toLocaleDateString('fr-FR')}`, { align: 'right' });
      doc.text(`N° Bulletin: ${payslip.payslip_number}`, 50, doc.y);
      doc.moveDown();

      // Employee info
      doc.fontSize(12).font('Helvetica-Bold').text('INFORMATIONS EMPLOYÉ');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Nom: ${payslip.employee.first_name} ${payslip.employee.last_name}`);
      doc.text(`Matricule: ${payslip.employee.employee_number}`);
      if (payslip.employee.job_position) {
        doc.text(`Poste: ${payslip.employee.job_position.title}`);
      }
      if (payslip.employee.direction) {
        doc.text(`Direction: ${payslip.employee.direction.name}`);
      }
      doc.moveDown();

      // Earnings and deductions table
      doc.fontSize(12).font('Helvetica-Bold').text('DÉTAIL DE LA PAIE');
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 400;

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Description', col1, tableTop);
      doc.text('Montant (CDF)', col2, tableTop);
      doc.moveTo(col1, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      doc.font('Helvetica');
      let yPos = tableTop + 25;

      // Items
      if (payslip.items && payslip.items.length > 0) {
        payslip.items.forEach(item => {
          const amount = parseFloat(item.amount);
          const formattedAmount = new Intl.NumberFormat('fr-CD', {
            minimumFractionDigits: 2
          }).format(Math.abs(amount));

          doc.text(item.description, col1, yPos);
          doc.text(
            amount >= 0 ? formattedAmount : `(${formattedAmount})`,
            col2,
            yPos
          );
          yPos += 20;
        });
      }

      // Totals
      yPos += 10;
      doc.moveTo(col1, yPos).lineTo(550, yPos).stroke();
      yPos += 10;

      doc.font('Helvetica-Bold');
      doc.text('SALAIRE BRUT', col1, yPos);
      doc.text(
        new Intl.NumberFormat('fr-CD', { minimumFractionDigits: 2 }).format(payslip.gross_salary),
        col2,
        yPos
      );
      yPos += 20;

      doc.text('TOTAL DÉDUCTIONS', col1, yPos);
      doc.text(
        `(${new Intl.NumberFormat('fr-CD', { minimumFractionDigits: 2 }).format(payslip.total_deductions)})`,
        col2,
        yPos
      );
      yPos += 20;

      doc.moveTo(col1, yPos).lineTo(550, yPos).stroke();
      yPos += 10;

      doc.fontSize(12);
      doc.text('SALAIRE NET', col1, yPos);
      doc.text(
        new Intl.NumberFormat('fr-CD', { minimumFractionDigits: 2 }).format(payslip.net_salary),
        col2,
        yPos
      );

      // Footer
      doc.fontSize(8).font('Helvetica').text(
        'Ce bulletin est confidentiel et ne peut être communiqué à des tiers.',
        50,
        doc.page.height - 100,
        { align: 'center' }
      );

      doc.end();

      stream.on('finish', () => {
        resolve(`/uploads/payslips/${filename}`);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export default payrollController;
