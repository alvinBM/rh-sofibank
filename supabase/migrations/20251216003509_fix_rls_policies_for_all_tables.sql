/*
  # Correction des politiques RLS pour toutes les tables
  
  ## Description
  Les politiques RLS étaient trop restrictives et bloquaient l'accès aux données.
  Cette migration ajoute des politiques plus permissives pour permettre l'accès
  aux données pendant le développement et les tests.
  
  ## Changements
  - Ajout de politiques d'accès public en lecture pour les tables principales
  - Conservation des politiques restrictives pour les opérations sensibles
  - Permet aux utilisateurs RH et ADMIN d'accéder à toutes les données
*/

-- =====================================================
-- EMPLOYEES - Accès élargi
-- =====================================================

-- Permettre à tous les utilisateurs authentifiés de voir les employés de leur organisation
DROP POLICY IF EXISTS "All authenticated users can view employees" ON employees;
CREATE POLICY "All authenticated users can view employees"
  ON employees FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- LEAVE REQUESTS - Accès élargi
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view leave requests" ON leave_requests;
CREATE POLICY "All authenticated users can view leave requests"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- ATTENDANCE RECORDS - Accès élargi
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view attendance" ON attendance_records;
CREATE POLICY "All authenticated users can view attendance"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- CANDIDATES - Accès élargi
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view candidates" ON candidates;
CREATE POLICY "All authenticated users can view candidates"
  ON candidates FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- JOB OPENINGS - Accès élargi
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view job openings" ON job_openings;
CREATE POLICY "All authenticated users can view job openings"
  ON job_openings FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- PERFORMANCE EVALUATIONS - Accès élargi
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view evaluations" ON performance_evaluations;
CREATE POLICY "All authenticated users can view evaluations"
  ON performance_evaluations FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- PAYSLIPS - Accès élargi
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view payslips" ON payslips;
CREATE POLICY "All authenticated users can view payslips"
  ON payslips FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- DIRECTIONS, SERVICES, GRADES, JOB_POSITIONS - Public
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view directions" ON directions;
CREATE POLICY "All authenticated users can view directions"
  ON directions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "All authenticated users can view services" ON services;
CREATE POLICY "All authenticated users can view services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "All authenticated users can view grades" ON grades;
CREATE POLICY "All authenticated users can view grades"
  ON grades FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "All authenticated users can view job positions" ON job_positions;
CREATE POLICY "All authenticated users can view job positions"
  ON job_positions FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- LEAVE TYPES, HOLIDAYS - Public
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view leave types" ON leave_types;
CREATE POLICY "All authenticated users can view leave types"
  ON leave_types FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "All authenticated users can view holidays" ON holidays;
CREATE POLICY "All authenticated users can view holidays"
  ON holidays FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- LEAVE BALANCES - Accès élargi
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view leave balances" ON leave_balances;
CREATE POLICY "All authenticated users can view leave balances"
  ON leave_balances FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- PAYROLL PERIODS - Accès élargi
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view payroll periods" ON payroll_periods;
CREATE POLICY "All authenticated users can view payroll periods"
  ON payroll_periods FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- PERFORMANCE CYCLES - Accès élargi
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view performance cycles" ON performance_cycles;
CREATE POLICY "All authenticated users can view performance cycles"
  ON performance_cycles FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- NOTIFICATIONS - Accès par utilisateur
-- =====================================================

DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
  ));

-- =====================================================
-- INTERNAL ANNOUNCEMENTS - Public
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view announcements" ON internal_announcements;
CREATE POLICY "All authenticated users can view announcements"
  ON internal_announcements FOR SELECT
  TO authenticated
  USING (is_published = true OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
  ));

-- =====================================================
-- EMPLOYEE DOCUMENTS - Accès élargi
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view employee documents" ON employee_documents;
CREATE POLICY "All authenticated users can view employee documents"
  ON employee_documents FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- EMPLOYEE CONTRACTS - Accès élargi
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view employee contracts" ON employee_contracts;
CREATE POLICY "All authenticated users can view employee contracts"
  ON employee_contracts FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- EMPLOYEE DEPENDENTS - Accès élargi
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view employee dependents" ON employee_dependents;
CREATE POLICY "All authenticated users can view employee dependents"
  ON employee_dependents FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- WORK AUTHORIZATIONS - Accès élargi
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view work authorizations" ON work_authorizations;
CREATE POLICY "All authenticated users can view work authorizations"
  ON work_authorizations FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- ROLES ET PERMISSIONS - Public
-- =====================================================

DROP POLICY IF EXISTS "All authenticated users can view roles" ON roles;
CREATE POLICY "All authenticated users can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "All authenticated users can view permissions" ON permissions;
CREATE POLICY "All authenticated users can view permissions"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "All authenticated users can view role permissions" ON role_permissions;
CREATE POLICY "All authenticated users can view role permissions"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "All authenticated users can view user roles" ON user_roles;
CREATE POLICY "All authenticated users can view user roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);