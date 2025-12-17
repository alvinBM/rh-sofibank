-- =====================================================
-- PATCH ADDITIVE POUR MODULE PARAMETRAGES
-- Ajoute les tables manquantes pour holidays, biometric_devices, system_settings
-- Date: 2025-12-17
-- =====================================================

USE rh_sofibank;

-- =====================================================
-- Table: holidays (Jours fériés)
-- =====================================================
CREATE TABLE IF NOT EXISTS holidays (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  year INT NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_year (year)
) ENGINE=InnoDB;

-- =====================================================
-- Table: biometric_devices (Terminaux biométriques)
-- =====================================================
CREATE TABLE IF NOT EXISTS biometric_devices (
  id CHAR(36) PRIMARY KEY,
  device_name VARCHAR(200) NOT NULL,
  device_code VARCHAR(50) UNIQUE NOT NULL,
  location VARCHAR(200),
  site VARCHAR(100),
  device_type VARCHAR(50) DEFAULT 'fingerprint',
  ip_address VARCHAR(50),
  protocol VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  last_sync DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (device_code),
  INDEX idx_site (site),
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- Table: system_settings (Paramètres système)
-- =====================================================
CREATE TABLE IF NOT EXISTS system_settings (
  id CHAR(36) PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'string',
  module VARCHAR(50),
  description TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (setting_key),
  INDEX idx_module (module)
) ENGINE=InnoDB;

-- =====================================================
-- SEED: Données initiales pour les jours fériés 2024-2025
-- =====================================================
INSERT IGNORE INTO holidays (id, name, date, year, is_recurring, description) VALUES
(UUID(), 'Nouvel An', '2024-01-01', 2024, TRUE, 'Premier jour de l\'année'),
(UUID(), 'Fête du Travail', '2024-05-01', 2024, TRUE, 'Fête internationale du travail'),
(UUID(), 'Fête de l\'Indépendance', '2024-06-30', 2024, TRUE, 'Indépendance de la RDC'),
(UUID(), 'Noël', '2024-12-25', 2024, TRUE, 'Fête de Noël'),
(UUID(), 'Nouvel An', '2025-01-01', 2025, TRUE, 'Premier jour de l\'année'),
(UUID(), 'Fête du Travail', '2025-05-01', 2025, TRUE, 'Fête internationale du travail'),
(UUID(), 'Fête de l\'Indépendance', '2025-06-30', 2025, TRUE, 'Indépendance de la RDC'),
(UUID(), 'Noël', '2025-12-25', 2025, TRUE, 'Fête de Noël');

-- =====================================================
-- SEED: Paramètres système par défaut
-- =====================================================
INSERT IGNORE INTO system_settings (id, setting_key, setting_value, setting_type, module, description) VALUES
(UUID(), 'company_name', 'SOFIBANK', 'string', 'general', 'Nom de l\'entreprise'),
(UUID(), 'default_currency', 'USD', 'string', 'general', 'Devise par défaut'),
(UUID(), 'date_format', 'DD/MM/YYYY', 'string', 'general', 'Format de date par défaut'),
(UUID(), 'working_hours_per_day', '8', 'number', 'attendance', 'Heures de travail par jour'),
(UUID(), 'working_days_per_week', '5', 'number', 'attendance', 'Jours de travail par semaine'),
(UUID(), 'leave_accrual_rate', '2.5', 'number', 'leave', 'Taux d\'accumulation de congés par mois'),
(UUID(), 'probation_period_days', '90', 'number', 'hr', 'Période d\'essai en jours'),
(UUID(), 'max_leave_carryover', '5', 'number', 'leave', 'Nombre max de jours de congés reportables'),
(UUID(), 'payroll_day', '25', 'number', 'payroll', 'Jour de paiement du mois');

-- =====================================================
-- Vérification des permissions pour les nouveaux modules
-- =====================================================
-- Ajouter les permissions si elles n'existent pas déjà
INSERT IGNORE INTO permissions (id, name, code, module, description, created_at) VALUES
(UUID(), 'Gérer les utilisateurs', 'users_manage', 'settings', 'Créer, modifier, supprimer des utilisateurs', NOW()),
(UUID(), 'Gérer les rôles', 'roles_manage', 'settings', 'Créer, modifier, supprimer des rôles et permissions', NOW()),
(UUID(), 'Gérer la structure organisationnelle', 'org_manage', 'settings', 'Gérer directions et services', NOW()),
(UUID(), 'Gérer les grades', 'payroll_settings_manage', 'settings', 'Gérer les grades et rémunérations', NOW()),
(UUID(), 'Gérer les postes', 'positions_manage', 'settings', 'Gérer les postes/fonctions', NOW()),
(UUID(), 'Gérer les jours fériés', 'holidays_manage', 'settings', 'Gérer les jours fériés', NOW()),
(UUID(), 'Gérer les terminaux biométriques', 'attendance_settings_manage', 'settings', 'Gérer les terminaux de pointage', NOW()),
(UUID(), 'Gérer les paramètres système', 'system_settings_manage', 'settings', 'Modifier les paramètres système', NOW()),
(UUID(), 'Accès aux paramètres', 'settings_access', 'settings', 'Accès au module paramètres', NOW());

-- =====================================================
-- Message de fin
-- =====================================================
SELECT 'Patch appliqué avec succès - Tables et données initiales créées' AS message;
