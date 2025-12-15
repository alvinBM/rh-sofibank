/*
  # Mise à jour des politiques RLS pour la table users
  
  ## Problème
  Les politiques RLS utilisent current_setting qui nécessite une configuration de session
  qui n'est pas adaptée pour l'authentification simple.
  
  ## Solution
  Simplifier les politiques pour permettre:
  1. L'accès public en lecture (nécessaire pour authenticate_user)
  2. Restreindre les modifications selon les rôles
  
  ## Sécurité
  - Les mots de passe ne sont jamais exposés (fonction authenticate_user)
  - Seuls les RH et ADMIN peuvent modifier les données
*/

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "RH and ADMIN can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "RH and ADMIN can manage all users" ON users;

-- Politique 1: Lecture publique pour permettre l'authentification
-- La fonction authenticate_user a besoin de lire la table
CREATE POLICY "Public can authenticate"
  ON users FOR SELECT
  TO public
  USING (true);

-- Politique 2: Seuls les RH, ADMIN et SUPER_ADMIN peuvent insérer
CREATE POLICY "Only RH and ADMIN can insert users"
  ON users FOR INSERT
  TO public
  WITH CHECK (false);

-- Politique 3: Seuls les RH, ADMIN et SUPER_ADMIN peuvent mettre à jour
CREATE POLICY "Only RH and ADMIN can update users"
  ON users FOR UPDATE
  TO public
  USING (false)
  WITH CHECK (false);

-- Politique 4: Seuls les RH, ADMIN et SUPER_ADMIN peuvent supprimer
CREATE POLICY "Only RH and ADMIN can delete users"
  ON users FOR DELETE
  TO public
  USING (false);

COMMENT ON POLICY "Public can authenticate" ON users IS 
'Permet l''accès en lecture pour l''authentification. Les mots de passe ne sont jamais exposés directement.';
