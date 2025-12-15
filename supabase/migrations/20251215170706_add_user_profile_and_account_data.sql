/*
  # Ajout des données de profil utilisateur et compte
  
  1. Nouvelles tables
    - `user_profiles` : Profil étendu des utilisateurs (firstname, lastname, phone, etc.)
    - `accounts` : Comptes entreprise (équivalent organization)
    - `stores` : Magasins/Branches
    
  2. Modifications
    - Mise à jour des relations avec auth.users
    
  3. Security
    - RLS activé avec policies restrictives
*/

-- Table des comptes entreprise (équivalent accounts dans l'ancien système)
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status integer DEFAULT 1,
  creator_id uuid REFERENCES auth.users(id),
  business_name text NOT NULL,
  description text,
  billing_plan text DEFAULT 'Essentiel',
  expired_at timestamptz,
  main_currency text DEFAULT 'CDF',
  secondary_currency text,
  email text,
  phone text,
  city text,
  country text DEFAULT 'CD',
  exchange_rate decimal(10,3) DEFAULT 0,
  tva decimal(5,3) DEFAULT 0,
  logo text,
  nb_employees text,
  address text,
  category text,
  website text
);

-- Table des magasins/branches (équivalent stores)
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status integer DEFAULT 1,
  user_id uuid REFERENCES auth.users(id),
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  city text,
  country text DEFAULT 'CD',
  email text,
  phone text,
  type integer DEFAULT 1,
  logo text,
  accounting_caisse_compte_id integer
);

-- Table des profils utilisateurs étendus
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  firstname text,
  lastname text,
  username text,
  phone text,
  email text,
  country text DEFAULT 'CD',
  city text,
  profile text,
  root_store uuid REFERENCES stores(id),
  public_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64'),
  ip_address inet,
  last_activity timestamptz DEFAULT now(),
  otp text,
  status integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_id ON user_profiles(account_id);
CREATE INDEX IF NOT EXISTS idx_stores_account_id ON stores(account_id);
CREATE INDEX IF NOT EXISTS idx_accounts_creator_id ON accounts(creator_id);

-- RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies pour accounts
CREATE POLICY "Users can view their own account"
  ON accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.account_id = accounts.id
      AND up.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage accounts"
  ON accounts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Policies pour stores
CREATE POLICY "Users can view stores in their account"
  ON stores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.account_id = stores.account_id
      AND up.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage stores"
  ON stores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Policies pour user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "RH can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'RH', 'ADMIN')
    )
  );

CREATE POLICY "Admins can manage profiles"
  ON user_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.code IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- Triggers
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, email, firstname, lastname)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'firstname', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastname', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement le profil lors de l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
