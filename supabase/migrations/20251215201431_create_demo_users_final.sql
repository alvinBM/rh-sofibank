/*
  # Création des utilisateurs de démonstration SOFIBANQUE
  
  Cette migration crée 4 utilisateurs de test avec leurs profils, rôles et données employés.
  
  ## Utilisateurs créés
  
  1. DRH - Marie Dubois (drh@sofibanque.com / Password123!)
  2. RH Manager - Jean Martin (rh@sofibanque.com / Password123!)  
  3. Manager - Sophie Leroy (manager@sofibanque.com / Password123!)
  4. Employé - Pierre Durand (employe@sofibanque.com / Password123!)
  
  ## Sécurité
  - Mots de passe hashés avec bcrypt via pgsodium
  - Utilisateurs confirmés automatiquement
  - Profils et rôles liés correctement
*/

DO $$
DECLARE
  v_account_id uuid;
  v_store_id uuid;
  v_direction_id uuid;
  v_service_id uuid;
  v_grade_id uuid;
  v_user_id uuid;
  v_role_id uuid;
  v_job_position_id uuid;
  v_existing_user_id uuid;
BEGIN
  -- Récupérer les IDs nécessaires
  SELECT id INTO v_account_id FROM accounts WHERE business_name = 'SOFIBANQUE' LIMIT 1;
  SELECT id INTO v_store_id FROM stores WHERE account_id = v_account_id LIMIT 1;
  SELECT id INTO v_direction_id FROM directions WHERE code = 'DRH' LIMIT 1;
  SELECT id INTO v_service_id FROM services WHERE direction_id = v_direction_id LIMIT 1;
  SELECT id INTO v_grade_id FROM grades WHERE code = 'CS' LIMIT 1;

  -- ============================================
  -- 1. UTILISATEUR DRH
  -- ============================================
  
  SELECT id INTO v_existing_user_id FROM auth.users WHERE email = 'drh@sofibanque.com';
  
  IF v_existing_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'drh@sofibanque.com',
      crypt('Password123!', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"firstname": "Marie", "lastname": "Dubois"}'::jsonb,
      'authenticated',
      'authenticated',
      NOW(),
      NOW()
    );
  ELSE
    v_user_id := v_existing_user_id;
    UPDATE auth.users 
    SET encrypted_password = crypt('Password123!', gen_salt('bf')),
        updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO user_profiles (user_id, account_id, root_store, firstname, lastname, phone, email, status)
  VALUES (v_user_id, v_account_id, v_store_id, 'Marie', 'Dubois', '+243810000001', 'drh@sofibanque.com', 1)
  ON CONFLICT (user_id) DO UPDATE SET firstname = EXCLUDED.firstname, lastname = EXCLUDED.lastname, phone = EXCLUDED.phone;

  SELECT id INTO v_role_id FROM roles WHERE code = 'drh' LIMIT 1;
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id) VALUES (v_user_id, v_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  SELECT id INTO v_job_position_id FROM job_positions WHERE code = 'DRH' LIMIT 1;
  INSERT INTO employees (user_id, employee_number, first_name, last_name, email, phone, hire_date, direction_id, service_id, grade_id, job_position_id, employment_status, contract_type, is_active)
  VALUES (v_user_id, 'EMP-2024-001', 'Marie', 'Dubois', 'drh@sofibanque.com', '+243810000001', '2020-01-15', v_direction_id, v_service_id, v_grade_id, v_job_position_id, 'active', 'permanent', true)
  ON CONFLICT (user_id) DO NOTHING;

  -- ============================================
  -- 2. UTILISATEUR RH MANAGER
  -- ============================================
  
  SELECT id INTO v_existing_user_id FROM auth.users WHERE email = 'rh@sofibanque.com';
  
  IF v_existing_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at)
    VALUES (v_user_id, '00000000-0000-0000-0000-000000000000', 'rh@sofibanque.com', crypt('Password123!', gen_salt('bf')), NOW(), '{"provider": "email", "providers": ["email"]}'::jsonb, '{"firstname": "Jean", "lastname": "Martin"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW());
  ELSE
    v_user_id := v_existing_user_id;
    UPDATE auth.users SET encrypted_password = crypt('Password123!', gen_salt('bf')), updated_at = NOW() WHERE id = v_user_id;
  END IF;

  INSERT INTO user_profiles (user_id, account_id, root_store, firstname, lastname, phone, email, status)
  VALUES (v_user_id, v_account_id, v_store_id, 'Jean', 'Martin', '+243810000002', 'rh@sofibanque.com', 1)
  ON CONFLICT (user_id) DO UPDATE SET firstname = EXCLUDED.firstname, lastname = EXCLUDED.lastname, phone = EXCLUDED.phone;

  SELECT id INTO v_role_id FROM roles WHERE code = 'rh_manager' LIMIT 1;
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id) VALUES (v_user_id, v_role_id) ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  INSERT INTO employees (user_id, employee_number, first_name, last_name, email, phone, hire_date, direction_id, service_id, grade_id, employment_status, contract_type, is_active)
  VALUES (v_user_id, 'EMP-2024-002', 'Jean', 'Martin', 'rh@sofibanque.com', '+243810000002', '2021-03-10', v_direction_id, v_service_id, v_grade_id, 'active', 'permanent', true)
  ON CONFLICT (user_id) DO NOTHING;

  -- ============================================
  -- 3. UTILISATEUR MANAGER
  -- ============================================
  
  SELECT id INTO v_existing_user_id FROM auth.users WHERE email = 'manager@sofibanque.com';
  
  IF v_existing_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at)
    VALUES (v_user_id, '00000000-0000-0000-0000-000000000000', 'manager@sofibanque.com', crypt('Password123!', gen_salt('bf')), NOW(), '{"provider": "email", "providers": ["email"]}'::jsonb, '{"firstname": "Sophie", "lastname": "Leroy"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW());
  ELSE
    v_user_id := v_existing_user_id;
    UPDATE auth.users SET encrypted_password = crypt('Password123!', gen_salt('bf')), updated_at = NOW() WHERE id = v_user_id;
  END IF;

  INSERT INTO user_profiles (user_id, account_id, root_store, firstname, lastname, phone, email, status)
  VALUES (v_user_id, v_account_id, v_store_id, 'Sophie', 'Leroy', '+243810000003', 'manager@sofibanque.com', 1)
  ON CONFLICT (user_id) DO UPDATE SET firstname = EXCLUDED.firstname, lastname = EXCLUDED.lastname, phone = EXCLUDED.phone;

  SELECT id INTO v_role_id FROM roles WHERE code = 'manager' LIMIT 1;
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id) VALUES (v_user_id, v_role_id) ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  INSERT INTO employees (user_id, employee_number, first_name, last_name, email, phone, hire_date, direction_id, service_id, grade_id, employment_status, contract_type, is_active)
  VALUES (v_user_id, 'EMP-2024-003', 'Sophie', 'Leroy', 'manager@sofibanque.com', '+243810000003', '2021-06-01', v_direction_id, v_service_id, v_grade_id, 'active', 'permanent', true)
  ON CONFLICT (user_id) DO NOTHING;

  -- ============================================
  -- 4. UTILISATEUR EMPLOYÉ
  -- ============================================
  
  SELECT id INTO v_existing_user_id FROM auth.users WHERE email = 'employe@sofibanque.com';
  
  IF v_existing_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at)
    VALUES (v_user_id, '00000000-0000-0000-0000-000000000000', 'employe@sofibanque.com', crypt('Password123!', gen_salt('bf')), NOW(), '{"provider": "email", "providers": ["email"]}'::jsonb, '{"firstname": "Pierre", "lastname": "Durand"}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW());
  ELSE
    v_user_id := v_existing_user_id;
    UPDATE auth.users SET encrypted_password = crypt('Password123!', gen_salt('bf')), updated_at = NOW() WHERE id = v_user_id;
  END IF;

  INSERT INTO user_profiles (user_id, account_id, root_store, firstname, lastname, phone, email, status)
  VALUES (v_user_id, v_account_id, v_store_id, 'Pierre', 'Durand', '+243810000004', 'employe@sofibanque.com', 1)
  ON CONFLICT (user_id) DO UPDATE SET firstname = EXCLUDED.firstname, lastname = EXCLUDED.lastname, phone = EXCLUDED.phone;

  SELECT id INTO v_role_id FROM roles WHERE code = 'employee' LIMIT 1;
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id) VALUES (v_user_id, v_role_id) ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  INSERT INTO employees (user_id, employee_number, first_name, last_name, email, phone, hire_date, direction_id, service_id, grade_id, employment_status, contract_type, is_active)
  VALUES (v_user_id, 'EMP-2024-004', 'Pierre', 'Durand', 'employe@sofibanque.com', '+243810000004', '2023-01-15', v_direction_id, v_service_id, v_grade_id, 'active', 'permanent', true)
  ON CONFLICT (user_id) DO NOTHING;

END $$;
