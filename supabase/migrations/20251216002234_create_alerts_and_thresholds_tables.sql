/*
  # Création des tables d'alertes RH et seuils
  
  ## Description
  Création des tables pour le système d'alertes RH automatiques et la gestion
  des seuils configurables.
  
  ## Nouvelles tables
  - `hr_alerts` : Alertes RH générées automatiquement ou manuellement
    - Colonnes: id, alert_type, title, message, severity, status, threshold_value, 
      actual_value, metadata, acknowledged_by, acknowledged_at, resolved_by, 
      resolved_at, resolution, created_at
      
  - `alert_thresholds` : Configuration des seuils pour génération automatique d'alertes
    - Colonnes: id, alert_type, threshold_value, comparison_operator, severity,
      description, is_active, check_frequency, last_checked_at, created_at, updated_at
  
  ## Fonctions
  - `get_alert_counts()` : Retourne le nombre d'alertes par type et sévérité
  - `check_and_generate_alerts()` : Vérifie et génère les alertes automatiques
  
  ## Sécurité
  - RLS activé sur toutes les tables
  - Policies pour RH et Admin uniquement
*/

-- =====================================================
-- TABLE HR_ALERTS
-- =====================================================

CREATE TABLE IF NOT EXISTS hr_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL CHECK (alert_type IN (
    'absence_rate',
    'turnover_rate',
    'leave_request_pending',
    'contract_expiring',
    'document_expiring',
    'performance_review_due',
    'probation_ending',
    'birthday',
    'work_anniversary',
    'overtime_exceeded',
    'late_arrival_pattern',
    'payroll_error',
    'budget_exceeded',
    'recruitment_delayed',
    'training_due',
    'custom'
  )),
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical', 'urgent')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  
  threshold_value numeric,
  actual_value numeric,
  
  metadata jsonb DEFAULT '{}',
  
  employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  related_record_id uuid,
  related_table_name text,
  
  acknowledged_by uuid REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at timestamptz,
  
  resolved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  resolution text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- TABLE ALERT_THRESHOLDS
-- =====================================================

CREATE TABLE IF NOT EXISTS alert_thresholds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL UNIQUE,
  threshold_value numeric NOT NULL,
  comparison_operator text NOT NULL DEFAULT '>=' CHECK (comparison_operator IN ('>', '>=', '<', '<=', '=', '!=')),
  severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical', 'urgent')),
  
  title_template text NOT NULL,
  message_template text NOT NULL,
  
  description text,
  is_active boolean DEFAULT true,
  
  check_frequency text DEFAULT 'daily' CHECK (check_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'monthly')),
  last_checked_at timestamptz,
  
  notify_roles text[] DEFAULT ARRAY['RH', 'ADMIN'],
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_hr_alerts_type ON hr_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_hr_alerts_severity ON hr_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_hr_alerts_status ON hr_alerts(status);
CREATE INDEX IF NOT EXISTS idx_hr_alerts_employee_id ON hr_alerts(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_alerts_created_at ON hr_alerts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alert_thresholds_type ON alert_thresholds(alert_type);
CREATE INDEX IF NOT EXISTS idx_alert_thresholds_active ON alert_thresholds(is_active);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE hr_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_thresholds ENABLE ROW LEVEL SECURITY;

-- Policies pour hr_alerts
CREATE POLICY "RH and Admin can view all alerts"
  ON hr_alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

CREATE POLICY "RH and Admin can manage alerts"
  ON hr_alerts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

-- Policies pour alert_thresholds
CREATE POLICY "RH and Admin can view thresholds"
  ON alert_thresholds FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

CREATE POLICY "Only Admin can manage thresholds"
  ON alert_thresholds FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_hr_alerts_updated_at BEFORE UPDATE ON hr_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_thresholds_updated_at BEFORE UPDATE ON alert_thresholds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FONCTIONS
-- =====================================================

-- Fonction pour obtenir le nombre d'alertes par type et sévérité
CREATE OR REPLACE FUNCTION get_alert_counts()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  total_active integer;
  by_type jsonb;
  by_severity jsonb;
BEGIN
  -- Compter le total d'alertes actives
  SELECT COUNT(*)::integer INTO total_active
  FROM hr_alerts
  WHERE status = 'active';
  
  -- Compter par type
  SELECT jsonb_object_agg(alert_type, count) INTO by_type
  FROM (
    SELECT alert_type, COUNT(*)::integer as count
    FROM hr_alerts
    WHERE status = 'active'
    GROUP BY alert_type
  ) t;
  
  -- Compter par sévérité
  SELECT jsonb_object_agg(severity, count) INTO by_severity
  FROM (
    SELECT severity, COUNT(*)::integer as count
    FROM hr_alerts
    WHERE status = 'active'
    GROUP BY severity
  ) s;
  
  -- Construire le résultat
  result := jsonb_build_object(
    'total_active', COALESCE(total_active, 0),
    'by_type', COALESCE(by_type, '{}'::jsonb),
    'by_severity', COALESCE(by_severity, '{}'::jsonb)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier et générer les alertes automatiques
CREATE OR REPLACE FUNCTION check_and_generate_alerts()
RETURNS jsonb AS $$
DECLARE
  generated_count integer := 0;
  alert_record record;
  threshold_record record;
BEGIN
  -- Vérifier les contrats expirant dans 30 jours
  FOR alert_record IN
    SELECT e.id as employee_id, e.first_name, e.last_name, ec.end_date
    FROM employees e
    JOIN employee_contracts ec ON ec.employee_id = e.id
    WHERE ec.is_current = true
    AND ec.end_date IS NOT NULL
    AND ec.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    AND NOT EXISTS (
      SELECT 1 FROM hr_alerts
      WHERE alert_type = 'contract_expiring'
      AND employee_id = e.id
      AND status IN ('active', 'acknowledged')
      AND created_at > CURRENT_DATE - INTERVAL '7 days'
    )
  LOOP
    INSERT INTO hr_alerts (alert_type, title, message, severity, status, employee_id, metadata)
    VALUES (
      'contract_expiring',
      'Contrat arrivant à expiration',
      'Le contrat de ' || alert_record.first_name || ' ' || alert_record.last_name || ' expire le ' || alert_record.end_date,
      'warning',
      'active',
      alert_record.employee_id,
      jsonb_build_object('end_date', alert_record.end_date)
    );
    generated_count := generated_count + 1;
  END LOOP;
  
  -- Vérifier les demandes de congés en attente depuis plus de 3 jours
  FOR alert_record IN
    SELECT lr.id, e.first_name, e.last_name, lr.submitted_at
    FROM leave_requests lr
    JOIN employees e ON e.id = lr.employee_id
    WHERE lr.status IN ('pending_supervisor', 'pending_hr', 'pending_dg')
    AND lr.submitted_at < CURRENT_TIMESTAMP - INTERVAL '3 days'
    AND NOT EXISTS (
      SELECT 1 FROM hr_alerts
      WHERE alert_type = 'leave_request_pending'
      AND related_record_id = lr.id
      AND status IN ('active', 'acknowledged')
    )
  LOOP
    INSERT INTO hr_alerts (alert_type, title, message, severity, status, related_record_id, related_table_name, metadata)
    VALUES (
      'leave_request_pending',
      'Demande de congé en attente',
      'Demande de congé de ' || alert_record.first_name || ' ' || alert_record.last_name || ' en attente depuis ' || 
      EXTRACT(DAY FROM CURRENT_TIMESTAMP - alert_record.submitted_at) || ' jours',
      'warning',
      'active',
      alert_record.id,
      'leave_requests',
      jsonb_build_object('submitted_at', alert_record.submitted_at)
    );
    generated_count := generated_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object('generated_alerts', generated_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DONNÉES INITIALES - SEUILS PAR DÉFAUT
-- =====================================================

INSERT INTO alert_thresholds (alert_type, threshold_value, comparison_operator, severity, title_template, message_template, description, check_frequency)
VALUES
  ('absence_rate', 10, '>=', 'warning', 'Taux d''absence élevé', 'Le taux d''absence a atteint {actual_value}% (seuil: {threshold_value}%)', 'Alerte sur taux d''absence supérieur à 10%', 'daily'),
  ('turnover_rate', 15, '>=', 'critical', 'Taux de rotation élevé', 'Le taux de rotation a atteint {actual_value}% (seuil: {threshold_value}%)', 'Alerte sur taux de rotation supérieur à 15%', 'monthly'),
  ('overtime_exceeded', 20, '>=', 'warning', 'Heures supplémentaires excessives', 'Un employé a effectué {actual_value}h supplémentaires (seuil: {threshold_value}h)', 'Alerte sur heures supplémentaires dépassant 20h/mois', 'monthly'),
  ('contract_expiring', 30, '<=', 'warning', 'Contrat arrivant à expiration', 'Contrat expirant dans {actual_value} jours', 'Alerte 30 jours avant expiration contrat', 'daily'),
  ('performance_review_due', 0, '<=', 'info', 'Évaluation de performance due', 'Évaluation de performance à réaliser', 'Alerte pour évaluations en retard', 'weekly'),
  ('probation_ending', 15, '<=', 'warning', 'Fin de période d''essai', 'Période d''essai se termine dans {actual_value} jours', 'Alerte 15 jours avant fin période essai', 'daily'),
  ('budget_exceeded', 100, '>=', 'critical', 'Budget dépassé', 'Budget dépassé de {actual_value}%', 'Alerte sur dépassement budget', 'weekly'),
  ('recruitment_delayed', 30, '>=', 'warning', 'Recrutement en retard', 'Processus de recrutement en cours depuis {actual_value} jours', 'Alerte sur processus recrutement long', 'weekly')
ON CONFLICT (alert_type) DO UPDATE SET
  threshold_value = EXCLUDED.threshold_value,
  comparison_operator = EXCLUDED.comparison_operator,
  severity = EXCLUDED.severity,
  title_template = EXCLUDED.title_template,
  message_template = EXCLUDED.message_template,
  description = EXCLUDED.description,
  check_frequency = EXCLUDED.check_frequency;