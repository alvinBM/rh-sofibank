import { Op  } from 'sequelize';
import models from '../models/index.js';

const employeeController = {
  /**
   * Get all employees with pagination and filters
   */
  getAll: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        direction_id,
        service_id,
        employment_status,
        contract_type
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      // Search filter
      if (search) {
        where[Op.or] = [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { employee_number: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      // Direction filter
      if (direction_id) {
        where.direction_id = direction_id;
      }

      // Service filter
      if (service_id) {
        where.service_id = service_id;
      }

      // Employment status filter
      if (employment_status) {
        where.employment_status = employment_status;
      }

      // Contract type filter
      if (contract_type) {
        where.contract_type = contract_type;
      }

      const { count, rows } = await models.Employee.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        include: [
          { model: models.User, as: 'user', attributes: ['id', 'email', 'is_active'] },
          { model: models.Direction, as: 'direction' },
          { model: models.Service, as: 'service' },
          { model: models.JobPosition, as: 'job_position' },
          { model: models.Grade, as: 'grade' },
          { model: models.Employee, as: 'direct_supervisor', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
          { model: models.Employee, as: 'secondary_supervisor', attributes: ['id', 'first_name', 'last_name', 'employee_number'] }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        status: 200,
        data: {
          employees: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get all employees error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération des employés',
        error: error.message
      });
    }
  },

  /**
   * Get employee by ID
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const employee = await models.Employee.findByPk(id, {
        include: [
          { model: models.User, as: 'user', attributes: ['id', 'email', 'is_active', 'last_login'] },
          { model: models.Direction, as: 'direction' },
          { model: models.Service, as: 'service' },
          { model: models.JobPosition, as: 'job_position' },
          { model: models.Grade, as: 'grade' },
          { model: models.Employee, as: 'direct_supervisor', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
          { model: models.Employee, as: 'secondary_supervisor', attributes: ['id', 'first_name', 'last_name', 'employee_number'] }
        ]
      });

      if (!employee) {
        return res.status(200).json({
          status: 404,
          message: 'Employé non trouvé'
        });
      }

      return res.status(200).json({
        status: 200,
        data: employee
      });
    } catch (error) {
      console.error('Get employee by ID error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération de l\'employé',
        error: error.message
      });
    }
  },

  /**
   * Create new employee
   */
  create: async (req, res) => {
    try {
      const employeeData = req.body;
      employeeData.created_by = req.user.id;

      // Check if user_id exists
      if (employeeData.user_id) {
        const user = await models.User.findByPk(employeeData.user_id);
        if (!user) {
          return res.status(200).json({
            status: 404,
            message: 'Utilisateur non trouvé'
          });
        }

        // Check if employee already exists for this user
        const existingEmployee = await models.Employee.findOne({
          where: { user_id: employeeData.user_id }
        });

        if (existingEmployee) {
          return res.status(200).json({
            status: 409,
            message: 'Un employé existe déjà pour cet utilisateur'
          });
        }
      }

      // Check if employee_number is unique
      if (employeeData.employee_number) {
        const existingEmployee = await models.Employee.findOne({
          where: { employee_number: employeeData.employee_number }
        });

        if (existingEmployee) {
          return res.status(200).json({
            status: 409,
            message: 'Ce matricule employé existe déjà'
          });
        }
      }

      const employee = await models.Employee.create(employeeData);

      // Fetch with associations
      const createdEmployee = await models.Employee.findByPk(employee.id, {
        include: [
          { model: models.User, as: 'user' },
          { model: models.Direction, as: 'direction' },
          { model: models.Service, as: 'service' },
          { model: models.JobPosition, as: 'job_position' },
          { model: models.Grade, as: 'grade' }
        ]
      });

      return res.status(200).json({
        status: 201,
        message: 'Employé créé avec succès',
        data: createdEmployee
      });
    } catch (error) {
      console.error('Create employee error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la création de l\'employé',
        error: error.message
      });
    }
  },

  /**
   * Update employee
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      updates.updated_by = req.user.id;

      const employee = await models.Employee.findByPk(id);

      if (!employee) {
        return res.status(200).json({
          status: 404,
          message: 'Employé non trouvé'
        });
      }

      // Check if employee_number is being changed and is unique
      if (updates.employee_number && updates.employee_number !== employee.employee_number) {
        const existingEmployee = await models.Employee.findOne({
          where: { 
            employee_number: updates.employee_number,
            id: { [Op.ne]: id }
          }
        });

        if (existingEmployee) {
          return res.status(200).json({
            status: 409,
            message: 'Ce matricule employé existe déjà'
          });
        }
      }

      await employee.update(updates);

      // Fetch with associations
      const updatedEmployee = await models.Employee.findByPk(id, {
        include: [
          { model: models.User, as: 'user' },
          { model: models.Direction, as: 'direction' },
          { model: models.Service, as: 'service' },
          { model: models.JobPosition, as: 'job_position' },
          { model: models.Grade, as: 'grade' }
        ]
      });

      return res.status(200).json({
        status: 200,
        message: 'Employé mis à jour avec succès',
        data: updatedEmployee
      });
    } catch (error) {
      console.error('Update employee error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la mise à jour de l\'employé',
        error: error.message
      });
    }
  },

  /**
   * Delete employee (soft delete)
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const employee = await models.Employee.findByPk(id);

      if (!employee) {
        return res.status(200).json({
          status: 404,
          message: 'Employé non trouvé'
        });
      }

      // Soft delete by setting is_active to false
      await employee.update({ 
        is_active: false,
        employment_status: 'terminated',
        termination_date: new Date(),
        updated_by: req.user.id
      });

      return res.status(200).json({
        status: 200,
        message: 'Employé désactivé avec succès'
      });
    } catch (error) {
      console.error('Delete employee error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la suppression de l\'employé',
        error: error.message
      });
    }
  },

  /**
   * Get employee statistics
   */
  getStatistics: async (req, res) => {
    try {
      const totalEmployees = await models.Employee.count({
        where: { is_active: true }
      });

      const byStatus = await models.Employee.findAll({
        attributes: [
          'employment_status',
          [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']
        ],
        where: { is_active: true },
        group: ['employment_status']
      });

      const byDirection = await models.Employee.findAll({
        attributes: [
          'direction_id',
          [models.sequelize.fn('COUNT', models.sequelize.col('employees.id')), 'count']
        ],
        where: { is_active: true },
        include: [
          { model: models.Direction, as: 'direction', attributes: ['name', 'code'] }
        ],
        group: ['direction_id']
      });

      const byContractType = await models.Employee.findAll({
        attributes: [
          'contract_type',
          [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']
        ],
        where: { is_active: true },
        group: ['contract_type']
      });

      return res.status(200).json({
        status: 200,
        data: {
          total: totalEmployees,
          by_status: byStatus,
          by_direction: byDirection,
          by_contract_type: byContractType
        }
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message
      });
    }
  },

  /**
   * Get employee's subordinates
   */
  getSubordinates: async (req, res) => {
    try {
      const { id } = req.params;

      const subordinates = await models.Employee.findAll({
        where: {
          [Op.or]: [
            { direct_supervisor_id: id },
            { secondary_supervisor_id: id }
          ],
          is_active: true
        },
        include: [
          { model: models.Direction, as: 'direction' },
          { model: models.Service, as: 'service' },
          { model: models.JobPosition, as: 'job_position' }
        ]
      });

      return res.status(200).json({
        status: 200,
        data: subordinates
      });
    } catch (error) {
      console.error('Get subordinates error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération des subordonnés',
        error: error.message
      });
    }
  }
};

export default employeeController;
