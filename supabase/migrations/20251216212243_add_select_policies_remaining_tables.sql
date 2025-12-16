/*
  # Ajout des politiques SELECT pour les tables restantes
  
  ## Description
  Plusieurs tables avaient RLS activé mais aucune politique SELECT,
  ce qui empêchait l'accès aux données même pour les utilisateurs authentifiés.
  
  ## Tables concernées
  - announcement_reads
  - attendance_reports
  - authorizations
  - benefits
  - candidate_evaluations
  - candidate_interviews
  - evaluation_kpi_responses
  - interviews
  - job_applications
  - job_offers
  - salary_levels
  - social_media_posts
  
  ## Changements
  Ajout de politiques permettant aux utilisateurs authentifiés de lire les données
*/

-- =====================================================
-- ANNOUNCEMENT_READS
-- =====================================================
DROP POLICY IF EXISTS "Users can view announcement reads" ON announcement_reads;
CREATE POLICY "Users can view announcement reads"
  ON announcement_reads FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- ATTENDANCE_REPORTS
-- =====================================================
DROP POLICY IF EXISTS "Users can view attendance reports" ON attendance_reports;
CREATE POLICY "Users can view attendance reports"
  ON attendance_reports FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- AUTHORIZATIONS (work_authorizations)
-- =====================================================
DROP POLICY IF EXISTS "Users can view authorizations" ON authorizations;
CREATE POLICY "Users can view authorizations"
  ON authorizations FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- BENEFITS
-- =====================================================
DROP POLICY IF EXISTS "Users can view benefits" ON benefits;
CREATE POLICY "Users can view benefits"
  ON benefits FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- CANDIDATE_EVALUATIONS
-- =====================================================
DROP POLICY IF EXISTS "Users can view candidate evaluations" ON candidate_evaluations;
CREATE POLICY "Users can view candidate evaluations"
  ON candidate_evaluations FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- CANDIDATE_INTERVIEWS
-- =====================================================
DROP POLICY IF EXISTS "Users can view candidate interviews" ON candidate_interviews;
CREATE POLICY "Users can view candidate interviews"
  ON candidate_interviews FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- EVALUATION_KPI_RESPONSES
-- =====================================================
DROP POLICY IF EXISTS "Users can view evaluation kpi responses" ON evaluation_kpi_responses;
CREATE POLICY "Users can view evaluation kpi responses"
  ON evaluation_kpi_responses FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- INTERVIEWS
-- =====================================================
DROP POLICY IF EXISTS "Users can view interviews" ON interviews;
CREATE POLICY "Users can view interviews"
  ON interviews FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- JOB_APPLICATIONS
-- =====================================================
DROP POLICY IF EXISTS "Users can view job applications" ON job_applications;
CREATE POLICY "Users can view job applications"
  ON job_applications FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- JOB_OFFERS
-- =====================================================
DROP POLICY IF EXISTS "Users can view job offers" ON job_offers;
CREATE POLICY "Users can view job offers"
  ON job_offers FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- SALARY_LEVELS
-- =====================================================
DROP POLICY IF EXISTS "Users can view salary levels" ON salary_levels;
CREATE POLICY "Users can view salary levels"
  ON salary_levels FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- SOCIAL_MEDIA_POSTS
-- =====================================================
DROP POLICY IF EXISTS "Users can view social media posts" ON social_media_posts;
CREATE POLICY "Users can view social media posts"
  ON social_media_posts FOR SELECT
  TO authenticated
  USING (true);