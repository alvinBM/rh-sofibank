-- =====================================================
-- MIGRATION: Ajouter colonne description à la table holidays
-- Date: 2025-12-17
-- Description: Ajoute une colonne TEXT pour stocker la description des jours fériés
-- =====================================================

USE rh_sofibank;

-- Vérifier et ajouter la colonne description si elle n'existe pas
SET @dbname = DATABASE();
SET @tablename = 'holidays';
SET @columnname = 'description';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 'Column already exists' AS msg;",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " TEXT AFTER is_recurring;")
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SELECT 'Migration 001_add_description_to_holidays completed successfully' AS status;
