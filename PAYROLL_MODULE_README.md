# Module Paie (Payroll) - Documentation

## Vue d'ensemble

Le module de paie permet de gérer l'ensemble du processus de rémunération des employés, incluant :
- Création et traitement des périodes de paie
- Gestion des éléments variables (primes, heures supplémentaires, déductions)
- Configuration des paramètres de paie (taux d'imposition, INSS, etc.)
- Génération et distribution automatique des bulletins de paie PDF

## Architecture

### Tables de base de données

1. **payroll_periods** : Périodes de paie (mois/année)
2. **payslips** : Bulletins de paie individuels
3. **payslip_items** : Détails des éléments du bulletin (salaire, primes, déductions)
4. **payroll_item_types** : Types d'éléments configurables (salaire de base, bonus, IRPP, etc.)
5. **payroll_variables** : Éléments variables ponctuels par employé
6. **payroll_settings** : Configuration globale (taux d'imposition, devise, jour de paiement)

### API Endpoints

#### Exécutions de paie
- `GET /api/payroll/runs` - Liste des exécutions de paie
- `GET /api/payroll/runs/:id` - Détails d'une exécution
- `POST /api/payroll/runs` - Créer une nouvelle période
- `POST /api/payroll/runs/:id/process` - Traiter la paie (calculer pour tous les employés)
- `POST /api/payroll/runs/:id/approve` - Approuver la paie
- `POST /api/payroll/runs/:id/distribute` - Distribuer les bulletins

#### Éléments variables
- `GET /api/payroll/variables` - Liste des éléments variables
- `POST /api/payroll/variables` - Créer un élément variable
- `PUT /api/payroll/variables/:id` - Modifier un élément
- `DELETE /api/payroll/variables/:id` - Supprimer un élément

#### Paramètres
- `GET /api/payroll/settings` - Récupérer les paramètres
- `PUT /api/payroll/settings` - Mettre à jour les paramètres

#### Bulletins employés (ESS)
- `GET /api/payroll/employees/:employeeId/payslips` - Bulletins d'un employé
- `GET /api/payroll/employees/:employeeId/payslips/:id` - Détail d'un bulletin
- `GET /api/payroll/employees/:employeeId/payslips/:id/download` - Télécharger le PDF
- `GET /api/payroll/employees/:employeeId/payment-history` - Historique des paiements

## Processus de paie

### 1. Création d'une période
```javascript
POST /api/payroll/runs
{
  "year": 2025,
  "month": 12,
  "payment_date": "2025-12-24"
}
```

### 2. Ajout d'éléments variables (optionnel)
```javascript
POST /api/payroll/variables
{
  "employee_id": "uuid",
  "variable_type": "bonus",
  "amount": 50000,
  "period": "2025-12",
  "description": "Prime de performance"
}
```

### 3. Traitement de la paie
```javascript
POST /api/payroll/runs/:id/process
```
Cette action :
- Récupère tous les employés actifs
- Calcule le salaire brut (salaire de base + primes + indemnités)
- Calcule les déductions (IRPP + INSS + autres)
- Calcule le salaire net
- Crée un bulletin (payslip) pour chaque employé

### 4. Approbation
```javascript
POST /api/payroll/runs/:id/approve
{
  "approved_by": "user_uuid"
}
```

### 5. Distribution des bulletins
```javascript
POST /api/payroll/runs/:id/distribute
{
  "distribution_method": "email"
}
```
Cette action génère les PDFs et marque les bulletins comme distribués.

## Calculs de paie

### Salaire brut
```
Salaire brut = Salaire de base + Indemnités + Primes + Heures sup.
```

### Déductions
```
IRPP = Salaire imposable × Taux IRPP (défaut: 30%)
INSS = Salaire brut × Taux INSS (défaut: 5%)
Total déductions = IRPP + INSS + Autres déductions
```

### Salaire net
```
Salaire net = Salaire brut - Total déductions
```

## Configuration initiale

### 1. Créer les tables
Exécutez le script SQL fourni pour créer toutes les tables nécessaires.

### 2. Initialiser les données
```bash
mysql -u username -p database_name < api/database/payroll_initial_data.sql
```

Ceci créera :
- Les types d'éléments de paie (salaire, primes, déductions)
- Les paramètres par défaut (IRPP 30%, INSS 5%)

### 3. Configurer les salaires de base
Assurez-vous que chaque grade ou poste a un salaire de base défini.

### 4. Installer les dépendances
```bash
cd api
npm install pdfkit
```

## Génération de bulletins PDF

Les bulletins sont générés automatiquement lors de la distribution et sauvegardés dans :
```
api/public/uploads/payslips/
```

Le PDF inclut :
- Informations de l'entreprise (SOFIBANK RDC)
- Informations de l'employé
- Période et numéro de bulletin
- Détail de tous les éléments (gains et déductions)
- Salaires brut et net

## Frontend - Pages et composants

### Page principale : `/dashboard/payroll`
4 onglets principaux :
- **Exécutions de paie** : Créer et gérer les périodes
- **Éléments variables** : Ajouter primes/déductions ponctuelles
- **Paramètres** : Configuration globale
- **Distribution** : Historique de distribution

### Profil employé : `/dashboard/employees/[id]`
Onglet "Paie" qui affiche :
- Résumé des paiements (total brut, net, déductions)
- Historique complet des bulletins
- Bouton de téléchargement PDF

## Types d'éléments variables

- **bonus** : Prime ponctuelle
- **overtime** : Heures supplémentaires
- **commission** : Commission sur ventes
- **allowance** : Indemnité (transport, logement, etc.)
- **deduction** : Déduction diverse

## Permissions requises

- `payroll.view` : Voir les données de paie
- `payroll.create` : Créer des périodes de paie
- `payroll.process` : Traiter la paie
- `payroll.approve` : Approuver la paie
- `payroll.distribute` : Distribuer les bulletins
- `payroll.settings` : Modifier les paramètres

## Exemples d'utilisation

### Créer une paie complète
```javascript
// 1. Créer la période
const run = await createPayrollRun({
  year: 2025,
  month: 12,
  payment_date: "2025-12-24"
});

// 2. Ajouter des primes
await createPayrollVariable({
  employee_id: "emp-uuid",
  variable_type: "bonus",
  amount: 100000,
  period: "2025-12",
  description: "Prime de fin d'année"
});

// 3. Traiter
await processPayrollRun(run.id);

// 4. Approuver
await approvePayrollRun(run.id, userId);

// 5. Distribuer
await distributePayslips(run.id, "email");
```

## Dépannage

### Problème : Aucun employé traité
- Vérifiez que des employés ont le statut "active"
- Vérifiez que les grades/postes ont un salaire de base

### Problème : PDF non généré
- Vérifiez que le dossier `api/public/uploads/payslips/` existe
- Vérifiez que PDFKit est installé
- Vérifiez les permissions d'écriture

### Problème : Calculs incorrects
- Vérifiez les paramètres de paie (taux IRPP/INSS)
- Vérifiez que les types d'éléments sont correctement configurés

## Évolutions futures

- [ ] Envoi automatique des bulletins par email
- [ ] Export comptable (écritures)
- [ ] Historique des modifications
- [ ] Gestion des acomptes
- [ ] Gestion des prêts
- [ ] Calcul automatique des congés payés
- [ ] Intégration bancaire pour virements
- [ ] Rapports analytiques avancés

## Support

Pour toute question ou problème, contactez l'équipe technique.
