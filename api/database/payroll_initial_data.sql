-- Script pour initialiser les données de base pour le module Payroll
-- À exécuter après la création des tables

-- 1. Créer les types d'éléments de paie
INSERT INTO `payroll_item_types` (`id`, `name`, `code`, `category`, `is_taxable`, `calculation_method`, `is_active`, `display_order`) VALUES
(UUID(), 'Salaire de Base', 'BASE_SALARY', 'earning', 1, 'fixed', 1, 1),
(UUID(), 'Indemnité', 'ALLOWANCE', 'earning', 1, 'variable', 1, 2),
(UUID(), 'Prime/Bonus', 'BONUS', 'earning', 1, 'variable', 1, 3),
(UUID(), 'Heures Supplémentaires', 'OVERTIME', 'earning', 1, 'variable', 1, 4),
(UUID(), 'Commission', 'COMMISSION', 'earning', 1, 'variable', 1, 5),
(UUID(), 'IRPP (Impôt)', 'TAX', 'deduction', 0, 'percentage', 1, 10),
(UUID(), 'INSS (Sécurité Sociale)', 'INSS', 'deduction', 0, 'percentage', 1, 11),
(UUID(), 'Déduction Diverse', 'DEDUCTION', 'deduction', 0, 'variable', 1, 12),
(UUID(), 'Avance sur Salaire', 'ADVANCE', 'deduction', 0, 'variable', 1, 13),
(UUID(), 'Transport', 'TRANSPORT', 'earning', 0, 'fixed', 1, 6),
(UUID(), 'Logement', 'HOUSING', 'earning', 0, 'fixed', 1, 7),
(UUID(), 'Repas', 'MEAL', 'earning', 0, 'fixed', 1, 8);

-- 2. Créer les paramètres de paie par défaut
INSERT INTO `payroll_settings` (`id`, `effective_date`, `irpp_rate`, `inss_rate`, `pay_frequency`, `payment_day`, `currency`, `is_active`) VALUES
(UUID(), CURDATE(), 30.00, 5.00, 'monthly', 24, 'CDF', 1);

-- 3. Mettre à jour les grades avec des salaires de base (si la colonne existe)
-- Si vous n'avez pas encore de colonne base_salary dans la table grades, ajoutez-la d'abord:
-- ALTER TABLE `grades` ADD COLUMN `base_salary` DECIMAL(12,2) DEFAULT 0.00 AFTER `name`;

-- Exemple de mise à jour des salaires (à adapter selon vos grades)
-- UPDATE `grades` SET `base_salary` = 800000.00 WHERE `code` = 'DIR';
-- UPDATE `grades` SET `base_salary` = 600000.00 WHERE `code` = 'CHEF_SERV';
-- UPDATE `grades` SET `base_salary` = 400000.00 WHERE `code` = 'CADRE';
-- UPDATE `grades` SET `base_salary` = 250000.00 WHERE `code` = 'AGENT';

-- 4. Créer un exemple de période de paie (optionnel - pour test)
-- INSERT INTO `payroll_periods` (`id`, `period_name`, `year`, `month`, `start_date`, `end_date`, `payment_date`, `status`) VALUES
-- (UUID(), 'Paie Décembre 2025', 2025, 12, '2025-12-01', '2025-12-31', '2025-12-24', 'draft');
