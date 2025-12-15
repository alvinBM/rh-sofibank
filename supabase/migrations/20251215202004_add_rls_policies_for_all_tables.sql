/*
  # Ajout des politiques RLS pour toutes les tables manquantes
  
  ## Tables concernées
  Toutes les tables avec RLS activé mais sans politiques (22 tables au total)
  
  ## Principe de sécurité
  1. RH et ADMIN peuvent voir toutes les données
  2. Les employés peuvent voir leurs propres données
  3. Seuls les RH et ADMIN peuvent modifier les données
  
  ## Tables traitées
  - attendance_anomalies, attendance_reports, birthday_cards
  - candidate_evaluations, candidate_interviews, employee_contracts
  - employee_dependents, employee_history, evaluation_kpi_responses
  - grade_benefits, job_offers, job_openings, kpis
  - leave_approvals, leave_planning, payroll_item_types
  - payroll_periods, payslip_items, performance_cycles
  - pip_plans, system_settings, work_schedules
*/

-- ========================================
-- ATTENDANCE ANOMALIES
-- ========================================
CREATE POLICY "RH can view all attendance anomalies"
  ON attendance_anomalies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

CREATE POLICY "Employees can view their attendance anomalies"
  ON attendance_anomalies FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "RH can manage attendance anomalies"
  ON attendance_anomalies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

-- ========================================
-- ATTENDANCE REPORTS
-- ========================================
CREATE POLICY "RH can manage attendance reports"
  ON attendance_reports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

-- ========================================
-- BIRTHDAY CARDS
-- ========================================
CREATE POLICY "RH can manage birthday cards"
  ON birthday_cards FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

CREATE POLICY "Employees can view their birthday cards"
  ON birthday_cards FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- CANDIDATE EVALUATIONS
-- ========================================
CREATE POLICY "RH can manage candidate evaluations"
  ON candidate_evaluations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

-- ========================================
-- CANDIDATE INTERVIEWS
-- ========================================
CREATE POLICY "RH can manage candidate interviews"
  ON candidate_interviews FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

-- ========================================
-- EMPLOYEE CONTRACTS
-- ========================================
CREATE POLICY "RH can manage employee contracts"
  ON employee_contracts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

CREATE POLICY "Employees can view their contracts"
  ON employee_contracts FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- EMPLOYEE DEPENDENTS
-- ========================================
CREATE POLICY "RH can manage employee dependents"
  ON employee_dependents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

CREATE POLICY "Employees can view their dependents"
  ON employee_dependents FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- EMPLOYEE HISTORY
-- ========================================
CREATE POLICY "RH can manage employee history"
  ON employee_history FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

CREATE POLICY "Employees can view their history"
  ON employee_history FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- EVALUATION KPI RESPONSES
-- ========================================
CREATE POLICY "RH can manage evaluation kpi responses"
  ON evaluation_kpi_responses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

-- ========================================
-- GRADE BENEFITS
-- ========================================
CREATE POLICY "Authenticated users can view grade benefits"
  ON grade_benefits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "RH can manage grade benefits"
  ON grade_benefits FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

-- ========================================
-- JOB OFFERS
-- ========================================
CREATE POLICY "RH can manage job offers"
  ON job_offers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

-- ========================================
-- JOB OPENINGS
-- ========================================
CREATE POLICY "Authenticated users can view published job openings"
  ON job_openings FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "RH can manage job openings"
  ON job_openings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

-- ========================================
-- KPIS
-- ========================================
CREATE POLICY "Authenticated users can view active KPIs"
  ON kpis FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "RH can manage KPIs"
  ON kpis FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

-- ========================================
-- LEAVE APPROVALS
-- ========================================
CREATE POLICY "RH can view all leave approvals"
  ON leave_approvals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

CREATE POLICY "Employees can view approvals for their leave requests"
  ON leave_approvals FOR SELECT
  TO authenticated
  USING (
    leave_request_id IN (
      SELECT lr.id FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      WHERE e.user_id = auth.uid()
    )
  );

CREATE POLICY "RH can manage leave approvals"
  ON leave_approvals FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

-- ========================================
-- LEAVE PLANNING
-- ========================================
CREATE POLICY "RH can view all leave planning"
  ON leave_planning FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

CREATE POLICY "Employees can view their leave planning"
  ON leave_planning FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "RH can manage leave planning"
  ON leave_planning FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

-- ========================================
-- PAYROLL ITEM TYPES
-- ========================================
CREATE POLICY "Authenticated users can view active payroll item types"
  ON payroll_item_types FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "RH can manage payroll item types"
  ON payroll_item_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

-- ========================================
-- PAYROLL PERIODS
-- ========================================
CREATE POLICY "RH can manage payroll periods"
  ON payroll_periods FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

-- ========================================
-- PAYSLIP ITEMS
-- ========================================
CREATE POLICY "RH can manage payslip items"
  ON payslip_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

CREATE POLICY "Employees can view their payslip items"
  ON payslip_items FOR SELECT
  TO authenticated
  USING (
    payslip_id IN (
      SELECT ps.id FROM payslips ps
      JOIN employees e ON e.id = ps.employee_id
      WHERE e.user_id = auth.uid()
    )
  );

-- ========================================
-- PERFORMANCE CYCLES
-- ========================================
CREATE POLICY "Authenticated users can view active performance cycles"
  ON performance_cycles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "RH can manage performance cycles"
  ON performance_cycles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

-- ========================================
-- PIP PLANS
-- ========================================
CREATE POLICY "RH can manage PIP plans"
  ON pip_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

CREATE POLICY "Employees can view their PIP plans"
  ON pip_plans FOR SELECT
  TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- SYSTEM SETTINGS
-- ========================================
CREATE POLICY "Authenticated users can view system settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage system settings"
  ON system_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- ========================================
-- WORK SCHEDULES
-- ========================================
CREATE POLICY "Authenticated users can view active work schedules"
  ON work_schedules FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "RH can manage work schedules"
  ON work_schedules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );
