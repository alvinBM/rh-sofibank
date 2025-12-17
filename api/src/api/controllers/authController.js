import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op  } from 'sequelize';
import models from '../models/index.js';

const authController = {
  /**
   * User login
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(200).json({
          status: 400,
          message: 'Email et mot de passe sont requis'
        });
      }

      // Find user
      const user = await models.User.findOne({
        where: { email: email.toLowerCase() },
        include: [
          {
            model: models.Role,
            as: 'roles',
            through: { attributes: [] },
            include: [
              {
                model: models.Permission,
                as: 'permissions',
                through: { attributes: [] }
              }
            ]
          },
          {
            model: models.Employee,
            as: 'employee',
            attributes: ['id', 'employee_number', 'first_name', 'last_name', 'profile_photo_url']
          }
        ]
      });

      if (!user) {
        return res.status(200).json({
          status: 401,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(200).json({
          status: 403,
          message: 'Votre compte a été désactivé. Contactez l\'administrateur.'
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(200).json({
          status: 401,
          message: 'Email ou mot de passe incorrect'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          roles: user.roles.map(r => r.code)
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update last login
      await user.update({ last_login: new Date() });

      // Prepare response
      const permissions = new Set();
      user.roles.forEach(role => {
        role.permissions.forEach(permission => {
          permissions.add(permission.code);
        });
      });

      return res.status(200).json({
        status: 200,
        message: 'Connexion réussie',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            is_active: user.is_active,
            roles: user.roles.map(r => ({ id: r.id, name: r.name, code: r.code })),
            permissions: Array.from(permissions),
            employee: user.employee
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la connexion',
        error: error.message
      });
    }
  },

  /**
   * User registration
   */
  register: async (req, res) => {
    try {
      const { email, password, first_name, last_name, employee_number } = req.body;

      // Validate input
      if (!email || !password || !first_name || !last_name) {
        return res.status(200).json({
          status: 400,
          message: 'Tous les champs obligatoires doivent être remplis'
        });
      }

      // Check if user exists
      const existingUser = await models.User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return res.status(200).json({
          status: 409,
          message: 'Un utilisateur avec cet email existe déjà'
        });
      }

      // Check if employee number exists
      if (employee_number) {
        const existingEmployee = await models.Employee.findOne({
          where: { employee_number }
        });

        if (existingEmployee) {
          return res.status(200).json({
            status: 409,
            message: 'Ce matricule employé existe déjà'
          });
        }
      }

      // Create user
      const user = await models.User.create({
        email: email.toLowerCase(),
        password,
        is_active: true
      });

      // Assign default EMPLOYEE role
      const employeeRole = await models.Role.findOne({ where: { code: 'EMPLOYEE' } });
      if (employeeRole) {
        await models.UserRole.create({
          user_id: user.id,
          role_id: employeeRole.id,
          assigned_by: user.id
        });
      }

      // Create employee record if employee_number provided
      if (employee_number) {
        await models.Employee.create({
          user_id: user.id,
          employee_number,
          first_name,
          last_name,
          email: email.toLowerCase(),
          hire_date: new Date(),
          contract_type: 'permanent',
          employment_status: 'active',
          created_by: user.id
        });
      }

      return res.status(200).json({
        status: 201,
        message: 'Utilisateur créé avec succès',
        data: {
          id: user.id,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la création du compte',
        error: error.message
      });
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await models.User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: models.Role,
            as: 'roles',
            through: { attributes: [] },
            include: [
              {
                model: models.Permission,
                as: 'permissions',
                through: { attributes: [] }
              }
            ]
          },
          {
            model: models.Employee,
            as: 'employee',
            include: [
              { model: models.Direction, as: 'direction' },
              { model: models.Service, as: 'service' },
              { model: models.JobPosition, as: 'job_position' },
              { model: models.Grade, as: 'grade' }
            ]
          }
        ]
      });

      if (!user) {
        return res.status(200).json({
          status: 404,
          message: 'Utilisateur non trouvé'
        });
      }

      // Compile permissions
      const permissions = new Set();
      user.roles.forEach(role => {
        role.permissions.forEach(permission => {
          permissions.add(permission.code);
        });
      });

      return res.status(200).json({
        status: 200,
        data: {
          ...user.toJSON(),
          permissions: Array.from(permissions)
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération du profil',
        error: error.message
      });
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const updates = req.body;

      // Prevent updating sensitive fields
      delete updates.password;
      delete updates.email;
      delete updates.is_active;

      const user = await models.User.findByPk(userId);
      if (!user) {
        return res.status(200).json({
          status: 404,
          message: 'Utilisateur non trouvé'
        });
      }

      await user.update(updates);

      return res.status(200).json({
        status: 200,
        message: 'Profil mis à jour avec succès',
        data: user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la mise à jour du profil',
        error: error.message
      });
    }
  },

  /**
   * Change password
   */
  changePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { current_password, new_password } = req.body;

      if (!current_password || !new_password) {
        return res.status(200).json({
          status: 400,
          message: 'Mot de passe actuel et nouveau mot de passe sont requis'
        });
      }

      const user = await models.User.findByPk(userId);
      if (!user) {
        return res.status(200).json({
          status: 404,
          message: 'Utilisateur non trouvé'
        });
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(current_password);
      if (!isPasswordValid) {
        return res.status(200).json({
          status: 401,
          message: 'Mot de passe actuel incorrect'
        });
      }

      // Update password (will be hashed by model hook)
      await user.update({ password: new_password });

      return res.status(200).json({
        status: 200,
        message: 'Mot de passe changé avec succès'
      });
    } catch (error) {
      console.error('Change password error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors du changement de mot de passe',
        error: error.message
      });
    }
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(200).json({
          status: 400,
          message: 'Email requis'
        });
      }

      const user = await models.User.findOne({
        where: { email: email.toLowerCase() }
      });

      // Always return success to prevent email enumeration
      if (!user) {
        return res.status(200).json({
          status: 200,
          message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé'
        });
      }

      // TODO: Generate reset token and send email
      // For now, just return success
      return res.status(200).json({
        status: 200,
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé'
      });
    } catch (error) {
      console.error('Request password reset error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la demande de réinitialisation',
        error: error.message
      });
    }
  },

  /**
   * Verify token validity
   */
  verifyToken: async (req, res) => {
    try {
      // Token already verified by middleware
      return res.status(200).json({
        status: 200,
        message: 'Token valide',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Verify token error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la vérification du token',
        error: error.message
      });
    }
  }
};

export default authController;
