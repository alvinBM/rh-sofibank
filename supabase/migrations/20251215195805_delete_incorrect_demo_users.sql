/*
  # Suppression des utilisateurs de démonstration incorrects
  
  1. Problème
    - Les utilisateurs créés avec crypt() de PostgreSQL ne sont pas compatibles avec Supabase Auth
    - L'authentification échoue avec "Invalid login credentials"
  
  2. Solution
    - Supprimer tous les utilisateurs créés incorrectement
    - Les recréer via l'API Supabase Admin avec le script create-demo-users.js
  
  3. Utilisateurs supprimés
    - drh@sofibanque.com
    - rh@sofibanque.com
    - manager@sofibanque.com
    - employe@sofibanque.com
*/

-- Supprimer les enregistrements liés en cascade
DELETE FROM employees WHERE email IN ('drh@sofibanque.com', 'rh@sofibanque.com', 'manager@sofibanque.com', 'employe@sofibanque.com');

-- Supprimer les rôles utilisateurs
DELETE FROM user_roles WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('drh@sofibanque.com', 'rh@sofibanque.com', 'manager@sofibanque.com', 'employe@sofibanque.com')
);

-- Supprimer les profils utilisateurs
DELETE FROM user_profiles WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('drh@sofibanque.com', 'rh@sofibanque.com', 'manager@sofibanque.com', 'employe@sofibanque.com')
);

-- Supprimer les utilisateurs Auth
DELETE FROM auth.users WHERE email IN ('drh@sofibanque.com', 'rh@sofibanque.com', 'manager@sofibanque.com', 'employe@sofibanque.com');
