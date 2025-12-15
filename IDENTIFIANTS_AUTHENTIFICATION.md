# Identifiants d'authentification - Système personnalisé

## Nouveau système d'authentification

Un nouveau système d'authentification personnalisé a été mis en place avec une table `users` dédiée.

### Caractéristiques du système

- **Table**: `users` (indépendante de auth.users de Supabase)
- **Méthode**: Authentification par email et mot de passe
- **Hashage**: Bcrypt avec salt de 10 rounds
- **Token**: JWT encodé en base64
- **Session**: Stockage dans localStorage et cookies

### Fonction d'authentification

```sql
SELECT * FROM authenticate_user('email@example.com', 'password');
```

Cette fonction :
- Vérifie l'email et le mot de passe
- Vérifie que le compte est actif
- Met à jour la date de dernière connexion
- Retourne les informations utilisateur (sans le mot de passe)

## Utilisateurs de test

### 1. Directeur RH (DRH)
- **Email**: drh@sofibanque.com
- **Mot de passe**: 123456
- **Rôle**: RH
- **Nom**: Marie Dubois
- **Téléphone**: +33612345678

### 2. Administrateur RH
- **Email**: rh@sofibanque.com
- **Mot de passe**: 123456
- **Rôle**: RH
- **Nom**: Jean Martin
- **Téléphone**: +33612345679

### 3. Manager
- **Email**: manager@sofibanque.com
- **Mot de passe**: 123456
- **Rôle**: MANAGER
- **Nom**: Sophie Leroy
- **Téléphone**: +33612345680

### 4. Employé
- **Email**: employe@sofibanque.com
- **Mot de passe**: 123456
- **Rôle**: EMPLOYEE
- **Nom**: Pierre Durand
- **Téléphone**: +33612345681

## Rôles et permissions

### RH (Administrateur RH)
- Voir le tableau de bord
- Voir son profil
- Gérer les employés
- Gérer les congés
- Gérer les présences
- Gérer la paie
- Gérer le recrutement
- Gérer les évaluations
- Voir les rapports

### MANAGER (Manager/Responsable)
- Voir le tableau de bord
- Voir son profil
- Voir son équipe
- Approuver les congés
- Voir les présences de l'équipe
- Conduire les évaluations

### EMPLOYEE (Employé)
- Voir le tableau de bord
- Voir son profil
- Demander des congés
- Voir ses bulletins de paie
- Voir ses présences

## Sécurité

### Protection des mots de passe
- Les mots de passe sont hashés avec bcrypt (10 rounds)
- Les mots de passe ne sont jamais exposés dans les réponses API
- La fonction `authenticate_user` est SECURITY DEFINER

### Row Level Security (RLS)
- Lecture publique autorisée (nécessaire pour l'authentification)
- Modifications restreintes aux administrateurs
- Les mots de passe ne sont jamais retournés dans les requêtes SELECT

### Token de session
- Token JWT encodé en base64
- Contient: id, email, role, timestamp
- Stocké dans localStorage et cookies
- Vérifié à chaque requête

## Structure de la table users

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,              -- Hashé avec bcrypt
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
```

## Fonctions utiles

### Créer un nouvel utilisateur
```sql
INSERT INTO users (email, password, firstname, lastname, role, account_id)
VALUES (
  'nouvel.utilisateur@sofibanque.com',
  crypt('motdepasse', gen_salt('bf', 10)),
  'Prénom',
  'Nom',
  'EMPLOYEE',
  (SELECT id FROM accounts WHERE business_name = 'SOFIBANQUE')
);
```

### Changer le mot de passe d'un utilisateur
```sql
UPDATE users
SET password = crypt('nouveau_motdepasse', gen_salt('bf', 10'))
WHERE email = 'utilisateur@sofibanque.com';
```

### Désactiver un utilisateur
```sql
UPDATE users
SET is_active = false
WHERE email = 'utilisateur@sofibanque.com';
```

## Notes importantes

1. **Mot de passe par défaut**: Tous les utilisateurs de test ont le mot de passe `123456`
2. **Compte associé**: Tous les utilisateurs sont associés au compte SOFIBANQUE
3. **Statut actif**: Tous les utilisateurs sont actifs par défaut
4. **Connexion**: Utiliser uniquement l'email (pas de connexion par téléphone dans ce système)

## Migration depuis l'ancien système

L'ancien système utilisait `auth.users` de Supabase. Le nouveau système utilise une table `users` personnalisée pour plus de flexibilité et de contrôle. Les deux systèmes peuvent coexister, mais le code d'authentification a été modifié pour utiliser uniquement le nouveau système.

## Fichiers modifiés

1. `/src/services/authService.js` - Service d'authentification
2. `/src/redux/AuthContext.js` - Contexte d'authentification React
3. Base de données - Migration `create_custom_users_authentication_system`
