/*
  # Tables Gestion de la Présence et Temps (Time & Attendance)
  
  1. Tables Principales
    - `biometric_devices` : Terminaux biométriques (24 sites)
    - `attendance_records` : Enregistrements de présence (entrée/sortie)
    - `work_authorizations` : Autorisations de sortie/absence
    - `attendance_reports` : Rapports générés (retards, absences)
    - `work_schedules` : Horaires de travail
  
  2. Intégration biométrique
    - Support 24 points d'installation
    - Import données biométriques
  
  3. Security
    - RLS restrictif
*/

-- =====================================================
-- TABLES PRÉSENCE
-- =====================================================

-- Table des terminaux biométriques
CREATE TABLE IF NOT EXISTS biometric_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name text UNIQUE NOT NULL,
  device_id text UNIQUE NOT NULL,
  location text NOT NULL,
  device_type text CHECK (device_type IN ('fingerprint', 'facial', 'iris', 'card')) NOT NULL,
  ip_address inet,
  status text CHECK (status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
  last_sync_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des horaires de travail
CREATE TABLE IF NOT EXISTS work_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  start_time time NOT NULL,
  end_time time NOT NULL,
  break_duration_minutes integer DEFAULT 60,
  working_days integer[] DEFAULT ARRAY[1,2,3,4,5],
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des enregistrements de présence
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  device_id uuid REFERENCES biometric_devices(id),
  record_date date NOT NULL,
  check_in_time timestamptz,
  check_out_time timestamptz,
  work_duration_minutes integer,
  status text CHECK (status IN ('present', 'absent', 'late', 'early_departure', 'overtime')) DEFAULT 'present',
  notes text,
  is_manual_entry boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des autorisations (sortie, etc.)
CREATE TABLE IF NOT EXISTS work_authorizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  authorization_number text UNIQUE NOT NULL,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  authorization_type text CHECK (authorization_type IN ('exit', 'late_arrival', 'early_departure', 'remote_work', 'other')) NOT NULL,
  authorization_date date NOT NULL,
  start_time time,
  end_time time,
  duration_hours decimal(5,2),
  reason text NOT NULL,
  destination text,
  status text CHECK (status IN ('draft', 'pending_supervisor', 'pending_hr', 'approved', 'rejected', 'cancelled')) DEFAULT 'draft',
  
  -- Workflow
  submitted_at timestamptz,
  supervisor_approved_by uuid REFERENCES auth.users(id),
  supervisor_approved_at timestamptz,
  supervisor_notes text,
  hr_approved_by uuid REFERENCES auth.users(id),
  hr_approved_at timestamptz,
  hr_notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des rapports de présence
CREATE TABLE IF NOT EXISTS attendance_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  generated_by uuid REFERENCES auth.users(id) NOT NULL,
  report_data jsonb NOT NULL,
  filters jsonb,
  file_url text,
  created_at timestamptz DEFAULT now()
);

-- Table des anomalies de présence
CREATE TABLE IF NOT EXISTS attendance_anomalies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  anomaly_date date NOT NULL,
  anomaly_type text CHECK (anomaly_type IN ('missing_checkin', 'missing_checkout', 'late', 'absent', 'duplicate')) NOT NULL,
  description text,
  is_resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_attendance_records_employee_id ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(record_date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_work_authorizations_employee_id ON work_authorizations(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_authorizations_status ON work_authorizations(status);
CREATE INDEX IF NOT EXISTS idx_work_authorizations_date ON work_authorizations(authorization_date);
CREATE INDEX IF NOT EXISTS idx_attendance_anomalies_employee_id ON attendance_anomalies(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_anomalies_is_resolved ON attendance_anomalies(is_resolved);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE biometric_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_anomalies ENABLE ROW LEVEL SECURITY;

-- Policies pour biometric_devices (RH seulement)
CREATE POLICY "RH can view biometric devices"
  ON biometric_devices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

-- Policies pour attendance_records
CREATE POLICY "Employees can view their own attendance"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = attendance_records.employee_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "RH can view all attendance records"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

CREATE POLICY "Managers can view team attendance"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees emp
      JOIN employees mgr ON mgr.id = emp.direct_supervisor_id
      WHERE mgr.user_id = auth.uid()
      AND emp.id = attendance_records.employee_id
    )
  );

CREATE POLICY "RH can manage attendance records"
  ON attendance_records FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

-- Policies pour work_authorizations
CREATE POLICY "Employees can view their own authorizations"
  ON work_authorizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = work_authorizations.employee_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can create authorizations"
  ON work_authorizations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = work_authorizations.employee_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Employees can update their draft authorizations"
  ON work_authorizations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = work_authorizations.employee_id
      AND e.user_id = auth.uid()
      AND work_authorizations.status = 'draft'
    )
  );

CREATE POLICY "Supervisors can view team authorizations"
  ON work_authorizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees emp
      JOIN employees mgr ON mgr.id = emp.direct_supervisor_id OR mgr.id = emp.secondary_supervisor_id
      WHERE mgr.user_id = auth.uid()
      AND emp.id = work_authorizations.employee_id
    )
  );

CREATE POLICY "Supervisors can approve authorizations"
  ON work_authorizations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees emp
      JOIN employees mgr ON mgr.id = emp.direct_supervisor_id OR mgr.id = emp.secondary_supervisor_id
      WHERE mgr.user_id = auth.uid()
      AND emp.id = work_authorizations.employee_id
      AND work_authorizations.status = 'pending_supervisor'
    )
  );

CREATE POLICY "RH can manage all authorizations"
  ON work_authorizations FOR ALL
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

CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_authorizations_updated_at BEFORE UPDATE ON work_authorizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_biometric_devices_updated_at BEFORE UPDATE ON biometric_devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer le numéro d'autorisation
CREATE OR REPLACE FUNCTION generate_authorization_number()
RETURNS text AS $$
DECLARE
  next_num integer;
  auth_number text;
  current_year text;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(authorization_number FROM 9) AS integer)), 0) + 1
  INTO next_num
  FROM work_authorizations
  WHERE authorization_number LIKE 'AUT' || current_year || '%';
  
  auth_number := 'AUT' || current_year || LPAD(next_num::text, 5, '0');
  RETURN auth_number;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer la durée de travail
CREATE OR REPLACE FUNCTION calculate_work_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.check_in_time IS NOT NULL AND NEW.check_out_time IS NOT NULL THEN
    NEW.work_duration_minutes := EXTRACT(EPOCH FROM (NEW.check_out_time - NEW.check_in_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_work_duration
  BEFORE INSERT OR UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION calculate_work_duration();
