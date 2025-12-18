# Documentation - Module Fiche Employé Complète

## 📋 Vue d'ensemble

Ce module implémente une fiche employé complète avec toutes les fonctionnalités requises :

- ✅ **Gestion des documents** (attestations, contrats, évaluations, etc.)
- ✅ **Demandes de congé** liées à l'employé
- ✅ **Historique des paiements** avec téléchargement des bulletins de paie
- ✅ **Calendrier de présence** avec mode liste des mouvements (entrées/sorties)
- ✅ **Seeder de données de test** pour tous les employés

## 🏗️ Architecture

### Backend (API)

#### Nouveaux Controllers

1. **`employeeDocumentsController.js`**
   - `getByEmployeeId` - Liste tous les documents d'un employé
   - `getById` - Récupère un document spécifique
   - `create` - Upload un nouveau document
   - `update` - Met à jour les métadonnées d'un document
   - `delete` - Supprime un document
   - `download` - Télécharge un document

2. **`employeePayrollController.js`**
   - `getPayslips` - Liste des bulletins de paie d'un employé
   - `getPayslipById` - Récupère un bulletin spécifique avec détails
   - `downloadPayslip` - Télécharge le PDF du bulletin
   - `getPaymentHistory` - Historique complet avec résumé statistique

3. **`employeeAttendanceController.js`**
   - `getByEmployeeId` - Liste des présences avec statistiques
   - `getCalendarData` - Données formatées pour le calendrier
   - `getMovements` - Liste des mouvements (entrées/sorties)
   - `getMonthlySummary` - Résumé mensuel de présence

#### Routes Ajoutées

Toutes les routes sont ajoutées dans `/api/src/api/routes/employeeRoutes.js` :

```javascript
// Documents
GET    /employees/:employeeId/documents
POST   /employees/:employeeId/documents
GET    /employees/:employeeId/documents/:id
PUT    /employees/:employeeId/documents/:id
DELETE /employees/:employeeId/documents/:id
GET    /employees/:employeeId/documents/:id/download

// Paiements
GET    /employees/:employeeId/payslips
GET    /employees/:employeeId/payment-history
GET    /employees/:employeeId/payslips/:id
GET    /employees/:employeeId/payslips/:id/download

// Présences
GET    /employees/:employeeId/attendance
GET    /employees/:employeeId/attendance/calendar
GET    /employees/:employeeId/attendance/movements
GET    /employees/:employeeId/attendance/summary
```

### Frontend (Next.js)

#### Nouveaux Hooks

1. **`useEmployeeDocuments.js`**
   - `useGetEmployeeDocuments` - Récupère les documents
   - `useUploadEmployeeDocument` - Upload un document
   - `useUpdateEmployeeDocument` - Met à jour un document
   - `useDeleteEmployeeDocument` - Supprime un document
   - `useDownloadEmployeeDocument` - Télécharge un document

2. **`useEmployeeAttendance.js`**
   - `useGetEmployeeAttendance` - Récupère les présences
   - `useGetAttendanceCalendar` - Données pour le calendrier
   - `useGetAttendanceMovements` - Liste des mouvements
   - `useGetMonthlySummary` - Résumé mensuel

3. **Services mis à jour**
   - `employeeService.js` - Méthodes pour documents améliorées
   - `payrollService.js` - Ajout des méthodes employé-spécifiques
   - `attendanceService.js` - Nouveau service créé

#### Composants UI

Tous les composants sont dans `/app/dashboard/employees/[id]/components/` :

1. **`DocumentsSection.jsx`**
   - Liste des documents avec filtres par type
   - Modal d'upload avec formulaire complet
   - Actions : Télécharger, Supprimer
   - Affichage du statut de vérification
   - Gestion des dates d'expiration

2. **`PayrollSection.jsx`**
   - Résumé statistique (total paiements, brut, net, déductions)
   - Tableau d'historique des paiements
   - Bouton de téléchargement pour chaque bulletin
   - Formatage monétaire en CDF

3. **`AttendanceSection.jsx`**
   - Deux modes : Calendrier et Liste
   - **Mode Calendrier** :
     - Intégration FullCalendar
     - Vue mensuelle avec code couleur par statut
     - Affichage des heures d'entrée/sortie
     - Indicateur de retard
   - **Mode Liste** :
     - Liste chronologique des mouvements
     - Distinction entrée/sortie
     - Statut (à l'heure, en retard)
     - Total heures travaillées
   - Statistiques mensuelles en cards

4. **`LeaveRequestsSection.jsx`**
   - Liste des demandes de congé
   - Statut avec code couleur
   - Lien vers la page de détail
   - Bouton pour créer une nouvelle demande

#### Page Principale

`/app/dashboard/employees/[id]/page.jsx` - Page mise à jour avec :
- Import de tous les nouveaux hooks
- Intégration des 4 nouveaux composants
- Nouveaux onglets : Documents, Paiements, Présence, Congés
- Gestion des états de chargement

## 📦 Base de Données

### Tables Utilisées

Le schéma existe déjà dans `schema_new.sql` :

- `employee_documents` - Stockage des documents
- `document_types` - Types de documents
- `payroll_periods` - Périodes de paie
- `payslips` - Bulletins de paie
- `payslip_items` - Lignes de bulletins
- `attendance_records` - Enregistrements de présence
- `leave_requests` - Demandes de congé

### Seeder de Données

**Fichier** : `/api/database/employee_test_data_seeder.sql`

Le seeder génère automatiquement :

#### 1. Documents (pour chaque employé)
- Contrat de travail
- Carte d'identité
- Diplômes
- Certificats
- Attestations de service
- Attestations de congé
- Évaluations

#### 2. Périodes de Paie
- 12 périodes pour toute l'année 2024
- Statut "paid" avec dates réalistes

#### 3. Bulletins de Paie
- Générés automatiquement pour tous les employés
- 12 bulletins par employé (un par mois)
- Calculs réalistes :
  - Salaire de base selon le grade
  - Allocations (20%)
  - Bonus (10%)
  - Déductions (25%)
  - Impôts (15%)
  - Net = 80% du brut

#### 4. Présences (3 derniers mois)
- Génération automatique pour chaque jour ouvrable
- Distribution réaliste :
  - 85% présences normales
  - 10% retards (5-60 minutes)
  - 5% absences
- Heures d'entrée/sortie avec variation
- Calcul du total d'heures

#### 5. Demandes de Congé
- Une demande de congé annuel par employé
- Statut : approuvé
- 14 jours de congé

### Exécution du Seeder

```bash
# Depuis le dossier api/database
mysql -u root -p rh_sofibank < employee_test_data_seeder.sql
```

Ou via MySQL Workbench :
1. Ouvrir le fichier `employee_test_data_seeder.sql`
2. Exécuter le script
3. Vérifier les résultats affichés

## 🚀 Installation et Configuration

### 1. Backend

```bash
cd api
npm install express-fileupload
```

Ajouter dans `app.js` ou `server.js` :

```javascript
import fileUpload from 'express-fileupload';

app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  abortOnLimit: true,
  createParentPath: true
}));
```

### 2. Frontend

```bash
cd ..
npm install @fullcalendar/react @fullcalendar/daygrid
```

### 3. Base de Données

```bash
cd api/database
mysql -u root -p rh_sofibank < employee_test_data_seeder.sql
```

## 📱 Utilisation

### Accéder à la Fiche Employé

1. Naviguer vers `/dashboard/employees`
2. Cliquer sur un employé dans la liste
3. Explorer les différents onglets :

#### Onglet "Documents"
- Cliquer sur "Ajouter un Document"
- Sélectionner un fichier (PDF, DOC, DOCX, JPG, PNG)
- Renseigner les informations
- Télécharger ou supprimer des documents existants

#### Onglet "Paiements"
- Voir le résumé des paiements en haut
- Consulter l'historique dans le tableau
- Cliquer sur "Bulletin" pour télécharger un PDF

#### Onglet "Présence"
- Basculer entre "Calendrier" et "Liste"
- **Calendrier** : Vue mensuelle avec couleurs
- **Liste** : Mouvements chronologiques
- Statistiques mensuelles affichées en haut

#### Onglet "Congés"
- Liste des demandes avec statut
- Cliquer sur "Nouvelle Demande" pour créer
- Cliquer sur une demande pour voir les détails

## 🎨 Personnalisation

### Couleurs de Statut

Personnalisables dans chaque composant :

```javascript
// Présence
const STATUS_COLORS = {
    present: "success",
    absent: "danger",
    late: "warning",
    on_leave: "primary",
};

// Congés
const LEAVE_STATUS_COLORS = {
    approved: "success",
    pending: "warning",
    rejected: "danger",
};
```

### Types de Documents

Ajoutables dans `DocumentsSection.jsx` :

```javascript
const DOCUMENT_TYPES = [
    { value: "contract", label: "Contrat de travail" },
    // Ajouter ici
];
```

## 🔒 Sécurité

- Toutes les routes nécessitent une authentification (`validateToken`)
- Permissions vérifiées via `checkPermission`
- Upload de fichiers avec validation de type et taille
- Téléchargement sécurisé avec vérification de propriété

## 📊 Statistiques Disponibles

### Paiements
- Total des paiements
- Somme salaire brut
- Somme salaire net
- Total des déductions
- Total des impôts

### Présence
- Jours travaillés
- Jours présents
- Absences
- Retards
- Congés pris
- Total heures travaillées
- Minutes de retard cumulées

## 🐛 Dépannage

### Problème d'upload de fichiers
Vérifier que le dossier existe :
```bash
mkdir -p api/public/uploads/documents
chmod 755 api/public/uploads/documents
```

### PDF de bulletins non trouvés
Les PDF sont générés par le système de paie. Le seeder crée uniquement les enregistrements.

### Calendrier ne s'affiche pas
Vérifier l'installation de FullCalendar :
```bash
npm list @fullcalendar/react
```

## 📝 Notes Importantes

1. **Performance** : Les requêtes incluent des `include` pour charger les relations. Pour de grandes quantités de données, envisager la pagination.

2. **Fichiers physiques** : Le seeder ne crée pas de fichiers physiques, uniquement les enregistrements en base. Pour tester les téléchargements, ajouter des fichiers réels.

3. **Permissions** : S'assurer que les permissions `view_employees`, `update_employee`, etc. sont bien configurées dans le système RBAC.

4. **Dates** : Toutes les dates sont gérées en UTC côté serveur et formatées en locale côté client.

## 🔄 Prochaines Améliorations Possibles

- [ ] Génération automatique des PDF de bulletins de paie
- [ ] Signature électronique des documents
- [ ] Notifications push pour nouveaux documents
- [ ] Export Excel de l'historique de paiement
- [ ] Graphiques de présence sur plusieurs mois
- [ ] OCR pour extraction automatique de données des documents
- [ ] Workflow d'approbation des documents
- [ ] Archivage automatique des anciens documents

## 📞 Support

Pour toute question ou problème :
1. Consulter les logs du serveur : `api/logs/`
2. Vérifier la console du navigateur
3. Tester les endpoints via Postman/Thunder Client

---

**Créé le** : 18 Décembre 2025  
**Version** : 1.0.0  
**Auteur** : GitHub Copilot
