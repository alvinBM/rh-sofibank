#!/bin/bash

# Script de test des APIs Payroll
# Usage: ./test_payroll_apis.sh

BASE_URL="http://localhost:5000/api"
TOKEN="YOUR_AUTH_TOKEN_HERE"

echo "==================================="
echo "Test des APIs Payroll - SOFIBANK"
echo "==================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour faire une requête GET
test_get() {
    local endpoint=$1
    local description=$2
    
    echo -e "${YELLOW}Test: ${description}${NC}"
    echo "GET ${BASE_URL}${endpoint}"
    
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        "${BASE_URL}${endpoint}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ Success (${http_code})${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Failed (${http_code})${NC}"
        echo "$body"
    fi
    echo ""
}

# Fonction pour faire une requête POST
test_post() {
    local endpoint=$1
    local description=$2
    local data=$3
    
    echo -e "${YELLOW}Test: ${description}${NC}"
    echo "POST ${BASE_URL}${endpoint}"
    echo "Data: ${data}"
    
    response=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Authorization: Bearer ${TOKEN}" \
        -H "Content-Type: application/json" \
        -d "${data}" \
        "${BASE_URL}${endpoint}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ Success (${http_code})${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Failed (${http_code})${NC}"
        echo "$body"
    fi
    echo ""
}

# Vérifier que jq est installé
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq is not installed. JSON output will not be formatted.${NC}"
    echo "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
    echo ""
fi

# Demander le token si non défini
if [ "$TOKEN" = "YOUR_AUTH_TOKEN_HERE" ]; then
    echo -e "${YELLOW}Please provide your authentication token:${NC}"
    read -p "Token: " TOKEN
    echo ""
fi

echo "==================================="
echo "1. Test Health Check"
echo "==================================="
test_get "/health" "Health check"

echo "==================================="
echo "2. Test Paramètres de Paie"
echo "==================================="
test_get "/payroll/settings" "Récupérer les paramètres de paie"

echo "==================================="
echo "3. Test Types d'Éléments"
echo "==================================="
test_get "/payroll/item-types" "Récupérer les types d'éléments de paie"

echo "==================================="
echo "4. Test Exécutions de Paie"
echo "==================================="
test_get "/payroll/runs?limit=10&offset=0" "Liste des exécutions de paie"

echo "==================================="
echo "5. Test Création de Période"
echo "==================================="
CURRENT_YEAR=$(date +%Y)
CURRENT_MONTH=$(date +%m)
PAYMENT_DATE="${CURRENT_YEAR}-${CURRENT_MONTH}-24"

test_post "/payroll/runs" \
    "Créer une nouvelle période de paie" \
    "{\"year\": ${CURRENT_YEAR}, \"month\": ${CURRENT_MONTH}, \"payment_date\": \"${PAYMENT_DATE}\"}"

echo "==================================="
echo "6. Test Éléments Variables"
echo "==================================="
test_get "/payroll/variables?limit=10&offset=0" "Liste des éléments variables"

echo "==================================="
echo "7. Test Création Variable (optionnel)"
echo "==================================="
# Décommentez et remplacez EMPLOYEE_ID par un ID valide pour tester
# EMPLOYEE_ID="your-employee-uuid-here"
# PERIOD="${CURRENT_YEAR}-${CURRENT_MONTH}"
# test_post "/payroll/variables" \
#     "Créer un élément variable" \
#     "{\"employee_id\": \"${EMPLOYEE_ID}\", \"variable_type\": \"bonus\", \"amount\": 50000, \"period\": \"${PERIOD}\", \"description\": \"Prime de test\"}"

echo "==================================="
echo "8. Test Bulletins Employé (ESS)"
echo "==================================="
# Décommentez et remplacez EMPLOYEE_ID par un ID valide
# test_get "/payroll/employees/${EMPLOYEE_ID}/payslips" "Bulletins d'un employé"
# test_get "/payroll/employees/${EMPLOYEE_ID}/payment-history" "Historique de paiement"

echo "==================================="
echo "Tests terminés!"
echo "==================================="
echo ""
echo -e "${YELLOW}Note:${NC} Pour tester le traitement, l'approbation et la distribution:"
echo "1. Créez une période de paie"
echo "2. Notez l'ID retourné"
echo "3. Utilisez ces endpoints:"
echo "   - POST /payroll/runs/{id}/process"
echo "   - POST /payroll/runs/{id}/approve"
echo "   - POST /payroll/runs/{id}/distribute"
