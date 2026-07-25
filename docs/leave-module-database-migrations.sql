-- =============================================================================
-- MODULE CONGÉS - MIGRATIONS BASE DE DONNÉES SUPABASE
-- =============================================================================
-- Ce fichier contient toutes les migrations nécessaires pour le module Congés
-- du SIRH

-- =============================================================================
-- 1. AJOUT DE COLONNES À LA TABLE leave_requests
-- =============================================================================

-- Colonnes pour le workflow et la traçabilité
ALTER TABLE leave_requests
ADD COLUMN IF NOT EXISTS backup_employee_id UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS backup_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS handover_document_url TEXT,
ADD COLUMN IF NOT EXISTS handover_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS supervisor_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS supervisor_comments TEXT,
ADD COLUMN IF NOT EXISTS hr_approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS hr_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS hr_comments TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS rejection_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS workflow_status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0;

-- Créer un index sur workflow_status pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_leave_requests_workflow_status ON leave_requests(workflow_status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_backup_employee ON leave_requests(backup_employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_supervisor ON leave_requests(supervisor_id);

-- Ajouter une contrainte CHECK pour workflow_status
ALTER TABLE leave_requests
DROP CONSTRAINT IF EXISTS chk_workflow_status,
ADD CONSTRAINT chk_workflow_status CHECK (
  workflow_status IN (
    'draft',
    'pending_backup',
    'backup_confirmed',
    'pending_supervisor',
    'pending_hr',
    'pending_dg',
    'approved',
    'rejected',
    'cancelled'
  )
);

-- =============================================================================
-- 2. TABLE POUR LES APPROBATIONS (leave_approvals)
-- =============================================================================

CREATE TABLE IF NOT EXISTS leave_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  level TEXT NOT NULL CHECK (level IN ('backup', 'supervisor', 'hr', 'dg')),
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected')),
  comments TEXT,
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_leave_approvals_request ON leave_approvals(leave_request_id);
CREATE INDEX IF NOT EXISTS idx_leave_approvals_approver ON leave_approvals(approver_id);

-- =============================================================================
-- 3. TABLE POUR LES AJUSTEMENTS DE SOLDE (leave_balance_adjustments)
-- =============================================================================

CREATE TABLE IF NOT EXISTS leave_balance_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_balance_id UUID NOT NULL REFERENCES leave_balances(id) ON DELETE CASCADE,
  adjustment DECIMAL(5, 2) NOT NULL,
  reason TEXT NOT NULL,
  adjusted_by UUID NOT NULL REFERENCES auth.users(id),
  adjusted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_balance_adjustments_balance ON leave_balance_adjustments(leave_balance_id);
CREATE INDEX IF NOT EXISTS idx_balance_adjustments_adjusted_by ON leave_balance_adjustments(adjusted_by);

-- =============================================================================
-- 4. TABLE POUR LES JOURS FÉRIÉS (holidays)
-- =============================================================================

CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requêtes de dates
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(date);
CREATE INDEX IF NOT EXISTS idx_holidays_year ON holidays(year);

-- Insérer les jours fériés français pour 2025 (exemple)
INSERT INTO holidays (date, name, is_recurring, year) VALUES
  ('2025-01-01', 'Jour de l''An', TRUE, 2025),
  ('2025-04-21', 'Lundi de Pâques', FALSE, 2025),
  ('2025-05-01', 'Fête du Travail', TRUE, 2025),
  ('2025-05-08', 'Victoire 1945', TRUE, 2025),
  ('2025-05-29', 'Jeudi de l''Ascension', FALSE, 2025),
  ('2025-06-09', 'Lundi de Pentecôte', FALSE, 2025),
  ('2025-07-14', 'Fête Nationale', TRUE, 2025),
  ('2025-08-15', 'Assomption', TRUE, 2025),
  ('2025-11-01', 'Toussaint', TRUE, 2025),
  ('2025-11-11', 'Armistice 1918', TRUE, 2025),
  ('2025-12-25', 'Noël', TRUE, 2025)
ON CONFLICT (date) DO NOTHING;

-- =============================================================================
-- 5. AJOUT DE COLONNES À LA TABLE leave_balances
-- =============================================================================

ALTER TABLE leave_balances
ADD COLUMN IF NOT EXISTS pending_days DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS carry_forward_days DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_carry_forward_days DECIMAL(5, 2) DEFAULT 0;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_year ON leave_balances(employee_id, year);
CREATE INDEX IF NOT EXISTS idx_leave_balances_leave_type ON leave_balances(leave_type_id);

-- =============================================================================
-- 6. AJOUT DE COLONNES À LA TABLE leave_types
-- =============================================================================

ALTER TABLE leave_types
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS deduct_from_balance BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS requires_medical_certificate BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS max_consecutive_days INTEGER,
ADD COLUMN IF NOT EXISTS min_notice_days INTEGER DEFAULT 0;

-- Créer un index sur le code
CREATE INDEX IF NOT EXISTS idx_leave_types_code ON leave_types(code);

-- =============================================================================
-- 7. FONCTION POUR GÉNÉRER UN NUMÉRO DE DEMANDE
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_leave_request_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_part TEXT;
  sequence_part INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');

  -- Obtenir le prochain numéro de séquence pour l'année
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(request_number FROM 8) AS INTEGER)
  ), 0) + 1
  INTO sequence_part
  FROM leave_requests
  WHERE request_number LIKE 'LV' || year_part || '%';

  -- Formater le numéro: LV-YYYY-NNNN
  new_number := 'LV-' || year_part || '-' || LPAD(sequence_part::TEXT, 4, '0');

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 8. FONCTION POUR CALCULER LES JOURS OUVRABLES
-- =============================================================================

CREATE OR REPLACE FUNCTION calculate_working_days(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS INTEGER AS $$
DECLARE
  working_days INTEGER := 0;
  current_date DATE;
  day_of_week INTEGER;
  is_holiday BOOLEAN;
BEGIN
  current_date := p_start_date;

  WHILE current_date <= p_end_date LOOP
    -- Obtenir le jour de la semaine (0 = dimanche, 6 = samedi)
    day_of_week := EXTRACT(DOW FROM current_date);

    -- Vérifier si c'est un jour férié
    SELECT EXISTS(
      SELECT 1 FROM holidays WHERE date = current_date
    ) INTO is_holiday;

    -- Compter seulement si ce n'est pas un weekend ni un jour férié
    IF day_of_week NOT IN (0, 6) AND NOT is_holiday THEN
      working_days := working_days + 1;
    END IF;

    current_date := current_date + INTERVAL '1 day';
  END LOOP;

  RETURN working_days;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 9. TRIGGER POUR METTRE À JOUR updated_at
-- =============================================================================

-- Fonction générique pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur les tables concernées
DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON leave_requests;
CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leave_approvals_updated_at ON leave_approvals;
CREATE TRIGGER update_leave_approvals_updated_at
  BEFORE UPDATE ON leave_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_holidays_updated_at ON holidays;
CREATE TRIGGER update_holidays_updated_at
  BEFORE UPDATE ON holidays
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 10. TRIGGER POUR CALCULER AUTOMATIQUEMENT LA DURÉE
-- =============================================================================

CREATE OR REPLACE FUNCTION calculate_leave_duration()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculer la durée en jours ouvrables
  IF NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL THEN
    NEW.duration := calculate_working_days(NEW.start_date, NEW.end_date);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_duration_trigger ON leave_requests;
CREATE TRIGGER calculate_duration_trigger
  BEFORE INSERT OR UPDATE OF start_date, end_date ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION calculate_leave_duration();

-- =============================================================================
-- 11. POLITIQUE RLS (ROW LEVEL SECURITY)
-- =============================================================================

-- Activer RLS sur les tables
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balance_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;

-- Politique pour leave_requests: Les employés voient leurs propres demandes
CREATE POLICY "Employees can view own leave requests"
  ON leave_requests FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
    OR
    -- Les RH et managers peuvent voir toutes les demandes
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('Admin', 'RH', 'Manager')
    )
  );

-- Politique pour créer des demandes
CREATE POLICY "Employees can create own leave requests"
  ON leave_requests FOR INSERT
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- Politique pour modifier ses propres demandes en brouillon
CREATE POLICY "Employees can update own draft requests"
  ON leave_requests FOR UPDATE
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
    AND status = 'draft'
  );

-- =============================================================================
-- 12. VUES UTILES
-- =============================================================================

-- Vue pour obtenir un résumé des demandes avec tous les détails
CREATE OR REPLACE VIEW v_leave_requests_summary AS
SELECT
  lr.id,
  lr.request_number,
  lr.employee_id,
  e.first_name || ' ' || e.last_name AS employee_name,
  e.employee_number,
  d.name AS department_name,
  lt.name AS leave_type_name,
  lt.code AS leave_type_code,
  lr.start_date,
  lr.end_date,
  lr.duration,
  lr.status,
  lr.workflow_status,
  lr.reason,
  lr.handover_completed,
  lr.handover_document_url,
  bp.first_name || ' ' || bp.last_name AS backup_person_name,
  sup.first_name || ' ' || sup.last_name AS supervisor_name,
  lr.created_at,
  lr.submitted_at,
  lr.backup_confirmed_at,
  lr.supervisor_approved_at,
  lr.hr_approved_at
FROM leave_requests lr
LEFT JOIN employees e ON lr.employee_id = e.id
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
LEFT JOIN employees bp ON lr.backup_employee_id = bp.id
LEFT JOIN employees sup ON lr.supervisor_id = sup.id;

-- Vue pour les statistiques de soldes
CREATE OR REPLACE VIEW v_leave_balances_summary AS
SELECT
  lb.id,
  lb.employee_id,
  e.first_name || ' ' || e.last_name AS employee_name,
  e.employee_number,
  d.name AS department_name,
  lt.name AS leave_type_name,
  lb.year,
  lb.total_days,
  lb.used_days,
  lb.pending_days,
  (lb.total_days - lb.used_days - lb.pending_days) AS available_days,
  lb.carry_forward_days
FROM leave_balances lb
LEFT JOIN employees e ON lb.employee_id = e.id
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN leave_types lt ON lb.leave_type_id = lt.id;

-- =============================================================================
-- 13. COMMENTAIRES SUR LES TABLES ET COLONNES
-- =============================================================================

COMMENT ON TABLE leave_requests IS 'Table des demandes de congés avec workflow complet';
COMMENT ON COLUMN leave_requests.workflow_status IS 'Statut dans le workflow: draft → pending_backup → backup_confirmed → pending_supervisor → pending_hr → approved';
COMMENT ON COLUMN leave_requests.handover_completed IS 'Feuille de Remise-Reprise complétée (obligatoire avant validation superviseur)';
COMMENT ON COLUMN leave_requests.backup_employee_id IS 'Collaborateur remplaçant (obligatoire)';
COMMENT ON COLUMN leave_requests.duration IS 'Durée en jours ouvrables (calculée automatiquement)';

COMMENT ON TABLE leave_approvals IS 'Historique des approbations pour traçabilité';
COMMENT ON TABLE leave_balance_adjustments IS 'Historique des ajustements manuels de soldes par RH';
COMMENT ON TABLE holidays IS 'Jours fériés pour calcul des jours ouvrables';

-- =============================================================================
-- FIN DES MIGRATIONS
-- =============================================================================
