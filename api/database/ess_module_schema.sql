-- ESS (Employee Self-Service) Module Tables

-- Employee Documents Table
CREATE TABLE IF NOT EXISTS employee_documents (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    document_type ENUM('id_card', 'passport', 'birth_certificate', 'diploma', 'certificate', 'contract', 'other') NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    expiry_date DATE,
    notes TEXT,
    uploaded_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employee_documents_employee (employee_id),
    INDEX idx_employee_documents_type (document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Contracts Table
CREATE TABLE IF NOT EXISTS employee_contracts (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    contract_type ENUM('permanent', 'fixed_term', 'temporary', 'internship', 'consultant') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    salary DECIMAL(15,2),
    position VARCHAR(255),
    contract_file_path VARCHAR(500),
    status ENUM('active', 'expired', 'terminated', 'renewed') DEFAULT 'active',
    notes TEXT,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employee_contracts_employee (employee_id),
    INDEX idx_employee_contracts_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Request Types Table
CREATE TABLE IF NOT EXISTS request_types (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    category ENUM('administrative', 'technical', 'hr', 'it', 'other') DEFAULT 'other',
    requires_approval BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_request_types_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Requests Table
CREATE TABLE IF NOT EXISTS employee_requests (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    request_type_id CHAR(36) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'resolved', 'rejected') DEFAULT 'pending',
    attachment_url VARCHAR(500),
    handled_by CHAR(36),
    handled_at TIMESTAMP NULL,
    response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employee_requests_employee (employee_id),
    INDEX idx_employee_requests_type (request_type_id),
    INDEX idx_employee_requests_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Internal Announcements Table
CREATE TABLE IF NOT EXISTS internal_announcements (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('general', 'event', 'policy', 'alert', 'celebration') DEFAULT 'general',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    is_published BOOLEAN DEFAULT FALSE,
    published_date TIMESTAMP NULL,
    expiry_date DATE,
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_announcements_published (is_published),
    INDEX idx_announcements_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Announcement Reads Table (tracking who has read announcements)
CREATE TABLE IF NOT EXISTS announcement_reads (
    id CHAR(36) PRIMARY KEY,
    announcement_id CHAR(36) NOT NULL,
    employee_id CHAR(36) NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_announcement_employee (announcement_id, employee_id),
    INDEX idx_announcement_reads_announcement (announcement_id),
    INDEX idx_announcement_reads_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Feedback Table
CREATE TABLE IF NOT EXISTS employee_feedback (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    category ENUM('suggestion', 'complaint', 'compliment', 'question', 'other') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'reviewed', 'archived') DEFAULT 'pending',
    response TEXT,
    reviewed_by CHAR(36),
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_feedback_employee (employee_id),
    INDEX idx_feedback_status (status),
    INDEX idx_feedback_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Career History Table
CREATE TABLE IF NOT EXISTS career_history (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    change_type ENUM('promotion', 'transfer', 'salary_increase', 'position_change', 'grade_change', 'demotion') NOT NULL,
    effective_date DATE NOT NULL,
    previous_direction_id CHAR(36),
    new_direction_id CHAR(36),
    previous_service_id CHAR(36),
    new_service_id CHAR(36),
    previous_job_position_id CHAR(36),
    new_job_position_id CHAR(36),
    previous_grade_id CHAR(36),
    new_grade_id CHAR(36),
    previous_salary DECIMAL(15,2),
    new_salary DECIMAL(15,2),
    reason TEXT,
    notes TEXT,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_career_history_employee (employee_id),
    INDEX idx_career_history_type (change_type),
    INDEX idx_career_history_date (effective_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employee Dependents Table
CREATE TABLE IF NOT EXISTS employee_dependents (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship ENUM('spouse', 'child', 'parent', 'sibling', 'other') NOT NULL,
    date_of_birth DATE,
    gender ENUM('M', 'F'),
    is_beneficiary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dependents_employee (employee_id),
    INDEX idx_dependents_relationship (relationship)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default request types
INSERT INTO request_types (id, name, code, description, category, is_active) VALUES
(UUID(), 'Attestation de Travail', 'WORK_CERTIFICATE', 'Demande d\'attestation de travail', 'administrative', TRUE),
(UUID(), 'Fiche de Paie', 'PAY_SLIP', 'Demande de fiche de paie', 'administrative', TRUE),
(UUID(), 'Certificat de Salaire', 'SALARY_CERTIFICATE', 'Demande de certificat de salaire', 'administrative', TRUE),
(UUID(), 'Badge d\'Accès', 'ACCESS_BADGE', 'Demande ou remplacement de badge', 'administrative', TRUE),
(UUID(), 'Matériel Informatique', 'IT_EQUIPMENT', 'Demande de matériel informatique', 'it', TRUE),
(UUID(), 'Support Technique', 'TECH_SUPPORT', 'Demande d\'assistance technique', 'technical', TRUE),
(UUID(), 'Formation', 'TRAINING', 'Demande de formation professionnelle', 'hr', TRUE),
(UUID(), 'Autre Demande', 'OTHER', 'Autre type de demande', 'other', TRUE);
