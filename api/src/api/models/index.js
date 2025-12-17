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

// Recruitment Module Models
import RecruitmentPlan from './RecruitmentPlan.js';
import RecruitmentPlanPosition from './RecruitmentPlanPosition.js';
import JobPosting from './JobPosting.js';
import JobApplication from './JobApplication.js';
import ApplicationStatusHistory from './ApplicationStatusHistory.js';
import JobInterview from './JobInterview.js';
import InterviewEvaluation from './InterviewEvaluation.js';
import EmploymentOffer from './EmploymentOffer.js';
import OnboardingChecklist from './OnboardingChecklist.js';
import OnboardingTask from './OnboardingTask.js';
import OnboardingTaskTemplate from './OnboardingTaskTemplate.js';
import RecruitmentEmail from './RecruitmentEmail.js';
import EmailTemplate from './EmailTemplate.js';
import SentEmail from './SentEmail.js';

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

// ========== RECRUITMENT PLAN ==========
RecruitmentPlan.belongsTo(Direction, {
    foreignKey: 'direction_id',
    as: 'direction'
});

RecruitmentPlan.belongsTo(User, {
    foreignKey: 'approved_by',
    as: 'approver'
});

Direction.hasMany(RecruitmentPlan, {
    foreignKey: 'direction_id',
    as: 'recruitment_plans'
});

// ========== RECRUITMENT PLAN POSITIONS ==========
RecruitmentPlanPosition.belongsTo(RecruitmentPlan, {
    foreignKey: 'recruitment_plan_id',
    as: 'recruitment_plan'
});

RecruitmentPlanPosition.belongsTo(JobPosition, {
    foreignKey: 'job_position_id',
    as: 'job_position'
});

RecruitmentPlanPosition.belongsTo(Grade, {
    foreignKey: 'grade_id',
    as: 'grade'
});

RecruitmentPlanPosition.belongsTo(Service, {
    foreignKey: 'service_id',
    as: 'service'
});

RecruitmentPlan.hasMany(RecruitmentPlanPosition, {
    foreignKey: 'recruitment_plan_id',
    as: 'positions'
});

// ========== JOB POSTING ==========
JobPosting.belongsTo(RecruitmentPlanPosition, {
    foreignKey: 'recruitment_plan_position_id',
    as: 'plan_position'
});

JobPosting.belongsTo(Direction, {
    foreignKey: 'direction_id',
    as: 'direction'
});

JobPosting.belongsTo(Service, {
    foreignKey: 'service_id',
    as: 'service'
});

JobPosting.belongsTo(JobPosition, {
    foreignKey: 'job_position_id',
    as: 'job_position'
});

JobPosting.belongsTo(Grade, {
    foreignKey: 'grade_id',
    as: 'grade'
});

JobPosting.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

// ========== JOB APPLICATION ==========
JobApplication.belongsTo(JobPosting, {
    foreignKey: 'job_posting_id',
    as: 'job_posting'
});

JobApplication.belongsTo(User, {
    foreignKey: 'assigned_to',
    as: 'assigned_user'
});

JobPosting.hasMany(JobApplication, {
    foreignKey: 'job_posting_id',
    as: 'applications'
});

// ========== APPLICATION STATUS HISTORY ==========
ApplicationStatusHistory.belongsTo(JobApplication, {
    foreignKey: 'application_id',
    as: 'application'
});

ApplicationStatusHistory.belongsTo(User, {
    foreignKey: 'changed_by',
    as: 'changer'
});

JobApplication.hasMany(ApplicationStatusHistory, {
    foreignKey: 'application_id',
    as: 'status_history'
});

// ========== JOB INTERVIEW ==========
JobInterview.belongsTo(JobApplication, {
    foreignKey: 'application_id',
    as: 'application'
});

JobInterview.belongsTo(User, {
    foreignKey: 'scheduled_by',
    as: 'scheduler'
});

JobApplication.hasMany(JobInterview, {
    foreignKey: 'application_id',
    as: 'interviews'
});

// ========== INTERVIEW EVALUATION ==========
InterviewEvaluation.belongsTo(JobInterview, {
    foreignKey: 'interview_id',
    as: 'interview'
});

InterviewEvaluation.belongsTo(User, {
    foreignKey: 'evaluator_id',
    as: 'evaluator'
});

JobInterview.hasMany(InterviewEvaluation, {
    foreignKey: 'interview_id',
    as: 'evaluations'
});

// ========== EMPLOYMENT OFFER ==========
EmploymentOffer.belongsTo(JobApplication, {
    foreignKey: 'application_id',
    as: 'application'
});

EmploymentOffer.belongsTo(JobPosition, {
    foreignKey: 'job_position_id',
    as: 'job_position'
});

EmploymentOffer.belongsTo(Grade, {
    foreignKey: 'grade_id',
    as: 'grade'
});

EmploymentOffer.belongsTo(Service, {
    foreignKey: 'service_id',
    as: 'service'
});

EmploymentOffer.belongsTo(Direction, {
    foreignKey: 'direction_id',
    as: 'direction'
});

EmploymentOffer.belongsTo(User, {
    foreignKey: 'approved_by',
    as: 'approver'
});

EmploymentOffer.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

JobApplication.hasMany(EmploymentOffer, {
    foreignKey: 'application_id',
    as: 'offers'
});

// ========== ONBOARDING CHECKLIST ==========
OnboardingChecklist.belongsTo(Employee, {
    foreignKey: 'employee_id',
    as: 'employee'
});

OnboardingChecklist.belongsTo(EmploymentOffer, {
    foreignKey: 'employment_offer_id',
    as: 'employment_offer'
});

OnboardingChecklist.belongsTo(User, {
    foreignKey: 'assigned_mentor_id',
    as: 'assigned_mentor'
});

OnboardingChecklist.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

Employee.hasMany(OnboardingChecklist, {
    foreignKey: 'employee_id',
    as: 'onboarding_checklists'
});

// ========== ONBOARDING TASK ==========
OnboardingTask.belongsTo(OnboardingChecklist, {
    foreignKey: 'onboarding_checklist_id',
    as: 'checklist'
});

OnboardingTask.belongsTo(User, {
    foreignKey: 'assigned_to',
    as: 'assigned_user'
});

OnboardingChecklist.hasMany(OnboardingTask, {
    foreignKey: 'onboarding_checklist_id',
    as: 'tasks'
});

// ========== RECRUITMENT EMAIL ==========
RecruitmentEmail.belongsTo(JobPosting, {
    foreignKey: 'job_posting_id',
    as: 'job_posting'
});

RecruitmentEmail.belongsTo(JobApplication, {
    foreignKey: 'application_id',
    as: 'application'
});

// ========== EMAIL TEMPLATE ==========
EmailTemplate.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

// ========== SENT EMAIL ==========
SentEmail.belongsTo(EmailTemplate, {
    foreignKey: 'template_id',
    as: 'template'
});

SentEmail.belongsTo(User, {
    foreignKey: 'sent_by',
    as: 'sender'
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
    EmployeeDependent,
    // Recruitment Module
    RecruitmentPlan,
    RecruitmentPlanPosition,
    JobPosting,
    JobApplication,
    ApplicationStatusHistory,
    JobInterview,
    InterviewEvaluation,
    EmploymentOffer,
    OnboardingChecklist,
    OnboardingTask,
    OnboardingTaskTemplate,
    RecruitmentEmail,
    EmailTemplate,
    SentEmail
};
