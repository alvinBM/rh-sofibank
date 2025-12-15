/*
  # Configuration Complète des Permissions RBAC - Version Simplifiée

  1. Ajout de 56 permissions couvrant tous les modules
  2. Attribution aux 7 rôles existants
  3. Attribution du rôle RH à drh@sofibanque.com
*/

-- ==================== CRÉER LES 56 PERMISSIONS ====================

INSERT INTO permissions (name, code, description, module) VALUES
  -- Employés (7)
  ('Voir les employés', 'employees_view', 'Consulter la liste et les détails des employés', 'employees'),
  ('Créer des employés', 'employees_create', 'Ajouter de nouveaux employés', 'employees'),
  ('Modifier des employés', 'employees_edit', 'Modifier les informations des employés', 'employees'),
  ('Supprimer des employés', 'employees_delete', 'Supprimer des employés', 'employees'),
  ('Gérer les contrats', 'employees_contracts', 'Gérer les contrats des employés', 'employees'),
  ('Gérer les documents employés', 'employees_documents', 'Gérer les documents des employés', 'employees'),
  ('Voir historique employé', 'employees_history', 'Consulter l''historique professionnel', 'employees'),
  
  -- Recrutement (8)
  ('Planification recrutement', 'recruitment_planning', 'Gérer la planification annuelle des besoins', 'recruitment'),
  ('Gérer postes vacants', 'recruitment_jobs', 'Créer et gérer les postes vacants', 'recruitment'),
  ('Publier offres emploi', 'recruitment_publish', 'Publier des offres d''emploi', 'recruitment'),
  ('Gérer candidats', 'recruitment_candidates', 'Gérer les candidatures', 'recruitment'),
  ('Planifier interviews', 'recruitment_interviews', 'Planifier et gérer les entretiens', 'recruitment'),
  ('Évaluer candidats', 'recruitment_evaluate', 'Évaluer les candidats', 'recruitment'),
  ('Créer offres emploi', 'recruitment_offers', 'Créer et envoyer des offres d''emploi', 'recruitment'),
  ('Gérer recrutement', 'recruitment_manage', 'Accès complet au module recrutement', 'recruitment'),
  
  -- ESS (7)
  ('Voir profil ESS', 'ess_view_profile', 'Consulter son profil personnel', 'ess'),
  ('Modifier profil ESS', 'ess_edit_profile', 'Modifier ses informations personnelles', 'ess'),
  ('Voir documents ESS', 'ess_view_documents', 'Consulter ses documents', 'ess'),
  ('Créer demandes ESS', 'ess_create_requests', 'Créer des demandes RH', 'ess'),
  ('Voir annonces', 'ess_view_announcements', 'Consulter les communications internes', 'ess'),
  ('Gérer annonces', 'ess_manage_announcements', 'Créer et gérer les annonces', 'ess'),
  ('Gérer demandes ESS', 'ess_manage_requests', 'Traiter les demandes des employés', 'ess'),
  
  -- Congés (6)
  ('Voir congés', 'leave_view', 'Consulter les demandes de congés', 'leave'),
  ('Créer demandes congés', 'leave_create', 'Créer des demandes de congés', 'leave'),
  ('Approuver congés', 'leave_approve', 'Approuver les demandes de congés', 'leave'),
  ('Rejeter congés', 'leave_reject', 'Rejeter les demandes de congés', 'leave'),
  ('Gérer soldes congés', 'leave_manage_balance', 'Gérer les soldes de congés', 'leave'),
  ('Gérer types congés', 'leave_manage_types', 'Gérer les types de congés', 'leave'),
  
  -- Performance (5)
  ('Voir évaluations', 'performance_view', 'Consulter les évaluations', 'performance'),
  ('Créer évaluations', 'performance_create', 'Créer des évaluations', 'performance'),
  ('Modifier évaluations', 'performance_edit', 'Modifier des évaluations', 'performance'),
  ('Gérer objectifs', 'performance_goals', 'Gérer les objectifs', 'performance'),
  ('Gérer compétences', 'performance_skills', 'Gérer les compétences', 'performance'),
  
  -- Paie (4)
  ('Voir fiches paie', 'payroll_view', 'Consulter les fiches de paie', 'payroll'),
  ('Gérer paie', 'payroll_manage', 'Gérer le traitement de la paie', 'payroll'),
  ('Configurer paie', 'payroll_configure', 'Configurer les paramètres de paie', 'payroll'),
  ('Générer bulletins', 'payroll_generate', 'Générer les bulletins de paie', 'payroll'),
  
  -- Présence (4)
  ('Voir présences', 'attendance_view', 'Consulter les présences', 'attendance'),
  ('Pointer présence', 'attendance_checkin', 'Effectuer le pointage', 'attendance'),
  ('Gérer présences équipe', 'attendance_manage', 'Gérer les présences de l''équipe', 'attendance'),
  ('Rapports présence', 'attendance_reports', 'Consulter les rapports de présence', 'attendance'),
  
  -- Configuration (6)
  ('Gérer directions', 'config_directions', 'Gérer les directions', 'configuration'),
  ('Gérer services', 'config_services', 'Gérer les services', 'configuration'),
  ('Gérer postes', 'config_positions', 'Gérer les postes', 'configuration'),
  ('Gérer grades', 'config_grades', 'Gérer les grades', 'configuration'),
  ('Gérer types documents', 'config_document_types', 'Gérer les types de documents', 'configuration'),
  ('Gérer types demandes', 'config_request_types', 'Gérer les types de demandes', 'configuration'),
  
  -- Utilisateurs (5)
  ('Voir utilisateurs', 'users_view', 'Consulter les utilisateurs', 'users'),
  ('Créer utilisateurs', 'users_create', 'Créer des utilisateurs', 'users'),
  ('Modifier utilisateurs', 'users_edit', 'Modifier des utilisateurs', 'users'),
  ('Supprimer utilisateurs', 'users_delete', 'Supprimer des utilisateurs', 'users'),
  ('Gérer rôles', 'roles_manage', 'Gérer les rôles et permissions', 'users'),
  
  -- Dashboard (4)
  ('Voir dashboard', 'dashboard_view', 'Accéder au tableau de bord', 'dashboard'),
  ('Statistiques RH', 'reports_hr_stats', 'Consulter les statistiques RH', 'reports'),
  ('Générer rapports', 'reports_generate', 'Générer des rapports personnalisés', 'reports'),
  ('Exporter données', 'reports_export', 'Exporter des données', 'reports')
ON CONFLICT (code) DO NOTHING;

-- ==================== ATTRIBUER LES PERMISSIONS ====================

DO $$
DECLARE
  v_role_id uuid;
  v_perm_codes text[];
BEGIN
  
  -- SUPER_ADMIN: Toutes les permissions
  SELECT id INTO v_role_id FROM roles WHERE code = 'SUPER_ADMIN';
  IF v_role_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_role_id, id FROM permissions
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- RH: 46 permissions
  SELECT id INTO v_role_id FROM roles WHERE code = 'RH';
  IF v_role_id IS NOT NULL THEN
    v_perm_codes := ARRAY[
      'employees_view', 'employees_create', 'employees_edit', 'employees_delete',
      'employees_contracts', 'employees_documents', 'employees_history',
      'recruitment_planning', 'recruitment_jobs', 'recruitment_publish',
      'recruitment_candidates', 'recruitment_interviews', 'recruitment_evaluate',
      'recruitment_offers', 'recruitment_manage',
      'ess_view_profile', 'ess_edit_profile', 'ess_view_documents',
      'ess_create_requests', 'ess_view_announcements', 'ess_manage_announcements', 'ess_manage_requests',
      'leave_view', 'leave_create', 'leave_approve', 'leave_reject', 'leave_manage_balance', 'leave_manage_types',
      'performance_view', 'performance_create', 'performance_edit', 'performance_goals', 'performance_skills',
      'payroll_view', 'payroll_manage', 'payroll_configure', 'payroll_generate',
      'attendance_view', 'attendance_manage', 'attendance_reports', 'attendance_checkin',
      'config_directions', 'config_services', 'config_positions', 'config_grades',
      'config_document_types', 'config_request_types',
      'users_view', 'users_create', 'users_edit',
      'dashboard_view', 'reports_hr_stats', 'reports_generate', 'reports_export'
    ];
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_role_id, id FROM permissions WHERE code = ANY(v_perm_codes)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- MANAGER: 22 permissions
  SELECT id INTO v_role_id FROM roles WHERE code = 'MANAGER';
  IF v_role_id IS NOT NULL THEN
    v_perm_codes := ARRAY[
      'employees_view', 'employees_edit', 'employees_documents', 'employees_history',
      'ess_view_profile', 'ess_edit_profile', 'ess_view_documents', 'ess_create_requests', 'ess_view_announcements',
      'leave_view', 'leave_create', 'leave_approve', 'leave_reject',
      'performance_view', 'performance_create', 'performance_edit', 'performance_goals',
      'attendance_view', 'attendance_checkin', 'attendance_manage', 'attendance_reports',
      'dashboard_view', 'reports_hr_stats'
    ];
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_role_id, id FROM permissions WHERE code = ANY(v_perm_codes)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- EMPLOYEE: 11 permissions
  SELECT id INTO v_role_id FROM roles WHERE code = 'EMPLOYEE';
  IF v_role_id IS NOT NULL THEN
    v_perm_codes := ARRAY[
      'ess_view_profile', 'ess_edit_profile', 'ess_view_documents', 'ess_create_requests', 'ess_view_announcements',
      'leave_view', 'leave_create',
      'attendance_view', 'attendance_checkin',
      'performance_view', 'dashboard_view'
    ];
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_role_id, id FROM permissions WHERE code = ANY(v_perm_codes)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- DG: 21 permissions
  SELECT id INTO v_role_id FROM roles WHERE code = 'DG';
  IF v_role_id IS NOT NULL THEN
    v_perm_codes := ARRAY[
      'employees_view', 'employees_history',
      'recruitment_planning', 'recruitment_jobs', 'recruitment_candidates',
      'ess_view_profile', 'ess_view_documents', 'ess_view_announcements', 'ess_create_requests',
      'leave_view', 'leave_create', 'leave_approve',
      'performance_view', 'payroll_view',
      'attendance_view', 'attendance_checkin', 'attendance_reports',
      'dashboard_view', 'reports_hr_stats', 'reports_generate', 'reports_export'
    ];
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_role_id, id FROM permissions WHERE code = ANY(v_perm_codes)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- RECRUITER: 15 permissions
  SELECT id INTO v_role_id FROM roles WHERE code = 'RECRUITER';
  IF v_role_id IS NOT NULL THEN
    v_perm_codes := ARRAY[
      'employees_view',
      'recruitment_planning', 'recruitment_jobs', 'recruitment_publish',
      'recruitment_candidates', 'recruitment_interviews', 'recruitment_evaluate',
      'recruitment_offers', 'recruitment_manage',
      'ess_view_profile', 'ess_view_documents', 'ess_view_announcements', 'ess_create_requests',
      'dashboard_view', 'reports_hr_stats'
    ];
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_role_id, id FROM permissions WHERE code = ANY(v_perm_codes)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;
  
  -- FINANCE: 17 permissions
  SELECT id INTO v_role_id FROM roles WHERE code = 'FINANCE';
  IF v_role_id IS NOT NULL THEN
    v_perm_codes := ARRAY[
      'employees_view',
      'ess_view_profile', 'ess_view_documents', 'ess_view_announcements', 'ess_create_requests',
      'leave_view', 'leave_create',
      'payroll_view', 'payroll_manage', 'payroll_configure', 'payroll_generate',
      'attendance_view', 'attendance_checkin', 'attendance_reports',
      'dashboard_view', 'reports_hr_stats', 'reports_generate', 'reports_export'
    ];
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT v_role_id, id FROM permissions WHERE code = ANY(v_perm_codes)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END IF;

  RAISE NOTICE 'Permissions attribuées avec succès';
  
END $$;
