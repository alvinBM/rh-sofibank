# Module CONGÉS - SIRH

## Vue d'ensemble

Le module CONGÉS est un système complet de gestion des demandes de congés avec workflow d'approbation multi-niveaux, gestion des soldes, et planification annuelle.

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Workflow d'approbation](#workflow-dapprobation)
- [Pages créées](#pages-créées)
- [Services et hooks](#services-et-hooks)
- [Base de données](#base-de-données)
- [Installation](#installation)
- [Utilisation](#utilisation)

## Fonctionnalités

### 1. Demandes de congés (requests/page.jsx)

- **Création de demandes** par les employés (ESS)
  - Sélection du type de congé avec affichage du solde disponible
  - Calcul automatique de la durée en jours ouvrables
  - Sélection obligatoire d'un collaborateur backup
  - Upload de la Feuille de Remise-Reprise (PDF/image)
  - Checkbox obligatoire pour confirmer la complétion de la Remise-Reprise

- **Workflow d'approbation** à 4 niveaux :
  1. Employé (ESS) crée la demande
  2. Collaborateur backup confirme
  3. Supérieur hiérarchique valide (nécessite Feuille Remise-Reprise)
  4. DRH valide (ou DG pour les responsables de direction)

- **Traçabilité complète**
  - Timeline visuelle du workflow
  - Historique des approbations avec commentaires
  - Timestamps pour chaque étape

- **Gestion des statuts**
  - draft, pending_backup, backup_confirmed, pending_supervisor, pending_hr, pending_dg, approved, rejected, cancelled

- **Actions disponibles**
  - Voir détails
  - Approuver (selon le rôle)
  - Rejeter avec raison
  - Annuler (pour l'employé)

- **Filtres et recherche**
  - Par statut, type de congé, période, employé
  - Pagination configurable

### 2. Soldes de congés (balance/page.jsx)

- **Vue d'ensemble des soldes**
  - Cards statistiques : Total acquis, Utilisé, En attente, Disponible
  - Table détaillée par employé et type de congé

- **Informations par ligne**
  - Employé, Département, Type de congé
  - Total jours, Utilisés, En attente, Restants
  - Reports de l'année précédente

- **Ajustement de solde (RH uniquement)**
  - Modal avec incrémentation/décrémentation
  - Raison obligatoire
  - Validation avec confirmation
  - Calcul automatique du nouveau solde

- **Historique des ajustements**
  - Liste chronologique des modifications
  - Utilisateur ayant effectué l'ajustement
  - Raison et montant

- **Filtres**
  - Par année, département, type de congé, employé
  - Recherche par nom d'employé

- **Export**
  - Excel/PDF (en développement)

### 3. Planification annuelle (planning/page.jsx)

- **Vue Calendrier**
  - Grille mensuelle pour les 12 mois
  - Affichage visuel des congés par employé
  - Légende par type de congé avec codes couleur
  - Indication des weekends et jours fériés

- **Vue Liste**
  - Table de tous les congés approuvés
  - Tri et filtres disponibles

- **Vue Statistiques**
  - Congés par type (nombre et total jours)
  - Congés par département
  - Répartition mensuelle
  - Graphiques et indicateurs

- **Détection de conflits**
  - Analyse des absences simultanées
  - Alerte si trop d'employés absents en même temps
  - Suggestions de planning optimal

- **Impression consolidée**
  - Génération de planning PDF
  - Vue imprimable pour les managers
  - Export par département/année

## Architecture

### Structure des fichiers

```
/tmp/cc-agent/61525859/project/
├── app/
│   ├── dashboard/
│   │   └── leave/
│   │       ├── requests/
│   │       │   └── page.jsx          # Page demandes
│   │       ├── balance/
│   │       │   └── page.jsx          # Page soldes
│   │       └── planning/
│   │           └── page.jsx          # Page planification
│   └── ui/
│       └── dashboard/
│           └── leave/
│               └── WorkflowTimeline.jsx  # Composant Timeline
├── src/
│   ├── services/
│   │   └── apis/
│   │       └── leaveService.js       # Service API
│   ├── hooks/
│   │   └── useLeave.js               # Hooks React Query
│   └── utils/
│       └── dateUtils.js              # Utilitaires dates
└── docs/
    ├── leave-module-database-migrations.sql  # Migrations SQL
    └── LEAVE_MODULE_README.md         # Ce fichier
```

## Workflow d'approbation

### Flux normal

```
Employé (ESS)
    ↓ Crée demande + sélectionne backup
[DRAFT]
    ↓ Soumet
[PENDING_BACKUP]
    ↓ Backup confirme
[BACKUP_CONFIRMED]
    ↓ Complète Feuille Remise-Reprise
[PENDING_SUPERVISOR]
    ↓ Supérieur approuve (vérifie Remise-Reprise)
[PENDING_HR]
    ↓ DRH valide (mise à jour soldes)
[APPROVED]
```

### Flux pour responsables de direction

```
[PENDING_SUPERVISOR]
    ↓ Supérieur approuve
[PENDING_DG]
    ↓ Direction Générale valide
[APPROVED]
```

### Règles métier importantes

1. **Backup obligatoire** : Toute demande doit avoir un collaborateur remplaçant
2. **Feuille Remise-Reprise** : Obligatoire AVANT validation du supérieur
3. **Workflow différencié** : Les responsables de direction ont une validation par DG au lieu de DRH
4. **Mise à jour soldes** : Uniquement après validation finale
5. **Calcul automatique** : Durée calculée en jours ouvrables (excluant weekends + jours fériés)
6. **Congés de circonstances** : Ne déduisent pas du solde principal

## Services et hooks

### leaveService.js

Fonctions principales :
- `fetchLeaveTypes()` : Récupérer les types de congés
- `fetchLeaveRequests()` : Récupérer les demandes avec filtres
- `createLeaveRequest()` : Créer une demande
- `submitLeaveRequest()` : Soumettre une demande
- `approveByBackup()` : Approbation par backup
- `approveBySupervisor()` : Approbation par superviseur
- `approveByHR()` : Approbation par RH (validation finale)
- `approveByDG()` : Approbation par DG
- `rejectLeaveRequest()` : Rejeter une demande
- `cancelLeaveRequest()` : Annuler une demande
- `uploadHandoverDocument()` : Upload document Remise-Reprise
- `calculateWorkingDaysFromDB()` : Calculer jours ouvrables
- `fetchAllLeaveBalances()` : Récupérer tous les soldes
- `adjustLeaveBalance()` : Ajuster un solde (RH)
- `fetchBalanceAdjustmentHistory()` : Historique ajustements
- `fetchAllApprovedLeaveRequests()` : Planning (congés approuvés)
- `detectLeaveConflicts()` : Détecter conflits
- `fetchLeaveStatsByDepartment()` : Statistiques par département

### useLeave.js

Hooks React Query :
- `useGetLeaveTypes()`
- `useGetLeaveRequests()`
- `useGetLeaveRequestById()`
- `useCreateLeaveRequest()`
- `useSubmitLeaveRequest()`
- `useApproveByBackup()`
- `useApproveBySupervisor()`
- `useApproveByHR()`
- `useApproveByDG()`
- `useRejectLeaveRequest()`
- `useCancelLeaveRequest()`
- `useUploadHandoverDocument()`
- `useCalculateWorkingDays()`
- `useGetAllLeaveBalances()`
- `useAdjustLeaveBalance()`
- `useGetBalanceAdjustmentHistory()`
- `useGetAllApprovedLeaveRequests()`
- `useDetectLeaveConflicts()`
- `useGetLeaveStatsByDepartment()`

### dateUtils.js

Fonctions utilitaires :
- `calculateWorkingDays()` : Calcul jours ouvrables
- `isWeekend()` : Vérifier si weekend
- `isHoliday()` : Vérifier si jour férié
- `formatDateToFrench()` : Format DD/MM/YYYY
- `formatDateTimeToFrench()` : Format DD/MM/YYYY HH:MM
- `formatDateToISO()` : Format YYYY-MM-DD
- `getMonthsForYear()` : Liste des mois
- `getDaysInMonth()` : Jours d'un mois
- `periodsOverlap()` : Vérifier chevauchement de périodes
- Autres fonctions de manipulation de dates

## Base de données

### Tables principales

1. **leave_requests** (modifiée)
   - Colonnes ajoutées pour workflow
   - backup_employee_id, supervisor_id
   - handover_document_url, handover_completed
   - workflow_status, duration
   - Timestamps pour chaque étape

2. **leave_approvals** (nouvelle)
   - Historique des approbations
   - level (backup, supervisor, hr, dg)
   - status, comments, approved_at

3. **leave_balance_adjustments** (nouvelle)
   - Historique des ajustements manuels
   - adjustment, reason, adjusted_by

4. **holidays** (nouvelle)
   - Jours fériés pour calcul jours ouvrables
   - date, name, is_recurring, year

5. **leave_balances** (modifiée)
   - pending_days, carry_forward_days ajoutés

6. **leave_types** (modifiée)
   - color, code, deduct_from_balance
   - requires_medical_certificate
   - max_consecutive_days, min_notice_days

### Fonctions SQL

- `generate_leave_request_number()` : Génère LV-YYYY-NNNN
- `calculate_working_days()` : Calcul jours ouvrables

### Vues

- `v_leave_requests_summary` : Vue complète des demandes
- `v_leave_balances_summary` : Vue des soldes avec calculs

### Triggers

- Calcul automatique de la durée
- Mise à jour de updated_at
- Validation des statuts

## Installation

### 1. Migrations base de données

Exécuter le fichier SQL dans Supabase :
```bash
psql -h your-supabase-host -U postgres -d postgres -f docs/leave-module-database-migrations.sql
```

Ou via l'interface Supabase SQL Editor :
- Copier le contenu de `leave-module-database-migrations.sql`
- Coller dans SQL Editor
- Exécuter

### 2. Configuration Supabase Storage

Créer un bucket pour les documents :
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('leave-documents', 'leave-documents', false);
```

Configurer les politiques RLS pour le bucket.

### 3. Jours fériés

Ajouter les jours fériés pour les années à venir dans la table `holidays`.

### 4. Permissions

Configurer les permissions dans la table `permissions` :
- `leave_requests_view` : Voir les demandes
- `leave_requests_create` : Créer des demandes
- `leave_requests_approve` : Approuver des demandes
- `leave_manage_balance` : Gérer les soldes
- `leave_manage_types` : Gérer les types de congés
- `ess_access` : Accès ESS

## Utilisation

### Pour les employés (ESS)

1. Aller sur **Congés > Demandes**
2. Cliquer sur **Nouvelle Demande**
3. Remplir le formulaire :
   - Type de congé
   - Dates (durée calculée automatiquement)
   - Sélectionner un remplaçant
   - Ajouter un commentaire
   - Cocher "Feuille Remise-Reprise complétée"
   - Upload le document (optionnel)
4. Soumettre la demande

### Pour les approbateurs

1. Aller sur **Congés > Demandes**
2. Voir les demandes en attente
3. Cliquer sur **Actions > Voir détails**
4. Vérifier la timeline et les informations
5. Cliquer sur **Actions > Approuver** ou **Rejeter**
6. Ajouter un commentaire (optionnel)
7. Confirmer

### Pour les RH

#### Gestion des soldes

1. Aller sur **Congés > Soldes**
2. Voir les statistiques globales
3. Filtrer par année/département/type
4. Cliquer sur **Actions > Ajuster le solde**
5. Entrer l'ajustement (+/- jours)
6. Indiquer la raison
7. Confirmer

#### Planification

1. Aller sur **Congés > Planning**
2. Sélectionner l'année et le département
3. Utiliser les 3 vues :
   - **Calendrier** : Vue mensuelle visuelle
   - **Liste** : Table de tous les congés
   - **Statistiques** : Indicateurs et graphiques
4. Cliquer sur **Détecter conflits** pour analyser
5. Cliquer sur **Générer PDF** pour exporter

## Permissions requises

| Page | Permission |
|------|-----------|
| Demandes (vue) | `leave_requests_view` ou `ess_access` |
| Demandes (création) | `leave_requests_create` ou `ess_access` |
| Demandes (approbation) | `leave_requests_approve` |
| Soldes (vue) | `leave_view` |
| Soldes (modification) | `leave_manage_balance` |
| Planning (vue) | `leave_view` |
| Planning (gestion) | `leave_manage_types` |

## TODO / Améliorations futures

- [ ] Implémenter la génération PDF du planning
- [ ] Ajouter l'export Excel des soldes
- [ ] Créer un dashboard de statistiques avancées
- [ ] Ajouter des notifications par email à chaque étape
- [ ] Implémenter la planification prévisionnelle (T4)
- [ ] Ajouter un calendrier interactif avec drag & drop
- [ ] Créer des rapports RH personnalisables
- [ ] Ajouter la gestion des absences non planifiées
- [ ] Implémenter les règles de validation par politique d'entreprise
- [ ] Ajouter l'intégration avec le calendrier Outlook/Google

## Support

Pour toute question ou problème :
- Consulter la documentation technique dans `/docs`
- Vérifier les migrations SQL
- Contacter l'équipe de développement

---

**Version:** 1.0.0
**Date:** Décembre 2025
**Auteur:** Claude AI pour SofiBanque SIRH
