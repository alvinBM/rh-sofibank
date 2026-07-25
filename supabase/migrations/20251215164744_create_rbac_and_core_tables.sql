/*
  # Schéma de base SIRH - RBAC et Tables Principales
  
  1. Tables RBAC (Role-Based Access Control)
    - `roles` : Rôles système (Super Admin, RH, Manager, Employé, etc.)
    - `permissions` : Permissions granulaires (code unique)
    - `role_permissions` : Liaison rôles-permissions
    - `user_roles` : Attribution des rôles aux utilisateurs
    - `audit_logs` : Traçabilité des actions
  
  2. Tables Structure Organisationnelle
    - `directions` : Directions de la banque
    - `services` : Services par direction
    - `grades` : Grades hiérarchiques
    - `job_positions` : Postes/fonctions
  
  3. Tables Système
    - `system_settings` : Paramètres système
    - `holidays` : Jours fériés
    - `notifications` : Notifications utilisateurs
  
  4. Security
    - RLS activé sur toutes les tables
    - Policies basées sur rôles et permissions
*/

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- RBAC TABLES
-- =====================================================

-- Table des rôles
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des permissions
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  module text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Table de liaison rôles-permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Table d'attribution des rôles aux utilisateurs
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Table des logs d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- STRUCTURE ORGANISATIONNELLE
-- =====================================================

-- Table des directions
CREATE TABLE IF NOT EXISTS directions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  director_id uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des services
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  direction_id uuid REFERENCES directions(id) ON DELETE CASCADE NOT NULL,
  manager_id uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(direction_id, code)
);

-- Table des grades
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  level integer NOT NULL,
  base_salary decimal(12,2) DEFAULT 0,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des avantages par grade
CREATE TABLE IF NOT EXISTS grade_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id uuid REFERENCES grades(id) ON DELETE CASCADE NOT NULL,
  benefit_name text NOT NULL,
  benefit_amount decimal(12,2) DEFAULT 0,
  benefit_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des postes/fonctions
CREATE TABLE IF NOT EXISTS job_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  code text UNIQUE NOT NULL,
  description text,
  required_skills text[],
  responsibilities text[],
  grade_id uuid REFERENCES grades(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- SYSTÈME
-- =====================================================

-- Table des paramètres système
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  category text NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Table des jours fériés
CREATE TABLE IF NOT EXISTS holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date date NOT NULL,
  year integer NOT NULL,
  is_recurring boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date)
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_services_direction_id ON services(direction_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE directions ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies pour roles (lecture: tous authentifiés, écriture: admin)
CREATE POLICY "Authenticated users can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Policies pour permissions
CREATE POLICY "Authenticated users can view permissions"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

-- Policies pour user_roles
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all user roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

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

-- Policies pour notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies pour audit_logs (lecture seule pour admins)
CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Policies pour directions (lecture: tous, écriture: RH/Admin)
CREATE POLICY "Authenticated users can view directions"
  ON directions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "RH and admins can manage directions"
  ON directions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN', 'RH')
    )
  );

-- Policies similaires pour services, grades, etc.
CREATE POLICY "Authenticated users can view services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view grades"
  ON grades FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view job_positions"
  ON job_positions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view holidays"
  ON holidays FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour vérifier si un utilisateur a une permission
CREATE OR REPLACE FUNCTION has_permission(user_id_param uuid, permission_code_param text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = user_id_param
    AND p.code = permission_code_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur a un rôle
CREATE OR REPLACE FUNCTION has_role(user_id_param uuid, role_code_param text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = user_id_param
    AND r.code = role_code_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_directions_updated_at BEFORE UPDATE ON directions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_positions_updated_at BEFORE UPDATE ON job_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
