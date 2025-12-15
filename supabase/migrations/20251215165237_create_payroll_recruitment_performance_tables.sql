/*
  # Tables Paie, Recrutement et Performance 360°
  
  1. Module Paie
    - `payroll_periods` : Périodes de paie
    - `payroll_items` : Éléments de paie (fixes/variables)
    - `payslips` : Bulletins de paie
    - `payslip_items` : Détails des bulletins
  
  2. Module Recrutement
    - `job_openings` : Postes vacants
    - `candidates` : Candidats
    - `candidate_evaluations` : Évaluations candidats
    - `job_offers` : Offres d'emploi
  
  3. Module Performance 360°
    - `performance_cycles` : Cycles d'évaluation
    - `kpis` : KPIs par fonction
    - `performance_evaluations` : Évaluations
    - `evaluation_responses` : Réponses aux KPIs
    - `pip_plans` : Plans d'amélioration (PIP)
*/

-- =====================================================
-- MODULE PAIE
-- =====================================================

-- Table des périodes de paie
CREATE TABLE IF NOT EXISTS payroll_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  payment_date date NOT NULL,
  status text CHECK (status IN ('draft', 'in_progress', 'validated', 'paid', 'closed')) DEFAULT 'draft',
  total_gross_amount decimal(15,2) DEFAULT 0,
  total_net_amount decimal(15,2) DEFAULT 0,
  total_tax_amount decimal(15,2) DEFAULT 0,
  processed_by uuid REFERENCES auth.users(id),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(start_date, end_date)
);

-- Table des types d'éléments de paie
CREATE TABLE IF NOT EXISTS payroll_item_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  category text CHECK (category IN ('salary', 'allowance', 'bonus', 'deduction', 'tax', 'other')) NOT NULL,
  is_taxable boolean DEFAULT true,
  calculation_method text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des bulletins de paie
CREATE TABLE IF NOT EXISTS payslips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_number text UNIQUE NOT NULL,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  payroll_period_id uuid REFERENCES payroll_periods(id) ON DELETE CASCADE NOT NULL,
  
  -- Montants
  base_salary decimal(12,2) NOT NULL,
  gross_salary decimal(12,2) NOT NULL,
  total_allowances decimal(12,2) DEFAULT 0,
  total_bonuses decimal(12,2) DEFAULT 0,
  total_deductions decimal(12,2) DEFAULT 0,
  taxable_amount decimal(12,2) DEFAULT 0,
  tax_amount decimal(12,2) DEFAULT 0,
  net_salary decimal(12,2) NOT NULL,
  
  -- Informations paiement
  payment_method text CHECK (payment_method IN ('bank_transfer', 'cash', 'cheque')) DEFAULT 'bank_transfer',
  payment_date date,
  payment_reference text,
  
  -- Statut et distribution
  status text CHECK (status IN ('draft', 'validated', 'paid', 'sent')) DEFAULT 'draft',
  sent_at timestamptz,
  pdf_url text,
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, payroll_period_id)
);

-- Table des lignes de bulletin
CREATE TABLE IF NOT EXISTS payslip_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_id uuid REFERENCES payslips(id) ON DELETE CASCADE NOT NULL,
  item_type_id uuid REFERENCES payroll_item_types(id) NOT NULL,
  description text NOT NULL,
  quantity decimal(10,2) DEFAULT 1,
  rate decimal(12,2),
  amount decimal(12,2) NOT NULL,
  is_taxable boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- MODULE RECRUTEMENT
-- =====================================================

-- Table des postes vacants
CREATE TABLE IF NOT EXISTS job_openings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number text UNIQUE NOT NULL,
  job_position_id uuid REFERENCES job_positions(id) NOT NULL,
  direction_id uuid REFERENCES directions(id) NOT NULL,
  service_id uuid REFERENCES services(id),
  grade_id uuid REFERENCES grades(id),
  
  title text NOT NULL,
  description text NOT NULL,
  requirements text[],
  responsibilities text[],
  number_of_positions integer DEFAULT 1,
  employment_type text CHECK (employment_type IN ('permanent', 'temporary', 'intern', 'consultant')) DEFAULT 'permanent',
  salary_range_min decimal(12,2),
  salary_range_max decimal(12,2),
  
  -- Dates
  opening_date date DEFAULT CURRENT_DATE,
  closing_date date,
  expected_start_date date,
  
  -- Publication
  is_published boolean DEFAULT false,
  published_at timestamptz,
  publish_on_website boolean DEFAULT true,
  publish_on_social_media boolean DEFAULT false,
  
  status text CHECK (status IN ('draft', 'open', 'closed', 'filled', 'cancelled')) DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des candidats
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_number text UNIQUE NOT NULL,
  job_opening_id uuid REFERENCES job_openings(id) ON DELETE CASCADE NOT NULL,
  
  -- Informations personnelles
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  date_of_birth date,
  nationality text,
  
  -- Documents
  cv_url text,
  cover_letter_url text,
  other_documents_urls text[],
  
  -- Statut candidature
  status text CHECK (status IN ('new', 'screening', 'interview_scheduled', 'interviewed', 'shortlisted', 'offer_made', 'hired', 'rejected', 'withdrawn')) DEFAULT 'new',
  application_date date DEFAULT CURRENT_DATE,
  
  -- Notes et évaluations
  screening_notes text,
  overall_score decimal(5,2),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des entretiens
CREATE TABLE IF NOT EXISTS candidate_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
  interview_type text CHECK (interview_type IN ('phone', 'video', 'in_person', 'technical', 'panel')) NOT NULL,
  scheduled_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  location text,
  meeting_link text,
  interviewers uuid[] NOT NULL,
  status text CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Table des évaluations candidats
CREATE TABLE IF NOT EXISTS candidate_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
  interview_id uuid REFERENCES candidate_interviews(id),
  evaluator_id uuid REFERENCES auth.users(id) NOT NULL,
  
  -- Critères d'évaluation (échelle 1-5)
  technical_skills decimal(3,2),
  communication_skills decimal(3,2),
  problem_solving decimal(3,2),
  teamwork decimal(3,2),
  cultural_fit decimal(3,2),
  motivation decimal(3,2),
  overall_score decimal(3,2),
  
  comments text,
  recommendation text CHECK (recommendation IN ('strongly_recommend', 'recommend', 'neutral', 'not_recommend', 'strongly_not_recommend')),
  
  created_at timestamptz DEFAULT now()
);

-- Table des offres d'emploi
CREATE TABLE IF NOT EXISTS job_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_number text UNIQUE NOT NULL,
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
  job_opening_id uuid REFERENCES job_openings(id) NOT NULL,
  
  job_title text NOT NULL,
  salary decimal(12,2) NOT NULL,
  benefits jsonb,
  start_date date NOT NULL,
  contract_type text NOT NULL,
  
  status text CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'expired')) DEFAULT 'draft',
  sent_at timestamptz,
  response_deadline date,
  accepted_at timestamptz,
  declined_reason text,
  
  offer_letter_url text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- MODULE PERFORMANCE 360°
-- =====================================================

-- Table des cycles d'évaluation
CREATE TABLE IF NOT EXISTS performance_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_name text NOT NULL,
  year integer NOT NULL,
  quarter integer CHECK (quarter IN (1, 2, 3, 4)),
  cycle_type text CHECK (cycle_type IN ('T1', 'T2', 'T3', 'T4')) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  kpi_review_deadline date,
  self_evaluation_deadline date,
  manager_evaluation_deadline date,
  hr_validation_deadline date,
  status text CHECK (status IN ('draft', 'kpi_review', 'self_evaluation', 'manager_evaluation', 'hr_validation', 'completed', 'closed')) DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(year, cycle_type)
);

-- Table des KPIs
CREATE TABLE IF NOT EXISTS kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  job_position_id uuid REFERENCES job_positions(id),
  direction_id uuid REFERENCES directions(id),
  service_id uuid REFERENCES services(id),
  category text NOT NULL,
  measurement_scale text NOT NULL,
  target_value decimal(10,2),
  weight_percentage decimal(5,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Table des évaluations de performance
CREATE TABLE IF NOT EXISTS performance_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_number text UNIQUE NOT NULL,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  cycle_id uuid REFERENCES performance_cycles(id) NOT NULL,
  
  -- Scores
  self_evaluation_score decimal(5,2),
  manager_evaluation_score decimal(5,2),
  peer_evaluation_score decimal(5,2),
  subordinate_evaluation_score decimal(5,2),
  final_score decimal(5,2),
  
  -- Rating (échelle 10-100)
  rating decimal(5,2),
  rating_label text CHECK (rating_label IN ('very_poor', 'poor', 'average', 'satisfactory', 'very_satisfactory', 'excellent')),
  
  -- Workflow
  status text CHECK (status IN ('draft', 'self_eval_pending', 'manager_eval_pending', 'peer_eval_pending', 'hr_review', 'dg_approval', 'completed')) DEFAULT 'draft',
  
  -- Recommandations
  recommended_for_leadership boolean DEFAULT false,
  recommended_for_promotion boolean DEFAULT false,
  recommended_for_training boolean DEFAULT false,
  training_needs text[],
  
  -- Dates
  self_evaluation_submitted_at timestamptz,
  manager_evaluation_submitted_at timestamptz,
  hr_validated_at timestamptz,
  dg_approved_at timestamptz,
  completed_at timestamptz,
  
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, cycle_id)
);

-- Table des réponses aux KPIs
CREATE TABLE IF NOT EXISTS evaluation_kpi_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id uuid REFERENCES performance_evaluations(id) ON DELETE CASCADE NOT NULL,
  kpi_id uuid REFERENCES kpis(id) NOT NULL,
  evaluator_type text CHECK (evaluator_type IN ('self', 'manager', 'peer', 'subordinate')) NOT NULL,
  evaluator_id uuid REFERENCES auth.users(id),
  
  score decimal(5,2),
  weight decimal(5,2),
  achievement_description text,
  key_success_factors text,
  
  created_at timestamptz DEFAULT now()
);

-- Table des plans d'amélioration (PIP)
CREATE TABLE IF NOT EXISTS pip_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pip_number text UNIQUE NOT NULL,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  evaluation_id uuid REFERENCES performance_evaluations(id),
  
  start_date date NOT NULL,
  end_date date NOT NULL,
  
  performance_issues text[] NOT NULL,
  improvement_goals jsonb NOT NULL,
  action_plan jsonb NOT NULL,
  support_provided text,
  
  status text CHECK (status IN ('active', 'on_track', 'needs_attention', 'completed_success', 'completed_failure', 'terminated')) DEFAULT 'active',
  
  -- Revues
  review_frequency text DEFAULT 'weekly',
  last_review_date date,
  next_review_date date,
  review_notes text,
  
  outcome text,
  completed_at timestamptz,
  
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Paie
CREATE INDEX IF NOT EXISTS idx_payslips_employee_id ON payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_period_id ON payslips(payroll_period_id);
CREATE INDEX IF NOT EXISTS idx_payslips_status ON payslips(status);

-- Recrutement
CREATE INDEX IF NOT EXISTS idx_candidates_job_opening_id ON candidates(job_opening_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_job_openings_status ON job_openings(status);

-- Performance
CREATE INDEX IF NOT EXISTS idx_performance_evaluations_employee_id ON performance_evaluations(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_evaluations_cycle_id ON performance_evaluations(cycle_id);
CREATE INDEX IF NOT EXISTS idx_performance_evaluations_status ON performance_evaluations(status);
CREATE INDEX IF NOT EXISTS idx_pip_plans_employee_id ON pip_plans(employee_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Paie : accès très restreint
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_item_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslip_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only Finance and RH can view payroll"
  ON payslips FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'FINANCE')
    )
    OR
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = payslips.employee_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Only Finance can manage payroll"
  ON payslips FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'FINANCE')
    )
  );

-- Recrutement
ALTER TABLE job_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RH and recruiters can view recruitment"
  ON candidates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'RECRUITER')
    )
  );

-- Performance
ALTER TABLE performance_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_kpi_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pip_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their own evaluations"
  ON performance_evaluations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = performance_evaluations.employee_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "RH can view all evaluations"
  ON performance_evaluations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH')
    )
  );

CREATE POLICY "Managers can view team evaluations"
  ON performance_evaluations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees emp
      JOIN employees mgr ON mgr.id = emp.direct_supervisor_id
      WHERE mgr.user_id = auth.uid()
      AND emp.id = performance_evaluations.employee_id
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_payroll_periods_updated_at BEFORE UPDATE ON payroll_periods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payslips_updated_at BEFORE UPDATE ON payslips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_openings_updated_at BEFORE UPDATE ON job_openings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_evaluations_updated_at BEFORE UPDATE ON performance_evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pip_plans_updated_at BEFORE UPDATE ON pip_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
