/*
  # Création des tables manquantes pour le SIRH

  1. Tables ajoutées
    - job_applications (candidatures)
    - interviews (entretiens)
    - authorizations (autorisations de sortie)
    - salary_grades (grades salariaux)
    - salary_levels (niveaux salariaux)
    - benefits (avantages)
    - employee_benefits (avantages par employé)
    - payroll_runs (exécutions paie)
    - payroll_items (éléments de paie)
    - evaluations (évaluations)
    - evaluation_kpis (KPIs d'évaluation)
    - alerts (alertes)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Policies appropriées selon les rôles
*/

-- ============= RECRUTEMENT =============

-- Candidatures
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_opening_id uuid REFERENCES job_openings(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  resume_url text,
  cover_letter text,
  status text DEFAULT 'new',
  rating integer,
  notes text,
  source text,
  applied_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Entretiens
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES job_applications(id) ON DELETE CASCADE,
  interview_type text DEFAULT 'technical',
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  location text,
  meeting_link text,
  interviewers uuid[],
  status text DEFAULT 'scheduled',
  feedback text,
  rating integer,
  recommendation text,
  conducted_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============= PRÉSENCE =============

-- Autorisations de sortie
CREATE TABLE IF NOT EXISTS authorizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  authorization_type text NOT NULL,
  start_datetime timestamptz NOT NULL,
  end_datetime timestamptz NOT NULL,
  duration_hours decimal(5,2),
  reason text NOT NULL,
  status text DEFAULT 'pending',
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============= PAIE =============

-- Grades salariaux
CREATE TABLE IF NOT EXISTS salary_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  min_salary decimal(12,2),
  max_salary decimal(12,2),
  currency text DEFAULT 'USD',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Niveaux salariaux
CREATE TABLE IF NOT EXISTS salary_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id uuid REFERENCES salary_grades(id) ON DELETE CASCADE,
  level integer NOT NULL,
  base_salary decimal(12,2) NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(grade_id, level)
);

-- Avantages
CREATE TABLE IF NOT EXISTS benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  benefit_type text,
  value decimal(12,2),
  is_taxable boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Avantages par employé
CREATE TABLE IF NOT EXISTS employee_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  benefit_id uuid REFERENCES benefits(id),
  start_date date NOT NULL,
  end_date date,
  amount decimal(12,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Exécutions de paie
CREATE TABLE IF NOT EXISTS payroll_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start date NOT NULL,
  period_end date NOT NULL,
  payment_date date NOT NULL,
  status text DEFAULT 'draft',
  total_gross decimal(14,2) DEFAULT 0,
  total_net decimal(14,2) DEFAULT 0,
  total_deductions decimal(14,2) DEFAULT 0,
  processed_by uuid REFERENCES auth.users(id),
  processed_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Éléments de paie
CREATE TABLE IF NOT EXISTS payroll_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id uuid REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  base_salary decimal(12,2) DEFAULT 0,
  bonuses decimal(12,2) DEFAULT 0,
  allowances decimal(12,2) DEFAULT 0,
  overtime decimal(12,2) DEFAULT 0,
  gross_salary decimal(12,2) DEFAULT 0,
  tax decimal(12,2) DEFAULT 0,
  social_security decimal(12,2) DEFAULT 0,
  other_deductions decimal(12,2) DEFAULT 0,
  total_deductions decimal(12,2) DEFAULT 0,
  net_salary decimal(12,2) DEFAULT 0,
  payslip_url text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============= PERFORMANCE =============

-- Évaluations
CREATE TABLE IF NOT EXISTS evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  evaluator_id uuid REFERENCES employees(id),
  evaluation_period text NOT NULL,
  year integer NOT NULL,
  quarter integer,
  evaluation_type text DEFAULT 'quarterly',
  status text DEFAULT 'draft',
  overall_score decimal(5,2),
  overall_rating text,
  strengths text,
  areas_for_improvement text,
  key_success_factors text,
  recommendations text,
  self_evaluation_completed_at timestamptz,
  supervisor_evaluation_completed_at timestamptz,
  hr_approved_at timestamptz,
  dg_approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- KPIs d'évaluation
CREATE TABLE IF NOT EXISTS evaluation_kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid REFERENCES evaluations(id) ON DELETE CASCADE,
  kpi_id uuid REFERENCES kpis(id),
  target_value decimal(10,2),
  actual_value decimal(10,2),
  score decimal(5,2),
  weight_percentage decimal(5,2),
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============= SYSTÈME =============

-- Alertes
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity text DEFAULT 'info',
  threshold_value decimal(10,2),
  actual_value decimal(10,2),
  triggered_at timestamptz DEFAULT now(),
  acknowledged_at timestamptz,
  acknowledged_by uuid REFERENCES auth.users(id),
  resolved_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============= ACTIVER RLS =============

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- ============= POLICIES RLS =============

-- Recrutement
CREATE POLICY "RH can manage applications" ON job_applications FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('RH', 'RECRUITER', 'SUPER_ADMIN')
  )
);

CREATE POLICY "RH can manage interviews" ON interviews FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('RH', 'RECRUITER', 'SUPER_ADMIN')
  )
);

-- Présence
CREATE POLICY "Users can manage own authorizations" ON authorizations FOR ALL TO authenticated USING (
  employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('RH', 'MANAGER', 'SUPER_ADMIN')
  )
);

-- Paie
CREATE POLICY "Finance can view salary grades" ON salary_grades FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('RH', 'FINANCE', 'DG', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Finance can manage salary grades" ON salary_grades FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('RH', 'FINANCE', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Finance can manage salary levels" ON salary_levels FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('RH', 'FINANCE', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Finance can manage benefits" ON benefits FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('RH', 'FINANCE', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Finance can view employee benefits" ON employee_benefits FOR SELECT TO authenticated USING (
  employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('RH', 'FINANCE', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Finance can manage employee benefits" ON employee_benefits FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('RH', 'FINANCE', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Finance can view payroll runs" ON payroll_runs FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('FINANCE', 'DG', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Finance can manage payroll runs" ON payroll_runs FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('FINANCE', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Users can view own payroll items" ON payroll_items FOR SELECT TO authenticated USING (
  employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('FINANCE', 'DG', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Finance can manage payroll items" ON payroll_items FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('FINANCE', 'SUPER_ADMIN')
  )
);

-- Performance
CREATE POLICY "Users can view own evaluations" ON evaluations FOR SELECT TO authenticated USING (
  employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  OR evaluator_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('RH', 'MANAGER', 'DG', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Managers can manage evaluations" ON evaluations FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('RH', 'MANAGER', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Users can view evaluation kpis" ON evaluation_kpis FOR SELECT TO authenticated USING (
  evaluation_id IN (
    SELECT id FROM evaluations 
    WHERE employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
    OR evaluator_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('RH', 'MANAGER', 'DG', 'SUPER_ADMIN')
  )
);

CREATE POLICY "Managers can manage evaluation kpis" ON evaluation_kpis FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('RH', 'MANAGER', 'SUPER_ADMIN')
  )
);

-- Système
CREATE POLICY "Users can view alerts" ON alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage alerts" ON alerts FOR ALL TO authenticated USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.code IN ('RH', 'SUPER_ADMIN')
  )
);
