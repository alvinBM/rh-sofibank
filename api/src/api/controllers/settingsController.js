import models from '../models/index.js';

const settingsController = {
  // ==================== DIRECTIONS ====================
  
  getAllDirections: async (req, res) => {
    try {
      const directions = await models.Direction.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']],
      });

      return res.json({
        status: 200,
        message: 'Directions récupérées avec succès',
        data: directions,
      });
    } catch (error) {
      console.error('Get all directions error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la récupération des directions',
      });
    }
  },

  createDirection: async (req, res) => {
    try {
      const direction = await models.Direction.create(req.body);

      return res.json({
        status: 201,
        message: 'Direction créée avec succès',
        data: direction,
      });
    } catch (error) {
      console.error('Create direction error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la création de la direction',
      });
    }
  },

  updateDirection: async (req, res) => {
    try {
      const { id } = req.params;
      const direction = await models.Direction.findByPk(id);

      if (!direction) {
        return res.json({
          status: 404,
          message: 'Direction non trouvée',
        });
      }

      await direction.update(req.body);

      return res.json({
        status: 200,
        message: 'Direction mise à jour avec succès',
        data: direction,
      });
    } catch (error) {
      console.error('Update direction error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la mise à jour de la direction',
      });
    }
  },

  deleteDirection: async (req, res) => {
    try {
      const { id } = req.params;
      const direction = await models.Direction.findByPk(id);

      if (!direction) {
        return res.json({
          status: 404,
          message: 'Direction non trouvée',
        });
      }

      await direction.update({ is_active: false });

      return res.json({
        status: 200,
        message: 'Direction supprimée avec succès',
      });
    } catch (error) {
      console.error('Delete direction error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la suppression de la direction',
      });
    }
  },

  // ==================== SERVICES ====================

  getAllServices: async (req, res) => {
    try {
      const { direction_id } = req.query;
      const where = { is_active: true };

      if (direction_id) {
        where.direction_id = direction_id;
      }

      const services = await models.Service.findAll({
        where,
        include: [
          {
            model: models.Direction,
            as: 'direction',
            attributes: ['id', 'name', 'code'],
          },
        ],
        order: [['name', 'ASC']],
      });

      return res.json({
        status: 200,
        message: 'Services récupérés avec succès',
        data: services,
      });
    } catch (error) {
      console.error('Get all services error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la récupération des services',
      });
    }
  },

  createService: async (req, res) => {
    try {
      const service = await models.Service.create(req.body);

      return res.json({
        status: 201,
        message: 'Service créé avec succès',
        data: service,
      });
    } catch (error) {
      console.error('Create service error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la création du service',
      });
    }
  },

  updateService: async (req, res) => {
    try {
      const { id } = req.params;
      const service = await models.Service.findByPk(id);

      if (!service) {
        return res.json({
          status: 404,
          message: 'Service non trouvé',
        });
      }

      await service.update(req.body);

      return res.json({
        status: 200,
        message: 'Service mis à jour avec succès',
        data: service,
      });
    } catch (error) {
      console.error('Update service error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la mise à jour du service',
      });
    }
  },

  deleteService: async (req, res) => {
    try {
      const { id } = req.params;
      const service = await models.Service.findByPk(id);

      if (!service) {
        return res.json({
          status: 404,
          message: 'Service non trouvé',
        });
      }

      await service.update({ is_active: false });

      return res.json({
        status: 200,
        message: 'Service supprimé avec succès',
      });
    } catch (error) {
      console.error('Delete service error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la suppression du service',
      });
    }
  },

  // ==================== GRADES ====================

  getAllGrades: async (req, res) => {
    try {
      const grades = await models.Grade.findAll({
        where: { is_active: true },
        order: [['level', 'ASC']],
      });

      return res.json({
        status: 200,
        message: 'Grades récupérés avec succès',
        data: grades,
      });
    } catch (error) {
      console.error('Get all grades error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la récupération des grades',
      });
    }
  },

  createGrade: async (req, res) => {
    try {
      const grade = await models.Grade.create(req.body);

      return res.json({
        status: 201,
        message: 'Grade créé avec succès',
        data: grade,
      });
    } catch (error) {
      console.error('Create grade error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la création du grade',
      });
    }
  },

  updateGrade: async (req, res) => {
    try {
      const { id } = req.params;
      const grade = await models.Grade.findByPk(id);

      if (!grade) {
        return res.json({
          status: 404,
          message: 'Grade non trouvé',
        });
      }

      await grade.update(req.body);

      return res.json({
        status: 200,
        message: 'Grade mis à jour avec succès',
        data: grade,
      });
    } catch (error) {
      console.error('Update grade error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la mise à jour du grade',
      });
    }
  },

  deleteGrade: async (req, res) => {
    try {
      const { id } = req.params;
      const grade = await models.Grade.findByPk(id);

      if (!grade) {
        return res.json({
          status: 404,
          message: 'Grade non trouvé',
        });
      }

      await grade.update({ is_active: false });

      return res.json({
        status: 200,
        message: 'Grade supprimé avec succès',
      });
    } catch (error) {
      console.error('Delete grade error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la suppression du grade',
      });
    }
  },

  // ==================== JOB POSITIONS ====================

  getAllJobPositions: async (req, res) => {
    try {
      const jobPositions = await models.JobPosition.findAll({
        where: { is_active: true },
        order: [['title', 'ASC']],
      });

      return res.json({
        status: 200,
        message: 'Postes récupérés avec succès',
        data: jobPositions,
      });
    } catch (error) {
      console.error('Get all job positions error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la récupération des postes',
      });
    }
  },

  createJobPosition: async (req, res) => {
    try {
      const jobPosition = await models.JobPosition.create(req.body);

      return res.json({
        status: 201,
        message: 'Poste créé avec succès',
        data: jobPosition,
      });
    } catch (error) {
      console.error('Create job position error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la création du poste',
      });
    }
  },

  updateJobPosition: async (req, res) => {
    try {
      const { id } = req.params;
      const jobPosition = await models.JobPosition.findByPk(id);

      if (!jobPosition) {
        return res.json({
          status: 404,
          message: 'Poste non trouvé',
        });
      }

      await jobPosition.update(req.body);

      return res.json({
        status: 200,
        message: 'Poste mis à jour avec succès',
        data: jobPosition,
      });
    } catch (error) {
      console.error('Update job position error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la mise à jour du poste',
      });
    }
  },

  deleteJobPosition: async (req, res) => {
    try {
      const { id } = req.params;
      const jobPosition = await models.JobPosition.findByPk(id);

      if (!jobPosition) {
        return res.json({
          status: 404,
          message: 'Poste non trouvé',
        });
      }

      await jobPosition.update({ is_active: false });

      return res.json({
        status: 200,
        message: 'Poste supprimé avec succès',
      });
    } catch (error) {
      console.error('Delete job position error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la suppression du poste',
      });
    }
  },
  
  // ==================== USERS ====================

  getAllUsers: async (req, res) => {
    try {
      const { offset = 0, limit = 10, query = '' } = req.query;
      
      const whereClause = {};
      if (query) {
        whereClause[models.sequelize.Sequelize.Op.or] = [
          { email: { [models.sequelize.Sequelize.Op.like]: `%${query}%` } },
          { '$employee.first_name$': { [models.sequelize.Sequelize.Op.like]: `%${query}%` } },
          { '$employee.last_name$': { [models.sequelize.Sequelize.Op.like]: `%${query}%` } },
        ];
      }

      const { rows: users, count: total } = await models.User.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: models.Employee,
            as: 'employee',
            attributes: ['id', 'first_name', 'last_name', 'employee_number', 'profile_photo_url'],
          },
          {
            model: models.Role,
            as: 'roles',
            attributes: ['id', 'name', 'code'],
            through: { attributes: [] },
          },
        ],
        offset: parseInt(offset),
        limit: parseInt(limit),
        order: [['created_at', 'DESC']],
        distinct: true,
      });

      return res.json({
        status: 200,
        message: 'Utilisateurs récupérés avec succès',
        data: users,
        total,
      });
    } catch (error) {
      console.error('Get all users error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la récupération des utilisateurs',
      });
    }
  },

  createUser: async (req, res) => {
    try {
      const { email, password, role_ids, employee_data } = req.body;

      // Create user
      const user = await models.User.create({
        email,
        password,
        is_active: true,
      });

      // Assign roles if provided
      if (role_ids && role_ids.length > 0) {
        const roles = await models.Role.findAll({
          where: { id: role_ids },
        });
        await user.setRoles(roles);
      }

      // Create employee if data provided
      if (employee_data) {
        await models.Employee.create({
          ...employee_data,
          user_id: user.id,
        });
      }

      // Fetch complete user data
      const completeUser = await models.User.findByPk(user.id, {
        include: [
          {
            model: models.Employee,
            as: 'employee',
          },
          {
            model: models.Role,
            as: 'roles',
            through: { attributes: [] },
          },
        ],
      });

      return res.json({
        status: 201,
        message: 'Utilisateur créé avec succès',
        data: completeUser,
      });
    } catch (error) {
      console.error('Create user error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la création de l\'utilisateur',
        error: error.message,
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { email, phone, password, role_ids, employee_data } = req.body;

      const user = await models.User.findByPk(id);
      if (!user) {
        return res.json({
          status: 404,
          message: 'Utilisateur non trouvé',
        });
      }

      // Update user basic info
      const updateData = { email, phone };
      if (password) {
        updateData.password = password;
      }
      await user.update(updateData);

      // Update roles if provided
      if (role_ids && role_ids.length > 0) {
        const roles = await models.Role.findAll({
          where: { id: role_ids },
        });
        await user.setRoles(roles);
      }

      // Update employee if data provided
      if (employee_data) {
        const employee = await models.Employee.findOne({ where: { user_id: id } });
        if (employee) {
          await employee.update(employee_data);
        }
      }

      // Fetch complete user data
      const completeUser = await models.User.findByPk(id, {
        include: [
          {
            model: models.Employee,
            as: 'employee',
          },
          {
            model: models.Role,
            as: 'roles',
            through: { attributes: [] },
          },
        ],
      });

      return res.json({
        status: 200,
        message: 'Utilisateur mis à jour avec succès',
        data: completeUser,
      });
    } catch (error) {
      console.error('Update user error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la mise à jour de l\'utilisateur',
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await models.User.findByPk(id);

      if (!user) {
        return res.json({
          status: 404,
          message: 'Utilisateur non trouvé',
        });
      }

      await user.update({ is_active: false });

      return res.json({
        status: 200,
        message: 'Utilisateur désactivé avec succès',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la suppression de l\'utilisateur',
      });
    }
  },

  toggleUserStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      const user = await models.User.findByPk(id);
      if (!user) {
        return res.json({
          status: 404,
          message: 'Utilisateur non trouvé',
        });
      }

      await user.update({ is_active });

      return res.json({
        status: 200,
        message: `Utilisateur ${is_active ? 'activé' : 'désactivé'} avec succès`,
        data: user,
      });
    } catch (error) {
      console.error('Toggle user status error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors du changement de statut',
      });
    }
  },

  // ==================== ROLES & PERMISSIONS ====================

  getAllRoles: async (req, res) => {
    try {
      const { offset = 0, limit = 100, query = '' } = req.query;
      
      const whereClause = {};
      if (query) {
        whereClause[models.sequelize.Sequelize.Op.or] = [
          { name: { [models.sequelize.Sequelize.Op.like]: `%${query}%` } },
          { code: { [models.sequelize.Sequelize.Op.like]: `%${query}%` } },
        ];
      }

      const { rows: roles, count: total } = await models.Role.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: models.Permission,
            as: 'permissions',
            attributes: ['id', 'name', 'code', 'module'],
            through: { attributes: [] },
          },
        ],
        offset: parseInt(offset),
        limit: parseInt(limit),
        order: [['name', 'ASC']],
        distinct: true,
      });

      return res.json({
        status: 200,
        message: 'Rôles récupérés avec succès',
        data: roles,
        total,
      });
    } catch (error) {
      console.error('Get all roles error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la récupération des rôles',
      });
    }
  },

  createRole: async (req, res) => {
    try {
      const { name, code, description, permission_ids } = req.body;

      const role = await models.Role.create({
        name,
        code,
        description,
        is_system: false,
      });

      // Assign permissions if provided
      if (permission_ids && permission_ids.length > 0) {
        const permissions = await models.Permission.findAll({
          where: { id: permission_ids },
        });
        await role.setPermissions(permissions);
      }

      // Fetch complete role data
      const completeRole = await models.Role.findByPk(role.id, {
        include: [
          {
            model: models.Permission,
            as: 'permissions',
            through: { attributes: [] },
          },
        ],
      });

      return res.json({
        status: 201,
        message: 'Rôle créé avec succès',
        data: completeRole,
      });
    } catch (error) {
      console.error('Create role error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la création du rôle',
        error: error.message,
      });
    }
  },

  updateRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, code, description, permission_ids } = req.body;

      const role = await models.Role.findByPk(id);
      if (!role) {
        return res.json({
          status: 404,
          message: 'Rôle non trouvé',
        });
      }

      // Prevent modification of system roles
      if (role.is_system) {
        return res.json({
          status: 403,
          message: 'Les rôles système ne peuvent pas être modifiés',
        });
      }

      await role.update({ name, code, description });

      // Update permissions if provided
      if (permission_ids) {
        const permissions = await models.Permission.findAll({
          where: { id: permission_ids },
        });
        await role.setPermissions(permissions);
      }

      // Fetch complete role data
      const completeRole = await models.Role.findByPk(id, {
        include: [
          {
            model: models.Permission,
            as: 'permissions',
            through: { attributes: [] },
          },
        ],
      });

      return res.json({
        status: 200,
        message: 'Rôle mis à jour avec succès',
        data: completeRole,
      });
    } catch (error) {
      console.error('Update role error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la mise à jour du rôle',
      });
    }
  },

  deleteRole: async (req, res) => {
    try {
      const { id } = req.params;
      const role = await models.Role.findByPk(id);

      if (!role) {
        return res.json({
          status: 404,
          message: 'Rôle non trouvé',
        });
      }

      if (role.is_system) {
        return res.json({
          status: 403,
          message: 'Les rôles système ne peuvent pas être supprimés',
        });
      }

      await role.destroy();

      return res.json({
        status: 200,
        message: 'Rôle supprimé avec succès',
      });
    } catch (error) {
      console.error('Delete role error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la suppression du rôle',
      });
    }
  },

  getAllPermissions: async (req, res) => {
    try {
      const permissions = await models.Permission.findAll({
        order: [['module', 'ASC'], ['name', 'ASC']],
      });

      // Group permissions by module
      const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.module]) {
          acc[perm.module] = [];
        }
        acc[perm.module].push(perm);
        return acc;
      }, {});

      return res.json({
        status: 200,
        message: 'Permissions récupérées avec succès',
        data: permissions,
        grouped: groupedPermissions,
      });
    } catch (error) {
      console.error('Get all permissions error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la récupération des permissions',
      });
    }
  },

  getRolePermissions: async (req, res) => {
    try {
      const { id } = req.params;

      const role = await models.Role.findByPk(id, {
        include: [
          {
            model: models.Permission,
            as: 'permissions',
            through: { attributes: [] },
          },
        ],
      });

      if (!role) {
        return res.json({
          status: 404,
          message: 'Rôle non trouvé',
        });
      }

      return res.json({
        status: 200,
        message: 'Permissions du rôle récupérées avec succès',
        data: role.permissions,
      });
    } catch (error) {
      console.error('Get role permissions error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la récupération des permissions du rôle',
      });
    }
  },

  updateRolePermissions: async (req, res) => {
    try {
      const { id } = req.params;
      const { permission_ids } = req.body;

      const role = await models.Role.findByPk(id);
      if (!role) {
        return res.json({
          status: 404,
          message: 'Rôle non trouvé',
        });
      }

      // Update permissions
      if (permission_ids && Array.isArray(permission_ids)) {
        const permissions = await models.Permission.findAll({
          where: { id: permission_ids },
        });
        await role.setPermissions(permissions);
      }

      // Fetch updated role with permissions
      const updatedRole = await models.Role.findByPk(id, {
        include: [
          {
            model: models.Permission,
            as: 'permissions',
            through: { attributes: [] },
          },
        ],
      });

      return res.json({
        status: 200,
        message: 'Permissions du rôle mises à jour avec succès',
        data: updatedRole,
      });
    } catch (error) {
      console.error('Update role permissions error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la mise à jour des permissions du rôle',
      });
    }
  },

  // ==================== HOLIDAYS ====================

  getAllHolidays: async (req, res) => {
    try {
      const { offset = 0, limit = 100, query = '', year } = req.query;
      
      const whereClause = {};
      if (query) {
        whereClause.name = { [models.sequelize.Sequelize.Op.like]: `%${query}%` };
      }
      if (year) {
        whereClause.year = parseInt(year);
      }

      const { rows: holidays, count: total } = await models.Holiday.findAndCountAll({
        where: whereClause,
        offset: parseInt(offset),
        limit: parseInt(limit),
        order: [['date', 'DESC']],
      });

      return res.json({
        status: 200,
        message: 'Jours fériés récupérés avec succès',
        data: holidays,
        total,
      });
    } catch (error) {
      console.error('Get all holidays error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la récupération des jours fériés',
      });
    }
  },

  createHoliday: async (req, res) => {
    try {
      const holiday = await models.Holiday.create(req.body);

      return res.json({
        status: 201,
        message: 'Jour férié créé avec succès',
        data: holiday,
      });
    } catch (error) {
      console.error('Create holiday error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la création du jour férié',
      });
    }
  },

  updateHoliday: async (req, res) => {
    try {
      const { id } = req.params;
      const holiday = await models.Holiday.findByPk(id);

      if (!holiday) {
        return res.json({
          status: 404,
          message: 'Jour férié non trouvé',
        });
      }

      await holiday.update(req.body);

      return res.json({
        status: 200,
        message: 'Jour férié mis à jour avec succès',
        data: holiday,
      });
    } catch (error) {
      console.error('Update holiday error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la mise à jour du jour férié',
      });
    }
  },

  deleteHoliday: async (req, res) => {
    try {
      const { id } = req.params;
      const holiday = await models.Holiday.findByPk(id);

      if (!holiday) {
        return res.json({
          status: 404,
          message: 'Jour férié non trouvé',
        });
      }

      await holiday.destroy();

      return res.json({
        status: 200,
        message: 'Jour férié supprimé avec succès',
      });
    } catch (error) {
      console.error('Delete holiday error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la suppression du jour férié',
      });
    }
  },

  // ==================== BIOMETRIC DEVICES ====================

  getAllBiometricDevices: async (req, res) => {
    try {
      const { offset = 0, limit = 100, query = '' } = req.query;
      
      const whereClause = {};
      if (query) {
        whereClause[models.sequelize.Sequelize.Op.or] = [
          { device_name: { [models.sequelize.Sequelize.Op.like]: `%${query}%` } },
          { device_code: { [models.sequelize.Sequelize.Op.like]: `%${query}%` } },
          { location: { [models.sequelize.Sequelize.Op.like]: `%${query}%` } },
        ];
      }

      const { rows: devices, count: total } = await models.BiometricDevice.findAndCountAll({
        where: whereClause,
        offset: parseInt(offset),
        limit: parseInt(limit),
        order: [['device_name', 'ASC']],
      });

      return res.json({
        status: 200,
        message: 'Terminaux biométriques récupérés avec succès',
        data: devices,
        total,
      });
    } catch (error) {
      console.error('Get all biometric devices error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la récupération des terminaux',
      });
    }
  },

  createBiometricDevice: async (req, res) => {
    try {
      const device = await models.BiometricDevice.create(req.body);

      return res.json({
        status: 201,
        message: 'Terminal biométrique créé avec succès',
        data: device,
      });
    } catch (error) {
      console.error('Create biometric device error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la création du terminal',
      });
    }
  },

  updateBiometricDevice: async (req, res) => {
    try {
      const { id } = req.params;
      const device = await models.BiometricDevice.findByPk(id);

      if (!device) {
        return res.json({
          status: 404,
          message: 'Terminal non trouvé',
        });
      }

      await device.update(req.body);

      return res.json({
        status: 200,
        message: 'Terminal mis à jour avec succès',
        data: device,
      });
    } catch (error) {
      console.error('Update biometric device error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la mise à jour du terminal',
      });
    }
  },

  deleteBiometricDevice: async (req, res) => {
    try {
      const { id } = req.params;
      const device = await models.BiometricDevice.findByPk(id);

      if (!device) {
        return res.json({
          status: 404,
          message: 'Terminal non trouvé',
        });
      }

      await device.update({ is_active: false });

      return res.json({
        status: 200,
        message: 'Terminal supprimé avec succès',
      });
    } catch (error) {
      console.error('Delete biometric device error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la suppression du terminal',
      });
    }
  },

  testBiometricConnection: async (req, res) => {
    try {
      const { id } = req.params;
      const device = await models.BiometricDevice.findByPk(id);

      if (!device) {
        return res.json({
          status: 404,
          message: 'Terminal non trouvé',
        });
      }

      // TODO: Implement actual connection test logic
      // For now, return a mock response
      const isConnected = Math.random() > 0.3; // 70% success rate for testing

      if (isConnected) {
        await device.update({ last_sync: new Date() });
      }

      return res.json({
        status: isConnected ? 200 : 500,
        message: isConnected ? 'Connexion réussie' : 'Échec de la connexion',
        data: {
          connected: isConnected,
          device_name: device.device_name,
          ip_address: device.ip_address,
          last_sync: device.last_sync,
        },
      });
    } catch (error) {
      console.error('Test biometric connection error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors du test de connexion',
      });
    }
  },

  // ==================== SYSTEM PARAMETERS ====================

  getAllSystemParameters: async (req, res) => {
    try {
      const { offset = 0, limit = 100, query = '' } = req.query;
      
      const whereClause = {};
      if (query) {
        whereClause[models.sequelize.Sequelize.Op.or] = [
          { setting_key: { [models.sequelize.Sequelize.Op.like]: `%${query}%` } },
          { module: { [models.sequelize.Sequelize.Op.like]: `%${query}%` } },
          { description: { [models.sequelize.Sequelize.Op.like]: `%${query}%` } },
        ];
      }

      const { rows: parameters, count: total } = await models.SystemParameter.findAndCountAll({
        where: whereClause,
        offset: parseInt(offset),
        limit: parseInt(limit),
        order: [['module', 'ASC'], ['setting_key', 'ASC']],
      });

      return res.json({
        status: 200,
        message: 'Paramètres système récupérés avec succès',
        data: parameters,
        total,
      });
    } catch (error) {
      console.error('Get all system parameters error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la récupération des paramètres',
      });
    }
  },

  createSystemParameter: async (req, res) => {
    try {
      const parameter = await models.SystemParameter.create(req.body);

      return res.json({
        status: 201,
        message: 'Paramètre créé avec succès',
        data: parameter,
      });
    } catch (error) {
      console.error('Create system parameter error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la création du paramètre',
      });
    }
  },

  updateSystemParameter: async (req, res) => {
    try {
      const { id } = req.params;
      const parameter = await models.SystemParameter.findByPk(id);

      if (!parameter) {
        return res.json({
          status: 404,
          message: 'Paramètre non trouvé',
        });
      }

      await parameter.update(req.body);

      return res.json({
        status: 200,
        message: 'Paramètre mis à jour avec succès',
        data: parameter,
      });
    } catch (error) {
      console.error('Update system parameter error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la mise à jour du paramètre',
      });
    }
  },

  deleteSystemParameter: async (req, res) => {
    try {
      const { id } = req.params;
      const parameter = await models.SystemParameter.findByPk(id);

      if (!parameter) {
        return res.json({
          status: 404,
          message: 'Paramètre non trouvé',
        });
      }

      await parameter.destroy();

      return res.json({
        status: 200,
        message: 'Paramètre supprimé avec succès',
      });
    } catch (error) {
      console.error('Delete system parameter error:', error);
      return res.json({
        status: 500,
        message: 'Erreur lors de la suppression du paramètre',
      });
    }
  },
};

export default settingsController;
