#!/bin/bash

# =====================================================
# Script de vérification et application des corrections BDD
# Date: 2025-12-17
# Usage: ./verify-and-fix-db.sh
# =====================================================

echo "🔍 Vérification de la base de données rh_sofibank..."
echo ""

# Configuration
DB_NAME="rh_sofibank"
DB_USER="root"
DB_PASS="alvinpass"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour exécuter une requête MySQL
run_query() {
    mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "$1" 2>/dev/null
}

# Fonction pour vérifier l'existence d'une table
check_table() {
    result=$(mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW TABLES LIKE '$1';" 2>/dev/null | grep -c "$1")
    if [ "$result" -eq 1 ]; then
        echo -e "${GREEN}✓${NC} Table $1 existe"
        return 0
    else
        echo -e "${RED}✗${NC} Table $1 manquante"
        return 1
    fi
}

# Fonction pour vérifier l'existence d'une colonne
check_column() {
    result=$(mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW COLUMNS FROM $1 LIKE '$2';" 2>/dev/null | grep -c "$2")
    if [ "$result" -eq 1 ]; then
        echo -e "${GREEN}✓${NC} Colonne $1.$2 existe"
        return 0
    else
        echo -e "${RED}✗${NC} Colonne $1.$2 manquante"
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 VÉRIFICATION DES TABLES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TABLES_MISSING=0

# Vérifier les tables principales
check_table "users" || TABLES_MISSING=$((TABLES_MISSING+1))
check_table "employees" || TABLES_MISSING=$((TABLES_MISSING+1))
check_table "roles" || TABLES_MISSING=$((TABLES_MISSING+1))
check_table "permissions" || TABLES_MISSING=$((TABLES_MISSING+1))
check_table "directions" || TABLES_MISSING=$((TABLES_MISSING+1))
check_table "services" || TABLES_MISSING=$((TABLES_MISSING+1))
check_table "grades" || TABLES_MISSING=$((TABLES_MISSING+1))
check_table "job_positions" || TABLES_MISSING=$((TABLES_MISSING+1))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 VÉRIFICATION DES TABLES DU MODULE PARAMÉTRAGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PATCH_NEEDED=0

check_table "holidays" || PATCH_NEEDED=$((PATCH_NEEDED+1))
check_table "biometric_devices" || PATCH_NEEDED=$((PATCH_NEEDED+1))
check_table "system_settings" || PATCH_NEEDED=$((PATCH_NEEDED+1))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VÉRIFICATION DES COLONNES CRITIQUES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

COLUMNS_MISSING=0

check_column "employees" "profile_photo_url" || COLUMNS_MISSING=$((COLUMNS_MISSING+1))

if check_table "holidays" >/dev/null 2>&1; then
    check_column "holidays" "description" || COLUMNS_MISSING=$((COLUMNS_MISSING+1))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 RÉSUMÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$TABLES_MISSING" -gt 0 ]; then
    echo -e "${RED}⚠️  $TABLES_MISSING tables principales manquantes${NC}"
    echo "   → Exécuter le schema.sql complet requis"
fi

if [ "$PATCH_NEEDED" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $PATCH_NEEDED tables du module Paramétrages manquantes${NC}"
    echo "   → Patch requis: database/patch_settings_module.sql"
    echo ""
    read -p "Voulez-vous appliquer le patch maintenant? (o/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        echo ""
        echo "📦 Application du patch..."
        mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < database/patch_settings_module.sql
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓${NC} Patch appliqué avec succès"
        else
            echo -e "${RED}✗${NC} Erreur lors de l'application du patch"
            exit 1
        fi
    fi
fi

if [ "$COLUMNS_MISSING" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $COLUMNS_MISSING colonnes manquantes${NC}"
    echo "   → Migration requise: database/migrations/001_add_description_to_holidays.sql"
    echo ""
    read -p "Voulez-vous appliquer la migration maintenant? (o/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        echo ""
        echo "🔄 Application de la migration..."
        mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < database/migrations/001_add_description_to_holidays.sql
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓${NC} Migration appliquée avec succès"
        else
            echo -e "${RED}✗${NC} Erreur lors de l'application de la migration"
            exit 1
        fi
    fi
fi

if [ "$TABLES_MISSING" -eq 0 ] && [ "$PATCH_NEEDED" -eq 0 ] && [ "$COLUMNS_MISSING" -eq 0 ]; then
    echo -e "${GREEN}✅ Base de données cohérente - Aucune correction nécessaire${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VÉRIFICATION DES PERMISSIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

PERMISSIONS=$(mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT COUNT(*) as count FROM permissions WHERE module = 'settings';" 2>/dev/null | tail -n 1)

if [ "$PERMISSIONS" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} $PERMISSIONS permissions du module Settings trouvées"
else
    echo -e "${RED}✗${NC} Aucune permission Settings trouvée"
    echo "   → Le patch patch_settings_module.sql n'a pas été appliqué"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Vérification terminée"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
