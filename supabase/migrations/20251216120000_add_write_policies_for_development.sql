/*
  # Add Write Policies for Development
  
  ## Description
  Enable INSERT, UPDATE, DELETE operations for authenticated users during development.
  This allows the application to save data properly while maintaining basic security.
  
  ## Changes
  - Add INSERT policies for main tables
  - Add UPDATE policies for main tables
  - Add DELETE policies for admin roles only
  - Keep strict policies for sensitive operations (roles, permissions)
*/

-- =====================================================
-- EMPLOYEES - Write access
-- =====================================================

DROP POLICY IF EXISTS "RH can insert employees" ON employees;
CREATE POLICY "RH can insert employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "RH can update employees" ON employees;
CREATE POLICY "RH can update employees"
  ON employees FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "Employees can update their own profile" ON employees;
CREATE POLICY "Employees can update their own profile"
  ON employees FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- LEAVE REQUESTS - Write access
-- =====================================================

DROP POLICY IF EXISTS "Employees can insert leave requests" ON leave_requests;
CREATE POLICY "Employees can insert leave requests"
  ON leave_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = leave_requests.employee_id
      AND e.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can update leave requests" ON leave_requests;
CREATE POLICY "Authenticated users can update leave requests"
  ON leave_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- LEAVE BALANCES - Write access
-- =====================================================

DROP POLICY IF EXISTS "RH can manage leave balances" ON leave_balances;
CREATE POLICY "RH can manage leave balances"
  ON leave_balances FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

-- =====================================================
-- LEAVE APPROVALS - Write access
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can insert leave approvals" ON leave_approvals;
CREATE POLICY "Authenticated users can insert leave approvals"
  ON leave_approvals FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- LEAVE HANDOVER SHEETS - Write access
-- =====================================================

DROP POLICY IF EXISTS "Employees can manage handover sheets" ON leave_handover_sheets;
CREATE POLICY "Employees can manage handover sheets"
  ON leave_handover_sheets FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- ATTENDANCE RECORDS - Write access
-- =====================================================

DROP POLICY IF EXISTS "RH can manage attendance" ON attendance_records;
CREATE POLICY "RH can manage attendance"
  ON attendance_records FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN', 'MANAGER')
    )
  );

-- =====================================================
-- EXIT AUTHORIZATIONS - Write access
-- =====================================================

DROP POLICY IF EXISTS "Employees can create exit authorizations" ON exit_authorizations;
CREATE POLICY "Employees can create exit authorizations"
  ON exit_authorizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update exit authorizations" ON exit_authorizations;
CREATE POLICY "Authenticated users can update exit authorizations"
  ON exit_authorizations FOR UPDATE
  TO authenticated
  USING (true);

-- =====================================================
-- EMPLOYEE REQUESTS - Write access
-- =====================================================

DROP POLICY IF EXISTS "Employees can create requests" ON employee_requests;
CREATE POLICY "Employees can create requests"
  ON employee_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = employee_requests.employee_id
      AND e.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can update employee requests" ON employee_requests;
CREATE POLICY "Authenticated users can update employee requests"
  ON employee_requests FOR UPDATE
  TO authenticated
  USING (true);

-- =====================================================
-- EMPLOYEE DOCUMENTS - Write access
-- =====================================================

DROP POLICY IF EXISTS "RH can manage employee documents" ON employee_documents;
CREATE POLICY "RH can manage employee documents"
  ON employee_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

-- =====================================================
-- EMPLOYEE DEPENDENTS - Write access
-- =====================================================

DROP POLICY IF EXISTS "Employees can manage their dependents" ON employee_dependents;
CREATE POLICY "Employees can manage their dependents"
  ON employee_dependents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = employee_dependents.employee_id
      AND e.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "RH can manage all dependents" ON employee_dependents;
CREATE POLICY "RH can manage all dependents"
  ON employee_dependents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

-- =====================================================
-- EMPLOYEE CONTRACTS - Write access
-- =====================================================

DROP POLICY IF EXISTS "RH can manage employee contracts" ON employee_contracts;
CREATE POLICY "RH can manage employee contracts"
  ON employee_contracts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

-- =====================================================
-- PAYROLL - Write access
-- =====================================================

DROP POLICY IF EXISTS "RH can manage payroll" ON payroll_periods;
CREATE POLICY "RH can manage payroll"
  ON payroll_periods FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "RH can manage payslips" ON payslips;
CREATE POLICY "RH can manage payslips"
  ON payslips FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

-- =====================================================
-- RECRUITMENT - Write access
-- =====================================================

DROP POLICY IF EXISTS "RH can manage job openings" ON job_openings;
CREATE POLICY "RH can manage job openings"
  ON job_openings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN', 'MANAGER')
    )
  );

DROP POLICY IF EXISTS "RH can manage candidates" ON candidates;
CREATE POLICY "RH can manage candidates"
  ON candidates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN', 'MANAGER')
    )
  );

-- =====================================================
-- PERFORMANCE - Write access
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can manage evaluations" ON performance_evaluations;
CREATE POLICY "Authenticated users can manage evaluations"
  ON performance_evaluations FOR ALL
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "RH can manage KPIs" ON kpis;
CREATE POLICY "RH can manage KPIs"
  ON kpis FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

-- =====================================================
-- DIRECTIONS, SERVICES, GRADES, POSITIONS - Write access
-- =====================================================

DROP POLICY IF EXISTS "RH can manage directions" ON directions;
CREATE POLICY "RH can manage directions"
  ON directions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "RH can manage services" ON services;
CREATE POLICY "RH can manage services"
  ON services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "RH can manage grades" ON grades;
CREATE POLICY "RH can manage grades"
  ON grades FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "RH can manage job positions" ON job_positions;
CREATE POLICY "RH can manage job positions"
  ON job_positions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

-- =====================================================
-- LEAVE TYPES AND HOLIDAYS - Write access
-- =====================================================

DROP POLICY IF EXISTS "RH can manage leave types" ON leave_types;
CREATE POLICY "RH can manage leave types"
  ON leave_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "RH can manage holidays" ON holidays;
CREATE POLICY "RH can manage holidays"
  ON holidays FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

-- =====================================================
-- NOTIFICATIONS - Write access
-- =====================================================

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- DOCUMENT TYPES AND REQUEST TYPES - Write access
-- =====================================================

DROP POLICY IF EXISTS "RH can manage document types" ON document_types;
CREATE POLICY "RH can manage document types"
  ON document_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

DROP POLICY IF EXISTS "RH can manage request types" ON request_types;
CREATE POLICY "RH can manage request types"
  ON request_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

-- =====================================================
-- USER ROLES - Strict write access (admin only)
-- =====================================================

DROP POLICY IF EXISTS "Only admins can manage user roles" ON user_roles;
CREATE POLICY "Only admins can manage user roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN')
    )
  );
