/*
  # Configuration finale des utilisateurs de démo
  
  ## Problème
  Les utilisateurs de démo existent mais ne sont pas configurés correctement
  
  ## Solution
  1. Associer les user_profiles au compte SOFIBANQUE
  2. Créer les user_roles
  3. Créer les données de référence (directions, services, postes, grades)
  4. Créer les employés
  
  ## Sécurité
  Toutes les insertions vérifient l'existence avant d'insérer
*/

DO $$
DECLARE
  v_account_id uuid;
  v_user_drh uuid;
  v_user_rh uuid;
  v_user_manager uuid;
  v_user_employe uuid;
  v_role_rh uuid;
  v_role_manager uuid;
  v_role_employee uuid;
  v_direction_id uuid;
  v_service_id uuid;
  v_position_id uuid;
  v_grade_id uuid;
BEGIN
  -- Récupérer l'ID du compte SOFIBANQUE
  SELECT id INTO v_account_id FROM accounts WHERE business_name = 'SOFIBANQUE' LIMIT 1;
  
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Compte SOFIBANQUE introuvable';
  END IF;
  
  -- Récupérer les IDs des utilisateurs
  SELECT user_id INTO v_user_drh FROM user_profiles WHERE email = 'drh@sofibanque.com';
  SELECT user_id INTO v_user_rh FROM user_profiles WHERE email = 'rh@sofibanque.com';
  SELECT user_id INTO v_user_manager FROM user_profiles WHERE email = 'manager@sofibanque.com';
  SELECT user_id INTO v_user_employe FROM user_profiles WHERE email = 'employe@sofibanque.com';
  
  -- Récupérer les IDs des rôles
  SELECT id INTO v_role_rh FROM roles WHERE code = 'RH';
  SELECT id INTO v_role_manager FROM roles WHERE code = 'MANAGER';
  SELECT id INTO v_role_employee FROM roles WHERE code = 'EMPLOYEE';
  
  -- Associer les user_profiles au compte
  UPDATE user_profiles 
  SET account_id = v_account_id 
  WHERE email IN ('drh@sofibanque.com', 'rh@sofibanque.com', 'manager@sofibanque.com', 'employe@sofibanque.com')
  AND account_id IS NULL;
  
  -- Assigner les rôles
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = v_user_drh AND role_id = v_role_rh) THEN
    INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (v_user_drh, v_role_rh, NOW());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = v_user_rh AND role_id = v_role_rh) THEN
    INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (v_user_rh, v_role_rh, NOW());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = v_user_manager AND role_id = v_role_manager) THEN
    INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (v_user_manager, v_role_manager, NOW());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = v_user_employe AND role_id = v_role_employee) THEN
    INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES (v_user_employe, v_role_employee, NOW());
  END IF;
  
  -- Créer ou récupérer une direction
  SELECT id INTO v_direction_id FROM directions WHERE code = 'DRH' LIMIT 1;
  IF v_direction_id IS NULL THEN
    INSERT INTO directions (name, code, description, is_active, created_at)
    VALUES ('Direction des Ressources Humaines', 'DRH', 'Gestion des ressources humaines', true, NOW())
    RETURNING id INTO v_direction_id;
  END IF;
  
  -- Créer ou récupérer un service
  SELECT id INTO v_service_id FROM services WHERE name = 'Service RH' LIMIT 1;
  IF v_service_id IS NULL THEN
    INSERT INTO services (direction_id, name, code, is_active, created_at)
    VALUES (v_direction_id, 'Service RH', 'SRH', true, NOW())
    RETURNING id INTO v_service_id;
  END IF;
  
  -- Créer ou récupérer un grade
  SELECT id INTO v_grade_id FROM grades WHERE code = 'GA' LIMIT 1;
  IF v_grade_id IS NULL THEN
    INSERT INTO grades (name, code, level, base_salary, created_at)
    VALUES ('Grade A', 'GA', 5, 50000, NOW())
    RETURNING id INTO v_grade_id;
  END IF;
  
  -- Créer ou récupérer un poste
  SELECT id INTO v_position_id FROM job_positions WHERE code = 'RRH' LIMIT 1;
  IF v_position_id IS NULL THEN
    INSERT INTO job_positions (title, code, description, grade_id, is_active, created_at)
    VALUES ('Responsable RH', 'RRH', 'Responsable des ressources humaines', v_grade_id, true, NOW())
    RETURNING id INTO v_position_id;
  END IF;
  
  -- Créer les employés s'ils n'existent pas
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'drh@sofibanque.com') THEN
    INSERT INTO employees (
      user_id, employee_number, first_name, last_name, 
      email, phone, hire_date, direction_id, service_id, 
      job_position_id, grade_id, employment_status, contract_type, is_active, created_at
    )
    VALUES (
      v_user_drh, 'EMP001', 'Marie', 'Dubois',
      'drh@sofibanque.com', '+33612345678', '2020-01-01', v_direction_id, v_service_id,
      v_position_id, v_grade_id, 'active', 'permanent', true, NOW()
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'rh@sofibanque.com') THEN
    INSERT INTO employees (
      user_id, employee_number, first_name, last_name, 
      email, phone, hire_date, direction_id, service_id, 
      job_position_id, grade_id, employment_status, contract_type, is_active, created_at
    )
    VALUES (
      v_user_rh, 'EMP002', 'Jean', 'Martin',
      'rh@sofibanque.com', '+33612345679', '2020-01-01', v_direction_id, v_service_id,
      v_position_id, v_grade_id, 'active', 'permanent', true, NOW()
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'manager@sofibanque.com') THEN
    INSERT INTO employees (
      user_id, employee_number, first_name, last_name, 
      email, phone, hire_date, direction_id, service_id, 
      job_position_id, grade_id, employment_status, contract_type, is_active, created_at
    )
    VALUES (
      v_user_manager, 'EMP003', 'Sophie', 'Leroy',
      'manager@sofibanque.com', '+33612345680', '2020-01-01', v_direction_id, v_service_id,
      v_position_id, v_grade_id, 'active', 'permanent', true, NOW()
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM employees WHERE email = 'employe@sofibanque.com') THEN
    INSERT INTO employees (
      user_id, employee_number, first_name, last_name, 
      email, phone, hire_date, direction_id, service_id, 
      job_position_id, grade_id, employment_status, contract_type, is_active, created_at
    )
    VALUES (
      v_user_employe, 'EMP004', 'Pierre', 'Durand',
      'employe@sofibanque.com', '+33612345681', '2020-01-01', v_direction_id, v_service_id,
      v_position_id, v_grade_id, 'active', 'permanent', true, NOW()
    );
  END IF;
  
  RAISE NOTICE 'Configuration terminée avec succès';
END $$;
