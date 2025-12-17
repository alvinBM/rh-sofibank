import express from 'express';
import settingsController from '../controllers/settingsController.js';
import validateToken from '../middlewares/validateToken.js';
import checkPermission from '../middlewares/checkPermission.js';

const router = express.Router();

// ==================== USERS ====================
router.get('/users', validateToken, checkPermission(['users_manage', 'settings_access']), settingsController.getAllUsers);
router.post('/users', validateToken, checkPermission(['users_manage']), settingsController.createUser);
router.put('/users/:id', validateToken, checkPermission(['users_manage']), settingsController.updateUser);
router.delete('/users/:id', validateToken, checkPermission(['users_manage']), settingsController.deleteUser);
router.patch('/users/:id/toggle-status', validateToken, checkPermission(['users_manage']), settingsController.toggleUserStatus);

// ==================== ROLES & PERMISSIONS ====================
router.get('/roles', validateToken, checkPermission(['roles_manage', 'settings_access']), settingsController.getAllRoles);
router.post('/roles', validateToken, checkPermission(['roles_manage']), settingsController.createRole);
router.put('/roles/:id', validateToken, checkPermission(['roles_manage']), settingsController.updateRole);
router.delete('/roles/:id', validateToken, checkPermission(['roles_manage']), settingsController.deleteRole);
router.get('/permissions', validateToken, checkPermission(['roles_manage', 'settings_access']), settingsController.getAllPermissions);
router.get('/roles/:id/permissions', validateToken, checkPermission(['roles_manage', 'settings_access']), settingsController.getRolePermissions);
router.put('/roles/:id/permissions', validateToken, checkPermission(['roles_manage']), settingsController.updateRolePermissions);

// ==================== DIRECTIONS ====================
router.get('/directions', validateToken, settingsController.getAllDirections);
router.post('/directions', validateToken, checkPermission(['org_manage', 'manage_settings']), settingsController.createDirection);
router.put('/directions/:id', validateToken, checkPermission(['org_manage', 'manage_settings']), settingsController.updateDirection);
router.delete('/directions/:id', validateToken, checkPermission(['org_manage', 'manage_settings']), settingsController.deleteDirection);

// ==================== SERVICES ====================
router.get('/services', validateToken, settingsController.getAllServices);
router.post('/services', validateToken, checkPermission(['org_manage', 'manage_settings']), settingsController.createService);
router.put('/services/:id', validateToken, checkPermission(['org_manage', 'manage_settings']), settingsController.updateService);
router.delete('/services/:id', validateToken, checkPermission(['org_manage', 'manage_settings']), settingsController.deleteService);

// ==================== GRADES ====================
router.get('/grades', validateToken, settingsController.getAllGrades);
router.post('/grades', validateToken, checkPermission(['payroll_settings_manage', 'manage_settings']), settingsController.createGrade);
router.put('/grades/:id', validateToken, checkPermission(['payroll_settings_manage', 'manage_settings']), settingsController.updateGrade);
router.delete('/grades/:id', validateToken, checkPermission(['payroll_settings_manage', 'manage_settings']), settingsController.deleteGrade);

// ==================== JOB POSITIONS ====================
router.get('/job-positions', validateToken, settingsController.getAllJobPositions);
router.post('/job-positions', validateToken, checkPermission(['positions_manage', 'manage_settings']), settingsController.createJobPosition);
router.put('/job-positions/:id', validateToken, checkPermission(['positions_manage', 'manage_settings']), settingsController.updateJobPosition);
router.delete('/job-positions/:id', validateToken, checkPermission(['positions_manage', 'manage_settings']), settingsController.deleteJobPosition);

// ==================== HOLIDAYS ====================
router.get('/holidays', validateToken, settingsController.getAllHolidays);
router.post('/holidays', validateToken, checkPermission(['holidays_manage', 'manage_settings']), settingsController.createHoliday);
router.put('/holidays/:id', validateToken, checkPermission(['holidays_manage', 'manage_settings']), settingsController.updateHoliday);
router.delete('/holidays/:id', validateToken, checkPermission(['holidays_manage', 'manage_settings']), settingsController.deleteHoliday);

// ==================== BIOMETRIC DEVICES ====================
router.get('/biometric-devices', validateToken, settingsController.getAllBiometricDevices);
router.post('/biometric-devices', validateToken, checkPermission(['attendance_settings_manage', 'manage_settings']), settingsController.createBiometricDevice);
router.put('/biometric-devices/:id', validateToken, checkPermission(['attendance_settings_manage', 'manage_settings']), settingsController.updateBiometricDevice);
router.delete('/biometric-devices/:id', validateToken, checkPermission(['attendance_settings_manage', 'manage_settings']), settingsController.deleteBiometricDevice);
router.post('/biometric-devices/:id/test', validateToken, checkPermission(['attendance_settings_manage', 'manage_settings']), settingsController.testBiometricConnection);

// ==================== SYSTEM PARAMETERS ====================
router.get('/system-parameters', validateToken, checkPermission(['system_settings_manage', 'settings_access']), settingsController.getAllSystemParameters);
router.post('/system-parameters', validateToken, checkPermission(['system_settings_manage']), settingsController.createSystemParameter);
router.put('/system-parameters/:id', validateToken, checkPermission(['system_settings_manage']), settingsController.updateSystemParameter);
router.delete('/system-parameters/:id', validateToken, checkPermission(['system_settings_manage']), settingsController.deleteSystemParameter);

export default router;
