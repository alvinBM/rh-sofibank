import { v4 as uuidv4  } from "uuid";
import bcrypt from "bcrypt";
import db from "../src/config/database.js";
import models from "../src/api/models/index.js";

const seedDatabase = async () => {
    try {
        console.log("🌱 Starting database seeding...\n");

        // Disable foreign key checks
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        
        // Sync database (create tables)
        await db.sync({ force: true });
        
        // Re-enable foreign key checks
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log("✅ Database synced\n");

        // =====================================================
        // 1. SEED ROLES
        // =====================================================
        console.log("📝 Seeding roles...");
        const roleData = [
            { id: uuidv4(), name: "Super Administrateur", code: "SUPER_ADMIN", description: "Accès complet au système", is_system: true },
            { id: uuidv4(), name: "Administrateur", code: "ADMIN", description: "Accès administratif", is_system: true },
            { id: uuidv4(), name: "RH Manager", code: "RH_MANAGER", description: "Gestionnaire des ressources humaines", is_system: false },
            { id: uuidv4(), name: "Superviseur", code: "SUPERVISOR", description: "Chef d'équipe ou de service", is_system: false },
            { id: uuidv4(), name: "Employé", code: "EMPLOYEE", description: "Employé standard", is_system: false },
        ];
        const roles = await models.Role.bulkCreate(roleData);
        console.log(`✅ ${roles.length} roles created\n`);

        // =====================================================
        // 2. SEED PERMISSIONS
        // =====================================================
        console.log("📝 Seeding permissions...");
        const permissionData = [
            // Employee permissions
            { id: uuidv4(), name: "Voir employés", code: "view_employees", module: "employees" },
            { id: uuidv4(), name: "Créer employé", code: "create_employee", module: "employees" },
            { id: uuidv4(), name: "Modifier employé", code: "update_employee", module: "employees" },
            { id: uuidv4(), name: "Supprimer employé", code: "delete_employee", module: "employees" },

            // Leave permissions
            { id: uuidv4(), name: "Voir congés", code: "view_leaves", module: "leave" },
            { id: uuidv4(), name: "Créer demande congé", code: "create_leave_request", module: "leave" },
            { id: uuidv4(), name: "Approuver congé", code: "approve_leave", module: "leave" },
            { id: uuidv4(), name: "Gérer types congés", code: "manage_leave_types", module: "leave" },

            // Attendance permissions
            { id: uuidv4(), name: "Voir présences", code: "view_attendance", module: "attendance" },
            { id: uuidv4(), name: "Enregistrer présence", code: "record_attendance", module: "attendance" },
            { id: uuidv4(), name: "Modifier présence", code: "update_attendance", module: "attendance" },

            // Payroll permissions
            { id: uuidv4(), name: "Voir paies", code: "view_payroll", module: "payroll" },
            { id: uuidv4(), name: "Créer paie", code: "create_payroll", module: "payroll" },
            { id: uuidv4(), name: "Approuver paie", code: "approve_payroll", module: "payroll" },

            // Settings permissions
            { id: uuidv4(), name: "Gérer paramètres", code: "manage_settings", module: "settings" },
            { id: uuidv4(), name: "Gérer utilisateurs", code: "manage_users", module: "settings" },
            { id: uuidv4(), name: "Gérer rôles", code: "manage_roles", module: "settings" },
        ];
        const permissions = await models.Permission.bulkCreate(permissionData);
        console.log(`✅ ${permissions.length} permissions created\n`);

        // =====================================================
        // 3. ASSIGN PERMISSIONS TO ROLES
        // =====================================================
        console.log("📝 Assigning permissions to roles...");
        const rolePermissions = [];

        // Super Admin & Admin get all permissions
        const adminRoles = roles.filter((r) => ["SUPER_ADMIN", "ADMIN"].includes(r.code));
        adminRoles.forEach((role) => {
            permissions.forEach((permission) => {
                rolePermissions.push({
                    id: uuidv4(),
                    role_id: role.id,
                    permission_id: permission.id,
                });
            });
        });

        // RH Manager permissions
        const rhManager = roles.find((r) => r.code === "RH_MANAGER");
        const rhPermissions = permissions.filter((p) =>
            ["view_employees", "create_employee", "update_employee", "view_leaves", "approve_leave", "manage_leave_types", "view_attendance", "record_attendance", "update_attendance", "view_payroll", "create_payroll"].includes(p.code)
        );
        rhPermissions.forEach((permission) => {
            rolePermissions.push({
                id: uuidv4(),
                role_id: rhManager.id,
                permission_id: permission.id,
            });
        });

        // Supervisor permissions
        const supervisor = roles.find((r) => r.code === "SUPERVISOR");
        const supervisorPermissions = permissions.filter((p) => ["view_employees", "view_leaves", "approve_leave", "view_attendance", "record_attendance"].includes(p.code));
        supervisorPermissions.forEach((permission) => {
            rolePermissions.push({
                id: uuidv4(),
                role_id: supervisor.id,
                permission_id: permission.id,
            });
        });

        // Employee permissions
        const employee = roles.find((r) => r.code === "EMPLOYEE");
        const employeePermissions = permissions.filter((p) => ["view_leaves", "create_leave_request"].includes(p.code));
        employeePermissions.forEach((permission) => {
            rolePermissions.push({
                id: uuidv4(),
                role_id: employee.id,
                permission_id: permission.id,
            });
        });

        await models.RolePermission.bulkCreate(rolePermissions);
        console.log(`✅ ${rolePermissions.length} role-permission assignments created\n`);

        // =====================================================
        // 4. SEED USERS
        // =====================================================
        console.log("📝 Seeding users...");
        const hashedPassword = await bcrypt.hash("Password@123", 10);

        const userData = [
            { id: uuidv4(), email: "admin@sofibank.cd", password: hashedPassword, is_active: true },
            { id: uuidv4(), email: "rh@sofibank.cd", password: hashedPassword, is_active: true },
            { id: uuidv4(), email: "superviseur@sofibank.cd", password: hashedPassword, is_active: true },
            { id: uuidv4(), email: "employe1@sofibank.cd", password: hashedPassword, is_active: true },
            { id: uuidv4(), email: "employe2@sofibank.cd", password: hashedPassword, is_active: true },
            { id: uuidv4(), email: "employe3@sofibank.cd", password: hashedPassword, is_active: true },
        ];
        const users = await models.User.bulkCreate(userData);
        console.log(`✅ ${users.length} users created\n`);

        // =====================================================
        // 5. ASSIGN ROLES TO USERS
        // =====================================================
        console.log("📝 Assigning roles to users...");
        const userRoleData = [
            { id: uuidv4(), user_id: users[0].id, role_id: roles.find((r) => r.code === "SUPER_ADMIN").id, assigned_by: users[0].id },
            { id: uuidv4(), user_id: users[1].id, role_id: roles.find((r) => r.code === "RH_MANAGER").id, assigned_by: users[0].id },
            { id: uuidv4(), user_id: users[2].id, role_id: roles.find((r) => r.code === "SUPERVISOR").id, assigned_by: users[0].id },
            { id: uuidv4(), user_id: users[3].id, role_id: roles.find((r) => r.code === "EMPLOYEE").id, assigned_by: users[0].id },
            { id: uuidv4(), user_id: users[4].id, role_id: roles.find((r) => r.code === "EMPLOYEE").id, assigned_by: users[0].id },
            { id: uuidv4(), user_id: users[5].id, role_id: roles.find((r) => r.code === "EMPLOYEE").id, assigned_by: users[0].id },
        ];
        await models.UserRole.bulkCreate(userRoleData);
        console.log(`✅ ${userRoleData.length} user-role assignments created\n`);

        // =====================================================
        // 6. SEED ORGANIZATIONAL STRUCTURE
        // =====================================================
        console.log("📝 Seeding organizational structure...");

        // Directions
        const directionData = [
            { id: uuidv4(), name: "Direction Générale", code: "DG", director_id: users[0].id, is_active: true },
            { id: uuidv4(), name: "Direction des Ressources Humaines", code: "DRH", director_id: users[1].id, is_active: true },
            { id: uuidv4(), name: "Direction Financière", code: "DFIN", is_active: true },
            { id: uuidv4(), name: "Direction Commerciale", code: "DCOM", is_active: true },
        ];
        const directions = await models.Direction.bulkCreate(directionData);
        console.log(`✅ ${directions.length} directions created`);

        // Services
        const serviceData = [
            { id: uuidv4(), name: "Service RH", code: "SRH", direction_id: directions[1].id, manager_id: users[1].id, is_active: true },
            { id: uuidv4(), name: "Service Paie", code: "SPAIE", direction_id: directions[1].id, is_active: true },
            { id: uuidv4(), name: "Service Comptabilité", code: "SCOMPTA", direction_id: directions[2].id, is_active: true },
            { id: uuidv4(), name: "Service Commercial", code: "SCOM", direction_id: directions[3].id, manager_id: users[2].id, is_active: true },
        ];
        const services = await models.Service.bulkCreate(serviceData);
        console.log(`✅ ${services.length} services created`);

        // Grades
        const gradeData = [
            { id: uuidv4(), name: "Directeur", code: "DIR", level: 1, base_salary: 2000000, is_active: true },
            { id: uuidv4(), name: "Manager", code: "MGR", level: 2, base_salary: 1500000, is_active: true },
            { id: uuidv4(), name: "Senior", code: "SNR", level: 3, base_salary: 1000000, is_active: true },
            { id: uuidv4(), name: "Junior", code: "JNR", level: 4, base_salary: 600000, is_active: true },
            { id: uuidv4(), name: "Stagiaire", code: "STG", level: 5, base_salary: 300000, is_active: true },
        ];
        const grades = await models.Grade.bulkCreate(gradeData);
        console.log(`✅ ${grades.length} grades created`);

        // Job Positions
        const positionData = [
            { id: uuidv4(), title: "Directeur Général", code: "DG001", grade_id: grades[0].id, is_active: true },
            { id: uuidv4(), title: "Directeur RH", code: "DRH001", grade_id: grades[0].id, is_active: true },
            { id: uuidv4(), title: "Manager RH", code: "MRH001", grade_id: grades[1].id, is_active: true },
            { id: uuidv4(), title: "Gestionnaire RH", code: "GRH001", grade_id: grades[2].id, is_active: true },
            { id: uuidv4(), title: "Assistant RH", code: "ARH001", grade_id: grades[3].id, is_active: true },
            { id: uuidv4(), title: "Commercial", code: "COM001", grade_id: grades[2].id, is_active: true },
        ];
        const positions = await models.JobPosition.bulkCreate(positionData);
        console.log(`✅ ${positions.length} job positions created\n`);

        // =====================================================
        // 7. SEED EMPLOYEES
        // =====================================================
        console.log("📝 Seeding employees...");
        const employeeData = [
            {
                id: uuidv4(),
                user_id: users[0].id,
                employee_number: "EMP001",
                first_name: "Jean",
                last_name: "MUKENDI",
                date_of_birth: "1980-05-15",
                gender: "M",
                nationality: "Congolaise",
                email: "admin@sofibank.cd",
                phone: "+243 970 000 001",
                direction_id: directions[0].id,
                job_position_id: positions[0].id,
                grade_id: grades[0].id,
                hire_date: "2015-01-10",
                contract_type: "permanent",
                employment_status: "active",
                created_by: users[0].id,
            },
            {
                id: uuidv4(),
                user_id: users[1].id,
                employee_number: "EMP002",
                first_name: "Marie",
                last_name: "KABAMBA",
                date_of_birth: "1985-08-22",
                gender: "F",
                nationality: "Congolaise",
                email: "rh@sofibank.cd",
                phone: "+243 970 000 002",
                direction_id: directions[1].id,
                service_id: services[0].id,
                job_position_id: positions[1].id,
                grade_id: grades[0].id,
                hire_date: "2016-03-15",
                contract_type: "permanent",
                employment_status: "active",
                direct_supervisor_id: null,
                created_by: users[0].id,
            },
            {
                id: uuidv4(),
                user_id: users[2].id,
                employee_number: "EMP003",
                first_name: "Pierre",
                last_name: "MBUYI",
                date_of_birth: "1988-12-10",
                gender: "M",
                nationality: "Congolaise",
                email: "superviseur@sofibank.cd",
                phone: "+243 970 000 003",
                direction_id: directions[3].id,
                service_id: services[3].id,
                job_position_id: positions[2].id,
                grade_id: grades[1].id,
                hire_date: "2017-06-01",
                contract_type: "permanent",
                employment_status: "active",
                created_by: users[0].id,
            },
            {
                id: uuidv4(),
                user_id: users[3].id,
                employee_number: "EMP004",
                first_name: "Sarah",
                last_name: "TSHALA",
                date_of_birth: "1992-03-18",
                gender: "F",
                nationality: "Congolaise",
                email: "employe1@sofibank.cd",
                phone: "+243 970 000 004",
                direction_id: directions[1].id,
                service_id: services[0].id,
                job_position_id: positions[3].id,
                grade_id: grades[2].id,
                hire_date: "2019-09-01",
                contract_type: "permanent",
                employment_status: "active",
                created_by: users[0].id,
            },
            {
                id: uuidv4(),
                user_id: users[4].id,
                employee_number: "EMP005",
                first_name: "David",
                last_name: "KALALA",
                date_of_birth: "1994-07-25",
                gender: "M",
                nationality: "Congolaise",
                email: "employe2@sofibank.cd",
                phone: "+243 970 000 005",
                direction_id: directions[3].id,
                service_id: services[3].id,
                job_position_id: positions[5].id,
                grade_id: grades[2].id,
                hire_date: "2020-02-15",
                contract_type: "permanent",
                employment_status: "active",
                created_by: users[0].id,
            },
            {
                id: uuidv4(),
                user_id: users[5].id,
                employee_number: "EMP006",
                first_name: "Grace",
                last_name: "MULAMBA",
                date_of_birth: "1996-11-30",
                gender: "F",
                nationality: "Congolaise",
                email: "employe3@sofibank.cd",
                phone: "+243 970 000 006",
                direction_id: directions[1].id,
                service_id: services[0].id,
                job_position_id: positions[4].id,
                grade_id: grades[3].id,
                hire_date: "2021-08-01",
                contract_type: "permanent",
                employment_status: "active",
                created_by: users[0].id,
            },
        ];
        const employees = await models.Employee.bulkCreate(employeeData);

        // Update supervisor relationships
        await employees[1].update({ direct_supervisor_id: employees[0].id });
        await employees[2].update({ direct_supervisor_id: employees[1].id });
        await employees[3].update({ direct_supervisor_id: employees[1].id });
        await employees[4].update({ direct_supervisor_id: employees[2].id });
        await employees[5].update({ direct_supervisor_id: employees[1].id });

        console.log(`✅ ${employees.length} employees created\n`);

        // =====================================================
        // 8. SEED LEAVE TYPES
        // =====================================================
        console.log("📝 Seeding leave types...");
        const leaveTypeData = [
            {
                id: uuidv4(),
                name: "Congé Annuel",
                code: "CA",
                category: "annual",
                default_days: 22,
                max_days_per_year: 30,
                requires_document: false,
                requires_handover: true,
                is_paid: true,
                is_active: true,
            },
            {
                id: uuidv4(),
                name: "Congé Maladie",
                code: "CM",
                category: "sick",
                default_days: 10,
                max_days_per_year: 30,
                requires_document: true,
                requires_handover: false,
                is_paid: true,
                is_active: true,
            },
            {
                id: uuidv4(),
                name: "Congé Maternité",
                code: "CMAT",
                category: "maternity",
                default_days: 90,
                max_days_per_year: 90,
                requires_document: true,
                requires_handover: true,
                is_paid: true,
                is_active: true,
            },
            {
                id: uuidv4(),
                name: "Congé Paternité",
                code: "CPAT",
                category: "paternity",
                default_days: 3,
                max_days_per_year: 3,
                requires_document: true,
                requires_handover: false,
                is_paid: true,
                is_active: true,
            },
            {
                id: uuidv4(),
                name: "Congé Circonstance (Décès)",
                code: "CDC",
                category: "circumstance",
                default_days: 3,
                max_days_per_year: 10,
                requires_document: true,
                requires_handover: false,
                is_paid: true,
                is_active: true,
            },
            {
                id: uuidv4(),
                name: "Congé Circonstance (Mariage)",
                code: "CMAR",
                category: "circumstance",
                default_days: 3,
                max_days_per_year: 3,
                requires_document: true,
                requires_handover: false,
                is_paid: true,
                is_active: true,
            },
            {
                id: uuidv4(),
                name: "Congé Sans Solde",
                code: "CSS",
                category: "unpaid",
                default_days: 0,
                max_days_per_year: null,
                requires_document: false,
                requires_handover: true,
                is_paid: false,
                is_active: true,
            },
        ];
        const leaveTypes = await models.LeaveType.bulkCreate(leaveTypeData);
        console.log(`✅ ${leaveTypes.length} leave types created\n`);

        // =====================================================
        // 9. SEED LEAVE BALANCES
        // =====================================================
        console.log("📝 Seeding leave balances...");
        const leaveBalances = [];
        const currentYear = new Date().getFullYear();

        employees.forEach((emp) => {
            // Annual leave balance
            leaveBalances.push({
                id: uuidv4(),
                employee_id: emp.id,
                leave_type_id: leaveTypes[0].id, // Congé Annuel
                year: currentYear,
                total_days: 22,
                used_days: 0,
                remaining_days: 22,
                carried_over_days: 0,
            });

            // Sick leave balance
            leaveBalances.push({
                id: uuidv4(),
                employee_id: emp.id,
                leave_type_id: leaveTypes[1].id, // Congé Maladie
                year: currentYear,
                total_days: 10,
                used_days: 0,
                remaining_days: 10,
                carried_over_days: 0,
            });
        });

        await models.LeaveBalance.bulkCreate(leaveBalances);
        console.log(`✅ ${leaveBalances.length} leave balances created\n`);

        // =====================================================
        // 10. SEED SAMPLE LEAVE REQUESTS
        // =====================================================
        console.log("📝 Seeding sample leave requests...");
        const leaveRequestData = [
            {
                id: uuidv4(),
                request_number: "LR-2025-001",
                employee_id: employees[3].id,
                leave_type_id: leaveTypes[0].id,
                start_date: "2025-01-20",
                end_date: "2025-01-24",
                total_days: 5,
                return_date: "2025-01-27",
                reason: "Vacances familiales",
                backup_employee_id: employees[4].id,
                status: "pending_supervisor",
                submitted_at: new Date(),
                created_by: users[3].id,
            },
            {
                id: uuidv4(),
                request_number: "LR-2025-002",
                employee_id: employees[4].id,
                leave_type_id: leaveTypes[1].id,
                start_date: "2025-01-15",
                end_date: "2025-01-17",
                total_days: 3,
                return_date: "2025-01-18",
                reason: "Consultation médicale",
                status: "approved",
                submitted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                created_by: users[4].id,
            },
        ];
        await models.LeaveRequest.bulkCreate(leaveRequestData);
        console.log(`✅ ${leaveRequestData.length} leave requests created\n`);

        // =====================================================
        // 11. SEED ATTENDANCE RECORDS
        // =====================================================
        console.log("📝 Seeding attendance records...");
        const attendanceRecords = [];
        const today = new Date();

        // Last 5 days of attendance for all employees
        for (let i = 4; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            employees.forEach((emp) => {
                attendanceRecords.push({
                    id: uuidv4(),
                    employee_id: emp.id,
                    date: date.toISOString().split("T")[0],
                    check_in_time: "08:00:00",
                    check_out_time: "17:00:00",
                    total_hours: 8.0,
                    status: "present",
                    is_late: false,
                    late_minutes: 0,
                });
            });
        }

        await models.AttendanceRecord.bulkCreate(attendanceRecords);
        console.log(`✅ ${attendanceRecords.length} attendance records created\n`);

        // =====================================================
        // SUMMARY
        // =====================================================
        console.log("🎉 Database seeding completed successfully!\n");
        console.log("📊 Summary:");
        console.log(`   - ${roles.length} roles`);
        console.log(`   - ${permissions.length} permissions`);
        console.log(`   - ${users.length} users`);
        console.log(`   - ${directions.length} directions`);
        console.log(`   - ${services.length} services`);
        console.log(`   - ${grades.length} grades`);
        console.log(`   - ${positions.length} job positions`);
        console.log(`   - ${employees.length} employees`);
        console.log(`   - ${leaveTypes.length} leave types`);
        console.log(`   - ${leaveBalances.length} leave balances`);
        console.log(`   - ${leaveRequestData.length} leave requests`);
        console.log(`   - ${attendanceRecords.length} attendance records`);
        console.log("\n🔑 Test credentials:");
        console.log("   Admin: admin@sofibank.cd / Password@123");
        console.log("   RH Manager: rh@sofibank.cd / Password@123");
        console.log("   Supervisor: superviseur@sofibank.cd / Password@123");
        console.log("   Employee: employe1@sofibank.cd / Password@123");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
};

// Run seeder
seedDatabase();
