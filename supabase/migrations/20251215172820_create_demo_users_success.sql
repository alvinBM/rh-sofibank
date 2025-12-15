/*
  # Création des utilisateurs de démonstration pour SIRH SOFIBANQUE

  1. Utilisateurs créés
    - DRH (drh@sofibanque.com) - Directeur RH avec accès complet
    - RH (rh@sofibanque.com) - Responsable RH avec accès RH étendu
    - Manager (manager@sofibanque.com) - Manager avec accès modéré
    - Employé (employe@sofibanque.com) - Employé avec accès ESS uniquement

  2. Mot de passe pour tous: Password123!
*/

-- Nettoyer les utilisateurs existants
DELETE FROM employees WHERE email IN ('drh@sofibanque.com', 'rh@sofibanque.com', 'manager@sofibanque.com', 'employe@sofibanque.com');
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('drh@sofibanque.com', 'rh@sofibanque.com', 'manager@sofibanque.com', 'employe@sofibanque.com'));
DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('drh@sofibanque.com', 'rh@sofibanque.com', 'manager@sofibanque.com', 'employe@sofibanque.com'));
DELETE FROM auth.users WHERE email IN ('drh@sofibanque.com', 'rh@sofibanque.com', 'manager@sofibanque.com', 'employe@sofibanque.com');

-- Créer les utilisateurs de démonstration
DO $$
DECLARE
  v_drh_user_id uuid;
  v_rh_user_id uuid;
  v_manager_user_id uuid;
  v_employee_user_id uuid;
  v_direction_id uuid;
  v_service_id uuid;
  v_grade_id uuid;
  v_job_position_id uuid;
  v_account_id uuid;
  v_store_id uuid;
  v_role_id uuid;
BEGIN
  -- Créer ou récupérer le compte SOFIBANQUE
  SELECT id INTO v_account_id FROM accounts WHERE business_name = 'SOFIBANQUE' LIMIT 1;
  IF v_account_id IS NULL THEN
    INSERT INTO accounts (id, business_name, status, billing_plan, main_currency) 
    VALUES (gen_random_uuid(), 'SOFIBANQUE', 1, 'enterprise', 'CDF')
    RETURNING id INTO v_account_id;
  END IF;

  -- Créer ou récupérer le store
  SELECT id INTO v_store_id FROM stores WHERE account_id = v_account_id LIMIT 1;
  IF v_store_id IS NULL THEN
    INSERT INTO stores (id, account_id, name, status, type)
    VALUES (gen_random_uuid(), v_account_id, 'Siège Social', 1, 1)
    RETURNING id INTO v_store_id;
  END IF;

  -- Créer ou récupérer la direction
  SELECT id INTO v_direction_id FROM directions WHERE code = 'DRH' LIMIT 1;
  IF v_direction_id IS NULL THEN
    INSERT INTO directions (name, code)
    VALUES ('Direction des Ressources Humaines', 'DRH')
    RETURNING id INTO v_direction_id;
  END IF;

  -- Créer ou récupérer le service
  SELECT id INTO v_service_id FROM services WHERE direction_id = v_direction_id LIMIT 1;
  IF v_service_id IS NULL THEN
    INSERT INTO services (name, code, direction_id)
    VALUES ('Service Paie et Administration', 'SPA', v_direction_id)
    RETURNING id INTO v_service_id;
  END IF;

  -- Créer ou récupérer le grade
  SELECT id INTO v_grade_id FROM grades WHERE code = 'CS' LIMIT 1;
  IF v_grade_id IS NULL THEN
    INSERT INTO grades (name, code, level)
    VALUES ('Cadre Supérieur', 'CS', 5)
    RETURNING id INTO v_grade_id;
  END IF;

  -- Créer ou récupérer le poste
  SELECT id INTO v_job_position_id FROM job_positions WHERE code = 'DRH' LIMIT 1;
  IF v_job_position_id IS NULL THEN
    INSERT INTO job_positions (title, code)
    VALUES ('Directeur des Ressources Humaines', 'DRH')
    RETURNING id INTO v_job_position_id;
  END IF;

  -- 1. Créer le DRH - Marie Dubois
  v_drh_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role
  ) VALUES (
    v_drh_user_id, 'drh@sofibanque.com',
    crypt('Password123!', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"firstname":"Marie","lastname":"Dubois"}'::jsonb,
    'authenticated'
  );

  UPDATE user_profiles 
  SET account_id = v_account_id, root_store = v_store_id,
      firstname = 'Marie', lastname = 'Dubois',
      phone = '+243810000001', email = 'drh@sofibanque.com', status = 1
  WHERE user_id = v_drh_user_id;

  SELECT id INTO v_role_id FROM roles WHERE code = 'drh';
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id) VALUES (v_drh_user_id, v_role_id);
  END IF;

  INSERT INTO employees (
    user_id, employee_number, first_name, last_name, email, phone,
    hire_date, direction_id, service_id, grade_id, job_position_id,
    employment_status, contract_type, is_active
  ) VALUES (
    v_drh_user_id, 'EMP-2024-001', 'Marie', 'Dubois', 'drh@sofibanque.com',
    '+243810000001', '2020-01-15', v_direction_id, v_service_id,
    v_grade_id, v_job_position_id, 'active', 'permanent', true
  );

  -- 2. Créer le RH - Jean Martin
  v_rh_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role
  ) VALUES (
    v_rh_user_id, 'rh@sofibanque.com',
    crypt('Password123!', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"firstname":"Jean","lastname":"Martin"}'::jsonb,
    'authenticated'
  );

  UPDATE user_profiles 
  SET account_id = v_account_id, root_store = v_store_id,
      firstname = 'Jean', lastname = 'Martin',
      phone = '+243810000002', email = 'rh@sofibanque.com', status = 1
  WHERE user_id = v_rh_user_id;

  SELECT id INTO v_role_id FROM roles WHERE code = 'rh_manager';
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id) VALUES (v_rh_user_id, v_role_id);
  END IF;

  INSERT INTO employees (
    user_id, employee_number, first_name, last_name, email, phone,
    hire_date, direction_id, service_id, grade_id,
    employment_status, contract_type, is_active
  ) VALUES (
    v_rh_user_id, 'EMP-2024-002', 'Jean', 'Martin', 'rh@sofibanque.com',
    '+243810000002', '2021-03-10', v_direction_id, v_service_id, v_grade_id,
    'active', 'permanent', true
  );

  -- 3. Créer le Manager - Sophie Leroy
  v_manager_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role
  ) VALUES (
    v_manager_user_id, 'manager@sofibanque.com',
    crypt('Password123!', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"firstname":"Sophie","lastname":"Leroy"}'::jsonb,
    'authenticated'
  );

  UPDATE user_profiles 
  SET account_id = v_account_id, root_store = v_store_id,
      firstname = 'Sophie', lastname = 'Leroy',
      phone = '+243810000003', email = 'manager@sofibanque.com', status = 1
  WHERE user_id = v_manager_user_id;

  SELECT id INTO v_role_id FROM roles WHERE code = 'manager';
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id) VALUES (v_manager_user_id, v_role_id);
  END IF;

  INSERT INTO employees (
    user_id, employee_number, first_name, last_name, email, phone,
    hire_date, direction_id, service_id,
    employment_status, contract_type, is_active
  ) VALUES (
    v_manager_user_id, 'EMP-2024-003', 'Sophie', 'Leroy', 'manager@sofibanque.com',
    '+243810000003', '2021-06-01', v_direction_id, v_service_id,
    'active', 'permanent', true
  );

  -- 4. Créer l'Employé - Pierre Durand
  v_employee_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data, role
  ) VALUES (
    v_employee_user_id, 'employe@sofibanque.com',
    crypt('Password123!', gen_salt('bf')), now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"firstname":"Pierre","lastname":"Durand"}'::jsonb,
    'authenticated'
  );

  UPDATE user_profiles 
  SET account_id = v_account_id, root_store = v_store_id,
      firstname = 'Pierre', lastname = 'Durand',
      phone = '+243810000004', email = 'employe@sofibanque.com', status = 1
  WHERE user_id = v_employee_user_id;

  SELECT id INTO v_role_id FROM roles WHERE code = 'employee';
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id) VALUES (v_employee_user_id, v_role_id);
  END IF;

  INSERT INTO employees (
    user_id, employee_number, first_name, last_name, email, phone,
    hire_date, direction_id, service_id,
    employment_status, contract_type, is_active
  ) VALUES (
    v_employee_user_id, 'EMP-2024-004', 'Pierre', 'Durand', 'employe@sofibanque.com',
    '+243810000004', '2023-01-15', v_direction_id, v_service_id,
    'active', 'permanent', true
  );

END $$;
