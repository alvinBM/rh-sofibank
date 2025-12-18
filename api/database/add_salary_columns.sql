-- Script pour ajouter les salaires de base aux grades et postes
-- À exécuter avant d'utiliser le module de paie

-- Vérifier et ajouter la colonne base_salary à la table grades
ALTER TABLE `grades` ADD COLUMN IF NOT EXISTS `base_salary` DECIMAL(12,2) DEFAULT 0.00 AFTER `name`;

-- Vérifier et ajouter la colonne base_salary à la table job_positions  
ALTER TABLE `job_positions` ADD COLUMN IF NOT EXISTS `base_salary` DECIMAL(12,2) DEFAULT 0.00 AFTER `title`;

-- Exemples de mise à jour des salaires pour les grades (à adapter selon vos besoins)
-- Décommentez et modifiez selon vos grades existants

/*
UPDATE `grades` SET `base_salary` = 1200000.00 WHERE `code` = 'DG' OR `name` LIKE '%Directeur Général%';
UPDATE `grades` SET `base_salary` = 1000000.00 WHERE `code` = 'DGA' OR `name` LIKE '%Directeur Général Adjoint%';
UPDATE `grades` SET `base_salary` = 800000.00 WHERE `code` = 'DIR' OR `name` LIKE '%Directeur%';
UPDATE `grades` SET `base_salary` = 700000.00 WHERE `code` = 'DIR_ADJ' OR `name` LIKE '%Directeur Adjoint%';
UPDATE `grades` SET `base_salary` = 600000.00 WHERE `code` = 'CHEF_SERV' OR `name` LIKE '%Chef de Service%';
UPDATE `grades` SET `base_salary` = 500000.00 WHERE `code` = 'CHEF_SERV_ADJ' OR `name` LIKE '%Chef de Service Adjoint%';
UPDATE `grades` SET `base_salary` = 400000.00 WHERE `code` = 'CADRE' OR `name` LIKE '%Cadre%';
UPDATE `grades` SET `base_salary` = 350000.00 WHERE `code` = 'AGENT_MAITRISE' OR `name` LIKE '%Agent de Maîtrise%';
UPDATE `grades` SET `base_salary` = 250000.00 WHERE `code` = 'AGENT' OR `name` LIKE '%Agent%';
UPDATE `grades` SET `base_salary` = 200000.00 WHERE `code` = 'AGENT_EXEC' OR `name` LIKE '%Agent d''Exécution%';
*/

-- Exemples de mise à jour des salaires pour les postes (optionnel, si vous préférez gérer par poste)
/*
UPDATE `job_positions` SET `base_salary` = 1200000.00 WHERE `code` = 'DG';
UPDATE `job_positions` SET `base_salary` = 800000.00 WHERE `code` LIKE 'DIR%';
UPDATE `job_positions` SET `base_salary` = 600000.00 WHERE `code` LIKE 'CHEF%';
UPDATE `job_positions` SET `base_salary` = 400000.00 WHERE `title` LIKE '%Cadre%';
UPDATE `job_positions` SET `base_salary` = 250000.00 WHERE `title` LIKE '%Agent%';
*/

-- Vérifier que les salaires ont été ajoutés
SELECT id, name, code, base_salary FROM grades ORDER BY base_salary DESC;
SELECT id, title, code, base_salary FROM job_positions WHERE base_salary > 0 ORDER BY base_salary DESC;

-- Vérifier les employés avec leurs salaires
SELECT 
    e.employee_number,
    e.first_name,
    e.last_name,
    g.name as grade_name,
    g.base_salary as grade_salary,
    jp.title as job_title,
    jp.base_salary as job_salary,
    e.employment_status
FROM employees e
LEFT JOIN grades g ON e.grade_id = g.id
LEFT JOIN job_positions jp ON e.job_position_id = jp.id
WHERE e.employment_status = 'active'
ORDER BY e.employee_number;
