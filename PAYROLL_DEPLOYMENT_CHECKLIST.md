# Checklist de Déploiement - Module Paie

## Phase 1 : Préparation de l'environnement

### Base de données
- [ ] Créer les 6 tables payroll (periods, payslips, payslip_items, item_types, variables, settings)
- [ ] Exécuter le script `payroll_initial_data.sql` pour les données de base
- [ ] Exécuter le script `add_salary_columns.sql` pour ajouter les colonnes de salaire
- [ ] Définir les salaires de base pour tous les grades/postes
- [ ] Vérifier qu'au moins un employé actif existe avec un salaire défini

### Backend
- [ ] Installer la dépendance : `cd api && npm install pdfkit`
- [ ] Créer le dossier : `mkdir -p api/public/uploads/payslips`
- [ ] Définir les permissions : `chmod -R 755 api/public/uploads`
- [ ] Vérifier que tous les modèles sont bien importés dans `models/index.js`
- [ ] Vérifier que les routes sont montées dans `routes/index.js`

### Frontend
- [ ] Vérifier que `useGetEmployees` est bien importé dans `payroll/page.jsx`
- [ ] Vérifier que `downloadPayslip` est bien importé dans `PayrollSection.jsx`
- [ ] Tester la compilation : `npm run build`

## Phase 2 : Configuration initiale

### Paramètres de paie
- [ ] Accéder à `/dashboard/payroll`
- [ ] Aller dans l'onglet "Paramètres"
- [ ] Vérifier/Ajuster le taux IRPP (défaut: 30%)
- [ ] Vérifier/Ajuster le taux INSS (défaut: 5%)
- [ ] Vérifier le jour de paiement (défaut: 24)
- [ ] Vérifier la devise (défaut: CDF)

### Types d'éléments
- [ ] Vérifier que les 12 types d'éléments sont créés
- [ ] Vérifier les catégories (earning/deduction)
- [ ] Vérifier les flags is_taxable

## Phase 3 : Tests fonctionnels

### Test 1 : Création de période simple
- [ ] Créer une période pour le mois en cours
- [ ] Vérifier que la période apparaît dans la liste
- [ ] Vérifier les dates (début, fin, paiement)
- [ ] Statut = "draft" ✓

### Test 2 : Traitement de paie basique
- [ ] Cliquer sur "Traiter" pour la période créée
- [ ] Attendre la fin du traitement
- [ ] Vérifier le nombre d'employés traités
- [ ] Vérifier les montants totaux (brut, net)
- [ ] Statut = "processing" ✓

### Test 3 : Vérification des bulletins
- [ ] Ouvrir les détails de la période
- [ ] Vérifier qu'un bulletin existe pour chaque employé actif
- [ ] Vérifier les calculs sur un bulletin aléatoire :
  - [ ] Salaire brut = base salary
  - [ ] IRPP = brut × 30%
  - [ ] INSS = brut × 5%
  - [ ] Net = brut - IRPP - INSS

### Test 4 : Approbation
- [ ] Cliquer sur "Approuver"
- [ ] Confirmer l'approbation
- [ ] Vérifier le statut = "approved"
- [ ] Vérifier que approved_by et approved_at sont renseignés

### Test 5 : Distribution
- [ ] Cliquer sur "Distribuer"
- [ ] Attendre la génération des PDFs
- [ ] Vérifier que les PDFs sont créés dans `api/public/uploads/payslips/`
- [ ] Statut = "paid" ✓

### Test 6 : Téléchargement PDF
- [ ] Accéder au profil d'un employé
- [ ] Aller dans l'onglet "Paie"
- [ ] Vérifier l'historique affiché
- [ ] Cliquer sur "Télécharger Bulletin"
- [ ] Vérifier que le PDF s'ouvre correctement
- [ ] Vérifier le contenu du PDF :
  - [ ] En-tête SOFIBANK
  - [ ] Infos employé
  - [ ] Période
  - [ ] Détail des éléments
  - [ ] Totaux

### Test 7 : Éléments variables
- [ ] Aller dans l'onglet "Éléments Variables"
- [ ] Créer une prime pour un employé :
  - [ ] Sélectionner l'employé
  - [ ] Type = "bonus"
  - [ ] Montant = 100000 CDF
  - [ ] Période = mois suivant
  - [ ] Description = "Prime de test"
- [ ] Vérifier que l'élément apparaît dans la liste
- [ ] Créer une nouvelle période pour le mois suivant
- [ ] Traiter cette période
- [ ] Vérifier que la prime apparaît dans le bulletin de l'employé concerné

### Test 8 : Performance
- [ ] Chronométrer le temps de traitement d'une paie
- [ ] Vérifier qu'il n'y a pas d'erreurs dans les logs
- [ ] Vérifier l'utilisation mémoire
- [ ] Pour 100+ employés : < 30 secondes acceptable

## Phase 4 : Tests d'intégrité

### Données
- [ ] Vérifier les contraintes uniques (payslip_number, période par employé)
- [ ] Tenter de créer une période en double → doit échouer
- [ ] Tenter de traiter une période déjà traitée → doit échouer
- [ ] Vérifier les transactions (rollback en cas d'erreur)

### Sécurité
- [ ] Vérifier que les routes sont protégées (authentification)
- [ ] Tester l'accès sans token → doit retourner 401
- [ ] Vérifier les permissions (si système RBAC activé)

### Edge Cases
- [ ] Traiter une période sans employés actifs
- [ ] Traiter un employé sans salaire de base
- [ ] Créer un élément variable avec montant négatif
- [ ] Télécharger un bulletin non généré

## Phase 5 : Documentation

- [ ] Lire `PAYROLL_MODULE_README.md`
- [ ] Lire `QUICK_START_PAYROLL.md`
- [ ] Lire `PAYROLL_CHANGES_SUMMARY.md`
- [ ] Former les utilisateurs RH sur le processus
- [ ] Créer un guide utilisateur spécifique à l'organisation

## Phase 6 : Monitoring post-déploiement

### Jour 1-7
- [ ] Surveiller les logs d'erreurs
- [ ] Vérifier les performances
- [ ] Collecter les retours utilisateurs
- [ ] Corriger les bugs éventuels

### Semaine 2-4
- [ ] Valider les premiers bulletins avec la comptabilité
- [ ] Vérifier la conformité fiscale (IRPP, INSS)
- [ ] Ajuster les paramètres si nécessaire

### Mensuel
- [ ] Archiver les bulletins PDF
- [ ] Nettoyer les anciennes données (optionnel)
- [ ] Faire un rapport d'utilisation

## Phase 7 : Sauvegarde et récupération

- [ ] Planifier des sauvegardes automatiques de la BDD
- [ ] Sauvegarder les PDFs dans un système externe
- [ ] Tester la procédure de restauration
- [ ] Documenter le plan de récupération

## Critères de validation finale

### Fonctionnels
✅ Une période de paie complète peut être traitée de bout en bout
✅ Les calculs sont corrects et vérifiés
✅ Les bulletins PDF sont générés et téléchargeables
✅ L'interface employé affiche correctement les données
✅ Les éléments variables sont pris en compte

### Techniques
✅ Aucune erreur dans les logs
✅ Performance acceptable (< 30s pour 100 employés)
✅ Toutes les APIs répondent correctement
✅ Les transactions sont atomiques
✅ Les contraintes de BDD sont respectées

### Opérationnels
✅ Les utilisateurs RH sont formés
✅ La documentation est à jour
✅ Le processus mensuel est documenté
✅ Les sauvegardes sont en place
✅ Le support est prêt

## Rollback Plan

En cas de problème majeur :
1. Stopper l'utilisation du module
2. Restaurer la dernière sauvegarde de BDD
3. Revenir à l'ancien système
4. Analyser le problème
5. Corriger et re-tester
6. Re-déployer

## Sign-off

- [ ] Tests validés par l'équipe technique
- [ ] Processus validé par l'équipe RH
- [ ] Calculs validés par la comptabilité
- [ ] Conformité validée par le service juridique
- [ ] Go/No-Go pour la production

---

**Responsable Technique**: _____________________ Date: _____

**Responsable RH**: _____________________ Date: _____

**Direction**: _____________________ Date: _____
