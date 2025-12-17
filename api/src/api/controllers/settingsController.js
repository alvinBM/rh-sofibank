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
};

export default settingsController;
