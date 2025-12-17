-- Script SQL pour créer des données de test pour le module ESS

-- 1. Créer un contrat pour l'employé admin
INSERT INTO employee_contracts (
    id, 
    employee_id, 
    contract_type, 
    start_date, 
    salary, 
    position, 
    status,
    notes,
    created_by
) VALUES (
    UUID(),
    (SELECT id FROM employees WHERE employee_number = 'EMP001'),
    'permanent',
    '2015-01-10',
    2000000.00,
    'Directeur Général',
    'active',
    'Contrat initial - CDI',
    (SELECT id FROM users WHERE email = 'admin@sofibank.cd')
);

-- 2. Créer un historique de carrière (promotion en 2020)
INSERT INTO career_history (
    id,
    employee_id,
    change_type,
    effective_date,
    new_grade_id,
    previous_salary,
    new_salary,
    reason,
    created_by
) VALUES (
    UUID(),
    (SELECT id FROM employees WHERE employee_number = 'EMP001'),
    'promotion',
    '2020-01-15',
    (SELECT id FROM grades WHERE code = 'DIR'),
    2000000.00,
    2500000.00,
    'Promotion suite à excellentes performances et résultats exceptionnels',
    (SELECT id FROM users WHERE email = 'admin@sofibank.cd')
);

-- 3. Créer un historique d'augmentation de salaire (2022)
INSERT INTO career_history (
    id,
    employee_id,
    change_type,
    effective_date,
    previous_salary,
    new_salary,
    reason,
    created_by
) VALUES (
    UUID(),
    (SELECT id FROM employees WHERE employee_number = 'EMP001'),
    'salary_increase',
    '2022-06-01',
    2500000.00,
    3000000.00,
    'Augmentation annuelle - Revue salariale 2022',
    (SELECT id FROM users WHERE email = 'admin@sofibank.cd')
);

-- 4. Créer des dépendants
-- Conjoint
INSERT INTO employee_dependents (
    id,
    employee_id,
    first_name,
    last_name,
    relationship,
    date_of_birth,
    gender,
    is_beneficiary
) VALUES (
    UUID(),
    (SELECT id FROM employees WHERE employee_number = 'EMP001'),
    'Marie',
    'MUKENDI',
    'spouse',
    '1985-03-20',
    'F',
    TRUE
);

-- Enfant 1
INSERT INTO employee_dependents (
    id,
    employee_id,
    first_name,
    last_name,
    relationship,
    date_of_birth,
    gender,
    is_beneficiary
) VALUES (
    UUID(),
    (SELECT id FROM employees WHERE employee_number = 'EMP001'),
    'Paul',
    'MUKENDI',
    'child',
    '2010-08-15',
    'M',
    TRUE
);

-- Enfant 2
INSERT INTO employee_dependents (
    id,
    employee_id,
    first_name,
    last_name,
    relationship,
    date_of_birth,
    gender,
    is_beneficiary
) VALUES (
    UUID(),
    (SELECT id FROM employees WHERE employee_number = 'EMP001'),
    'Sophie',
    'MUKENDI',
    'child',
    '2013-11-25',
    'F',
    TRUE
);

-- 5. Créer quelques documents
INSERT INTO employee_documents (
    id,
    employee_id,
    document_type,
    document_name,
    file_path,
    notes,
    uploaded_by
) VALUES 
(
    UUID(),
    (SELECT id FROM employees WHERE employee_number = 'EMP001'),
    'contract',
    'Contrat CDI 2015',
    '/uploads/documents/contract_emp001_2015.pdf',
    'Contrat de travail initial',
    (SELECT id FROM users WHERE email = 'admin@sofibank.cd')
),
(
    UUID(),
    (SELECT id FROM employees WHERE employee_number = 'EMP001'),
    'diploma',
    'Diplôme Master en Gestion',
    '/uploads/documents/diploma_emp001.pdf',
    'Master en Gestion d\'Entreprise',
    (SELECT id FROM users WHERE email = 'admin@sofibank.cd')
),
(
    UUID(),
    (SELECT id FROM employees WHERE employee_number = 'EMP001'),
    'id_card',
    'Carte d\'Identité Nationale',
    '/uploads/documents/id_card_emp001.pdf',
    'CNI valide jusqu\'en 2028',
    (SELECT id FROM users WHERE email = 'admin@sofibank.cd')
);

-- 6. Créer une annonce interne de test
INSERT INTO internal_announcements (
    id,
    title,
    content,
    category,
    priority,
    is_published,
    published_date,
    expiry_date,
    created_by
) VALUES (
    UUID(),
    'Bienvenue sur le nouveau portail ESS',
    'Nous sommes heureux de vous annoncer le lancement de notre nouveau portail Employee Self-Service. Vous pouvez désormais consulter vos informations personnelles, vos contrats, votre historique de carrière et soumettre vos demandes administratives en ligne.',
    'general',
    'high',
    TRUE,
    NOW(),
    DATE_ADD(NOW(), INTERVAL 30 DAY),
    (SELECT id FROM users WHERE email = 'admin@sofibank.cd')
);

-- 7. Créer quelques demandes types supplémentaires
INSERT INTO request_types (id, name, code, description, category, is_active) VALUES
(UUID(), 'Avance sur Salaire', 'SALARY_ADVANCE', 'Demande d\'avance sur salaire', 'hr', TRUE),
(UUID(), 'Congé Exceptionnel', 'EXCEPTIONAL_LEAVE', 'Demande de congé exceptionnel', 'hr', TRUE),
(UUID(), 'Carte de Visite', 'BUSINESS_CARD', 'Demande de cartes de visite', 'administrative', TRUE);

-- 8. Créer une demande de test
INSERT INTO employee_requests (
    id,
    employee_id,
    request_type_id,
    subject,
    description,
    priority,
    status
) VALUES (
    UUID(),
    (SELECT id FROM employees WHERE employee_number = 'EMP001'),
    (SELECT id FROM request_types WHERE code = 'WORK_CERTIFICATE'),
    'Attestation de travail pour banque',
    'Je sollicite une attestation de travail pour constituer un dossier de demande de crédit auprès de ma banque.',
    'medium',
    'pending'
);

-- Afficher un résumé des données créées
SELECT 'Données de test créées avec succès!' AS Message;

SELECT COUNT(*) AS Contrats FROM employee_contracts;
SELECT COUNT(*) AS Historique FROM career_history;
SELECT COUNT(*) AS Dependants FROM employee_dependents;
SELECT COUNT(*) AS Documents FROM employee_documents;
SELECT COUNT(*) AS Annonces FROM internal_announcements;
SELECT COUNT(*) AS TypesDemandes FROM request_types;
SELECT COUNT(*) AS Demandes FROM employee_requests;
