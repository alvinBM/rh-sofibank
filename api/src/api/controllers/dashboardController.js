import models from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';

const { Employee, LeaveRequest, Direction, LeaveType, AttendanceRecord } = models;

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        // Total employees
        const totalEmployees = await Employee.count();

        // Active employees
        const activeEmployees = await Employee.count({
            where: { employment_status: 'active', is_active: true }
        });

        // Pending leave requests (all pending statuses)
        const pendingLeaveRequests = await LeaveRequest.count({
            where: {
                status: {
                    [Op.in]: ['pending_backup', 'pending_supervisor', 'pending_hr', 'pending_dg']
                }
            }
        });

        // Approved leave requests
        const approvedLeaveRequests = await LeaveRequest.count({
            where: { status: 'approved' }
        });

        // Employees by direction
        const employeesByDirection = await Employee.findAll({
            where: { 
                employment_status: 'active',
                is_active: true 
            },
            attributes: [
                'direction_id',
                [fn('COUNT', col('employees.id')), 'count']
            ],
            include: [{
                model: Direction,
                as: 'direction',
                attributes: ['id', 'name']
            }],
            group: ['direction_id', 'direction.id', 'direction.name'],
            raw: false
        });

        const employeesByDirectionData = employeesByDirection.map(item => ({
            name: item.direction?.name || 'Non assigné',
            value: parseInt(item.dataValues.count)
        }));

        // Employees by status
        const employeesByStatus = await Employee.findAll({
            attributes: [
                'employment_status',
                [fn('COUNT', col('employees.id')), 'count']
            ],
            group: ['employment_status'],
            raw: true
        });

        const statusLabels = {
            'active': 'Actif',
            'inactive': 'Inactif',
            'on_leave': 'En congé',
            'suspended': 'Suspendu',
            'terminated': 'Terminé'
        };

        const employeesByStatusData = employeesByStatus.map(item => ({
            name: statusLabels[item.employment_status] || item.employment_status,
            value: parseInt(item.count)
        }));

        // Leave requests by month for current year
        const leaveRequestsByMonth = await LeaveRequest.findAll({
            attributes: [
                [fn('MONTH', col('leave_requests.created_at')), 'month'],
                [fn('COUNT', col('leave_requests.id')), 'count']
            ],
            where: {
                created_at: {
                    [Op.gte]: `${currentYear}-01-01`,
                    [Op.lte]: `${currentYear}-12-31`
                }
            },
            group: [fn('MONTH', col('leave_requests.created_at'))],
            raw: true
        });

        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const monthCounts = {};
        monthNames.forEach(month => {
            monthCounts[month] = 0;
        });

        leaveRequestsByMonth.forEach(item => {
            const monthIndex = parseInt(item.month) - 1;
            monthCounts[monthNames[monthIndex]] = parseInt(item.count);
        });

        const leaveRequestsByMonthData = Object.entries(monthCounts).map(([name, demandes]) => ({
            name,
            demandes
        }));

        res.status(200).json({
            success: true,
            data: {
                totalEmployees,
                activeEmployees,
                pendingLeaveRequests,
                approvedLeaveRequests,
                employeesByDirection: employeesByDirectionData,
                employeesByStatus: employeesByStatusData,
                leaveRequestsByMonth: leaveRequestsByMonthData
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message
        });
    }
};


export const getEmployeeStatistics = async (req, res) => {
    try {
        const totalEmployees = await Employee.count();
        const activeEmployees = await Employee.count({
            where: { employment_status: 'active', is_active: true }
        });
        const inactiveEmployees = await Employee.count({
            where: { employment_status: 'inactive' }
        });
        const onLeaveEmployees = await Employee.count({
            where: { employment_status: 'on_leave' }
        });

        // Recent hires (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentHires = await Employee.count({
            where: {
                hire_date: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalEmployees,
                activeEmployees,
                inactiveEmployees,
                onLeaveEmployees,
                recentHires
            }
        });
    } catch (error) {
        console.error('Error fetching employee statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques des employés',
            error: error.message
        });
    }
};


export const getLeaveStatistics = async (req, res) => {
    try {
        const totalRequests = await LeaveRequest.count();
        const pendingRequests = await LeaveRequest.count({
            where: {
                status: {
                    [Op.in]: ['pending_backup', 'pending_supervisor', 'pending_hr', 'pending_dg']
                }
            }
        });
        const approvedRequests = await LeaveRequest.count({
            where: { status: 'approved' }
        });
        const rejectedRequests = await LeaveRequest.count({
            where: { status: 'rejected' }
        });

        // Leave requests by type
        const requestsByType = await LeaveRequest.findAll({
            attributes: [
                'leave_type_id',
                [fn('COUNT', col('leave_requests.id')), 'count']
            ],
            include: [{
                model: LeaveType,
                as: 'leaveType',
                attributes: ['id', 'name']
            }],
            group: ['leave_type_id', 'leaveType.id', 'leaveType.name'],
            raw: false
        });

        const requestsByTypeData = requestsByType.map(item => ({
            type: item.leaveType?.name || 'N/A',
            count: parseInt(item.dataValues.count)
        }));

        res.status(200).json({
            success: true,
            data: {
                totalRequests,
                pendingRequests,
                approvedRequests,
                rejectedRequests,
                requestsByType: requestsByTypeData
            }
        });
    } catch (error) {
        console.error('Error fetching leave statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques de congés',
            error: error.message
        });
    }
};

/**
 * Get attendance statistics
 */
export const getAttendanceStatistics = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today's attendance
        const todayPresent = await AttendanceRecord.count({
            where: {
                check_in_time: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow
                }
            }
        });

        // Late check-ins today (after 9:00 AM)
        const nineAM = new Date(today);
        nineAM.setHours(9, 0, 0, 0);

        const lateCheckIns = await AttendanceRecord.count({
            where: {
                check_in_time: {
                    [Op.gte]: nineAM,
                    [Op.lt]: tomorrow
                }
            }
        });

        // This month's attendance rate
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthlyRecords = await AttendanceRecord.count({
            where: {
                check_in_time: {
                    [Op.gte]: firstDayOfMonth,
                    [Op.lt]: tomorrow
                }
            }
        });

        const workingDays = today.getDate(); // Simplified calculation
        const activeEmployees = await Employee.count({
            where: { employment_status: 'active', is_active: true }
        });
        const expectedRecords = activeEmployees * workingDays;
        const attendanceRate = expectedRecords > 0 ? (monthlyRecords / expectedRecords * 100).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                todayPresent,
                lateCheckIns,
                monthlyRecords,
                attendanceRate: parseFloat(attendanceRate)
            }
        });
    } catch (error) {
        console.error('Error fetching attendance statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques de présence',
            error: error.message
        });
    }
};
