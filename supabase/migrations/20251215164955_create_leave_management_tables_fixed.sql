/*
  # Tables Gestion des Congés
  
  1. Tables Principales
    - `leave_types` : Types de congés (annuel, circonstance, maladie, etc.)
    - `leave_balances` : Soldes de congés par employé
    - `leave_requests` : Demandes de congés
    - `leave_approvals` : Historique des approbations (workflow)
    - `leave_handover_sheets` : Feuilles de remise-reprise
    - `leave_planning` : Planification annuelle des congés
  
  2. Workflow
    - Employé → Backup/Collaborateur → Supérieur → DRH
    - Pour responsables direction : DRH → Direction Générale
  
  3. Security
    - RLS avec workflow multi-niveaux
*/

-- =====================================================
-- TABLES CONGÉS
-- =====================================================

-- Table des types de congés
CREATE TABLE IF NOT EXISTS leave_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  category text CHECK (category IN ('annual', 'circumstance', 'sick', 'maternity', 'paternity', 'unpaid', 'other')) NOT NULL,
  default_days integer DEFAULT 0,
  max_days_per_year integer,
  requires_document boolean DEFAULT false,
  requires_handover boolean DEFAULT true,
  is_paid boolean DEFAULT true,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des soldes de congés
CREATE TABLE IF NOT EXISTS leave_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  leave_type_id uuid REFERENCES leave_types(id) ON DELETE CASCADE NOT NULL,
  year integer NOT NULL,
  total_days decimal(5,2) DEFAULT 0,
  used_days decimal(5,2) DEFAULT 0,
  remaining_days decimal(5,2) DEFAULT 0,
  carried_over_days decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- Table de planification annuelle des congés
CREATE TABLE IF NOT EXISTS leave_planning (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  year integer NOT NULL,
  planned_start_date date NOT NULL,
  planned_end_date date NOT NULL,
  planned_days integer NOT NULL,
  status text CHECK (status IN ('draft', 'submitted', 'approved', 'modified', 'cancelled')) DEFAULT 'draft',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des demandes de congés
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text UNIQUE NOT NULL,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  leave_type_id uuid REFERENCES leave_types(id) NOT NULL,
  
  -- Dates et durée
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days decimal(5,2) NOT NULL,
  return_date date NOT NULL,
  
  -- Détails
  reason text,
  contact_during_leave text,
  emergency_contact text,
  attachment_urls text[],
  
  -- Backup/Collaborateur
  backup_employee_id uuid REFERENCES employees(id),
  backup_approved boolean DEFAULT false,
  backup_approved_at timestamptz,
  backup_notes text,
  
  -- Status workflow
  status text CHECK (status IN ('draft', 'pending_backup', 'pending_supervisor', 'pending_hr', 'pending_dg', 'approved', 'rejected', 'cancelled')) DEFAULT 'draft',
  
  -- Tracking
  submitted_at timestamptz,
  current_approver_id uuid REFERENCES auth.users(id),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Table des approbations (historique workflow)
CREATE TABLE IF NOT EXISTS leave_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_request_id uuid REFERENCES leave_requests(id) ON DELETE CASCADE NOT NULL,
  approver_id uuid REFERENCES auth.users(id) NOT NULL,
  approver_role text NOT NULL,
  action text CHECK (action IN ('approved', 'rejected', 'returned')) NOT NULL,
  comments text,
  approval_level integer NOT NULL,
  approved_at timestamptz DEFAULT now()
);

-- Table des feuilles de remise-reprise
CREATE TABLE IF NOT EXISTS leave_handover_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_request_id uuid REFERENCES leave_requests(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Informations remise
  handover_items jsonb NOT NULL,
  ongoing_tasks text,
  important_contacts text,
  special_instructions text,
  keys_handed_over text[],
  documents_handed_over text[],
  
  -- Signatures
  employee_signature_date timestamptz,
  backup_signature_date timestamptz,
  supervisor_signature_date timestamptz,
  
  -- Reprise
  handover_received boolean DEFAULT false,
  reprise_items jsonb,
  reprise_notes text,
  reprise_signature_date timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_id ON leave_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_year ON leave_balances(year);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_start_date ON leave_requests(start_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_backup_employee_id ON leave_requests(backup_employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_approvals_leave_request_id ON leave_approvals(leave_request_id);
CREATE INDEX IF NOT EXISTS idx_leave_planning_employee_id ON leave_planning(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_planning_year ON leave_planning(year);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_planning ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_handover_sheets ENABLE ROW LEVEL SECURITY;

-- Policies pour leave_types (lecture pour tous)
CREATE POLICY "Authenticated users can view leave types"
  ON leave_types FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies pour leave_balances
CREATE POLICY "Employees can view their own leave balances"
  ON leave_balances FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = leave_balances.employee_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "RH can view all leave balances"
  ON leave_balances FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

CREATE POLICY "Managers can view their team balances"
  ON leave_balances FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees emp
      JOIN employees mgr ON mgr.id = emp.direct_supervisor_id
      WHERE mgr.user_id = auth.uid()
      AND emp.id = leave_balances.employee_id
    )
  );

-- Policies pour leave_requests
CREATE POLICY "Employees can view their own leave requests"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = leave_requests.employee_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Backup employees can view assigned leave requests"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = leave_requests.backup_employee_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Supervisors can view their team leave requests"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees emp
      JOIN employees mgr ON mgr.id = emp.direct_supervisor_id OR mgr.id = emp.secondary_supervisor_id
      WHERE mgr.user_id = auth.uid()
      AND emp.id = leave_requests.employee_id
    )
  );

CREATE POLICY "RH can view all leave requests"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

CREATE POLICY "Direction can view director leave requests"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('DG', 'ADG', 'DIRECTION')
    )
  );

CREATE POLICY "Employees can create leave requests"
  ON leave_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = leave_requests.employee_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can update their draft leave requests"
  ON leave_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = leave_requests.employee_id
      AND e.user_id = auth.uid()
      AND leave_requests.status IN ('draft', 'pending_backup')
    )
  );

CREATE POLICY "Backup can approve their part"
  ON leave_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = leave_requests.backup_employee_id
      AND e.user_id = auth.uid()
      AND leave_requests.status = 'pending_backup'
    )
  );

CREATE POLICY "Supervisors can approve leave requests"
  ON leave_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees emp
      JOIN employees mgr ON mgr.id = emp.direct_supervisor_id OR mgr.id = emp.secondary_supervisor_id
      WHERE mgr.user_id = auth.uid()
      AND emp.id = leave_requests.employee_id
      AND leave_requests.status = 'pending_supervisor'
    )
  );

CREATE POLICY "RH can manage leave requests"
  ON leave_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

-- Policies pour leave_handover_sheets
CREATE POLICY "Employees can view their own handover sheets"
  ON leave_handover_sheets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      WHERE lr.id = leave_handover_sheets.leave_request_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Backup can view assigned handover sheets"
  ON leave_handover_sheets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leave_requests lr
      JOIN employees e ON e.id = lr.backup_employee_id
      WHERE lr.id = leave_handover_sheets.leave_request_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "RH can view all handover sheets"
  ON leave_handover_sheets FOR SELECT
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
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON leave_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_handover_sheets_updated_at BEFORE UPDATE ON leave_handover_sheets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer le numéro de demande de congé
CREATE OR REPLACE FUNCTION generate_leave_request_number()
RETURNS text AS $$
DECLARE
  next_num integer;
  req_number text;
  current_year text;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 9) AS integer)), 0) + 1
  INTO next_num
  FROM leave_requests
  WHERE request_number LIKE 'LEV' || current_year || '%';
  
  req_number := 'LEV' || current_year || LPAD(next_num::text, 5, '0');
  RETURN req_number;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer les jours ouvrables
CREATE OR REPLACE FUNCTION calculate_working_days(start_date_param date, end_date_param date)
RETURNS decimal AS $$
DECLARE
  total_days decimal := 0;
  day_cursor date := start_date_param;
BEGIN
  WHILE day_cursor <= end_date_param LOOP
    -- Exclure les week-ends (samedi=6, dimanche=0)
    IF EXTRACT(DOW FROM day_cursor) NOT IN (0, 6) THEN
      -- Vérifier si ce n'est pas un jour férié
      IF NOT EXISTS (SELECT 1 FROM holidays WHERE date = day_cursor) THEN
        total_days := total_days + 1;
      END IF;
    END IF;
    day_cursor := day_cursor + 1;
  END LOOP;
  
  RETURN total_days;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour les soldes de congés
CREATE OR REPLACE FUNCTION update_leave_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE leave_balances
    SET used_days = used_days + NEW.total_days,
        remaining_days = remaining_days - NEW.total_days,
        updated_at = now()
    WHERE employee_id = NEW.employee_id
      AND leave_type_id = NEW.leave_type_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_leave_balance
  AFTER UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_leave_balance();
