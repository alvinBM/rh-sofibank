/*
  # Correction des références de clés étrangères avec nettoyage
  
  ## Description
  Cette migration corrige les références de clés étrangères de auth.users vers users.
  Elle nettoie d'abord les données orphelines avant de recréer les contraintes.
  
  ## Étapes
  1. Nettoyer les données orphelines
  2. Supprimer les anciennes contraintes FK
  3. Ajouter les nouvelles contraintes FK référençant users
  
  ## Tables affectées
  Toutes les tables avec des colonnes référençant auth.users
*/

-- =====================================================
-- ÉTAPE 1: NETTOYAGE DES DONNÉES ORPHELINES
-- =====================================================

-- Nettoyer user_roles
DELETE FROM user_roles 
WHERE user_id NOT IN (SELECT id FROM users);

-- Nettoyer audit_logs
DELETE FROM audit_logs 
WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users);

-- Nettoyer notifications
DELETE FROM notifications 
WHERE user_id NOT IN (SELECT id FROM users);

-- Nettoyer employees sans user_id valide
DELETE FROM employees 
WHERE user_id NOT IN (SELECT id FROM users);

-- Mettre à NULL les colonnes created_by/updated_by invalides
UPDATE employees SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM users);
UPDATE employees SET updated_by = NULL WHERE updated_by IS NOT NULL AND updated_by NOT IN (SELECT id FROM users);

UPDATE employee_contracts SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM users);

UPDATE employee_history SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM users);

UPDATE employee_documents SET uploaded_by = NULL WHERE uploaded_by IS NOT NULL AND uploaded_by NOT IN (SELECT id FROM users);

UPDATE employee_requests SET reviewed_by = NULL WHERE reviewed_by IS NOT NULL AND reviewed_by NOT IN (SELECT id FROM users);
UPDATE employee_requests SET approved_by = NULL WHERE approved_by IS NOT NULL AND approved_by NOT IN (SELECT id FROM users);

UPDATE job_openings SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM users);

UPDATE job_offers SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM users);

UPDATE pip_plans SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM users);

UPDATE system_settings SET updated_by = NULL WHERE updated_by IS NOT NULL AND updated_by NOT IN (SELECT id FROM users);

UPDATE candidate_evaluations SET evaluator_id = NULL WHERE evaluator_id IS NOT NULL AND evaluator_id NOT IN (SELECT id FROM users);

UPDATE evaluation_kpi_responses SET evaluator_id = NULL WHERE evaluator_id IS NOT NULL AND evaluator_id NOT IN (SELECT id FROM users);

UPDATE payroll_periods SET processed_by = NULL WHERE processed_by IS NOT NULL AND processed_by NOT IN (SELECT id FROM users);

UPDATE directions SET director_id = NULL WHERE director_id IS NOT NULL AND director_id NOT IN (SELECT id FROM users);

UPDATE services SET manager_id = NULL WHERE manager_id IS NOT NULL AND manager_id NOT IN (SELECT id FROM users);

UPDATE user_roles SET assigned_by = NULL WHERE assigned_by IS NOT NULL AND assigned_by NOT IN (SELECT id FROM users);

-- Nettoyer leave_requests si la table existe
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leave_requests') THEN
    EXECUTE 'UPDATE leave_requests SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM users)';
  END IF;
END $$;

-- Nettoyer attendance_records si la table existe
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendance_records') THEN
    EXECUTE 'UPDATE attendance_records SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM users)';
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 2: SUPPRESSION DES ANCIENNES CONTRAINTES
-- =====================================================

-- Helper pour supprimer une contrainte si elle existe
CREATE OR REPLACE FUNCTION drop_constraint_if_exists(
  p_table_name text,
  p_constraint_name text
) RETURNS void AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = p_constraint_name 
    AND table_name = p_table_name
  ) THEN
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', p_table_name, p_constraint_name);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Supprimer toutes les anciennes contraintes
SELECT drop_constraint_if_exists('employees', 'employees_user_id_fkey');
SELECT drop_constraint_if_exists('employees', 'employees_created_by_fkey');
SELECT drop_constraint_if_exists('employees', 'employees_updated_by_fkey');
SELECT drop_constraint_if_exists('employee_contracts', 'employee_contracts_created_by_fkey');
SELECT drop_constraint_if_exists('employee_history', 'employee_history_created_by_fkey');
SELECT drop_constraint_if_exists('employee_documents', 'employee_documents_uploaded_by_fkey');
SELECT drop_constraint_if_exists('employee_requests', 'employee_requests_reviewed_by_fkey');
SELECT drop_constraint_if_exists('employee_requests', 'employee_requests_approved_by_fkey');
SELECT drop_constraint_if_exists('job_openings', 'job_openings_created_by_fkey');
SELECT drop_constraint_if_exists('job_offers', 'job_offers_created_by_fkey');
SELECT drop_constraint_if_exists('pip_plans', 'pip_plans_created_by_fkey');
SELECT drop_constraint_if_exists('system_settings', 'system_settings_updated_by_fkey');
SELECT drop_constraint_if_exists('candidate_evaluations', 'candidate_evaluations_evaluator_id_fkey');
SELECT drop_constraint_if_exists('evaluation_kpi_responses', 'evaluation_kpi_responses_evaluator_id_fkey');
SELECT drop_constraint_if_exists('payroll_periods', 'payroll_periods_processed_by_fkey');
SELECT drop_constraint_if_exists('directions', 'directions_director_id_fkey');
SELECT drop_constraint_if_exists('services', 'services_manager_id_fkey');
SELECT drop_constraint_if_exists('user_roles', 'user_roles_user_id_fkey');
SELECT drop_constraint_if_exists('user_roles', 'user_roles_assigned_by_fkey');
SELECT drop_constraint_if_exists('audit_logs', 'audit_logs_user_id_fkey');
SELECT drop_constraint_if_exists('notifications', 'notifications_user_id_fkey');

-- Supprimer pour leave_requests et attendance_records si elles existent
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leave_requests') THEN
    PERFORM drop_constraint_if_exists('leave_requests', 'leave_requests_created_by_fkey');
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendance_records') THEN
    PERFORM drop_constraint_if_exists('attendance_records', 'attendance_records_created_by_fkey');
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 3: AJOUT DES NOUVELLES CONTRAINTES
-- =====================================================

-- Contraintes principales
ALTER TABLE employees ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE employees ADD CONSTRAINT employees_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE employees ADD CONSTRAINT employees_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE employee_contracts ADD CONSTRAINT employee_contracts_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE employee_history ADD CONSTRAINT employee_history_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE employee_documents ADD CONSTRAINT employee_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE employee_requests ADD CONSTRAINT employee_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE employee_requests ADD CONSTRAINT employee_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE job_openings ADD CONSTRAINT job_openings_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE job_offers ADD CONSTRAINT job_offers_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE pip_plans ADD CONSTRAINT pip_plans_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE system_settings ADD CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE candidate_evaluations ADD CONSTRAINT candidate_evaluations_evaluator_id_fkey FOREIGN KEY (evaluator_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE evaluation_kpi_responses ADD CONSTRAINT evaluation_kpi_responses_evaluator_id_fkey FOREIGN KEY (evaluator_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE payroll_periods ADD CONSTRAINT payroll_periods_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE directions ADD CONSTRAINT directions_director_id_fkey FOREIGN KEY (director_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE services ADD CONSTRAINT services_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Contraintes conditionnelles
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leave_requests') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leave_requests' AND column_name = 'created_by') THEN
    ALTER TABLE leave_requests ADD CONSTRAINT leave_requests_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendance_records') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance_records' AND column_name = 'created_by') THEN
    ALTER TABLE attendance_records ADD CONSTRAINT attendance_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Nettoyer la fonction helper
DROP FUNCTION IF EXISTS drop_constraint_if_exists(text, text);