-- =================================================================
-- SEEDER COMPLET POUR TOUS LES EMPLOYÉS
-- Inclut: Documents, Congés, Historique de Paiement, Présences
-- =================================================================

USE rh_sofibank;

-- =================================================================
-- 1. TYPES DE DOCUMENTS
-- =================================================================

INSERT INTO document_types (id, name, code, description, is_active, created_at) VALUES
(UUID(), 'Contrat de travail', 'contract', 'Contrat de travail signé', TRUE, NOW()),
(UUID(), 'Carte d\'identité', 'id_card', 'Carte nationale d\'identité', TRUE, NOW()),
(UUID(), 'Diplôme', 'diploma', 'Diplôme académique', TRUE, NOW()),
(UUID(), 'Certificat', 'certificate', 'Certificat professionnel', TRUE, NOW()),
(UUID(), 'Attestation de service', 'attestation_service', 'Attestation de service', TRUE, NOW()),
(UUID(), 'Attestation de congé', 'attestation_conge', 'Attestation de congé', TRUE, NOW()),
(UUID(), 'Évaluation', 'evaluation', 'Fiche d\'évaluation', TRUE, NOW()),
(UUID(), 'Passeport', 'passport', 'Passeport', TRUE, NOW()),
(UUID(), 'Acte de naissance', 'birth_certificate', 'Acte de naissance', TRUE, NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =================================================================
-- 2. DOCUMENTS EMPLOYÉS (Pour chaque employé)
-- =================================================================

-- Pour Jean MUKENDI (EMP001)
INSERT INTO employee_documents (id, employee_id, document_type_id, document_name, document_url, file_size, mime_type, upload_date, expiry_date, is_verified, notes, created_at) 
SELECT 
    UUID(),
    '5b955e09-abd5-48e3-8582-86f0c27584c6',
    dt.id,
    CASE dt.code
        WHEN 'contract' THEN 'Contrat CDI - MUKENDI Jean.pdf'
        WHEN 'id_card' THEN 'CNI - MUKENDI Jean.pdf'
        WHEN 'diploma' THEN 'Licence en Gestion - MUKENDI.pdf'
        WHEN 'attestation_service' THEN 'Attestation Service 2024 - MUKENDI.pdf'
    END,
    CONCAT('/uploads/documents/', UUID(), '.pdf'),
    FLOOR(RAND() * 500000) + 100000,
    'application/pdf',
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY),
    CASE dt.code
        WHEN 'id_card' THEN DATE_ADD(NOW(), INTERVAL 2 YEAR)
        WHEN 'passport' THEN DATE_ADD(NOW(), INTERVAL 5 YEAR)
        ELSE NULL
    END,
    TRUE,
    'Document vérifié et validé',
    NOW()
FROM document_types dt
WHERE dt.code IN ('contract', 'id_card', 'diploma', 'attestation_service');

-- Pour Marie KABAMBA (EMP002) - Responsable RH
INSERT INTO employee_documents (id, employee_id, document_type_id, document_name, document_url, file_size, mime_type, upload_date, is_verified, notes, created_at)
SELECT 
    UUID(),
    'e25d7090-5b10-4b35-84f1-6bcf5ecbf78b',
    dt.id,
    CASE dt.code
        WHEN 'contract' THEN 'Contrat CDI - KABAMBA Marie.pdf'
        WHEN 'id_card' THEN 'CNI - KABAMBA Marie.pdf'
        WHEN 'diploma' THEN 'Master RH - KABAMBA.pdf'
        WHEN 'certificate' THEN 'Certification GPEC - KABAMBA.pdf'
        WHEN 'attestation_service' THEN 'Attestation Service 2024 - KABAMBA.pdf'
    END,
    CONCAT('/uploads/documents/', UUID(), '.pdf'),
    FLOOR(RAND() * 500000) + 100000,
    'application/pdf',
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY),
    TRUE,
    'Document vérifié',
    NOW()
FROM document_types dt
WHERE dt.code IN ('contract', 'id_card', 'diploma', 'certificate', 'attestation_service');

-- Pour Pierre MBUYI (EMP003) - Superviseur
INSERT INTO employee_documents (id, employee_id, document_type_id, document_name, document_url, file_size, mime_type, upload_date, is_verified, created_at)
SELECT 
    UUID(),
    '327b9287-4582-41f4-ba1c-d7efe42e532b',
    dt.id,
    CASE dt.code
        WHEN 'contract' THEN 'Contrat CDI - MBUYI Pierre.pdf'
        WHEN 'id_card' THEN 'CNI - MBUYI Pierre.pdf'
        WHEN 'diploma' THEN 'Licence Commerce - MBUYI.pdf'
        WHEN 'evaluation' THEN 'Evaluation 2024 - MBUYI.pdf'
    END,
    CONCAT('/uploads/documents/', UUID(), '.pdf'),
    FLOOR(RAND() * 500000) + 100000,
    'application/pdf',
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY),
    TRUE,
    NOW()
FROM document_types dt
WHERE dt.code IN ('contract', 'id_card', 'diploma', 'evaluation');

-- Pour Sarah TSHALA (EMP004)
INSERT INTO employee_documents (id, employee_id, document_type_id, document_name, document_url, file_size, mime_type, upload_date, is_verified, created_at)
SELECT 
    UUID(),
    '02eb09b2-7ebb-45fd-8d3b-e93d3da8bdfa',
    dt.id,
    CASE dt.code
        WHEN 'contract' THEN 'Contrat CDI - TSHALA Sarah.pdf'
        WHEN 'id_card' THEN 'CNI - TSHALA Sarah.pdf'
        WHEN 'diploma' THEN 'Licence Economie - TSHALA.pdf'
    END,
    CONCAT('/uploads/documents/', UUID(), '.pdf'),
    FLOOR(RAND() * 500000) + 100000,
    'application/pdf',
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY),
    TRUE,
    NOW()
FROM document_types dt
WHERE dt.code IN ('contract', 'id_card', 'diploma');

-- Pour David KALALA (EMP005)
INSERT INTO employee_documents (id, employee_id, document_type_id, document_name, document_url, file_size, mime_type, upload_date, is_verified, created_at)
SELECT 
    UUID(),
    '8abb2629-1317-4d21-a1dd-016570983080',
    dt.id,
    CASE dt.code
        WHEN 'contract' THEN 'Contrat CDI - KALALA David.pdf'
        WHEN 'id_card' THEN 'CNI - KALALA David.pdf'
        WHEN 'diploma' THEN 'Licence Finance - KALALA.pdf'
        WHEN 'attestation_conge' THEN 'Attestation Congé 2023 - KALALA.pdf'
    END,
    CONCAT('/uploads/documents/', UUID(), '.pdf'),
    FLOOR(RAND() * 500000) + 100000,
    'application/pdf',
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY),
    TRUE,
    NOW()
FROM document_types dt
WHERE dt.code IN ('contract', 'id_card', 'diploma', 'attestation_conge');

-- Pour Grace MULAMBA (EMP006)
INSERT INTO employee_documents (id, employee_id, document_type_id, document_name, document_url, file_size, mime_type, upload_date, is_verified, created_at)
SELECT 
    UUID(),
    'bdb082b7-c5cc-4059-bcf4-e680c8d016d5',
    dt.id,
    CASE dt.code
        WHEN 'contract' THEN 'Contrat CDI - MULAMBA Grace.pdf'
        WHEN 'id_card' THEN 'CNI - MULAMBA Grace.pdf'
        WHEN 'diploma' THEN 'Licence Informatique - MULAMBA.pdf'
    END,
    CONCAT('/uploads/documents/', UUID(), '.pdf'),
    FLOOR(RAND() * 500000) + 100000,
    'application/pdf',
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 365) DAY),
    TRUE,
    NOW()
FROM document_types dt
WHERE dt.code IN ('contract', 'id_card', 'diploma');

-- =================================================================
-- 3. PÉRIODES DE PAIE
-- =================================================================

-- Créer les périodes de paie pour 2024 et 2025
INSERT INTO payroll_periods (id, period_name, year, month, start_date, end_date, payment_date, status, total_employees, total_gross_amount, total_net_amount, total_tax_amount, total_deductions, processed_at, approved_at, created_at) VALUES
(UUID(), 'Janvier 2024', 2024, 1, '2024-01-01', '2024-01-31', '2024-01-25', 'paid', 6, 12000000, 9600000, 1800000, 600000, '2024-01-20 10:00:00', '2024-01-22 14:00:00', '2024-01-05'),
(UUID(), 'Février 2024', 2024, 2, '2024-02-01', '2024-02-29', '2024-02-26', 'paid', 6, 12000000, 9600000, 1800000, 600000, '2024-02-20 10:00:00', '2024-02-22 14:00:00', '2024-02-05'),
(UUID(), 'Mars 2024', 2024, 3, '2024-03-01', '2024-03-31', '2024-03-25', 'paid', 6, 12000000, 9600000, 1800000, 600000, '2024-03-20 10:00:00', '2024-03-22 14:00:00', '2024-03-05'),
(UUID(), 'Avril 2024', 2024, 4, '2024-04-01', '2024-04-30', '2024-04-25', 'paid', 6, 12000000, 9600000, 1800000, 600000, '2024-04-20 10:00:00', '2024-04-22 14:00:00', '2024-04-05'),
(UUID(), 'Mai 2024', 2024, 5, '2024-05-01', '2024-05-31', '2024-05-27', 'paid', 6, 12000000, 9600000, 1800000, 600000, '2024-05-20 10:00:00', '2024-05-22 14:00:00', '2024-05-05'),
(UUID(), 'Juin 2024', 2024, 6, '2024-06-01', '2024-06-30', '2024-06-25', 'paid', 6, 12000000, 9600000, 1800000, 600000, '2024-06-20 10:00:00', '2024-06-22 14:00:00', '2024-06-05'),
(UUID(), 'Juillet 2024', 2024, 7, '2024-07-01', '2024-07-31', '2024-07-25', 'paid', 6, 12000000, 9600000, 1800000, 600000, '2024-07-20 10:00:00', '2024-07-22 14:00:00', '2024-07-05'),
(UUID(), 'Août 2024', 2024, 8, '2024-08-01', '2024-08-31', '2024-08-26', 'paid', 6, 12000000, 9600000, 1800000, 600000, '2024-08-20 10:00:00', '2024-08-22 14:00:00', '2024-08-05'),
(UUID(), 'Septembre 2024', 2024, 9, '2024-09-01', '2024-09-30', '2024-09-25', 'paid', 6, 12000000, 9600000, 1800000, 600000, '2024-09-20 10:00:00', '2024-09-22 14:00:00', '2024-09-05'),
(UUID(), 'Octobre 2024', 2024, 10, '2024-10-01', '2024-10-31', '2024-10-25', 'paid', 6, 12000000, 9600000, 1800000, 600000, '2024-10-20 10:00:00', '2024-10-22 14:00:00', '2024-10-05'),
(UUID(), 'Novembre 2024', 2024, 11, '2024-11-01', '2024-11-30', '2024-11-25', 'paid', 6, 12000000, 9600000, 1800000, 600000, '2024-11-20 10:00:00', '2024-11-22 14:00:00', '2024-11-05'),
(UUID(), 'Décembre 2024', 2024, 12, '2024-12-01', '2024-12-31', '2024-12-23', 'paid', 6, 12000000, 9600000, 1800000, 600000, '2024-12-18 10:00:00', '2024-12-20 14:00:00', '2024-12-05');

-- =================================================================
-- 4. TYPES D'ÉLÉMENTS DE PAIE
-- =================================================================

INSERT INTO payroll_item_types (id, name, code, category, is_taxable, is_active, display_order, created_at) VALUES
(UUID(), 'Salaire de Base', 'BASE_SALARY', 'earnings', TRUE, TRUE, 1, NOW()),
(UUID(), 'Prime de Transport', 'TRANSPORT', 'allowance', FALSE, TRUE, 2, NOW()),
(UUID(), 'Prime de Logement', 'HOUSING', 'allowance', FALSE, TRUE, 3, NOW()),
(UUID(), 'Prime de Fonction', 'FUNCTION', 'allowance', TRUE, TRUE, 4, NOW()),
(UUID(), 'Heures Supplémentaires', 'OVERTIME', 'earnings', TRUE, TRUE, 5, NOW()),
(UUID(), 'Prime de Performance', 'PERFORMANCE', 'bonus', TRUE, TRUE, 6, NOW()),
(UUID(), 'Impôt Professionnel', 'INCOME_TAX', 'deduction', FALSE, TRUE, 7, NOW()),
(UUID(), 'CNSS Employé', 'CNSS_EMPLOYEE', 'deduction', FALSE, TRUE, 8, NOW()),
(UUID(), 'INPP Employé', 'INPP_EMPLOYEE', 'deduction', FALSE, TRUE, 9, NOW()),
(UUID(), 'Avance sur Salaire', 'ADVANCE', 'deduction', FALSE, TRUE, 10, NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =================================================================
-- 5. BULLETINS DE PAIE (Pour tous les employés - 12 derniers mois)
-- =================================================================

-- Cette section génère automatiquement les bulletins pour tous les employés
-- Pour chaque mois de 2024

-- Fonction helper pour générer les bulletins
DELIMITER $$

DROP PROCEDURE IF EXISTS generate_payslips_2024$$

CREATE PROCEDURE generate_payslips_2024()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE emp_id CHAR(36);
    DECLARE emp_number VARCHAR(50);
    DECLARE emp_salary DECIMAL(12,2);
    DECLARE period_id CHAR(36);
    DECLARE period_month INT;
    DECLARE period_year INT;
    DECLARE payslip_id CHAR(36);
    
    DECLARE emp_cursor CURSOR FOR 
        SELECT id, employee_number, 
               CASE 
                   WHEN grade_id IS NOT NULL THEN (SELECT base_salary FROM grades WHERE id = grade_id)
                   ELSE 2000000 
               END as salary
        FROM employees 
        WHERE is_active = TRUE;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN emp_cursor;
    
    employee_loop: LOOP
        FETCH emp_cursor INTO emp_id, emp_number, emp_salary;
        
        IF done THEN
            LEAVE employee_loop;
        END IF;
        
        -- Pour chaque période de 2024
        BEGIN
            DECLARE period_done INT DEFAULT FALSE;
            DECLARE period_cursor CURSOR FOR 
                SELECT id, month, year FROM payroll_periods WHERE year = 2024;
            DECLARE CONTINUE HANDLER FOR NOT FOUND SET period_done = TRUE;
            
            OPEN period_cursor;
            
            period_loop: LOOP
                FETCH period_cursor INTO period_id, period_month, period_year;
                
                IF period_done THEN
                    LEAVE period_loop;
                END IF;
                
                SET payslip_id = UUID();
                
                -- Insérer le bulletin
                INSERT INTO payslips (
                    id, payslip_number, employee_id, payroll_period_id,
                    base_salary, gross_salary, total_allowances, total_bonuses,
                    total_deductions, taxable_amount, tax_amount, net_salary,
                    payment_method, payment_date, status, pdf_url, created_at
                ) VALUES (
                    payslip_id,
                    CONCAT('BS-', period_year, '-', LPAD(period_month, 2, '0'), '-', emp_number),
                    emp_id,
                    period_id,
                    emp_salary,
                    emp_salary * 1.30, -- Avec primes
                    emp_salary * 0.20, -- 20% d'allocations
                    emp_salary * 0.10, -- 10% de bonus
                    emp_salary * 0.25, -- 25% de déductions
                    emp_salary * 1.30,
                    emp_salary * 0.15, -- 15% d'impôt
                    emp_salary * 0.80, -- Net = 80% du brut
                    'bank_transfer',
                    DATE_ADD(CONCAT(period_year, '-', LPAD(period_month, 2, '0'), '-25'), INTERVAL 0 DAY),
                    'paid',
                    CONCAT('/uploads/payslips/', payslip_id, '.pdf'),
                    NOW()
                );
                
            END LOOP period_loop;
            
            CLOSE period_cursor;
        END;
        
    END LOOP employee_loop;
    
    CLOSE emp_cursor;
END$$

DELIMITER ;

-- Exécuter la procédure
CALL generate_payslips_2024();

-- =================================================================
-- 6. HISTORIQUE DE PRÉSENCE (3 derniers mois pour tous les employés)
-- =================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS generate_attendance_records$$

CREATE PROCEDURE generate_attendance_records()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE emp_id CHAR(36);
    DECLARE current_date DATE;
    DECLARE end_date DATE;
    DECLARE day_of_week INT;
    DECLARE is_late BOOLEAN;
    DECLARE status VARCHAR(20);
    
    DECLARE emp_cursor CURSOR FOR 
        SELECT id FROM employees WHERE is_active = TRUE;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    SET current_date = DATE_SUB(CURDATE(), INTERVAL 90 DAY);
    SET end_date = CURDATE();
    
    OPEN emp_cursor;
    
    employee_loop: LOOP
        FETCH emp_cursor INTO emp_id;
        
        IF done THEN
            LEAVE employee_loop;
        END IF;
        
        SET current_date = DATE_SUB(CURDATE(), INTERVAL 90 DAY);
        
        date_loop: WHILE current_date <= end_date DO
            SET day_of_week = DAYOFWEEK(current_date);
            
            -- Skip weekends
            IF day_of_week NOT IN (1, 7) THEN
                -- 5% de chance d'absence
                IF RAND() < 0.05 THEN
                    SET status = 'absent';
                    SET is_late = FALSE;
                -- 10% de chance de retard
                ELSEIF RAND() < 0.10 THEN
                    SET status = 'late';
                    SET is_late = TRUE;
                -- 85% de chance de présence normale
                ELSE
                    SET status = 'present';
                    SET is_late = FALSE;
                END IF;
                
                INSERT INTO attendance_records (
                    id, employee_id, date, 
                    check_in_time, check_out_time, total_hours,
                    status, is_late, late_minutes, created_at
                ) VALUES (
                    UUID(),
                    emp_id,
                    current_date,
                    CASE 
                        WHEN status = 'absent' THEN NULL
                        WHEN is_late = TRUE THEN ADDTIME('08:00:00', SEC_TO_TIME(FLOOR(RAND() * 3600)))
                        ELSE ADDTIME('08:00:00', SEC_TO_TIME(FLOOR(RAND() * 600) - 300))
                    END,
                    CASE 
                        WHEN status = 'absent' THEN NULL
                        ELSE ADDTIME('17:00:00', SEC_TO_TIME(FLOOR(RAND() * 1800)))
                    END,
                    CASE 
                        WHEN status = 'absent' THEN NULL
                        ELSE 8 + (RAND() * 2)
                    END,
                    status,
                    is_late,
                    CASE 
                        WHEN is_late = TRUE THEN FLOOR(RAND() * 60) + 5
                        ELSE 0
                    END,
                    NOW()
                );
            END IF;
            
            SET current_date = DATE_ADD(current_date, INTERVAL 1 DAY);
        END WHILE date_loop;
        
    END LOOP employee_loop;
    
    CLOSE emp_cursor;
END$$

DELIMITER ;

-- Exécuter la procédure
CALL generate_attendance_records();

-- =================================================================
-- 7. DEMANDES DE CONGÉ
-- =================================================================

-- Insérer quelques demandes de congé pour chaque employé
INSERT INTO leave_requests (id, request_number, employee_id, leave_type_id, start_date, end_date, total_days, return_date, reason, status, submitted_at, created_at)
SELECT 
    UUID(),
    CONCAT('LC-2024-', LPAD(ROW_NUMBER() OVER (), 4, '0')),
    e.id,
    (SELECT id FROM leave_types WHERE code = 'annual' LIMIT 1),
    DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 60) DAY),
    DATE_ADD(DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 60) DAY), INTERVAL 14 DAY),
    14,
    DATE_ADD(DATE_ADD(CURDATE(), INTERVAL FLOOR(RAND() * 60) DAY), INTERVAL 15 DAY),
    'Congé annuel planifié',
    'approved',
    DATE_SUB(NOW(), INTERVAL 30 DAY),
    DATE_SUB(NOW(), INTERVAL 30 DAY)
FROM employees e
WHERE e.is_active = TRUE;

-- =================================================================
-- FIN DU SEEDER
-- =================================================================

SELECT 'Seeder exécuté avec succès!' as message;
SELECT COUNT(*) as 'Documents créés' FROM employee_documents;
SELECT COUNT(*) as 'Périodes de paie créées' FROM payroll_periods;
SELECT COUNT(*) as 'Bulletins de paie créés' FROM payslips;
SELECT COUNT(*) as 'Présences enregistrées' FROM attendance_records;
SELECT COUNT(*) as 'Demandes de congé créées' FROM leave_requests;
