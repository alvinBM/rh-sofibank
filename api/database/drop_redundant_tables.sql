-- ========================================
-- SUPPRESSION DES TABLES REDONDANTES
-- ========================================
-- Ces tables sont des duplicatas du système de recrutement actuel
-- Le système utilise : job_applications, job_interviews, interview_evaluations
-- Ces tables sont inutilisées : candidates, candidate_interviews, candidate_evaluations
--
-- Date: 2025-12-17
-- ========================================

-- Supprimer les contraintes de clés étrangères d'abord
ALTER TABLE candidate_evaluations DROP FOREIGN KEY IF EXISTS candidate_evaluations_ibfk_1;
ALTER TABLE candidate_evaluations DROP FOREIGN KEY IF EXISTS candidate_evaluations_ibfk_2;
ALTER TABLE candidate_evaluations DROP FOREIGN KEY IF EXISTS candidate_evaluations_ibfk_3;

ALTER TABLE candidate_interviews DROP FOREIGN KEY IF EXISTS candidate_interviews_ibfk_1;

ALTER TABLE candidates DROP FOREIGN KEY IF EXISTS candidates_ibfk_1;

-- Supprimer les tables
DROP TABLE IF EXISTS candidate_evaluations;
DROP TABLE IF EXISTS candidate_interviews;
DROP TABLE IF EXISTS candidates;

-- Vérification: ces tables NE devraient PLUS exister
-- SHOW TABLES LIKE 'candidate%';

-- ========================================
-- ARCHITECTURE FINALE DU MODULE RECRUTEMENT
-- ========================================
-- 
-- FLUX DE RECRUTEMENT:
-- 1. job_postings (Offres d'emploi publiées)
--    ↓
-- 2. job_applications (Candidatures - source: website, email, etc.)
--    ↓
-- 3. job_interviews (Entretiens planifiés)
--    ↓
-- 4. interview_evaluations (Évaluations des entretiens)
--    ↓
-- 5. employment_offers (Offres d'emploi envoyées)
--    ↓
-- 6. employees (Recrutement finalisé → Employé)
--
-- TABLES SUPPLÉMENTAIRES:
-- - application_status_history (Historique des changements de statut)
-- - recruitment_plans (Plans de recrutement annuels)
-- - recruitment_plan_positions (Postes planifiés)
-- 
-- ========================================
