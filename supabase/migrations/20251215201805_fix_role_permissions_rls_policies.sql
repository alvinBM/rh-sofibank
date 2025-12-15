/*
  # Correction des politiques RLS pour role_permissions
  
  ## Problème
  La table role_permissions a RLS activé mais aucune politique, ce qui bloque toutes les requêtes
  et cause l'erreur "Database error querying schema" lors de la connexion.
  
  ## Solution
  Ajouter des politiques RLS pour permettre :
  1. Aux utilisateurs authentifiés de voir toutes les permissions (lecture seule)
  2. Aux admins de gérer les permissions
  
  ## Sécurité
  - SELECT : Tous les utilisateurs authentifiés (nécessaire pour charger les rôles)
  - INSERT/UPDATE/DELETE : Uniquement les SUPER_ADMIN et ADMIN
*/

DO $$
BEGIN
  -- Supprimer les anciennes politiques si elles existent
  DROP POLICY IF EXISTS "Authenticated users can view role permissions" ON role_permissions;
  DROP POLICY IF EXISTS "Only admins can manage role permissions" ON role_permissions;

  -- Politique pour permettre la lecture des permissions de rôle
  CREATE POLICY "Authenticated users can view role permissions"
    ON role_permissions
    FOR SELECT
    TO authenticated
    USING (true);

  -- Politique pour permettre aux admins de gérer les permissions de rôle
  CREATE POLICY "Only admins can manage role permissions"
    ON role_permissions
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND r.code IN ('SUPER_ADMIN', 'ADMIN')
      )
    );
END $$;
