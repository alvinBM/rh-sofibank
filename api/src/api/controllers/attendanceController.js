import { Op  } from 'sequelize';
import models from '../models/index.js';

const attendanceController = {
  /**
   * Get all attendance records with pagination and filters
   */
  getAll: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        employee_id,
        start_date,
        end_date,
        status
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};

      if (employee_id) where.employee_id = employee_id;
      if (status) where.status = status;
      if (start_date && end_date) {
        where.date = {
          [Op.between]: [start_date, end_date]
        };
      } else if (start_date) {
        where.date = { [Op.gte]: start_date };
      } else if (end_date) {
        where.date = { [Op.lte]: end_date };
      }

      const { count, rows } = await models.AttendanceRecord.findAndCountAll({
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
          }
        ],
        order: [['date', 'DESC'], ['created_at', 'DESC']]
      });

      return res.status(200).json({
        status: 200,
        data: {
          records: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get all attendance error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération des présences',
        error: error.message
      });
    }
  },

  /**
   * Get attendance record by ID
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const record = await models.AttendanceRecord.findByPk(id, {
        include: [
          {
            model: models.Employee,
            as: 'employee',
            include: [
              { model: models.Direction, as: 'direction' },
              { model: models.Service, as: 'service' }
            ]
          }
        ]
      });

      if (!record) {
        return res.status(200).json({
          status: 404,
          message: 'Enregistrement de présence non trouvé'
        });
      }

      return res.status(200).json({
        status: 200,
        data: record
      });
    } catch (error) {
      console.error('Get attendance by ID error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération de l\'enregistrement',
        error: error.message
      });
    }
  },

  /**
   * Check in
   */
  checkIn: async (req, res) => {
    try {
      const { employee_id } = req.body;
      const today = new Date().toISOString().split('T')[0];
      const checkInTime = new Date();

      // Check if already checked in today
      const existingRecord = await models.AttendanceRecord.findOne({
        where: {
          employee_id,
          date: today
        }
      });

      if (existingRecord && existingRecord.check_in_time) {
        return res.status(200).json({
          status: 400,
          message: 'Vous avez déjà pointé l\'arrivée aujourd\'hui',
          data: existingRecord
        });
      }

      // Calculate if late (assuming 8:00 AM is start time)
      const startTime = new Date();
      startTime.setHours(8, 0, 0, 0);
      const isLate = checkInTime > startTime;
      const lateMinutes = isLate ? Math.floor((checkInTime - startTime) / 60000) : 0;

      let record;
      if (existingRecord) {
        record = await existingRecord.update({
          check_in_time: checkInTime.toTimeString().split(' ')[0],
          is_late: isLate,
          late_minutes: lateMinutes,
          status: 'present'
        });
      } else {
        record = await models.AttendanceRecord.create({
          employee_id,
          date: today,
          check_in_time: checkInTime.toTimeString().split(' ')[0],
          is_late: isLate,
          late_minutes: lateMinutes,
          status: 'present'
        });
      }

      // Fetch with associations
      const createdRecord = await models.AttendanceRecord.findByPk(record.id, {
        include: [{ model: models.Employee, as: 'employee' }]
      });

      return res.status(200).json({
        status: 200,
        message: 'Pointage d\'arrivée enregistré avec succès',
        data: createdRecord
      });
    } catch (error) {
      console.error('Check in error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors du pointage d\'arrivée',
        error: error.message
      });
    }
  },

  /**
   * Check out
   */
  checkOut: async (req, res) => {
    try {
      const { employee_id } = req.body;
      const today = new Date().toISOString().split('T')[0];
      const checkOutTime = new Date();

      const record = await models.AttendanceRecord.findOne({
        where: {
          employee_id,
          date: today
        }
      });

      if (!record) {
        return res.status(200).json({
          status: 404,
          message: 'Aucun pointage d\'arrivée trouvé pour aujourd\'hui'
        });
      }

      if (record.check_out_time) {
        return res.status(200).json({
          status: 400,
          message: 'Vous avez déjà pointé le départ aujourd\'hui',
          data: record
        });
      }

      // Calculate total hours
      const checkIn = new Date(`${today} ${record.check_in_time}`);
      const totalMilliseconds = checkOutTime - checkIn;
      const totalHours = (totalMilliseconds / (1000 * 60 * 60)).toFixed(2);

      await record.update({
        check_out_time: checkOutTime.toTimeString().split(' ')[0],
        total_hours: totalHours
      });

      // Fetch with associations
      const updatedRecord = await models.AttendanceRecord.findByPk(record.id, {
        include: [{ model: models.Employee, as: 'employee' }]
      });

      return res.status(200).json({
        status: 200,
        message: 'Pointage de départ enregistré avec succès',
        data: updatedRecord
      });
    } catch (error) {
      console.error('Check out error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors du pointage de départ',
        error: error.message
      });
    }
  },

  /**
   * Create or update attendance record
   */
  createOrUpdate: async (req, res) => {
    try {
      const recordData = req.body;

      // Check if record exists
      const existingRecord = await models.AttendanceRecord.findOne({
        where: {
          employee_id: recordData.employee_id,
          date: recordData.date
        }
      });

      let record;
      if (existingRecord) {
        await existingRecord.update(recordData);
        record = existingRecord;
      } else {
        record = await models.AttendanceRecord.create(recordData);
      }

      // Fetch with associations
      const result = await models.AttendanceRecord.findByPk(record.id, {
        include: [{ model: models.Employee, as: 'employee' }]
      });

      return res.status(200).json({
        status: existingRecord ? 200 : 201,
        message: `Présence ${existingRecord ? 'mise à jour' : 'enregistrée'} avec succès`,
        data: result
      });
    } catch (error) {
      console.error('Create or update attendance error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de l\'enregistrement de la présence',
        error: error.message
      });
    }
  },

  /**
   * Delete attendance record
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const record = await models.AttendanceRecord.findByPk(id);

      if (!record) {
        return res.status(200).json({
          status: 404,
          message: 'Enregistrement de présence non trouvé'
        });
      }

      await record.destroy();

      return res.status(200).json({
        status: 200,
        message: 'Enregistrement de présence supprimé avec succès'
      });
    } catch (error) {
      console.error('Delete attendance error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la suppression de l\'enregistrement',
        error: error.message
      });
    }
  },

  /**
   * Get attendance statistics
   */
  getStatistics: async (req, res) => {
    try {
      const { start_date, end_date, employee_id } = req.query;

      const where = {};
      if (employee_id) where.employee_id = employee_id;
      if (start_date && end_date) {
        where.date = { [Op.between]: [start_date, end_date] };
      }

      const totalRecords = await models.AttendanceRecord.count({ where });

      const byStatus = await models.AttendanceRecord.findAll({
        attributes: [
          'status',
          [models.sequelize.fn('COUNT', models.sequelize.col('id')), 'count']
        ],
        where,
        group: ['status']
      });

      const lateCount = await models.AttendanceRecord.count({
        where: { ...where, is_late: true }
      });

      const avgHours = await models.AttendanceRecord.findOne({
        attributes: [
          [models.sequelize.fn('AVG', models.sequelize.col('total_hours')), 'avg_hours']
        ],
        where: { ...where, total_hours: { [Op.ne]: null } }
      });

      return res.status(200).json({
        status: 200,
        data: {
          total_records: totalRecords,
          by_status: byStatus,
          late_count: lateCount,
          average_hours: avgHours ? parseFloat(avgHours.dataValues.avg_hours).toFixed(2) : 0
        }
      });
    } catch (error) {
      console.error('Get attendance statistics error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération des statistiques',
        error: error.message
      });
    }
  },

  /**
   * Get employee attendance summary
   */
  getEmployeeSummary: async (req, res) => {
    try {
      const { employee_id, year, month } = req.query;

      if (!employee_id || !year || !month) {
        return res.status(200).json({
          status: 400,
          message: 'employee_id, year et month sont requis'
        });
      }

      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const records = await models.AttendanceRecord.findAll({
        where: {
          employee_id,
          date: { [Op.between]: [startDate, endDate] }
        },
        order: [['date', 'ASC']]
      });

      const summary = {
        total_days: records.length,
        present_days: records.filter(r => r.status === 'present').length,
        absent_days: records.filter(r => r.status === 'absent').length,
        late_days: records.filter(r => r.is_late).length,
        on_leave_days: records.filter(r => r.status === 'on_leave').length,
        total_hours: records.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0).toFixed(2),
        records
      };

      return res.status(200).json({
        status: 200,
        data: summary
      });
    } catch (error) {
      console.error('Get employee summary error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération du résumé',
        error: error.message
      });
    }
  }
};

export default attendanceController;
