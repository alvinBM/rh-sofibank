import models from '../models/index.js';
import { Op } from 'sequelize';

const employeeAttendanceController = {
  /**
   * Get attendance records for an employee
   */
  getByEmployeeId: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { 
        startDate, 
        endDate, 
        status,
        month,
        year 
      } = req.query;

      const where = { employee_id: employeeId };

      // Date range filter
      if (startDate && endDate) {
        where.date = {
          [Op.between]: [startDate, endDate]
        };
      } else if (month && year) {
        // Filter by month and year
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        where.date = {
          [Op.between]: [start, end]
        };
      }

      // Status filter
      if (status) {
        where.status = status;
      }

      const records = await models.AttendanceRecord.findAll({
        where,
        order: [['date', 'DESC']]
      });

      // Calculate statistics
      const stats = {
        total_records: records.length,
        present: records.filter(r => r.status === 'present').length,
        absent: records.filter(r => r.status === 'absent').length,
        late: records.filter(r => r.is_late).length,
        on_leave: records.filter(r => r.status === 'on_leave').length,
        half_day: records.filter(r => r.status === 'half_day').length,
        total_hours: records.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0),
        total_late_minutes: records.reduce((sum, r) => sum + (r.late_minutes || 0), 0)
      };

      return res.status(200).json({
        status: 200,
        data: {
          records,
          statistics: stats
        }
      });
    } catch (error) {
      console.error('Get attendance records error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération des présences',
        error: error.message
      });
    }
  },

  /**
   * Get attendance calendar data for an employee
   */
  getCalendarData: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(200).json({
          status: 400,
          message: 'Mois et année requis'
        });
      }

      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);

      const records = await models.AttendanceRecord.findAll({
        where: {
          employee_id: employeeId,
          date: {
            [Op.between]: [start, end]
          }
        },
        order: [['date', 'ASC']]
      });

      // Transform to calendar format
      const calendarData = records.map(record => ({
        id: record.id,
        date: record.date,
        status: record.status,
        check_in: record.check_in_time,
        check_out: record.check_out_time,
        total_hours: record.total_hours,
        is_late: record.is_late,
        late_minutes: record.late_minutes,
        notes: record.notes
      }));

      return res.status(200).json({
        status: 200,
        data: calendarData
      });
    } catch (error) {
      console.error('Get calendar data error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération des données calendrier',
        error: error.message
      });
    }
  },

  /**
   * Get attendance movements (entrées/sorties) for an employee
   */
  getMovements: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { 
        startDate, 
        endDate,
        limit = 50 
      } = req.query;

      const where = { 
        employee_id: employeeId,
        [Op.or]: [
          { check_in_time: { [Op.ne]: null } },
          { check_out_time: { [Op.ne]: null } }
        ]
      };

      if (startDate && endDate) {
        where.date = {
          [Op.between]: [startDate, endDate]
        };
      }

      const records = await models.AttendanceRecord.findAll({
        where,
        limit: parseInt(limit),
        order: [['date', 'DESC'], ['check_in_time', 'DESC']]
      });

      // Transform to movements format
      const movements = [];
      records.forEach(record => {
        if (record.check_in_time) {
          movements.push({
            id: `${record.id}-in`,
            date: record.date,
            time: record.check_in_time,
            type: 'entry',
            status: record.is_late ? 'late' : 'on_time',
            late_minutes: record.late_minutes,
            notes: record.notes
          });
        }
        if (record.check_out_time) {
          movements.push({
            id: `${record.id}-out`,
            date: record.date,
            time: record.check_out_time,
            type: 'exit',
            total_hours: record.total_hours,
            notes: record.notes
          });
        }
      });

      // Sort by date and time
      movements.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB - dateA;
      });

      return res.status(200).json({
        status: 200,
        data: movements
      });
    } catch (error) {
      console.error('Get movements error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération des mouvements',
        error: error.message
      });
    }
  },

  /**
   * Get monthly summary
   */
  getMonthlySummary: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { month, year } = req.query;

      const currentYear = year || new Date().getFullYear();
      const currentMonth = month || new Date().getMonth() + 1;

      const start = new Date(currentYear, currentMonth - 1, 1);
      const end = new Date(currentYear, currentMonth, 0);

      const records = await models.AttendanceRecord.findAll({
        where: {
          employee_id: employeeId,
          date: {
            [Op.between]: [start, end]
          }
        }
      });

      const summary = {
        month: currentMonth,
        year: currentYear,
        working_days: records.filter(r => ['present', 'late'].includes(r.status)).length,
        present_days: records.filter(r => r.status === 'present').length,
        absent_days: records.filter(r => r.status === 'absent').length,
        late_days: records.filter(r => r.is_late).length,
        leave_days: records.filter(r => r.status === 'on_leave').length,
        half_days: records.filter(r => r.status === 'half_day').length,
        total_hours: records.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0),
        total_late_minutes: records.reduce((sum, r) => sum + (r.late_minutes || 0), 0)
      };

      return res.status(200).json({
        status: 200,
        data: summary
      });
    } catch (error) {
      console.error('Get monthly summary error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération du résumé mensuel',
        error: error.message
      });
    }
  }
};

export default employeeAttendanceController;
