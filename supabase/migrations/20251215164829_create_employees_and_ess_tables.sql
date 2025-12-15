/*
  # Tables Employés et ESS (Employee Self-Service)
  
  1. Tables Principales
    - `employees` : Profils employés complets
    - `employee_documents` : Documents (contrat, fiches paie, etc.)
    - `employee_requests` : Demandes ESS (attestations, etc.)
    - `employee_dependents` : Personnes à charge
    - `employee_contracts` : Historique des contrats
    - `employee_history` : Historique carrière (mutations, promotions)
  
  2. Security
    - RLS avec policies restrictives
    - Employés peuvent voir leurs propres données
    - RH peut voir toutes les données
    - Managers voient leurs subordonnés
*/

-- =====================================================
-- TABLES EMPLOYÉS
-- =====================================================

-- Table principale des employés
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  employee_number text UNIQUE NOT NULL,
  
  -- Informations personnelles
  first_name text NOT NULL,
  last_name text NOT NULL,
  maiden_name text,
  date_of_birth date,
  place_of_birth text,
  gender text CHECK (gender IN ('M', 'F', 'Other')),
  nationality text DEFAULT 'Congolaise',
  national_id text UNIQUE,
  
  -- Contact
  email text UNIQUE NOT NULL,
  phone text,
  personal_email text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  
  -- Adresse
  address_line1 text,
  address_line2 text,
  city text,
  province text,
  postal_code text,
  country text DEFAULT 'RDC',
  
  -- Situation familiale
  marital_status text CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  spouse_name text,
  number_of_children integer DEFAULT 0,
  
  -- Informations professionnelles
  direction_id uuid REFERENCES directions(id),
  service_id uuid REFERENCES services(id),
  job_position_id uuid REFERENCES job_positions(id),
  grade_id uuid REFERENCES grades(id),
  hire_date date NOT NULL,
  contract_type text CHECK (contract_type IN ('permanent', 'temporary', 'intern', 'consultant')),
  employment_status text CHECK (employment_status IN ('active', 'inactive', 'suspended', 'terminated')) DEFAULT 'active',
  termination_date date,
  termination_reason text,
  
  -- Hiérarchie
  direct_supervisor_id uuid REFERENCES employees(id),
  secondary_supervisor_id uuid REFERENCES employees(id),
  
  -- Informations bancaires
  bank_name text,
  bank_account_number text,
  bank_account_holder text,
  
  -- Informations fiscales
  tax_id text,
  social_security_number text,
  
  -- Divers
  profile_photo_url text,
  notes text,
  is_active boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Table des personnes à charge
CREATE TABLE IF NOT EXISTS employee_dependents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  relationship text NOT NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('M', 'F')),
  is_student boolean DEFAULT false,
  is_handicapped boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Table des contrats
CREATE TABLE IF NOT EXISTS employee_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  contract_number text UNIQUE NOT NULL,
  contract_type text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  position text NOT NULL,
  salary decimal(12,2) NOT NULL,
  contract_file_url text,
  signed_date date,
  is_current boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Table historique carrière
CREATE TABLE IF NOT EXISTS employee_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('hire', 'promotion', 'mutation', 'grade_change', 'salary_increase', 'termination')),
  event_date date NOT NULL,
  old_value jsonb,
  new_value jsonb,
  old_direction_id uuid REFERENCES directions(id),
  new_direction_id uuid REFERENCES directions(id),
  old_service_id uuid REFERENCES services(id),
  new_service_id uuid REFERENCES services(id),
  old_job_position_id uuid REFERENCES job_positions(id),
  new_job_position_id uuid REFERENCES job_positions(id),
  old_grade_id uuid REFERENCES grades(id),
  new_grade_id uuid REFERENCES grades(id),
  description text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- =====================================================
-- TABLES ESS (Employee Self-Service)
-- =====================================================

-- Table des types de documents
CREATE TABLE IF NOT EXISTS document_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  category text NOT NULL,
  requires_approval boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des documents employés
CREATE TABLE IF NOT EXISTS employee_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  document_type_id uuid REFERENCES document_types(id),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  mime_type text,
  document_date date,
  expiry_date date,
  is_confidential boolean DEFAULT false,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Table des types de demandes ESS
CREATE TABLE IF NOT EXISTS request_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  category text NOT NULL,
  workflow_config jsonb,
  requires_document boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des demandes ESS
CREATE TABLE IF NOT EXISTS employee_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  request_type_id uuid REFERENCES request_types(id) NOT NULL,
  request_number text UNIQUE NOT NULL,
  subject text NOT NULL,
  description text,
  request_data jsonb,
  status text CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'cancelled')) DEFAULT 'draft',
  priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  
  -- Workflow
  submitted_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  review_notes text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  approval_notes text,
  
  -- Documents attachés
  attachment_urls text[],
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des anniversaires (pour les cartes électroniques)
CREATE TABLE IF NOT EXISTS birthday_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  year integer NOT NULL,
  card_sent_at timestamptz,
  card_html text,
  signatures jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, year)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_number ON employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_employees_direction_id ON employees(direction_id);
CREATE INDEX IF NOT EXISTS idx_employees_service_id ON employees(service_id);
CREATE INDEX IF NOT EXISTS idx_employees_supervisor_id ON employees(direct_supervisor_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employee_documents_employee_id ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_requests_employee_id ON employee_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_requests_status ON employee_requests(status);
CREATE INDEX IF NOT EXISTS idx_employee_contracts_employee_id ON employee_contracts(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_history_employee_id ON employee_history(employee_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthday_cards ENABLE ROW LEVEL SECURITY;

-- Policies pour employees
CREATE POLICY "Employees can view their own profile"
  ON employees FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "RH can view all employees"
  ON employees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

CREATE POLICY "Managers can view their subordinates"
  ON employees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.user_id = auth.uid()
      AND (employees.direct_supervisor_id = e.id OR employees.secondary_supervisor_id = e.id)
    )
  );

CREATE POLICY "Employees can update their own profile"
  ON employees FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "RH can manage all employees"
  ON employees FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

-- Policies pour employee_documents
CREATE POLICY "Employees can view their own documents"
  ON employee_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = employee_documents.employee_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "RH can view all documents"
  ON employee_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

CREATE POLICY "RH can manage documents"
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

-- Policies pour employee_requests
CREATE POLICY "Employees can view their own requests"
  ON employee_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = employee_requests.employee_id
      AND e.user_id = auth.uid()
    )
  );

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

CREATE POLICY "Employees can update their draft requests"
  ON employee_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = employee_requests.employee_id
      AND e.user_id = auth.uid()
      AND employee_requests.status = 'draft'
    )
  );

CREATE POLICY "RH and managers can view requests"
  ON employee_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN', 'MANAGER')
    )
  );

CREATE POLICY "RH can manage all requests"
  ON employee_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

-- Policies pour document_types et request_types (lecture pour tous)
CREATE POLICY "Authenticated users can view document types"
  ON document_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view request types"
  ON request_types FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_requests_updated_at BEFORE UPDATE ON employee_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer le numéro d'employé automatiquement
CREATE OR REPLACE FUNCTION generate_employee_number()
RETURNS text AS $$
DECLARE
  next_num integer;
  emp_number text;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(employee_number FROM 4) AS integer)), 0) + 1
  INTO next_num
  FROM employees;
  
  emp_number := 'EMP' || LPAD(next_num::text, 5, '0');
  RETURN emp_number;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer le numéro de demande
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS text AS $$
DECLARE
  next_num integer;
  req_number text;
  current_year text;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 9) AS integer)), 0) + 1
  INTO next_num
  FROM employee_requests
  WHERE request_number LIKE 'REQ' || current_year || '%';
  
  req_number := 'REQ' || current_year || LPAD(next_num::text, 5, '0');
  RETURN req_number;
END;
$$ LANGUAGE plpgsql;
