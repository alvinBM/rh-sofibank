#!/bin/bash

# Script d'installation des dépendances pour le module employé
# Exécuter depuis la racine du projet

echo "🚀 Installation des dépendances pour le module Fiche Employé..."

# Backend - API
echo "📦 Installation des dépendances backend..."
cd api
npm install express-fileupload
echo "✅ Dépendances backend installées"

# Frontend
echo "📦 Vérification des dépendances frontend..."
cd ..
# Les dépendances FullCalendar sont déjà installées
npm list @fullcalendar/react @fullcalendar/daygrid @fullcalendar/core

echo ""
echo "✅ Toutes les dépendances sont installées!"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Exécuter le seeder: mysql -u root -p rh_sofibank < api/database/employee_test_data_seeder.sql"
echo "2. Démarrer le backend: cd api && npm run dev"
echo "3. Démarrer le frontend: npm run dev"
echo ""
echo "📖 Consulter EMPLOYEE_MODULE_COMPLETE_DOCUMENTATION.md pour plus d'infos"
