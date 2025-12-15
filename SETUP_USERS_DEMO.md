# Guide de Création des Utilisateurs de Démonstration

Ce guide explique comment créer les utilisateurs de démonstration pour tester le SIRH SOFIBANQUE.

## Étape 1 : Créer les utilisateurs dans Supabase Auth

Connectez-vous à votre projet Supabase et accédez à Authentication > Users, puis créez les utilisateurs suivants :

### 1. Super Administrateur
- **Email**: `admin@sofibanque.com`
- **Mot de passe**: `Admin@2025`
- **Métadonnées utilisateur** (User Metadata):
```json
{
  "firstname": "Admin",
  "lastname": "SOFIBANQUE"
}
```

### 2. Directeur RH
- **Email**: `drh@sofibanque.com`
- **Mot de passe**: `DRH@2025`
- **Métadonnées utilisateur**:
```json
{
  "firstname": "Jean-Pierre",
  "lastname": "KABAMBA"
}
```

### 3. Manager RH
- **Email**: `rh@sofibanque.com`
- **Mot de passe**: `RH@2025`
- **Métadonnées utilisateur**:
```json
{
  "firstname": "Marie",
  "lastname": "MUKUNA"
}
```

### 4. Manager/Responsable Direction
- **Email**: `manager@sofibanque.com`
- **Mot de passe**: `Manager@2025`
- **Métadonnées utilisateur**:
```json
{
  "firstname": "Paul",
  "lastname": "MUTOMBO"
}
```

### 5. Employé Standard
- **Email**: `employe@sofibanque.com`
- **Mot de passe**: `Employe@2025`
- **Métadonnées utilisateur**:
```json
{
  "firstname": "Grace",
  "lastname": "NKULU"
}
```

### 6. Finance/Paie
- **Email**: `finance@sofibanque.com`
- **Mot de passe**: `Finance@2025`
- **Métadonnées utilisateur**:
```json
{
  "firstname": "David",
  "lastname": "TSHISEKEDI"
}
```

## Étape 2 : Exécuter le script SQL de configuration

Après avoir créé les utilisateurs dans Auth, exécutez le script SQL suivant dans l'éditeur SQL de Supabase pour :
1. Créer le compte SOFIBANQUE
2. Créer les profils utilisateurs
3. Attribuer les rôles appropriés

**IMPORTANT** : Remplacez les UUID dans le script par les vrais UUID des utilisateurs créés à l'étape 1.

```sql
-- 1. Créer le compte SOFIBANQUE
INSERT INTO accounts (
  id,
  business_name,
  description,
  billing_plan,
  expired_at,
  main_currency,
  email,
  phone,
  city,
  country,
  address,
  nb_employees,
  status
) VALUES (
  gen_random_uuid(),
  'SOFIBANQUE',
  'Société Financière Banque',
  'Enterprise',
  '2025-12-31',
  'CDF',
  'contact@sofibanque.com',
  '+243999000000',
  'Kinshasa',
  'CD',
  'Avenue de la Libération, Kinshasa',
  '100-500',
  1
);

-- Récupérer l'ID du compte créé
DO $$
DECLARE
  account_id_var uuid;
  store_id_var uuid;
  admin_user_id uuid := 'REMPLACER_PAR_UUID_ADMIN'; -- UUID de admin@sofibanque.com
  drh_user_id uuid := 'REMPLACER_PAR_UUID_DRH'; -- UUID de drh@sofibanque.com
  rh_user_id uuid := 'REMPLACER_PAR_UUID_RH'; -- UUID de rh@sofibanque.com
  manager_user_id uuid := 'REMPLACER_PAR_UUID_MANAGER'; -- UUID de manager@sofibanque.com
  employe_user_id uuid := 'REMPLACER_PAR_UUID_EMPLOYE'; -- UUID de employe@sofibanque.com
  finance_user_id uuid := 'REMPLACER_PAR_UUID_FINANCE'; -- UUID de finance@sofibanque.com
BEGIN
  -- Récupérer l'ID du compte SOFIBANQUE
  SELECT id INTO account_id_var FROM accounts WHERE business_name = 'SOFIBANQUE' LIMIT 1;

  -- 2. Créer le magasin principal
  INSERT INTO stores (
    id,
    account_id,
    name,
    address,
    city,
    country,
    phone,
    status
  ) VALUES (
    gen_random_uuid(),
    account_id_var,
    'Siège SOFIBANQUE',
    'Avenue de la Libération, Kinshasa',
    'Kinshasa',
    'CD',
    '+243999000000',
    1
  ) RETURNING id INTO store_id_var;

  -- 3. Créer les profils utilisateurs

  -- Admin
  INSERT INTO user_profiles (
    user_id, account_id, firstname, lastname, phone, city, country, root_store, status
  ) VALUES (
    admin_user_id, account_id_var, 'Admin', 'SOFIBANQUE', '+243999000001', 'Kinshasa', 'CD', store_id_var, 1
  );

  -- DRH
  INSERT INTO user_profiles (
    user_id, account_id, firstname, lastname, phone, city, country, root_store, status
  ) VALUES (
    drh_user_id, account_id_var, 'Jean-Pierre', 'KABAMBA', '+243999000002', 'Kinshasa', 'CD', store_id_var, 1
  );

  -- RH
  INSERT INTO user_profiles (
    user_id, account_id, firstname, lastname, phone, city, country, root_store, status
  ) VALUES (
    rh_user_id, account_id_var, 'Marie', 'MUKUNA', '+243999000003', 'Kinshasa', 'CD', store_id_var, 1
  );

  -- Manager
  INSERT INTO user_profiles (
    user_id, account_id, firstname, lastname, phone, city, country, root_store, status
  ) VALUES (
    manager_user_id, account_id_var, 'Paul', 'MUTOMBO', '+243999000004', 'Kinshasa', 'CD', store_id_var, 1
  );

  -- Employé
  INSERT INTO user_profiles (
    user_id, account_id, firstname, lastname, phone, city, country, root_store, status
  ) VALUES (
    employe_user_id, account_id_var, 'Grace', 'NKULU', '+243999000005', 'Kinshasa', 'CD', store_id_var, 1
  );

  -- Finance
  INSERT INTO user_profiles (
    user_id, account_id, firstname, lastname, phone, city, country, root_store, status
  ) VALUES (
    finance_user_id, account_id_var, 'David', 'TSHISEKEDI', '+243999000006', 'Kinshasa', 'CD', store_id_var, 1
  );

  -- 4. Attribuer les rôles

  -- Admin → SUPER_ADMIN
  INSERT INTO user_roles (user_id, role_id)
  SELECT admin_user_id, id FROM roles WHERE code = 'SUPER_ADMIN';

  -- DRH → RH + tous les droits
  INSERT INTO user_roles (user_id, role_id)
  SELECT drh_user_id, id FROM roles WHERE code = 'RH';

  -- RH → RH
  INSERT INTO user_roles (user_id, role_id)
  SELECT rh_user_id, id FROM roles WHERE code = 'RH';

  -- Manager → MANAGER
  INSERT INTO user_roles (user_id, role_id)
  SELECT manager_user_id, id FROM roles WHERE code = 'MANAGER';

  -- Employé → EMPLOYEE
  INSERT INTO user_roles (user_id, role_id)
  SELECT employe_user_id, id FROM roles WHERE code = 'EMPLOYEE';

  -- Finance → FINANCE
  INSERT INTO user_roles (user_id, role_id)
  SELECT finance_user_id, id FROM roles WHERE code = 'FINANCE';

  RAISE NOTICE 'Utilisateurs de démo créés avec succès !';
  RAISE NOTICE 'Account ID: %', account_id_var;
  RAISE NOTICE 'Store ID: %', store_id_var;
END $$;
```

## Étape 3 : Vérifier les utilisateurs

Vous pouvez vérifier que tout fonctionne en vous connectant avec chaque utilisateur :

| Email | Mot de passe | Rôle | Permissions |
|-------|--------------|------|-------------|
| admin@sofibanque.com | Admin@2025 | Super Admin | Accès complet |
| drh@sofibanque.com | DRH@2025 | RH | Gestion RH complète |
| rh@sofibanque.com | RH@2025 | RH | Gestion RH complète |
| manager@sofibanque.com | Manager@2025 | Manager | Gestion équipe |
| employe@sofibanque.com | Employe@2025 | Employé | ESS uniquement |
| finance@sofibanque.com | Finance@2025 | Finance | Module paie |

## Étape 4 : Créer des données de test supplémentaires (optionnel)

Pour tester complètement le système, vous pouvez créer :

1. **Directions et Services** (via l'interface Admin)
2. **Employés** (via le module Employés)
3. **Demandes de congés** (via ESS)
4. **Terminaux biométriques** (via Paramétrages)
5. **Postes vacants** (via Recrutement)

## Notes importantes

- **Sécurité** : Ces mots de passe sont pour la démonstration uniquement. En production, utilisez des mots de passe forts et uniques.
- **Email de confirmation** : Si l'email de confirmation est activé dans Supabase, désactivez-le pour les tests (Auth > Settings > Enable email confirmations = OFF).
- **Politique de mot de passe** : Assurez-vous que la politique de mot de passe dans Supabase permet les mots de passe proposés.

## Dépannage

### Erreur "Invalid login credentials"
- Vérifiez que l'email de confirmation est désactivé
- Vérifiez que les mots de passe respectent la politique de Supabase
- Vérifiez que les utilisateurs ont bien été créés dans Auth

### Profil utilisateur vide après connexion
- Vérifiez que le script SQL de l'étape 2 a été exécuté avec les bons UUID
- Vérifiez que les tables `user_profiles`, `accounts` et `stores` existent
- Vérifiez que les rôles ont été correctement assignés dans `user_roles`

### Session expire immédiatement
- Vérifiez la configuration Supabase dans `.env`
- Vérifiez que les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont correctes
- Vérifiez les cookies dans le navigateur
