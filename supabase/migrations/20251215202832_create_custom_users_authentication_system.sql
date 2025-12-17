/*
  # Création d'un système d'authentification personnalisé
  
  ## Description
  Création d'une nouvelle table `users` pour gérer l'authentification des utilisateurs
  de manière personnalisée, indépendamment de auth.users de Supabase.
  
  ## Nouvelle table
  - `users` : Table principale pour l'authentification
    - `id` (uuid, danger key)
    - `email` (text, unique)
    - `password` (text) - Mot de passe hashé avec bcrypt
    - `firstname` (text)
    - `lastname` (text)
    - `phone` (text)
    - `role` (text) - RH, MANAGER, EMPLOYEE, ADMIN
    - `account_id` (uuid) - Référence au compte de l'entreprise
    - `is_active` (boolean) - Statut actif/inactif
    - `last_login` (timestamptz) - Dernière connexion
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  ## Utilisateurs de test créés
  1. drh@sofibanque.com - Directeur RH (password: 123456)
  2. rh@sofibanque.com - RH (password: 123456)
  3. manager@sofibanque.com - Manager (password: 123456)
  4. employe@sofibanque.com - Employé (password: 123456)
  
  ## Sécurité
  - Enable RLS sur la table users
  - Politiques pour permettre la lecture de son propre profil
  - Politiques pour permettre aux RH de gérer les utilisateurs
  - Les mots de passe sont hashés avec crypt()
*/

-- Activer l'extension pgcrypto si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Créer la table users personnalisée
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  firstname text NOT NULL,
  lastname text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'EMPLOYEE',
  account_id uuid REFERENCES accounts(id),
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_account_id ON users(account_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour hasher les mots de passe
CREATE OR REPLACE FUNCTION hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier les mots de passe
CREATE OR REPLACE FUNCTION verify_password(password text, hash text)
RETURNS boolean AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour authentifier un utilisateur
CREATE OR REPLACE FUNCTION authenticate_user(user_email text, user_password text)
RETURNS TABLE (
  id uuid,
  email text,
  firstname text,
  lastname text,
  phone text,
  role text,
  account_id uuid,
  is_active boolean
) AS $$
DECLARE
  v_user_id uuid;
  v_password_hash text;
  v_is_active boolean;
BEGIN
  -- Récupérer le hash du mot de passe et le statut
  SELECT u.id, u.password, u.is_active 
  INTO v_user_id, v_password_hash, v_is_active
  FROM users u
  WHERE u.email = user_email;
  
  -- Vérifier que l'utilisateur existe
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Email ou mot de passe incorrect';
  END IF;
  
  -- Vérifier que l'utilisateur est actif
  IF NOT v_is_active THEN
    RAISE EXCEPTION 'Compte désactivé';
  END IF;
  
  -- Vérifier le mot de passe
  IF NOT verify_password(user_password, v_password_hash) THEN
    RAISE EXCEPTION 'Email ou mot de passe incorrect';
  END IF;
  
  -- Mettre à jour la date de dernière connexion
  UPDATE users SET last_login = now() WHERE users.id = v_user_id;
  
  -- Retourner les informations de l'utilisateur
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.firstname,
    u.lastname,
    u.phone,
    u.role,
    u.account_id,
    u.is_active
  FROM users u
  WHERE u.id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insérer les 4 utilisateurs de test
DO $$
DECLARE
  v_account_id uuid;
BEGIN
  -- Récupérer l'ID du compte SOFIBANQUE
  SELECT id INTO v_account_id FROM accounts WHERE business_name = 'SOFIBANQUE' LIMIT 1;
  
  -- Créer les utilisateurs avec mot de passe 123456
  INSERT INTO users (email, password, firstname, lastname, phone, role, account_id, is_active)
  VALUES
    (
      'drh@sofibanque.com',
      crypt('123456', gen_salt('bf', 10)),
      'Marie',
      'Dubois',
      '+33612345678',
      'RH',
      v_account_id,
      true
    ),
    (
      'rh@sofibanque.com',
      crypt('123456', gen_salt('bf', 10)),
      'Jean',
      'Martin',
      '+33612345679',
      'RH',
      v_account_id,
      true
    ),
    (
      'manager@sofibanque.com',
      crypt('123456', gen_salt('bf', 10)),
      'Sophie',
      'Leroy',
      '+33612345680',
      'MANAGER',
      v_account_id,
      true
    ),
    (
      'employe@sofibanque.com',
      crypt('123456', gen_salt('bf', 10)),
      'Pierre',
      'Durand',
      '+33612345681',
      'EMPLOYEE',
      v_account_id,
      true
    )
  ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    firstname = EXCLUDED.firstname,
    lastname = EXCLUDED.lastname,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    account_id = EXCLUDED.account_id,
    is_active = EXCLUDED.is_active;
    
  RAISE NOTICE 'Utilisateurs de test créés avec succès';
END $$;

-- Politiques RLS

-- Politique 1: Tous les utilisateurs authentifiés peuvent lire leur propre profil
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO public
  USING (email = current_setting('app.current_user_email', true));

-- Politique 2: Les utilisateurs RH et ADMIN peuvent voir tous les profils
CREATE POLICY "RH and ADMIN can view all profiles"
  ON users FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.email = current_setting('app.current_user_email', true)
      AND u.role IN ('RH', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- Politique 3: Les utilisateurs peuvent mettre à jour leur propre profil (sauf le rôle et account_id)
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO public
  USING (email = current_setting('app.current_user_email', true))
  WITH CHECK (
    email = current_setting('app.current_user_email', true)
    AND role = (SELECT role FROM users WHERE email = current_setting('app.current_user_email', true))
    AND account_id = (SELECT account_id FROM users WHERE email = current_setting('app.current_user_email', true))
  );

-- Politique 4: Les RH et ADMIN peuvent gérer tous les utilisateurs
CREATE POLICY "RH and ADMIN can manage all users"
  ON users FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.email = current_setting('app.current_user_email', true)
      AND u.role IN ('RH', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- Créer une vue pour les informations utilisateur (sans mot de passe)
CREATE OR REPLACE VIEW user_info AS
SELECT 
  id,
  email,
  firstname,
  lastname,
  phone,
  role,
  account_id,
  is_active,
  last_login,
  created_at,
  updated_at
FROM users;

-- Commentaires pour documentation
COMMENT ON TABLE users IS 'Table d''authentification personnalisée pour les utilisateurs du système SIRH';
COMMENT ON COLUMN users.password IS 'Mot de passe hashé avec bcrypt (ne jamais exposer)';
COMMENT ON FUNCTION authenticate_user IS 'Fonction pour authentifier un utilisateur avec email et mot de passe';
COMMENT ON FUNCTION hash_password IS 'Fonction pour hasher un mot de passe avec bcrypt';
COMMENT ON FUNCTION verify_password IS 'Fonction pour vérifier un mot de passe contre son hash';
