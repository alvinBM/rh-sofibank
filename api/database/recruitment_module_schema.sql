-- 6. TABLE: Entretiens/Interviews
CREATE TABLE IF NOT EXISTS job_interviews (
    id CHAR(36) PRIMARY KEY,
    application_id CHAR(36) NOT NULL,
    interview_type ENUM('phone', 'video', 'in_person', 'technical', 'panel', 'final') NOT NULL,
    interview_round INT DEFAULT 1,
    scheduled_date DATETIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    location VARCHAR(255),
    meeting_link VARCHAR(500),
    interviewers TEXT,
    status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show') DEFAULT 'scheduled',
    candidate_confirmed BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    scheduled_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_interviews_application (application_id),
    INDEX idx_interviews_date (scheduled_date),
    INDEX idx_interviews_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABLE: Évaluations des Entretiens
CREATE TABLE IF NOT EXISTS interview_evaluations (
    id CHAR(36) PRIMARY KEY,
    interview_id CHAR(36) NOT NULL,
    evaluator_id CHAR(36) NOT NULL,
    technical_skills_score INT,
    communication_score INT,
    problem_solving_score INT,
    cultural_fit_score INT,
    experience_score INT,
    overall_score INT,
    strengths TEXT,
    weaknesses TEXT,
    recommendation ENUM('highly_recommended', 'recommended', 'maybe', 'not_recommended', 'reject') NOT NULL,
    comments TEXT,
    evaluation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_evaluations_interview (interview_id),
    INDEX idx_evaluations_evaluator (evaluator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABLE: Offres d'Emploi (Employment Offers)
CREATE TABLE IF NOT EXISTS employment_offers (
    id CHAR(36) PRIMARY KEY,
    application_id CHAR(36) NOT NULL,
    offer_number VARCHAR(50) UNIQUE NOT NULL,
    job_position_id CHAR(36) NOT NULL,
    direction_id CHAR(36) NOT NULL,
    service_id CHAR(36),
    grade_id CHAR(36) NOT NULL,
    contract_type ENUM('permanent', 'fixed_term', 'temporary', 'internship', 'consultant') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    salary DECIMAL(15,2) NOT NULL,
    benefits TEXT,
    terms_and_conditions TEXT,
    offer_letter_path VARCHAR(500),
    status ENUM('draft', 'pending_approval', 'approved', 'sent', 'accepted', 'declined', 'expired', 'withdrawn') DEFAULT 'draft',
    sent_date DATE,
    response_deadline DATE,
    accepted_date DATE,
    declined_reason TEXT,
    approved_by CHAR(36),
    approval_date DATE,
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_offers_application (application_id),
    INDEX idx_offers_status (status),
    INDEX idx_offers_number (offer_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. TABLE: Onboarding Checklist
CREATE TABLE IF NOT EXISTS onboarding_checklists (
    id CHAR(36) PRIMARY KEY,
    employee_id CHAR(36) NOT NULL,
    employment_offer_id CHAR(36),
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    start_date DATE NOT NULL,
    expected_completion_date DATE,
    actual_completion_date DATE,
    assigned_mentor_id CHAR(36),
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_onboarding_employee (employee_id),
    INDEX idx_onboarding_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. TABLE: Tâches d'Onboarding
CREATE TABLE IF NOT EXISTS onboarding_tasks (
    id CHAR(36) PRIMARY KEY,
    onboarding_checklist_id CHAR(36) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('administrative', 'equipment', 'training', 'documentation', 'orientation', 'system_access', 'other') NOT NULL,
    assigned_to CHAR(36),
    due_date DATE,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed', 'blocked') DEFAULT 'pending',
    completion_date DATE,
    completion_notes TEXT,
    is_mandatory BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_onboarding_tasks_checklist (onboarding_checklist_id),
    INDEX idx_onboarding_tasks_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. TABLE: Emails de Recrutement (pour tracking)
CREATE TABLE IF NOT EXISTS recruitment_emails (
    id CHAR(36) PRIMARY KEY,
    message_id VARCHAR(255) UNIQUE,
    job_posting_id CHAR(36),
    application_id CHAR(36),
    from_email VARCHAR(255) NOT NULL,
    to_email VARCHAR(255),
    subject VARCHAR(500),
    body_text TEXT,
    body_html TEXT,
    attachments_info TEXT,
    email_date DATETIME NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_date DATETIME,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_recruitment_emails_message (message_id),
    INDEX idx_recruitment_emails_processed (processed),
    INDEX idx_recruitment_emails_posting (job_posting_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. TABLE: Templates d'Email
CREATE TABLE IF NOT EXISTS email_templates (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    category ENUM('recruitment', 'onboarding', 'general', 'birthday', 'anniversary') NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email_templates_code (code),
    INDEX idx_email_templates_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. TABLE: Historique d'Envoi d'Emails
CREATE TABLE IF NOT EXISTS sent_emails (
    id CHAR(36) PRIMARY KEY,
    template_id CHAR(36),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    employee_id CHAR(36),
    application_id CHAR(36),
    subject VARCHAR(500) NOT NULL,
    body_html TEXT,
    status ENUM('pending', 'sent', 'failed', 'bounced') DEFAULT 'pending',
    sent_date DATETIME,
    error_message TEXT,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sent_emails_recipient (recipient_email),
    INDEX idx_sent_emails_status (status),
    INDEX idx_sent_emails_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de templates d'email par défaut
INSERT INTO email_templates (id, name, code, category, subject, body_html, body_text, variables, created_by) VALUES
(UUID(), 'Accusé Réception Candidature', 'APPLICATION_RECEIVED', 'recruitment', 
 'Accusé de réception - {{job_title}}', 
 '<p>Bonjour {{first_name}} {{last_name}},</p><p>Nous avons bien reçu votre candidature pour le poste de <strong>{{job_title}}</strong>.</p><p>Numéro de candidature: {{application_number}}</p><p>Nous examinerons votre dossier et vous contacterons si votre profil correspond à nos besoins.</p><p>Cordialement,<br>Département RH<br>SofiBank</p>',
 'Bonjour {{first_name}} {{last_name}}, Nous avons bien reçu votre candidature...',
 'first_name, last_name, job_title, application_number',
 (SELECT id FROM users WHERE email = 'admin@sofibank.cd' LIMIT 1)),

(UUID(), 'Invitation Entretien', 'INTERVIEW_INVITATION', 'recruitment',
 'Invitation à un entretien - {{job_title}}',
 '<p>Bonjour {{first_name}} {{last_name}},</p><p>Nous avons le plaisir de vous inviter à un entretien pour le poste de <strong>{{job_title}}</strong>.</p><p><strong>Date:</strong> {{interview_date}}<br><strong>Heure:</strong> {{interview_time}}<br><strong>Lieu:</strong> {{interview_location}}<br><strong>Lien:</strong> {{meeting_link}}</p><p>Merci de confirmer votre présence.</p><p>Cordialement,<br>Département RH</p>',
 'Invitation entretien...',
 'first_name, last_name, job_title, interview_date, interview_time, interview_location, meeting_link',
 (SELECT id FROM users WHERE email = 'admin@sofibank.cd' LIMIT 1)),

(UUID(), 'Offre d\'Emploi', 'JOB_OFFER', 'recruitment',
 'Offre d\'emploi - {{job_title}} - {{company_name}}',
 '<p>Bonjour {{first_name}} {{last_name}},</p><p>Nous avons le plaisir de vous proposer le poste de <strong>{{job_title}}</strong> au sein de SofiBank.</p><p><strong>Détails de l\'offre:</strong><br>- Date de début: {{start_date}}<br>- Salaire: {{salary}}<br>- Type de contrat: {{contract_type}}</p><p>Veuillez trouver en pièce jointe la lettre d\'offre complète.</p><p>Merci de nous faire part de votre réponse avant le {{response_deadline}}.</p><p>Cordialement,<br>Direction des Ressources Humaines</p>',
 'Offre emploi...',
 'first_name, last_name, job_title, start_date, salary, contract_type, response_deadline, company_name',
 (SELECT id FROM users WHERE email = 'admin@sofibank.cd' LIMIT 1)),

(UUID(), 'Bienvenue Onboarding', 'ONBOARDING_WELCOME', 'onboarding',
 'Bienvenue chez SofiBank !',
 '<p>Bonjour {{first_name}},</p><p>Bienvenue dans l\'équipe SofiBank ! 🎉</p><p>Nous sommes ravis de vous compter parmi nous.</p><p><strong>Vos informations de connexion:</strong><br>Email: {{email}}<br>Mot de passe temporaire: {{temporary_password}}</p><p>Merci de vous connecter sur notre portail ESS pour compléter votre dossier.</p><p>À très bientôt,<br>L\'équipe RH</p>',
 'Bienvenue...',
 'first_name, last_name, email, temporary_password',
 (SELECT id FROM users WHERE email = 'admin@sofibank.cd' LIMIT 1)),

(UUID(), 'Carte Anniversaire', 'BIRTHDAY_CARD', 'birthday',
 'Joyeux Anniversaire {{first_name}} ! 🎂',
 '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; border-radius: 10px;"><h1>🎉 Joyeux Anniversaire {{first_name}} ! 🎉</h1><p style="font-size: 18px; margin: 20px 0;">Toute l\'équipe de SofiBank vous souhaite une excellente journée remplie de joie et de bonheur.</p><p style="margin-top: 30px;"><strong>{{supervisor_name}}</strong><br>{{supervisor_title}}</p><p><strong>Direction des Ressources Humaines</strong></p></div>',
 'Joyeux Anniversaire...',
 'first_name, last_name, supervisor_name, supervisor_title',
 (SELECT id FROM users WHERE email = 'admin@sofibank.cd' LIMIT 1));

-- Insertion de tâches d'onboarding par défaut
-- Ces tâches seront utilisées comme template pour chaque nouveau employé
CREATE TABLE IF NOT EXISTS onboarding_task_templates (
    id CHAR(36) PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('administrative', 'equipment', 'training', 'documentation', 'orientation', 'system_access', 'other') NOT NULL,
    assigned_to_role VARCHAR(100),
    days_offset INT DEFAULT 0,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    is_mandatory BOOLEAN DEFAULT TRUE,
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO onboarding_task_templates (id, task_name, description, category, assigned_to_role, days_offset, priority, order_index) VALUES
(UUID(), 'Création du dossier administratif', 'Créer le dossier physique et numérique de l\'employé', 'administrative', 'RH', 0, 'critical', 1),
(UUID(), 'Attribution ordinateur et téléphone', 'Préparer et configurer l\'ordinateur et le téléphone', 'equipment', 'IT', 1, 'critical', 2),
(UUID(), 'Création des accès systèmes', 'Créer les comptes email, ERP, et autres systèmes', 'system_access', 'IT', 1, 'critical', 3),
(UUID(), 'Préparation badge et carte professionnelle', 'Préparer le badge d\'accès et la carte de visite', 'equipment', 'RH', 2, 'high', 4),
(UUID(), 'Session d\'orientation (Welcome Session)', 'Présentation de l\'entreprise, culture, valeurs', 'orientation', 'RH', 3, 'high', 5),
(UUID(), 'Tour des bureaux et présentation équipe', 'Visite des locaux et présentation aux collègues', 'orientation', 'Manager', 3, 'medium', 6),
(UUID(), 'Formation aux outils internes', 'Formation sur les outils et systèmes utilisés', 'training', 'IT', 5, 'high', 7),
(UUID(), 'Remise du règlement intérieur', 'Remettre et expliquer le règlement intérieur', 'documentation', 'RH', 3, 'high', 8),
(UUID(), 'Signature du contrat de travail', 'Faire signer le contrat et documents associés', 'administrative', 'RH', 0, 'critical', 9),
(UUID(), 'Ouverture compte bancaire (si nécessaire)', 'Accompagner pour ouverture compte salaire', 'administrative', 'RH', 7, 'medium', 10);
