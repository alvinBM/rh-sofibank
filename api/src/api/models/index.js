import database from '../../config/database.js';
import User from './User.js';
import Role from './Role.js';
import Permission from './Permission.js';
import UserRole from './UserRole.js';
import RolePermission from './RolePermission.js';
import Employee from './Employee.js';
import Direction from './Direction.js';
import Service from './Service.js';
import Grade from './Grade.js';
import JobPosition from './JobPosition.js';
import LeaveType from './LeaveType.js';
import LeaveBalance from './LeaveBalance.js';
import LeaveRequest from './LeaveRequest.js';
import LeaveApproval from './LeaveApproval.js';
import AttendanceRecord from './AttendanceRecord.js';
import Holiday from './Holiday.js';
import BiometricDevice from './BiometricDevice.js';
import SystemParameter from './SystemParameter.js';
import EmployeeDocument from './EmployeeDocument.js';
import EmployeeContract from './EmployeeContract.js';
import RequestType from './RequestType.js';
import EmployeeRequest from './EmployeeRequest.js';
import InternalAnnouncement from './InternalAnnouncement.js';
import AnnouncementRead from './AnnouncementRead.js';
import EmployeeFeedback from './EmployeeFeedback.js';
import CareerHistory from './CareerHistory.js';
import EmployeeDependent from './EmployeeDependent.js';

// ========== USER <-> ROLE (Many-to-Many) ==========
User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: 'user_id',
    otherKey: 'role_id',
    as: 'roles'
});

Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: 'role_id',
    otherKey: 'user_id',
    as: 'users'
});

// ========== ROLE <-> PERMISSION (Many-to-Many) ==========
Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: 'role_id',
    otherKey: 'permission_id',
    as: 'permissions'
});

Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: 'permission_id',
    otherKey: 'role_id',
    as: 'roles'
});

// ========== USER <-> EMPLOYEE (One-to-One) ==========
User.hasOne(Employee, {
    foreignKey: 'user_id',
    as: 'employee'
});

Employee.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

// ========== EMPLOYEE <-> DIRECTION ==========
Employee.belongsTo(Direction, {
    foreignKey: 'direction_id',
    as: 'direction'
});

Direction.hasMany(Employee, {
    foreignKey: 'direction_id',
    as: 'employees'
});

// ========== DIRECTION <-> SERVICE (One-to-Many) ==========
Direction.hasMany(Service, {
    foreignKey: 'direction_id',
    as: 'services'
});

Service.belongsTo(Direction, {
    foreignKey: 'direction_id',
    as: 'direction'
});

// ========== EMPLOYEE <-> SERVICE ==========
Employee.belongsTo(Service, {
    foreignKey: 'service_id',
    as: 'service'
});

Service.hasMany(Employee, {
    foreignKey: 'service_id',
    as: 'employees'
});

// ========== EMPLOYEE <-> JOB POSITION ==========
Employee.belongsTo(JobPosition, {
    foreignKey: 'job_position_id',
    as: 'job_position'
});

JobPosition.hasMany(Employee, {
    foreignKey: 'job_position_id',
    as: 'employees'
});

// ========== EMPLOYEE <-> GRADE ==========
Employee.belongsTo(Grade, {
    foreignKey: 'grade_id',
    as: 'grade'
});

Grade.hasMany(Employee, {
    foreignKey: 'grade_id',
    as: 'employees'
});

// ========== EMPLOYEE <-> SUPERVISOR (Self-referential) ==========
Employee.belongsTo(Employee, {
    foreignKey: 'direct_supervisor_id',
    as: 'direct_supervisor'
});

Employee.hasMany(Employee, {
    foreignKey: 'direct_supervisor_id',
    as: 'direct_subordinates'
});

Employee.belongsTo(Employee, {
    foreignKey: 'secondary_supervisor_id',
    as: 'secondary_supervisor'
});

// ========== LEAVE BALANCE ==========
LeaveBalance.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee'
});

LeaveBalance.belongsTo(LeaveType, {
    foreignKey: 'leave_type_id',
    as: 'leave_type'
});

Employee.hasMany(LeaveBalance, {
    foreignKey: 'employee_id',
    as: 'leave_balances'
});

// ========== LEAVE REQUEST ==========
LeaveRequest.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee'
});

LeaveRequest.belongsTo(LeaveType, {
    foreignKey: 'leave_type_id',
    as: 'leave_type'
});

LeaveRequest.belongsTo(Employee, {
    foreignKey: 'backup_employee_id',
    as: 'backup_employee'
});

LeaveRequest.hasMany(LeaveApproval, {
    foreignKey: 'leave_request_id',
    as: 'approvals'
});

Employee.hasMany(LeaveRequest, {
    foreignKey: 'employee_id',
    as: 'leave_requests'
});

// ========== LEAVE APPROVAL ==========
LeaveApproval.belongsTo(LeaveRequest, {
    foreignKey: 'leave_request_id',
    as: 'leave_request'
});

LeaveApproval.belongsTo(User, {
    foreignKey: 'approver_id',
    as: 'approver'
});

// ========== ATTENDANCE RECORD ==========
AttendanceRecord.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee'
});

Employee.hasMany(AttendanceRecord, {
    foreignKey: 'employee_id',
    as: 'attendance_records'
});

// ========== EMPLOYEE DOCUMENTS ==========
EmployeeDocument.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee'
});

Employee.hasMany(EmployeeDocument, {
    foreignKey: 'employee_id',
    as: 'documents'
});

// ========== EMPLOYEE CONTRACTS ==========
EmployeeContract.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee'
});

Employee.hasMany(EmployeeContract, {
    foreignKey: 'employee_id',
    as: 'contracts'
});

// ========== EMPLOYEE REQUESTS ==========
EmployeeRequest.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee'
});

EmployeeRequest.belongsTo(RequestType, {
    foreignKey: 'request_type_id',
    as: 'request_type'
});

Employee.hasMany(EmployeeRequest, {
    foreignKey: 'employee_id',
    as: 'requests'
});

// ========== ANNOUNCEMENTS ==========
InternalAnnouncement.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

AnnouncementRead.belongsTo(InternalAnnouncement, {
    foreignKey: 'announcement_id',
    as: 'announcement'
});

AnnouncementRead.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee'
});

// ========== EMPLOYEE FEEDBACK ==========
EmployeeFeedback.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee'
});

Employee.hasMany(EmployeeFeedback, {
    foreignKey: 'employee_id',
    as: 'feedback'
});

// ========== CAREER HISTORY ==========
CareerHistory.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee'
});

CareerHistory.belongsTo(Direction, {
    foreignKey: 'new_direction_id',
    as: 'direction'
});

CareerHistory.belongsTo(Service, {
    foreignKey: 'new_service_id',
    as: 'service'
});

CareerHistory.belongsTo(JobPosition, {
    foreignKey: 'new_job_position_id',
    as: 'job_position'
});

CareerHistory.belongsTo(Grade, {
    foreignKey: 'new_grade_id',
    as: 'grade'
});

Employee.hasMany(CareerHistory, {
    foreignKey: 'employee_id',
    as: 'career_history'
});

// ========== EMPLOYEE DEPENDENTS ==========
EmployeeDependent.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee'
});

Employee.hasMany(EmployeeDependent, {
    foreignKey: 'employee_id',
    as: 'dependents'
});

export default {
    database,
    sequelize: database,
    User,
    Role,
    Permission,
    UserRole,
    RolePermission,
    Employee,
    Direction,
    Service,
    Grade,
    JobPosition,
    LeaveType,
    LeaveBalance,
    LeaveRequest,
    LeaveApproval,
    AttendanceRecord,
    Holiday,
    BiometricDevice,
    SystemParameter,
    EmployeeDocument,
    EmployeeContract,
    RequestType,
    EmployeeRequest,
    InternalAnnouncement,
    AnnouncementRead,
    EmployeeFeedback,
    CareerHistory,
    EmployeeDependent
};
