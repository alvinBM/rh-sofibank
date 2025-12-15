/*
  # Données d'initialisation SIRH SOFIBANQUE
  
  1. Rôles système
  2. Permissions par module
  3. Attribution des permissions aux rôles
  4. Types de documents et demandes
  5. Types de congés
  6. Paramètres système
  7. Jours fériés 2025
*/

-- =====================================================
-- RÔLES SYSTÈME
-- =====================================================

INSERT INTO roles (name, code, description, is_system) VALUES
  ('Super Administrateur', 'SUPER_ADMIN', 'Accès complet au système et aux paramétrages', true),
  ('Administrateur RH', 'RH', 'Gestion complète des ressources humaines', true),
  ('Manager/Responsable', 'MANAGER', 'Gestion d''équipe et approbations', true),
  ('Employé', 'EMPLOYEE', 'Accès standard employé (ESS)', true),
  ('Direction Générale', 'DG', 'Direction générale et validation finale', true),
  ('Finance/Paie', 'FINANCE', 'Accès au module paie et finances', true),
  ('Recruteur', 'RECRUITER', 'Gestion du recrutement', true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- PERMISSIONS PAR MODULE
-- =====================================================

-- Module Paramétrages
INSERT INTO permissions (name, code, module, description) VALUES
  ('Accès Paramétrages', 'settings_access', 'settings', 'Accès au menu paramétrages'),
  ('Gérer Utilisateurs', 'users_manage', 'settings', 'Créer, modifier, désactiver utilisateurs'),
  ('Gérer Rôles', 'roles_manage', 'settings', 'Créer et modifier rôles et permissions'),
  ('Gérer Structure Org', 'org_structure_manage', 'settings', 'Gérer directions, services, grades'),
  ('Gérer Paramètres Système', 'system_settings_manage', 'settings', 'Modifier paramètres système')
ON CONFLICT (code) DO NOTHING;

-- Module Employés
INSERT INTO permissions (name, code, module, description) VALUES
  ('Voir Employés', 'employees_view', 'employees', 'Consulter les profils employés'),
  ('Gérer Employés', 'employees_manage', 'employees', 'Créer et modifier les employés'),
  ('Voir Son Profil', 'profile_view_own', 'employees', 'Consulter son propre profil'),
  ('Modifier Son Profil', 'profile_edit_own', 'employees', 'Modifier son profil personnel')
ON CONFLICT (code) DO NOTHING;

-- Module ESS
INSERT INTO permissions (name, code, module, description) VALUES
  ('Accès ESS', 'ess_access', 'ess', 'Accès à l''espace employé'),
  ('Voir Documents', 'documents_view_own', 'ess', 'Consulter ses documents'),
  ('Créer Demandes', 'requests_create', 'ess', 'Créer des demandes RH'),
  ('Gérer Toutes Demandes', 'requests_manage_all', 'ess', 'Gérer toutes les demandes')
ON CONFLICT (code) DO NOTHING;

-- Module Congés
INSERT INTO permissions (name, code, module, description) VALUES
  ('Voir Congés', 'leave_view', 'leave', 'Voir les demandes de congés'),
  ('Créer Congés', 'leave_create', 'leave', 'Créer des demandes de congés'),
  ('Approuver Congés', 'leave_approve', 'leave', 'Approuver les demandes de congés'),
  ('Gérer Tous Congés', 'leave_manage_all', 'leave', 'Gestion complète des congés')
ON CONFLICT (code) DO NOTHING;

-- Module Présence
INSERT INTO permissions (name, code, module, description) VALUES
  ('Voir Présence', 'attendance_view', 'attendance', 'Consulter les présences'),
  ('Gérer Présence', 'attendance_manage', 'attendance', 'Gérer les présences et pointages'),
  ('Demander Autorisation', 'authorization_request', 'attendance', 'Demander autorisations de sortie'),
  ('Approuver Autorisations', 'authorization_approve', 'attendance', 'Approuver les autorisations')
ON CONFLICT (code) DO NOTHING;

-- Module Paie
INSERT INTO permissions (name, code, module, description) VALUES
  ('Voir Paie', 'payroll_view', 'payroll', 'Consulter les bulletins de paie'),
  ('Gérer Paie', 'payroll_manage', 'payroll', 'Gérer la paie et les bulletins'),
  ('Voir Sa Paie', 'payslip_view_own', 'payroll', 'Voir ses bulletins de paie'),
  ('Paramétrer Paie', 'payroll_settings', 'payroll', 'Paramétrer grades et rémunérations')
ON CONFLICT (code) DO NOTHING;

-- Module Recrutement
INSERT INTO permissions (name, code, module, description) VALUES
  ('Voir Recrutements', 'recruitment_view', 'recruitment', 'Consulter les recrutements'),
  ('Gérer Recrutements', 'recruitment_manage', 'recruitment', 'Gérer postes et candidatures'),
  ('Évaluer Candidats', 'candidates_evaluate', 'recruitment', 'Évaluer les candidats')
ON CONFLICT (code) DO NOTHING;

-- Module Performance
INSERT INTO permissions (name, code, module, description) VALUES
  ('Voir Performances', 'performance_view', 'performance', 'Consulter les évaluations'),
  ('Gérer Performances', 'performance_manage', 'performance', 'Gérer les évaluations 360'),
  ('Auto-évaluation', 'self_evaluation', 'performance', 'Effectuer son auto-évaluation'),
  ('Évaluer Équipe', 'team_evaluation', 'performance', 'Évaluer son équipe')
ON CONFLICT (code) DO NOTHING;

-- Module Dashboards
INSERT INTO permissions (name, code, module, description) VALUES
  ('Voir Dashboards', 'dashboard_view', 'dashboard', 'Consulter les tableaux de bord'),
  ('Voir Rapports RH', 'reports_view', 'dashboard', 'Consulter les rapports RH'),
  ('Exporter Rapports', 'reports_export', 'dashboard', 'Exporter les rapports')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- ATTRIBUTION PERMISSIONS AUX RÔLES
-- =====================================================

-- SUPER_ADMIN : toutes les permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

-- RH : presque toutes sauf certains paramétrages système
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'RH'
AND p.code NOT IN ('system_settings_manage')
ON CONFLICT DO NOTHING;

-- MANAGER : gestion d'équipe
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'MANAGER'
AND p.code IN (
  'employees_view', 'profile_view_own', 'profile_edit_own',
  'ess_access', 'documents_view_own', 'requests_create',
  'leave_view', 'leave_create', 'leave_approve',
  'attendance_view', 'authorization_request', 'authorization_approve',
  'payslip_view_own',
  'performance_view', 'self_evaluation', 'team_evaluation',
  'dashboard_view', 'reports_view'
)
ON CONFLICT DO NOTHING;

-- EMPLOYEE : accès de base
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'EMPLOYEE'
AND p.code IN (
  'profile_view_own', 'profile_edit_own',
  'ess_access', 'documents_view_own', 'requests_create',
  'leave_view', 'leave_create',
  'attendance_view', 'authorization_request',
  'payslip_view_own',
  'self_evaluation'
)
ON CONFLICT DO NOTHING;

-- DG : validation finale
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'DG'
AND p.code IN (
  'employees_view',
  'leave_view', 'leave_approve',
  'performance_view',
  'dashboard_view', 'reports_view', 'reports_export'
)
ON CONFLICT DO NOTHING;

-- FINANCE : paie et finances
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'FINANCE'
AND p.code IN (
  'employees_view',
  'payroll_view', 'payroll_manage', 'payroll_settings',
  'reports_view', 'reports_export'
)
ON CONFLICT DO NOTHING;

-- RECRUITER : recrutement
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'RECRUITER'
AND p.code IN (
  'recruitment_view', 'recruitment_manage', 'candidates_evaluate',
  'ess_access', 'profile_view_own'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- TYPES DE DOCUMENTS
-- =====================================================

INSERT INTO document_types (name, code, category, requires_approval, is_active) VALUES
  ('Contrat de travail', 'CONTRACT', 'contract', false, true),
  ('Bulletin de paie', 'PAYSLIP', 'payroll', false, true),
  ('Certificat de travail', 'WORK_CERTIFICATE', 'certificate', false, true),
  ('Attestation de service', 'SERVICE_ATTESTATION', 'certificate', true, true),
  ('Fiche d''évaluation', 'EVALUATION_SHEET', 'performance', false, true),
  ('Document d''identité', 'ID_DOCUMENT', 'personal', false, true),
  ('Diplôme', 'DIPLOMA', 'education', false, true),
  ('CV', 'CV', 'recruitment', false, true),
  ('Autre', 'OTHER', 'other', false, true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- TYPES DE DEMANDES ESS
-- =====================================================

INSERT INTO request_types (name, code, category, requires_document, is_active) VALUES
  ('Attestation de service', 'SERVICE_ATTESTATION', 'certificate', false, true),
  ('Attestation de congé', 'LEAVE_ATTESTATION', 'certificate', false, true),
  ('Attestation de salaire', 'SALARY_ATTESTATION', 'certificate', false, true),
  ('Demande d''avance', 'SALARY_ADVANCE', 'financial', false, true),
  ('Demande de formation', 'TRAINING_REQUEST', 'development', false, true),
  ('Modification infos personnelles', 'PERSONAL_INFO_UPDATE', 'administrative', true, true),
  ('Autre demande', 'OTHER_REQUEST', 'other', false, true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- TYPES DE CONGÉS
-- =====================================================

INSERT INTO leave_types (name, code, category, default_days, max_days_per_year, requires_document, requires_handover, is_paid, description) VALUES
  ('Congé annuel', 'ANNUAL', 'annual', 22, 30, false, true, true, 'Congé annuel payé'),
  ('Congé de maladie', 'SICK', 'sick', 0, 15, true, false, true, 'Congé maladie avec certificat médical'),
  ('Congé de maternité', 'MATERNITY', 'maternity', 98, 98, true, true, true, 'Congé de maternité (14 semaines)'),
  ('Congé de paternité', 'PATERNITY', 'paternity', 3, 3, true, false, true, 'Congé de paternité'),
  ('Décès (famille proche)', 'BEREAVEMENT_CLOSE', 'circumstance', 5, 5, true, false, true, 'Décès conjoint, parent, enfant'),
  ('Décès (famille éloignée)', 'BEREAVEMENT_DISTANT', 'circumstance', 2, 2, true, false, true, 'Décès autre membre famille'),
  ('Mariage', 'MARRIAGE', 'circumstance', 3, 3, true, false, true, 'Congé de mariage'),
  ('Mariage enfant', 'CHILD_MARRIAGE', 'circumstance', 2, 2, false, false, true, 'Mariage d''un enfant'),
  ('Naissance', 'BIRTH', 'circumstance', 2, 2, false, false, true, 'Naissance d''un enfant'),
  ('Congé sans solde', 'UNPAID', 'unpaid', 0, 365, false, true, false, 'Congé non payé')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- PARAMÈTRES SYSTÈME
-- =====================================================

INSERT INTO system_settings (setting_key, setting_value, category, description) VALUES
  ('payroll_day', '{"day": 24, "fallback_to_last_working_day": true}', 'payroll', 'Jour de distribution des bulletins de paie'),
  ('annual_leave_days', '{"default": 22, "max_carryover": 5}', 'leave', 'Configuration congés annuels'),
  ('working_hours', '{"start": "08:00", "end": "17:00", "break_duration": 60}', 'attendance', 'Horaires de travail'),
  ('evaluation_periods', '{"T1": "01-03", "T2": "04-06", "T3": "07-09", "T4": "10-12"}', 'performance', 'Périodes d''évaluation trimestrielles'),
  ('birthday_card_enabled', '{"enabled": true, "auto_send": true}', 'ess', 'Cartes d''anniversaire automatiques'),
  ('biometric_sync_interval', '{"interval_minutes": 15}', 'attendance', 'Intervalle de synchronisation biométrique')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- JOURS FÉRIÉS 2025 (RDC)
-- =====================================================

INSERT INTO holidays (name, date, year, is_recurring) VALUES
  ('Jour de l''An', '2025-01-01', 2025, true),
  ('Fête des Martyrs de l''Indépendance', '2025-01-04', 2025, true),
  ('Fête du Travail', '2025-05-01', 2025, true),
  ('Fête de la Libération', '2025-05-17', 2025, true),
  ('Indépendance du Congo', '2025-06-30', 2025, true),
  ('Fête des Parents', '2025-08-01', 2025, true),
  ('Noël', '2025-12-25', 2025, true)
ON CONFLICT (date) DO NOTHING;
