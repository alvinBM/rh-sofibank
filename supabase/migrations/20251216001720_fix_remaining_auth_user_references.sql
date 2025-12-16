/*
  # Correction des références auth.users restantes
  
  ## Description
  Correction des dernières tables qui référencent encore auth.users :
  - announcement_reads
  - internal_announcements
  - interviews
  - social_media_posts
  - stores
  - user_profiles
  
  ## Actions
  1. Nettoyer les données orphelines
  2. Supprimer les anciennes contraintes
  3. Ajouter les nouvelles contraintes référençant users
*/

-- =====================================================
-- NETTOYAGE DES DONNÉES ORPHELINES
-- =====================================================

-- announcement_reads
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'announcement_reads') THEN
    DELETE FROM announcement_reads WHERE user_id NOT IN (SELECT id FROM users);
  END IF;
END $$;

-- internal_announcements
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'internal_announcements') THEN
    EXECUTE 'UPDATE internal_announcements SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM users)';
  END IF;
END $$;

-- interviews
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interviews') THEN
    EXECUTE 'UPDATE interviews SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM users)';
  END IF;
END $$;

-- social_media_posts
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_media_posts') THEN
    EXECUTE 'UPDATE social_media_posts SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM users)';
  END IF;
END $$;

-- stores
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stores') THEN
    DELETE FROM stores WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users);
  END IF;
END $$;

-- user_profiles
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    DELETE FROM user_profiles WHERE user_id NOT IN (SELECT id FROM users);
  END IF;
END $$;

-- =====================================================
-- FONCTION HELPER
-- =====================================================

CREATE OR REPLACE FUNCTION drop_constraint_if_exists(
  p_table_name text,
  p_constraint_name text
) RETURNS void AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = p_constraint_name 
    AND table_name = p_table_name
  ) THEN
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', p_table_name, p_constraint_name);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CORRECTION DES CONTRAINTES
-- =====================================================

-- announcement_reads
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'announcement_reads') THEN
    PERFORM drop_constraint_if_exists('announcement_reads', 'announcement_reads_user_id_fkey');
    ALTER TABLE announcement_reads ADD CONSTRAINT announcement_reads_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- internal_announcements
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'internal_announcements') THEN
    PERFORM drop_constraint_if_exists('internal_announcements', 'internal_announcements_created_by_fkey');
    
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'internal_announcements' AND column_name = 'created_by'
    ) THEN
      ALTER TABLE internal_announcements ADD CONSTRAINT internal_announcements_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- interviews
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interviews') THEN
    PERFORM drop_constraint_if_exists('interviews', 'interviews_created_by_fkey');
    
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'interviews' AND column_name = 'created_by'
    ) THEN
      ALTER TABLE interviews ADD CONSTRAINT interviews_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- social_media_posts
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_media_posts') THEN
    PERFORM drop_constraint_if_exists('social_media_posts', 'social_media_posts_created_by_fkey');
    
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'social_media_posts' AND column_name = 'created_by'
    ) THEN
      ALTER TABLE social_media_posts ADD CONSTRAINT social_media_posts_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- stores
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stores') THEN
    PERFORM drop_constraint_if_exists('stores', 'stores_user_id_fkey');
    
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'stores' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE stores ADD CONSTRAINT stores_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- user_profiles
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    PERFORM drop_constraint_if_exists('user_profiles', 'user_profiles_user_id_fkey');
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- NETTOYER LA FONCTION HELPER
-- =====================================================

DROP FUNCTION IF EXISTS drop_constraint_if_exists(text, text);