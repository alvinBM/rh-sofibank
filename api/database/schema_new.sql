-- =====================================================
-- SCHEMA COMPLET SIRH SOFIBANK
-- Base de données MySQL sans contraintes FK
-- Les relations seront gérées dans l'application
-- =====================================================

DROP DATABASE IF EXISTS rh_sofibank;
CREATE DATABASE rh_sofibank CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rh_sofibank;

-- =====================================================
-- MODULE: CORE & RBAC (Système de base)
-- =====================================================

-- Utilisateurs
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  password_reset_token VARCHAR(255),
  password_reset_expires DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Rôles
CREATE TABLE roles (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  level INT DEFAULT 0,
  is_system BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code)
) ENGINE=InnoDB;

-- Permissions
CREATE TABLE permissions (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  module VARCHAR(50) NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_module (module)
) ENGINE=InnoDB;

-- Pivot: Utilisateur <-> Rôles
CREATE TABLE user_roles (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  role_id CHAR(36) NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  assigned_by CHAR(36),
  INDEX idx_user (user_id),
  INDEX idx_role (role_id),
  UNIQUE KEY unique_user_role (user_id, role_id)
) ENGINE=InnoDB;

-- Pivot: Rôle <-> Permissions
CREATE TABLE role_permissions (
  id CHAR(36) PRIMARY KEY,
  role_id CHAR(36) NOT NULL,
  permission_id CHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_role (role_id),
  INDEX idx_permission (permission_id),
  UNIQUE KEY unique_role_permission (role_id, permission_id)
) ENGINE=InnoDB;

-- =====================================================
-- MODULE: PARAMÉTRAGES (Super Admin)
-- =====================================================

-- Directions (organigramme niveau 1)
CREATE TABLE directions (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  director_id CHAR(36),
  description TEXT,
  budget DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_director (director_id)
) ENGINE=InnoDB;

-- Services (organigramme niveau 2)
CREATE TABLE services (
  id CHAR(36) PRIMARY KEY,
  direction_id CHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  manager_id CHAR(36),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_direction (direction_id),
  INDEX idx_code (code),
  INDEX idx_manager (manager_id)
) ENGINE=InnoDB;

-- Grades (niveaux hiérarchiques)
CREATE TABLE grades (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  level INT NOT NULL,
  base_salary DECIMAL(12,2) DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_level (level),
  INDEX idx_code (code)
) ENGINE=InnoDB;

-- Avantages par grade
CREATE TABLE grade_benefits (
  id CHAR(36) PRIMARY KEY,
  grade_id CHAR(36) NOT NULL,
  benefit_name VARCHAR(200) NOT NULL,
  benefit_type VARCHAR(50) NOT NULL,
  benefit_amount DECIMAL(12,2) DEFAULT 0,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_grade (grade_id),
  INDEX idx_type (benefit_type)
) ENGINE=InnoDB;

-- Postes/Fonctions
CREATE TABLE job_positions (
  id CHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  required_skills JSON,
  responsibilities JSON,
  minimum_grade_id CHAR(36),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_grade (minimum_grade_id)
) ENGINE=InnoDB;

-- Jours fériés
CREATE TABLE holidays (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  year INT NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_year (year)
) ENGINE=InnoDB;

-- Paramètres système
CREATE TABLE system_settings (
  id CHAR(36) PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'string',
  module VARCHAR(50),
  description TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by CHAR(36),
  INDEX idx_key (setting_key),
  INDEX idx_module (module)
) ENGINE=InnoDB;

-- Paramètres de paie (IRPP, périodicité, etc.)
CREATE TABLE payroll_settings (
  id CHAR(36) PRIMARY KEY,
  effective_date DATE NOT NULL,
  irpp_rate DECIMAL(5,2) DEFAULT 0,
  inss_rate DECIMAL(5,2) DEFAULT 0,
  pay_frequency VARCHAR(20) DEFAULT 'monthly',
  payment_day INT DEFAULT 24,
  currency VARCHAR(10) DEFAULT 'CDF',
  config JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (effective_date),
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Tranches d'imposition IRPP
CREATE TABLE tax_brackets (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  min_amount DECIMAL(12,2) NOT NULL,
  max_amount DECIMAL(12,2),
  rate DECIMAL(5,2) NOT NULL,
  fixed_amount DECIMAL(12,2) DEFAULT 0,
  effective_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (effective_date)
) ENGINE=InnoDB;

-- Terminaux biométriques
CREATE TABLE biometric_devices (
  id CHAR(36) PRIMARY KEY,
  device_name VARCHAR(200) NOT NULL,
  device_code VARCHAR(50) UNIQUE NOT NULL,
  location VARCHAR(200),
  site VARCHAR(100),
  device_type VARCHAR(50) DEFAULT 'fingerprint',
  ip_address VARCHAR(50),
  protocol VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  last_sync DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (device_code),
  INDEX idx_site (site),
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- MODULE: EMPLOYÉS
-- =====================================================

-- Employés (table principale)
CREATE TABLE employees (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  employee_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  date_of_birth DATE,
  gender VARCHAR(20),
  marital_status VARCHAR(50),
  nationality VARCHAR(100),
  national_id VARCHAR(100),
  passport_number VARCHAR(100),
  
  -- Informations professionnelles
  direction_id CHAR(36),
  service_id CHAR(36),
  job_position_id CHAR(36),
  grade_id CHAR(36),
  manager_id CHAR(36),
  employment_status VARCHAR(50) DEFAULT 'active',
  employment_type VARCHAR(50) DEFAULT 'permanent',
  hire_date DATE,
  contract_start_date DATE,
  contract_end_date DATE,
  termination_date DATE,
  termination_reason TEXT,
  
  -- Informations contact
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(100),
  
  -- Informations bancaires
  bank_name VARCHAR(200),
  bank_account_number VARCHAR(100),
  
  -- Photo et documents
  photo_url TEXT,
  cv_url TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_number (employee_number),
  INDEX idx_email (email),
  INDEX idx_direction (direction_id),
  INDEX idx_service (service_id),
  INDEX idx_position (job_position_id),
  INDEX idx_grade (grade_id),
  INDEX idx_manager (manager_id),
  INDEX idx_status (employment_status),
  INDEX idx_hire_date (hire_date)
) ENGINE=InnoDB;

-- Personnes à charge
CREATE TABLE employee_dependents (
  id CHAR(36) PRIMARY KEY,
  employee_id CHAR(36) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  is_beneficiary BOOLEAN DEFAULT FALSE,
  national_id VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee (employee_id),
  INDEX idx_relationship (relationship)
) ENGINE=InnoDB;

-- Contrats employés
CREATE TABLE employee_contracts (
  id CHAR(36) PRIMARY KEY,
  employee_id CHAR(36) NOT NULL,
  contract_number VARCHAR(100) UNIQUE NOT NULL,
  contract_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  salary DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'CDF',
  terms TEXT,
  document_url TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  signed_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee (employee_id),
  INDEX idx_number (contract_number),
  INDEX idx_type (contract_type),
  INDEX idx_current (is_current)
) ENGINE=InnoDB;

-- Historique carrière
CREATE TABLE employee_history (
  id CHAR(36) PRIMARY KEY,
  employee_id CHAR(36) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_date DATE NOT NULL,
  old_value JSON,
  new_value JSON,
  old_direction_id CHAR(36),
  new_direction_id CHAR(36),
  old_service_id CHAR(36),
  new_service_id CHAR(36),
  old_job_position_id CHAR(36),
  new_job_position_id CHAR(36),
  old_grade_id CHAR(36),
  new_grade_id CHAR(36),
  description TEXT,
  effective_date DATE,
  approved_by CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_employee (employee_id),
  INDEX idx_event_type (event_type),
  INDEX idx_event_date (event_date)
) ENGINE=InnoDB;

-- =====================================================
-- MODULE: ESS (Employee Self-Service)
-- =====================================================

-- Types de documents
CREATE TABLE document_types (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code (code)
) ENGINE=InnoDB;

-- Documents employés
CREATE TABLE employee_documents (
  id CHAR(36) PRIMARY KEY,
  employee_id CHAR(36) NOT NULL,
  document_type_id CHAR(36) NOT NULL,
  document_name VARCHAR(200) NOT NULL,
  document_url TEXT NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by CHAR(36),
  verified_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_employee (employee_id),
  INDEX idx_type (document_type_id),
  INDEX idx_expiry (expiry_date)
) ENGINE=InnoDB;

-- Types de demandes RH
CREATE TABLE request_types (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  requires_approval BOOLEAN DEFAULT TRUE,
  approval_levels INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code (code)
) ENGINE=InnoDB;

-- Demandes RH (attestations, etc.)
CREATE TABLE employee_requests (
  id CHAR(36) PRIMARY KEY,
  request_number VARCHAR(100) UNIQUE NOT NULL,
  employee_id CHAR(36) NOT NULL,
  request_type_id CHAR(36) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  details TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'normal',
  requested_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_date DATETIME,
  processed_by CHAR(36),
  response TEXT,
  document_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee (employee_id),
  INDEX idx_type (request_type_id),
  INDEX idx_status (status),
  INDEX idx_number (request_number)
) ENGINE=InnoDB;

-- Workflow approbations demandes
CREATE TABLE request_approvals (
  id CHAR(36) PRIMARY KEY,
  request_id CHAR(36) NOT NULL,
  approver_id CHAR(36) NOT NULL,
  approval_level INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  comments TEXT,
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_request (request_id),
  INDEX idx_approver (approver_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Cartes d'anniversaire automatiques
CREATE TABLE birthday_cards (
  id CHAR(36) PRIMARY KEY,
  employee_id CHAR(36) NOT NULL,
  birth_date DATE NOT NULL,
  sent_date DATETIME,
  message TEXT,
  signed_by JSON,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_employee (employee_id),
  INDEX idx_birth_date (birth_date),
  INDEX idx_sent (email_sent)
) ENGINE=InnoDB;

-- =====================================================
-- MODULE: CONGÉS (Leave Management)
-- =====================================================

-- Types de congés
CREATE TABLE leave_types (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  days_per_year INT DEFAULT 0,
  max_consecutive_days INT,
  requires_backup BOOLEAN DEFAULT FALSE,
  requires_handover_form BOOLEAN DEFAULT FALSE,
  approval_levels INT DEFAULT 2,
  is_paid BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  color VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code)
) ENGINE=InnoDB;

-- Soldes de congés
CREATE TABLE leave_balances (
  id CHAR(36) PRIMARY KEY,
  employee_id CHAR(36) NOT NULL,
  leave_type_id CHAR(36) NOT NULL,
  year INT NOT NULL,
  total_days DECIMAL(5,2) DEFAULT 0,
  used_days DECIMAL(5,2) DEFAULT 0,
  pending_days DECIMAL(5,2) DEFAULT 0,
  available_days DECIMAL(5,2) DEFAULT 0,
  carry_forward_days DECIMAL(5,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee (employee_id),
  INDEX idx_type (leave_type_id),
  INDEX idx_year (year),
  UNIQUE KEY unique_employee_type_year (employee_id, leave_type_id, year)
) ENGINE=InnoDB;

-- Demandes de congés
CREATE TABLE leave_requests (
  id CHAR(36) PRIMARY KEY,
  request_number VARCHAR(100) UNIQUE NOT NULL,
  employee_id CHAR(36) NOT NULL,
  leave_type_id CHAR(36) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL(5,2) NOT NULL,
  reason TEXT,
  backup_employee_id CHAR(36),
  handover_form_url TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  submitted_at DATETIME,
  approved_at DATETIME,
  rejected_at DATETIME,
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee (employee_id),
  INDEX idx_type (leave_type_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_number (request_number)
) ENGINE=InnoDB;

-- Workflow approbations congés
CREATE TABLE leave_approvals (
  id CHAR(36) PRIMARY KEY,
  leave_request_id CHAR(36) NOT NULL,
  approver_id CHAR(36) NOT NULL,
  approver_role VARCHAR(50) NOT NULL,
  approval_level INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  comments TEXT,
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_request (leave_request_id),
  INDEX idx_approver (approver_id),
  INDEX idx_status (status),
  INDEX idx_level (approval_level)
) ENGINE=InnoDB;

-- Planification annuelle des congés
CREATE TABLE leave_planning (
  id CHAR(36) PRIMARY KEY,
  employee_id CHAR(36) NOT NULL,
  year INT NOT NULL,
  planned_start_date DATE,
  planned_end_date DATE,
  planned_days DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'draft',
  submitted_at DATETIME,
  approved_by CHAR(36),
  approved_at DATETIME,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee (employee_id),
  INDEX idx_year (year),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Ajustements de soldes
CREATE TABLE leave_balance_adjustments (
  id CHAR(36) PRIMARY KEY,
  leave_balance_id CHAR(36) NOT NULL,
  adjustment_type VARCHAR(50) NOT NULL,
  days DECIMAL(5,2) NOT NULL,
  reason TEXT NOT NULL,
  adjusted_by CHAR(36) NOT NULL,
  adjustment_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_balance (leave_balance_id),
  INDEX idx_date (adjustment_date)
) ENGINE=InnoDB;

-- =====================================================
-- MODULE: PRÉSENCE & MOUVEMENTS (Time & Attendance)
-- =====================================================

-- Horaires de travail
CREATE TABLE work_schedules (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INT DEFAULT 0,
  work_days JSON,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code)
) ENGINE=InnoDB;

-- Enregistrements de présence
CREATE TABLE attendance_records (
  id CHAR(36) PRIMARY KEY,
  employee_id CHAR(36) NOT NULL,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  check_in_device_id CHAR(36),
  check_out_device_id CHAR(36),
  status VARCHAR(50) DEFAULT 'present',
  late_minutes INT DEFAULT 0,
  early_leave_minutes INT DEFAULT 0,
  work_hours DECIMAL(5,2) DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_by CHAR(36),
  verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee (employee_id),
  INDEX idx_date (date),
  INDEX idx_status (status),
  UNIQUE KEY unique_employee_date (employee_id, date)
) ENGINE=InnoDB;

-- Autorisations de sortie
CREATE TABLE work_authorizations (
  id CHAR(36) PRIMARY KEY,
  employee_id CHAR(36) NOT NULL,
  authorization_type VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_by CHAR(36),
  approved_at DATETIME,
  rejection_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee (employee_id),
  INDEX idx_date (date),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Rapports de présence
CREATE TABLE attendance_reports (
  id CHAR(36) PRIMARY KEY,
  report_type VARCHAR(50) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  direction_id CHAR(36),
  service_id CHAR(36),
  report_data JSON,
  generated_by CHAR(36) NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (report_type),
  INDEX idx_period (period_start, period_end)
) ENGINE=InnoDB;

-- Anomalies de présence
CREATE TABLE attendance_anomalies (
  id CHAR(36) PRIMARY KEY,
  employee_id CHAR(36) NOT NULL,
  date DATE NOT NULL,
  anomaly_type VARCHAR(50) NOT NULL,
  description TEXT,
  severity VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'open',
  resolved_by CHAR(36),
  resolved_at DATETIME,
  resolution_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_employee (employee_id),
  INDEX idx_date (date),
  INDEX idx_type (anomaly_type),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- =====================================================
-- MODULE: RECRUTEMENT (Recruitment & Onboarding)
-- =====================================================

-- Planification annuelle des besoins
CREATE TABLE workforce_planning (
  id CHAR(36) PRIMARY KEY,
  planning_number VARCHAR(100) UNIQUE NOT NULL,
  year INT NOT NULL,
  direction_id CHAR(36) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  total_positions INT DEFAULT 0,
  estimated_budget DECIMAL(15,2) DEFAULT 0,
  justification TEXT,
  submitted_by CHAR(36),
  submitted_at DATETIME,
  approved_by CHAR(36),
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_year (year),
  INDEX idx_direction (direction_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Lignes de planification des besoins
CREATE TABLE workforce_planning_items (
  id CHAR(36) PRIMARY KEY,
  planning_id CHAR(36) NOT NULL,
  job_position_id CHAR(36) NOT NULL,
  grade_id CHAR(36) NOT NULL,
  service_id CHAR(36),
  need_type VARCHAR(50) NOT NULL,
  number_of_positions INT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  expected_hire_month INT,
  job_description TEXT,
  required_skills JSON,
  estimated_salary DECIMAL(12,2),
  justification TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_planning (planning_id),
  INDEX idx_position (job_position_id),
  INDEX idx_grade (grade_id)
) ENGINE=InnoDB;

-- Postes vacants
CREATE TABLE job_openings (
  id CHAR(36) PRIMARY KEY,
  job_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  direction_id CHAR(36) NOT NULL,
  service_id CHAR(36),
  job_position_id CHAR(36) NOT NULL,
  grade_id CHAR(36) NOT NULL,
  employment_type VARCHAR(50) NOT NULL,
  number_of_positions INT DEFAULT 1,
  job_description TEXT,
  requirements TEXT,
  responsibilities TEXT,
  skills_required JSON,
  salary_range_min DECIMAL(12,2),
  salary_range_max DECIMAL(12,2),
  deadline DATE,
  status VARCHAR(50) DEFAULT 'draft',
  is_published BOOLEAN DEFAULT FALSE,
  published_at DATETIME,
  published_channels JSON,
  closed_at DATETIME,
  created_by CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_number (job_number),
  INDEX idx_direction (direction_id),
  INDEX idx_position (job_position_id),
  INDEX idx_status (status),
  INDEX idx_published (is_published)
) ENGINE=InnoDB;

-- Candidats
CREATE TABLE candidates (
  id CHAR(36) PRIMARY KEY,
  candidate_number VARCHAR(100) UNIQUE NOT NULL,
  job_opening_id CHAR(36) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  date_of_birth DATE,
  gender VARCHAR(20),
  nationality VARCHAR(100),
  address TEXT,
  cv_url TEXT,
  cover_letter_url TEXT,
  application_source VARCHAR(50),
  linkedin_url TEXT,
  status VARCHAR(50) DEFAULT 'new',
  overall_score DECIMAL(5,2),
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_number (candidate_number),
  INDEX idx_job (job_opening_id),
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Entretiens
CREATE TABLE candidate_interviews (
  id CHAR(36) PRIMARY KEY,
  candidate_id CHAR(36) NOT NULL,
  interview_type VARCHAR(50) NOT NULL,
  scheduled_date DATETIME NOT NULL,
  duration INT DEFAULT 60,
  location VARCHAR(200),
  meeting_link TEXT,
  interviewers JSON,
  status VARCHAR(50) DEFAULT 'scheduled',
  feedback TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_candidate (candidate_id),
  INDEX idx_date (scheduled_date),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Évaluations candidats
CREATE TABLE candidate_evaluations (
  id CHAR(36) PRIMARY KEY,
  candidate_id CHAR(36) NOT NULL,
  interview_id CHAR(36),
  evaluator_id CHAR(36) NOT NULL,
  evaluation_type VARCHAR(50) NOT NULL,
  criteria JSON,
  scores JSON,
  total_score DECIMAL(5,2),
  strengths TEXT,
  weaknesses TEXT,
  recommendation VARCHAR(50),
  comments TEXT,
  evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_candidate (candidate_id),
  INDEX idx_interview (interview_id),
  INDEX idx_evaluator (evaluator_id)
) ENGINE=InnoDB;

-- Offres d'emploi
CREATE TABLE job_offers (
  id CHAR(36) PRIMARY KEY,
  offer_number VARCHAR(100) UNIQUE NOT NULL,
  candidate_id CHAR(36) NOT NULL,
  job_opening_id CHAR(36) NOT NULL,
  job_position_id CHAR(36) NOT NULL,
  grade_id CHAR(36) NOT NULL,
  employment_type VARCHAR(50) NOT NULL,
  start_date DATE,
  salary DECIMAL(12,2) NOT NULL,
  benefits JSON,
  terms TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  sent_at DATETIME,
  accepted_at DATETIME,
  rejected_at DATETIME,
  rejection_reason TEXT,
  document_url TEXT,
  created_by CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_number (offer_number),
  INDEX idx_candidate (candidate_id),
  INDEX idx_job (job_opening_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- =====================================================
-- MODULE: RÉMUNÉRATIONS & PAIE (Payroll)
-- =====================================================

-- Périodes de paie
CREATE TABLE payroll_periods (
  id CHAR(36) PRIMARY KEY,
  period_name VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  payment_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  total_employees INT DEFAULT 0,
  total_gross_amount DECIMAL(15,2) DEFAULT 0,
  total_net_amount DECIMAL(15,2) DEFAULT 0,
  total_tax_amount DECIMAL(15,2) DEFAULT 0,
  total_deductions DECIMAL(15,2) DEFAULT 0,
  processed_by CHAR(36),
  processed_at DATETIME,
  approved_by CHAR(36),
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_period (year, month),
  INDEX idx_status (status),
  UNIQUE KEY unique_year_month (year, month)
) ENGINE=InnoDB;

-- Types d'éléments de paie
CREATE TABLE payroll_item_types (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  is_taxable BOOLEAN DEFAULT TRUE,
  calculation_method TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_category (category)
) ENGINE=InnoDB;

-- Bulletins de paie
CREATE TABLE payslips (
  id CHAR(36) PRIMARY KEY,
  payslip_number VARCHAR(100) UNIQUE NOT NULL,
  employee_id CHAR(36) NOT NULL,
  payroll_period_id CHAR(36) NOT NULL,
  base_salary DECIMAL(12,2) NOT NULL,
  gross_salary DECIMAL(12,2) NOT NULL,
  total_allowances DECIMAL(12,2) DEFAULT 0,
  total_bonuses DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  taxable_amount DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  net_salary DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'bank_transfer',
  payment_date DATE,
  payment_reference VARCHAR(200),
  status VARCHAR(50) DEFAULT 'draft',
  sent_at DATETIME,
  pdf_url TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_number (payslip_number),
  INDEX idx_employee (employee_id),
  INDEX idx_period (payroll_period_id),
  INDEX idx_status (status),
  UNIQUE KEY unique_employee_period (employee_id, payroll_period_id)
) ENGINE=InnoDB;

-- Lignes de bulletins
CREATE TABLE payslip_items (
  id CHAR(36) PRIMARY KEY,
  payslip_id CHAR(36) NOT NULL,
  item_type_id CHAR(36) NOT NULL,
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  rate DECIMAL(12,2),
  amount DECIMAL(12,2) NOT NULL,
  is_taxable BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payslip (payslip_id),
  INDEX idx_type (item_type_id)
) ENGINE=InnoDB;

-- Éléments variables de paie
CREATE TABLE payroll_variables (
  id CHAR(36) PRIMARY KEY,
  employee_id CHAR(36) NOT NULL,
  variable_type VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  period VARCHAR(20) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  approved_by CHAR(36),
  approved_at DATETIME,
  created_by CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employee (employee_id),
  INDEX idx_type (variable_type),
  INDEX idx_period (period),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Bons de paiement (intérim, mission, etc.)
CREATE TABLE payment_vouchers (
  id CHAR(36) PRIMARY KEY,
  voucher_number VARCHAR(100) UNIQUE NOT NULL,
  employee_id CHAR(36) NOT NULL,
  voucher_type VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  period VARCHAR(20) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  submitted_by CHAR(36),
  submitted_at DATETIME,
  approved_by CHAR(36),
  approved_at DATETIME,
  paid_at DATETIME,
  document_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_number (voucher_number),
  INDEX idx_employee (employee_id),
  INDEX idx_type (voucher_type),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- =====================================================
-- MODULE: PERFORMANCE 360°
-- =====================================================

-- Cycles d'évaluation
CREATE TABLE performance_cycles (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  year INT NOT NULL,
  quarter INT,
  cycle_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  self_eval_deadline DATE,
  manager_eval_deadline DATE,
  status VARCHAR(50) DEFAULT 'draft',
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_year (year),
  INDEX idx_quarter (quarter),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- KPIs par fonction
CREATE TABLE kpis (
  id CHAR(36) PRIMARY KEY,
  job_position_id CHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  measurement_unit VARCHAR(50),
  min_scale DECIMAL(5,2) DEFAULT 0,
  max_scale DECIMAL(5,2) DEFAULT 100,
  weight DECIMAL(5,2) DEFAULT 0,
  calculation_method TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_position (job_position_id)
) ENGINE=InnoDB;

-- Évaluations de performance
CREATE TABLE performance_evaluations (
  id CHAR(36) PRIMARY KEY,
  evaluation_number VARCHAR(100) UNIQUE NOT NULL,
  employee_id CHAR(36) NOT NULL,
  cycle_id CHAR(36) NOT NULL,
  evaluator_id CHAR(36) NOT NULL,
  evaluator_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  overall_score DECIMAL(5,2),
  rating VARCHAR(50),
  self_assessment TEXT,
  manager_comments TEXT,
  strengths TEXT,
  areas_for_improvement TEXT,
  development_plan TEXT,
  recommendations JSON,
  submitted_at DATETIME,
  reviewed_by CHAR(36),
  reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_number (evaluation_number),
  INDEX idx_employee (employee_id),
  INDEX idx_cycle (cycle_id),
  INDEX idx_evaluator (evaluator_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Réponses aux KPIs
CREATE TABLE evaluation_kpi_responses (
  id CHAR(36) PRIMARY KEY,
  evaluation_id CHAR(36) NOT NULL,
  kpi_id CHAR(36) NOT NULL,
  target_value DECIMAL(10,2),
  actual_value DECIMAL(10,2),
  score DECIMAL(5,2),
  weight DECIMAL(5,2),
  weighted_score DECIMAL(5,2),
  comments TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_evaluation (evaluation_id),
  INDEX idx_kpi (kpi_id)
) ENGINE=InnoDB;

-- Plans d'amélioration de performance (PIP)
CREATE TABLE pip_plans (
  id CHAR(36) PRIMARY KEY,
  employee_id CHAR(36) NOT NULL,
  evaluation_id CHAR(36),
  pip_number VARCHAR(100) UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  objectives TEXT NOT NULL,
  action_plan TEXT NOT NULL,
  support_provided TEXT,
  status VARCHAR(50) DEFAULT 'active',
  progress_notes TEXT,
  outcome VARCHAR(50),
  completed_at DATETIME,
  created_by CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_number (pip_number),
  INDEX idx_employee (employee_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Revues PIP
CREATE TABLE pip_reviews (
  id CHAR(36) PRIMARY KEY,
  pip_id CHAR(36) NOT NULL,
  review_date DATE NOT NULL,
  progress_summary TEXT NOT NULL,
  achievements TEXT,
  challenges TEXT,
  next_steps TEXT,
  reviewer_id CHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pip (pip_id),
  INDEX idx_date (review_date)
) ENGINE=InnoDB;

-- =====================================================
-- MODULE: DASHBOARD & INDICATEURS RH
-- =====================================================

-- Métriques RH consolidées
CREATE TABLE hr_metrics (
  id CHAR(36) PRIMARY KEY,
  metric_date DATE NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  metric_value DECIMAL(15,2),
  dimension_1 VARCHAR(100),
  dimension_2 VARCHAR(100),
  metadata JSON,
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (metric_date),
  INDEX idx_type (metric_type)
) ENGINE=InnoDB;

-- Alertes automatiques
CREATE TABLE hr_alerts (
  id CHAR(36) PRIMARY KEY,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium',
  title VARCHAR(500) NOT NULL,
  description TEXT,
  threshold_value DECIMAL(15,2),
  actual_value DECIMAL(15,2),
  entity_type VARCHAR(50),
  entity_id CHAR(36),
  status VARCHAR(50) DEFAULT 'active',
  triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  acknowledged_by CHAR(36),
  acknowledged_at DATETIME,
  resolved_at DATETIME,
  resolution_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (alert_type),
  INDEX idx_status (status),
  INDEX idx_triggered (triggered_at)
) ENGINE=InnoDB;

-- Seuils d'alerte
CREATE TABLE alert_thresholds (
  id CHAR(36) PRIMARY KEY,
  metric_type VARCHAR(50) NOT NULL,
  threshold_name VARCHAR(200) NOT NULL,
  threshold_value DECIMAL(15,2) NOT NULL,
  comparison_operator VARCHAR(10) NOT NULL,
  direction_id CHAR(36),
  service_id CHAR(36),
  severity VARCHAR(20) DEFAULT 'medium',
  is_active BOOLEAN DEFAULT TRUE,
  notification_emails JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_metric (metric_type),
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Rapports personnalisés
CREATE TABLE custom_reports (
  id CHAR(36) PRIMARY KEY,
  report_name VARCHAR(200) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  data_source VARCHAR(100) NOT NULL,
  filters JSON,
  columns JSON,
  sort_config JSON,
  chart_config JSON,
  schedule_frequency VARCHAR(50),
  recipients JSON,
  is_public BOOLEAN DEFAULT FALSE,
  created_by CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (report_type),
  INDEX idx_creator (created_by)
) ENGINE=InnoDB;

-- Exécutions de rapports
CREATE TABLE report_executions (
  id CHAR(36) PRIMARY KEY,
  report_id CHAR(36) NOT NULL,
  executed_by CHAR(36),
  execution_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  parameters JSON,
  result_data JSON,
  file_url TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  error_message TEXT,
  INDEX idx_report (report_id),
  INDEX idx_date (execution_date)
) ENGINE=InnoDB;

-- =====================================================
-- TABLES TRANSVERSALES (Cross-cutting)
-- =====================================================

-- Notifications
CREATE TABLE notifications (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  message TEXT,
  entity_type VARCHAR(50),
  entity_id CHAR(36),
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,
  priority VARCHAR(20) DEFAULT 'normal',
  action_url TEXT,
  sent_via JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_read (is_read),
  INDEX idx_type (notification_type),
  INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- Logs d'audit
CREATE TABLE audit_logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id CHAR(36),
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- Fichiers téléchargés
CREATE TABLE file_uploads (
  id CHAR(36) PRIMARY KEY,
  file_name VARCHAR(500) NOT NULL,
  original_name VARCHAR(500) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id CHAR(36),
  uploaded_by CHAR(36),
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_uploader (uploaded_by)
) ENGINE=InnoDB;

-- Communications internes
CREATE TABLE internal_communications (
  id CHAR(36) PRIMARY KEY,
  communication_type VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  target_audience VARCHAR(50) DEFAULT 'all',
  direction_id CHAR(36),
  service_id CHAR(36),
  priority VARCHAR(20) DEFAULT 'normal',
  is_published BOOLEAN DEFAULT FALSE,
  published_at DATETIME,
  expires_at DATETIME,
  attachments JSON,
  created_by CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (communication_type),
  INDEX idx_published (is_published),
  INDEX idx_date (published_at)
) ENGINE=InnoDB;

-- =====================================================
-- FIN DU SCHEMA
-- =====================================================
