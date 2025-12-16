import { Op  } from 'sequelize';
import models from '../models.js';

const leaveController = {
  /**
   * Get all leave requests with pagination and filters
   */
  getAllRequests: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        employee_id,
        leave_type_id,
        start_date,
        end_date
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      if (status) where.status = status;
      if (employee_id) where.employee_id = employee_id;
      if (leave_type_id) where.leave_type_id = leave_type_id;
      if (start_date) where.start_date = { [Op.gte]: start_date };
      if (end_date) where.end_date = { [Op.lte]: end_date };

      const { count, rows } = await models.LeaveRequest.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        include: [
          {
            model: models.Employee,
            as: 'employee',
            attributes: ['id', 'first_name', 'last_name', 'employee_number', 'profile_photo_url'],
            include: [
              { model: models.Direction, as: 'direction', attributes: ['name'] },
              { model: models.Service, as: 'service', attributes: ['name'] }
            ]
          },
          { model: models.LeaveType, as: 'leave_type' },
          {
            model: models.Employee,
            as: 'backup_employee',
            attributes: ['id', 'first_name', 'last_name', 'employee_number']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        status: 200,
        data: {
          requests: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get all leave requests error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération des demandes de congé',
        error: error.message
      });
    }
  },

  /**
   * Get leave request by ID
   */
  getRequestById: async (req, res) => {
    try {
      const { id } = req.params;

      const request = await models.LeaveRequest.findByPk(id, {
        include: [
          {
            model: models.Employee,
            as: 'employee',
            include: [
              { model: models.Direction, as: 'direction' },
              { model: models.Service, as: 'service' },
              { model: models.Employee, as: 'direct_supervisor', attributes: ['id', 'first_name', 'last_name'] }
            ]
          },
          { model: models.LeaveType, as: 'leave_type' },
          {
            model: models.Employee,
            as: 'backup_employee',
            attributes: ['id', 'first_name', 'last_name', 'employee_number']
          },
          {
            model: models.LeaveApproval,
            as: 'approvals',
            include: [
              {
                model: models.User,
                as: 'approver',
                attributes: ['id', 'email'],
                include: [
                  {
                    model: models.Employee,
                    as: 'employee',
                    attributes: ['first_name', 'last_name']
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!request) {
        return res.status(200).json({
          status: 404,
          message: 'Demande de congé non trouvée'
        });
      }

      return res.status(200).json({
        status: 200,
        data: request
      });
    } catch (error) {
      console.error('Get leave request by ID error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération de la demande',
        error: error.message
      });
    }
  },

  /**
   * Create new leave request
   */
  createRequest: async (req, res) => {
    try {
      const requestData = req.body;
      requestData.created_by = req.user.id;

      // Generate request number
      const year = new Date().getFullYear();
      const lastRequest = await models.LeaveRequest.findOne({
        where: {
          request_number: { [Op.like]: `LR-${year}-%` }
        },
        order: [['created_at', 'DESC']]
      });

      let nextNumber = 1;
      if (lastRequest) {
        const lastNumber = parseInt(lastRequest.request_number.split('-')[2]);
        nextNumber = lastNumber + 1;
      }

      requestData.request_number = `LR-${year}-${String(nextNumber).padStart(3, '0')}`;
      requestData.status = 'draft';

      // Check leave balance
      const balance = await models.LeaveBalance.findOne({
        where: {
          employee_id: requestData.employee_id,
          leave_type_id: requestData.leave_type_id,
          year
        }
      });

      if (balance && parseFloat(requestData.total_days) > parseFloat(balance.remaining_days)) {
        return res.status(200).json({
          status: 400,
          message: `Solde de congé insuffisant. Disponible: ${balance.remaining_days} jours`
        });
      }

      const request = await models.LeaveRequest.create(requestData);

      // Fetch with associations
      const createdRequest = await models.LeaveRequest.findByPk(request.id, {
        include: [
          { model: models.Employee, as: 'employee' },
          { model: models.LeaveType, as: 'leave_type' },
          { model: models.Employee, as: 'backup_employee' }
        ]
      });

      return res.status(200).json({
        status: 201,
        message: 'Demande de congé créée avec succès',
        data: createdRequest
      });
    } catch (error) {
      console.error('Create leave request error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la création de la demande',
        error: error.message
      });
    }
  },

  /**
   * Submit leave request for approval
   */
  submitRequest: async (req, res) => {
    try {
      const { id } = req.params;

      const request = await models.LeaveRequest.findByPk(id, {
        include: [
          { model: models.LeaveType, as: 'leave_type' }
        ]
      });

      if (!request) {
        return res.status(200).json({
          status: 404,
          message: 'Demande de congé non trouvée'
        });
      }

      if (request.status !== 'draft') {
        return res.status(200).json({
          status: 400,
          message: 'Seules les demandes en brouillon peuvent être soumises'
        });
      }

      // Determine next status based on leave type
      let nextStatus = 'pending_supervisor';
      if (request.leave_type.requires_handover && request.backup_employee_id) {
        nextStatus = 'pending_backup';
      }

      await request.update({
        status: nextStatus,
        submitted_at: new Date()
      });

      return res.status(200).json({
        status: 200,
        message: 'Demande soumise avec succès',
        data: request
      });
    } catch (error) {
      console.error('Submit leave request error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la soumission de la demande',
        error: error.message
      });
    }
  },

  /**
   * Approve or reject leave request
   */
  processRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const { action, comments } = req.body; // action: 'approved' | 'rejected' | 'returned'

      if (!['approved', 'rejected', 'returned'].includes(action)) {
        return res.status(200).json({
          status: 400,
          message: 'Action invalide. Utilisez: approved, rejected, ou returned'
        });
      }

      const request = await models.LeaveRequest.findByPk(id, {
        include: [
          { model: models.Employee, as: 'employee' },
          { model: models.LeaveType, as: 'leave_type' }
        ]
      });

      if (!request) {
        return res.status(200).json({
          status: 404,
          message: 'Demande de congé non trouvée'
        });
      }

      // Get approver role
      const userRoles = await models.UserRole.findAll({
        where: { user_id: req.user.id },
        include: [{ model: models.Role, as: 'role' }]
      });

      const roleCodes = userRoles.map(ur => ur.role.code);
      let approverRole = 'SUPERVISOR';
      if (roleCodes.includes('SUPER_ADMIN') || roleCodes.includes('ADMIN')) {
        approverRole = 'DG';
      } else if (roleCodes.includes('RH_MANAGER')) {
        approverRole = 'RH';
      }

      // Determine approval level
      const approvalLevelMap = {
        'pending_backup': 1,
        'pending_supervisor': 2,
        'pending_hr': 3,
        'pending_dg': 4
      };

      const currentLevel = approvalLevelMap[request.status] || 0;

      // Create approval record
      await models.LeaveApproval.create({
        leave_request_id: id,
        approver_id: req.user.id,
        approver_role: approverRole,
        action,
        comments,
        approval_level: currentLevel
      });

      // Update request status
      let newStatus = request.status;
      if (action === 'rejected') {
        newStatus = 'rejected';
      } else if (action === 'returned') {
        newStatus = 'draft';
      } else if (action === 'approved') {
        const statusFlow = {
          'pending_backup': 'pending_supervisor',
          'pending_supervisor': 'pending_hr',
          'pending_hr': 'pending_dg',
          'pending_dg': 'approved'
        };
        newStatus = statusFlow[request.status] || 'approved';
      }

      await request.update({ status: newStatus });

      // If approved, update leave balance
      if (newStatus === 'approved') {
        const year = new Date(request.start_date).getFullYear();
        const balance = await models.LeaveBalance.findOne({
          where: {
            employee_id: request.employee_id,
            leave_type_id: request.leave_type_id,
            year
          }
        });

        if (balance) {
          const newUsed = parseFloat(balance.used_days) + parseFloat(request.total_days);
          const newRemaining = parseFloat(balance.total_days) - newUsed;
          await balance.update({
            used_days: newUsed,
            remaining_days: newRemaining
          });
        }
      }

      return res.status(200).json({
        status: 200,
        message: `Demande ${action === 'approved' ? 'approuvée' : action === 'rejected' ? 'rejetée' : 'retournée'} avec succès`,
        data: request
      });
    } catch (error) {
      console.error('Process leave request error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors du traitement de la demande',
        error: error.message
      });
    }
  },

  /**
   * Get employee leave balance
   */
  getBalance: async (req, res) => {
    try {
      const { employee_id, year = new Date().getFullYear() } = req.query;

      if (!employee_id) {
        return res.status(200).json({
          status: 400,
          message: 'employee_id est requis'
        });
      }

      const balances = await models.LeaveBalance.findAll({
        where: {
          employee_id,
          year: parseInt(year)
        },
        include: [
          { model: models.LeaveType, as: 'leave_type' }
        ]
      });

      return res.status(200).json({
        status: 200,
        data: balances
      });
    } catch (error) {
      console.error('Get leave balance error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération du solde',
        error: error.message
      });
    }
  },

  /**
   * Get all leave types
   */
  getLeaveTypes: async (req, res) => {
    try {
      const leaveTypes = await models.LeaveType.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']]
      });

      return res.status(200).json({
        status: 200,
        data: leaveTypes
      });
    } catch (error) {
      console.error('Get leave types error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération des types de congé',
        error: error.message
      });
    }
  },

  /**
   * Create leave type
   */
  createLeaveType: async (req, res) => {
    try {
      const leaveTypeData = req.body;

      const leaveType = await models.LeaveType.create(leaveTypeData);

      return res.status(200).json({
        status: 201,
        message: 'Type de congé créé avec succès',
        data: leaveType
      });
    } catch (error) {
      console.error('Create leave type error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la création du type de congé',
        error: error.message
      });
    }
  },

  /**
   * Initialize leave balances for an employee
   */
  initializeBalances: async (req, res) => {
    try {
      const { employee_id, year = new Date().getFullYear() } = req.body;

      if (!employee_id) {
        return res.status(200).json({
          status: 400,
          message: 'employee_id est requis'
        });
      }

      const leaveTypes = await models.LeaveType.findAll({
        where: { is_active: true, default_days: { [Op.gt]: 0 } }
      });

      const balances = [];
      for (const leaveType of leaveTypes) {
        const [balance, created] = await models.LeaveBalance.findOrCreate({
          where: {
            employee_id,
            leave_type_id: leaveType.id,
            year: parseInt(year)
          },
          defaults: {
            total_days: leaveType.default_days,
            used_days: 0,
            remaining_days: leaveType.default_days,
            carried_over_days: 0
          }
        });

        balances.push(balance);
      }

      return res.status(200).json({
        status: 200,
        message: 'Soldes de congé initialisés avec succès',
        data: balances
      });
    } catch (error) {
      console.error('Initialize balances error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de l\'initialisation des soldes',
        error: error.message
      });
    }
  }
};

export default leaveController;
