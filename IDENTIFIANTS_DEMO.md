# Identifiants de Démonstration SOFIBANQUE

## Utilisateurs Créés

Tous les utilisateurs utilisent le même mot de passe : **`Password123!`**

### 1. Directeur des Ressources Humaines (DRH)
- **Email** : `drh@sofibanque.com`
- **Mot de passe** : `Password123!`
- **Rôle** : DRH
- **Nom** : Marie Dubois
- **Téléphone** : +243810000001
- **Numéro employé** : EMP-2024-001

### 2. Responsable RH
- **Email** : `rh@sofibanque.com`
- **Mot de passe** : `Password123!`
- **Rôle** : Responsable RH
- **Nom** : Jean Martin
- **Téléphone** : +243810000002
- **Numéro employé** : EMP-2024-002

### 3. Manager
- **Email** : `manager@sofibanque.com`
- **Mot de passe** : `Password123!`
- **Rôle** : Manager
- **Nom** : Sophie Leroy
- **Téléphone** : +243810000003
- **Numéro employé** : EMP-2024-003

### 4. Employé
- **Email** : `employe@sofibanque.com`
- **Mot de passe** : `Password123!`
- **Rôle** : Employé
- **Nom** : Pierre Durand
- **Téléphone** : +243810000004
- **Numéro employé** : EMP-2024-004

---

## Comment se connecter

1. Accédez à la page de connexion
2. Saisissez l'email complet (ex: `drh@sofibanque.com`)
3. Saisissez le mot de passe : `Password123!`
4. Cliquez sur "Se connecter"

## Système d'authentification

Le système utilise **Supabase Auth** avec :
- Hashage des mots de passe avec **bcrypt**
- Authentification par email/password
- Gestion des sessions automatique
- Row Level Security (RLS) activé

## Statut

✅ Utilisateurs créés dans `auth.users`
✅ Profils créés dans `user_profiles`
✅ Rôles assignés dans `user_roles`
✅ Enregistrements employés dans `employees`
