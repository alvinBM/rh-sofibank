# SIRH - Système d'Information des Ressources Humaines

Plateforme SIRH complète pour la digitalisation de la Direction des Ressources Humaines de SOFIBANQUE, conforme au cahier des charges "Digitalisation de la DRH" (Appel d'offre N° 001/PRJ_DRH/11/2025).

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Structure du projet](#structure-du-projet)
- [Modules fonctionnels](#modules-fonctionnels)
- [Base de données](#base-de-données)
- [RBAC (Contrôle d'accès)](#rbac-contrôle-daccès)
- [Développement](#développement)
- [Déploiement](#déploiement)

## 🎯 Vue d'ensemble

Le SIRH est une application web centralisée qui digitalise l'ensemble des processus RH de la banque, couvrant 6 modules principaux :

1. **Acquisition des Talents & Onboarding** - Recrutement et intégration
2. **Gestion des Rémunérations et Paie** - Payroll complet
3. **Gestion des Mouvements et Présence** - Time & Attendance avec biométrie
4. **Gestion des Congés** - Workflow complet multi-niveaux
5. **Gestion de la Performance 360°** - Évaluations trimestrielles/semestrielles
6. **Indicateurs et Dashboard RH** - Analytics et rapports

## 🛠 Stack technique

### Frontend
- **Framework** : Next.js 14 (App Router)
- **UI Library** : NextUI (HeroUI)
- **State Management** : Redux Toolkit
- **Data Fetching** : React Query (TanStack Query)
- **Forms** : React Hook Form + Yup
- **Styling** : Tailwind CSS
- **Icons** : Iconify React

### Backend & Database
- **Database** : Supabase (PostgreSQL)
- **Authentication** : Supabase Auth
- **Storage** : Supabase Storage
- **APIs** : Axios (avec intercepteurs)

### Autres
- **Notifications** : React Toastify
- **PDF Generation** : jsPDF, react-pdf
- **Date Handling** : @internationalized/date
- **Charts** : Recharts

## 🏗 Architecture

### Pattern Axios → Services → Hooks (OBLIGATOIRE)

Le projet suit strictement cette architecture en 3 couches :

```
API Call Flow:
Component → Hook (React Query) → Service (Axios) → API Backend
```

#### 1. Axios Instance Centralisée

`src/services/axios.js` :
- Configuration globale (baseURL, headers, key, app)
- Intercepteurs pour injection du token Bearer
- Gestion des erreurs 401 (redirect login)

#### 2. Services API

`src/services/apis/*.js` :
- Fonctions pures pour chaque endpoint
- Gestion des query strings avec `qs`
- Support multipart/form-data pour uploads

Exemple : `src/services/apis/employeeService.js`

#### 3. Hooks React Query

`src/hooks/*.js` :
- `useQuery` pour les lectures (GET)
- `useMutation` pour les écritures (POST/PUT/DELETE)
- Invalidation automatique du cache
- Configuration `keepPreviousData: true`

Exemple : `src/hooks/useEmployees.js`

### Structure des composants

```
app/
├── ui/
│   ├── dashboard/
│   │   ├── sidebar/         # Sidebar dynamique basé sur permissions
│   │   ├── navbar/          # Header avec notifications
│   │   ├── forms/           # Modals de formulaires
│   │   └── [module]/        # Composants par module
│   └── landing/             # Pages publiques
├── dashboard/
│   ├── page.jsx             # Dashboard principal
│   ├── employees/           # Module employés
│   ├── leave/               # Module congés
│   ├── attendance/          # Module présence
│   ├── payroll/             # Module paie
│   ├── recruitment/         # Module recrutement
│   ├── performance/         # Module performance
│   ├── reports/             # Rapports & analytics
│   └── settings/            # Paramétrages (Super Admin)
└── auth/
    └── login/               # Page de connexion
```

## 🚀 Installation

### Prérequis

- Node.js 18.x ou supérieur
- npm ou yarn
- Compte Supabase (ou instance self-hosted)

### Étapes

1. **Cloner le repository**
   ```bash
   git clone <repo-url>
   cd sirh-sofibanque
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**

   Copier `.env.sample` vers `.env` et remplir les valeurs :

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

   # API Backend
   NEXT_PUBLIC_API_BASE_URL="https://api.stock243.com/api/v1"
   NEXT_PUBLIC_API_KEY="your-api-key"
   NEXT_PUBLIC_API_CHANNEL="Stock243-web"

   # Auth
   AUTH_SECRET="your-secret"
   AUTH_URL="http://localhost:3000/auth/login"

   # reCAPTCHA
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-recaptcha-key"
   ```

4. **Initialiser la base de données**

   Les migrations Supabase ont déjà été appliquées. Elles incluent :
   - Tables RBAC (roles, permissions, user_roles)
   - Tables employés et ESS
   - Tables congés et workflow
   - Tables présence/attendance
   - Tables paie
   - Tables recrutement
   - Tables performance 360°
   - Données de seed (rôles, permissions, types, etc.)

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

   L'application sera disponible sur `http://localhost:3000`

6. **Build de production**
   ```bash
   npm run build
   npm start
   ```

## ⚙️ Configuration

### Supabase

Le projet utilise Supabase pour :
- **Authentification** : Email/Password (pas de magic links)
- **Base de données** : PostgreSQL avec RLS
- **Storage** : Documents, photos, CV, etc.

### API Backend

L'instance Axios est configurée dans `src/services/axios.js` :
- Injection automatique du token Bearer Supabase
- Interception des erreurs 401 → redirect login
- Headers personnalisés (key, channel)

## 📁 Structure du projet

```
sirh-sofibanque/
├── app/                          # Next.js App Router
│   ├── auth/                     # Pages d'authentification
│   ├── dashboard/                # Pages dashboard (protégées)
│   ├── ui/                       # Composants UI réutilisables
│   ├── layout.js                 # Layout racine
│   ├── page.js                   # Landing page
│   └── providers.jsx             # Providers (Redux, React Query)
├── src/
│   ├── constants/                # Constantes (animations, pays, devises)
│   ├── helpers/                  # Fonctions utilitaires
│   ├── hooks/                    # Custom hooks React Query
│   │   ├── useRBAC.js
│   │   ├── useEmployees.js
│   │   ├── useLeave.js
│   │   └── ...
│   ├── lib/                      # Librairies configurées
│   │   ├── react-query-client.js
│   │   └── utils.js
│   ├── redux/                    # Redux store & slices
│   │   ├── store.js
│   │   ├── AuthContext.js
│   │   ├── ProtectedRoute.jsx
│   │   └── slices/
│   └── services/
│       ├── axios.js              # Instance Axios centralisée
│       └── apis/                 # Services API par domaine
│           ├── rbacService.js
│           ├── employeeService.js
│           ├── leaveService.js
│           ├── attendanceService.js (TODO)
│           ├── payrollService.js (TODO)
│           ├── recruitmentService.js (TODO)
│           └── performanceService.js (TODO)
├── public/                       # Assets statiques
├── supabase/                     # Migrations et Edge Functions
│   └── migrations/               # (appliquées automatiquement)
├── .env                          # Variables d'environnement
├── .env.sample                   # Template des variables
├── package.json
└── README.md
```

## 📚 Modules fonctionnels

### 1. Acquisition des Talents & Onboarding

**Tables** :
- `job_openings` : Postes vacants
- `candidates` : Candidats
- `candidate_interviews` : Entretiens
- `candidate_evaluations` : Évaluations candidats
- `job_offers` : Offres d'emploi

**Fonctionnalités** :
- Planification annuelle des besoins
- Publication de postes (site + réseaux sociaux)
- Gestion des candidatures
- Planification et évaluation des entretiens
- Production d'offres d'emploi
- Onboarding et finalisation dossier
- ESS étendu (documents, demandes, communication)

**Services** : `recruitmentService.js` (TODO)

**Hooks** : `useRecruitment.js` (TODO)

### 2. Gestion des Rémunérations et Paie

**Tables** :
- `payroll_periods` : Périodes de paie
- `payroll_item_types` : Types d'éléments de paie
- `payslips` : Bulletins de paie
- `payslip_items` : Lignes de bulletin
- `grades` : Grades
- `grade_benefits` : Avantages par grade

**Fonctionnalités** :
- Paramétrage grades, niveaux de rémunération, avantages
- Production payroll mensuelle + périodicité
- Calcul éléments variables (intérim, congé, mission, bonus, gratification)
- Calcul IRPP
- Distribution automatique bulletins le 24 du mois (ou dernier ouvrable)
- Accès strictement limité : RH + Taxes/Finances + Pay-Process/Procurement

**Services** : `payrollService.js` (TODO)

**Hooks** : `usePayroll.js` (TODO)

### 3. Gestion des Mouvements et Présence

**Tables** :
- `biometric_devices` : Terminaux biométriques (24 sites)
- `work_schedules` : Horaires de travail
- `attendance_records` : Enregistrements présence
- `work_authorizations` : Autorisations de sortie
- `attendance_anomalies` : Anomalies détectées
- `attendance_reports` : Rapports générés

**Fonctionnalités** :
- Collecte données biométriques (empreintes/reconnaissance oculaire/ISIS)
- Intégration 24 points d'installation
- Analyses journalières/hebdo/mensuelles
- Rapports automatiques retards, absences
- Demandes autorisations multi-plateformes
- Notifications supérieurs + RH

**Services** : `attendanceService.js` (TODO)

**Hooks** : `useAttendance.js` (TODO)

### 4. Gestion des Congés

**Tables** :
- `leave_types` : Types de congés
- `leave_balances` : Soldes par employé/année
- `leave_planning` : Planification annuelle
- `leave_requests` : Demandes de congés
- `leave_approvals` : Historique approbations
- `leave_handover_sheets` : Feuilles de remise-reprise

**Workflow** :
1. Employé (ESS) → Création demande
2. Collaborateur backup → Validation couverture
3. Supérieur hiérarchique → Approbation (après feuille remise-reprise)
4. DRH → Validation finale
5. **Cas spécial** : Responsables direction → validation par Direction Générale

**Fonctionnalités** :
- Planification annuelle Q4 → impression planning consolidé
- Gestion congés de circonstances
- Workflow multi-niveaux
- Feuille remise-reprise obligatoire
- Calcul & suivi soldes automatiques
- Calcul jours ouvrables (exclusion week-ends + jours fériés)

**Services** : ✅ `leaveService.js` (CRÉÉ)

**Hooks** : ✅ `useLeave.js` (CRÉÉ)

### 5. Gestion de la Performance 360°

**Tables** :
- `performance_cycles` : Cycles trimestriels/semestriels
- `kpis` : KPIs par fonction
- `performance_evaluations` : Évaluations
- `evaluation_kpi_responses` : Réponses aux KPIs
- `pip_plans` : Plans d'amélioration (PIP)

**Processus d'évaluation** :

**T1 (Jan-Mar) & T3 (Juil-Sept)** :
- Revue et validation KPIs (Superviseur)
- Auto-évaluation (Employé)
- Validation RH

**T2 (Avr-Juin) & T4 (Oct-Déc)** :
- Processus répété
- Rapport consolidé → DG pour validation (après Sup + DRH)
- Subalterne évalue supérieur
- Pairs (min. 2) évaluent responsable horizontal
- Recommandations leadership/promo/formation

**Notation** :
- Pondération semestre 1 & 2
- Échelle 10-100 (Très faible → Excellent)
- Zone explicative Key Success Factors

**PIP** :
- Suivi programme relèvement compétences
- Possibilité séparation si non-performant

**Services** : `performanceService.js` (TODO)

**Hooks** : `usePerformance.js` (TODO)

### 6. Indicateurs et Dashboard RH

**Tables** :
- `attendance_reports`
- Vues et agrégations via requêtes

**Fonctionnalités** :
- Dashboards dynamiques : effectifs, coûts salariaux (grade/direction/sexe), rotation, absentéisme, délai recrutement, résultats évaluations
- Rapports personnalisés : légaux/internes/stratégiques + filtres + export
- Alertes automatiques : dépassement seuils (ex: absentéisme élevé)

**Services** : `reportsService.js` (TODO)

**Hooks** : `useReports.js` (TODO)

## 🗄 Base de données

### Schéma général

La base de données Supabase contient 50+ tables organisées en modules :

#### RBAC (Role-Based Access Control)
```sql
roles                    -- Rôles système
permissions              -- Permissions granulaires
role_permissions         -- Liaison rôles-permissions
user_roles               -- Attribution rôles utilisateurs
audit_logs               -- Traçabilité actions
```

#### Structure Organisationnelle
```sql
directions               -- Directions de la banque
services                 -- Services par direction
grades                   -- Grades hiérarchiques
grade_benefits           -- Avantages par grade
job_positions            -- Postes/fonctions
```

#### Employés & ESS
```sql
employees                -- Profils employés complets
employee_dependents      -- Personnes à charge
employee_documents       -- Documents (contrats, fiches paie, etc.)
employee_requests        -- Demandes ESS (attestations, etc.)
employee_contracts       -- Historique contrats
employee_history         -- Historique carrière
document_types           -- Types de documents
request_types            -- Types de demandes ESS
birthday_cards           -- Cartes d'anniversaire
```

#### Congés
```sql
leave_types              -- Types de congés
leave_balances           -- Soldes par employé/année
leave_planning           -- Planification annuelle
leave_requests           -- Demandes de congés
leave_approvals          -- Historique approbations
leave_handover_sheets    -- Feuilles remise-reprise
```

#### Présence/Attendance
```sql
biometric_devices        -- Terminaux biométriques
work_schedules           -- Horaires de travail
attendance_records       -- Enregistrements présence
work_authorizations      -- Autorisations sortie
attendance_anomalies     -- Anomalies détectées
attendance_reports       -- Rapports générés
```

#### Paie/Payroll
```sql
payroll_periods          -- Périodes de paie
payroll_item_types       -- Types d'éléments de paie
payslips                 -- Bulletins de paie
payslip_items            -- Lignes de bulletin
```

#### Recrutement
```sql
job_openings             -- Postes vacants
candidates               -- Candidats
candidate_interviews     -- Entretiens
candidate_evaluations    -- Évaluations candidats
job_offers               -- Offres d'emploi
```

#### Performance 360°
```sql
performance_cycles       -- Cycles évaluation
kpis                     -- KPIs par fonction
performance_evaluations  -- Évaluations
evaluation_kpi_responses -- Réponses aux KPIs
pip_plans                -- Plans d'amélioration
```

#### Système
```sql
system_settings          -- Paramètres système
holidays                 -- Jours fériés
notifications            -- Notifications utilisateurs
```

### Row Level Security (RLS)

Toutes les tables utilisent RLS avec policies restrictives :

- **Principe du moindre privilège**
- Employés voient uniquement leurs propres données
- Managers voient leurs équipes
- RH voit tout
- Paie : accès limité RH + Finance + Procurement
- Audit complet des accès

Exemple de policy :
```sql
CREATE POLICY "Employees can view their own leave requests"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = leave_requests.employee_id
      AND e.user_id = auth.uid()
    )
  );
```

### Migrations

Les migrations Supabase sont dans `/supabase/migrations/` :

1. `create_rbac_and_core_tables.sql` - RBAC + structure org
2. `create_employees_and_ess_tables.sql` - Employés + ESS
3. `create_leave_management_tables_fixed.sql` - Congés
4. `create_attendance_tables.sql` - Présence
5. `create_payroll_recruitment_performance_tables.sql` - Paie, Recrutement, Performance
6. `seed_initial_data.sql` - Données d'initialisation

## 🔐 RBAC (Contrôle d'accès)

### Rôles système

| Code | Nom | Description |
|------|-----|-------------|
| `SUPER_ADMIN` | Super Administrateur | Accès complet système + paramétrages |
| `RH` | Administrateur RH | Gestion complète RH |
| `MANAGER` | Manager/Responsable | Gestion d'équipe + approbations |
| `EMPLOYEE` | Employé | Accès standard (ESS) |
| `DG` | Direction Générale | Validation finale (congés responsables, etc.) |
| `FINANCE` | Finance/Paie | Accès module paie |
| `RECRUITER` | Recruteur | Gestion recrutement |

### Permissions par module

**Paramétrages** :
- `settings_access` - Accès menu paramétrages
- `users_manage` - Gérer utilisateurs
- `roles_manage` - Gérer rôles & permissions
- `org_structure_manage` - Gérer structure org
- `system_settings_manage` - Paramètres système

**Employés** :
- `employees_view` - Voir employés
- `employees_manage` - Gérer employés
- `profile_view_own` - Voir son profil
- `profile_edit_own` - Modifier son profil

**ESS** :
- `ess_access` - Accès espace employé
- `documents_view_own` - Voir ses documents
- `requests_create` - Créer demandes RH
- `requests_manage_all` - Gérer toutes demandes

**Congés** :
- `leave_view` - Voir demandes congés
- `leave_create` - Créer demandes
- `leave_approve` - Approuver demandes
- `leave_manage_all` - Gestion complète

**Présence** :
- `attendance_view` - Voir présences
- `attendance_manage` - Gérer présences
- `authorization_request` - Demander autorisation
- `authorization_approve` - Approuver autorisations

**Paie** :
- `payroll_view` - Voir paie
- `payroll_manage` - Gérer paie
- `payslip_view_own` - Voir ses bulletins
- `payroll_settings` - Paramétrer paie

**Recrutement** :
- `recruitment_view` - Voir recrutements
- `recruitment_manage` - Gérer recrutements
- `candidates_evaluate` - Évaluer candidats

**Performance** :
- `performance_view` - Voir évaluations
- `performance_manage` - Gérer évaluations
- `self_evaluation` - Auto-évaluation
- `team_evaluation` - Évaluer équipe

**Dashboards** :
- `dashboard_view` - Voir dashboards
- `reports_view` - Voir rapports
- `reports_export` - Exporter rapports

### Helpers RBAC

Fonctions utilitaires dans `src/hooks/useRBAC.js` :

```javascript
// Vérifier permissions
hasPermission(permissions, ["leave_approve", "leave_manage_all"])

// Vérifier rôles
hasRole(roles, ["RH", "SUPER_ADMIN"])

// Hooks React Query
const { data: hasAccess } = useCheckPermission("settings_access");
const { data: isAdmin } = useCheckRole("SUPER_ADMIN");
```

Utilisation dans composants :
```jsx
import { hasPermission } from "@/src/hooks/useRBAC";

const MyComponent = () => {
  const userPermissions = useSelector(selectUserPermissions);

  if (!hasPermission(userPermissions, ["employees_view"])) {
    return <AccessDenied />;
  }

  return <EmployeesList />;
};
```

### Sidebar dynamique

Le sidebar (`app/ui/dashboard/sidebar/sidebar-items.js`) affiche automatiquement les menus selon les permissions de l'utilisateur :

```javascript
{
  key: "employees",
  href: "/dashboard/employees",
  icon: "solar:users-group-rounded-linear",
  title: "Employés",
  requiredPermission: "employees_view", // Menu visible si permission présente
}
```

## 💻 Développement

### Créer un nouveau module

1. **Créer les tables Supabase** (migration)
2. **Créer le service API** (`src/services/apis/moduleService.js`)
3. **Créer les hooks** (`src/hooks/useModule.js`)
4. **Créer les composants UI** (`app/ui/dashboard/module/`)
5. **Créer les pages** (`app/dashboard/module/`)
6. **Ajouter au sidebar** (`app/ui/dashboard/sidebar/sidebar-items.js`)

### Conventions de code

- **Composants** : PascalCase (`EmployeeCard.jsx`)
- **Hooks** : camelCase avec préfixe `use` (`useEmployees.js`)
- **Services** : camelCase avec suffix `Service` (`employeeService.js`)
- **Constantes** : SCREAMING_SNAKE_CASE
- **Fonctions** : camelCase
- **Fichiers config** : kebab-case

### Pattern Service + Hook

**Service** (`employeeService.js`) :
```javascript
export const fetchEmployees = async ({ offset, limit, query, filters }) => {
  const params = qs.stringify({ offset, limit, query, ...filters });
  const { data } = await api.get(`/employees?${params}`);

  if (data.status === 200) {
    return { employees: data.employees, total: data.total };
  }
  throw new Error(data.message);
};
```

**Hook** (`useEmployees.js`) :
```javascript
export const useGetEmployees = ({ page, rowsPerPage, query, filters }) => {
  const offset = (page - 1) * rowsPerPage;

  return useQuery({
    queryKey: ["employees", { page, rowsPerPage, query, filters }],
    queryFn: () => fetchEmployees({ offset, limit: rowsPerPage, query, filters }),
    keepPreviousData: true,
  });
};
```

**Composant** :
```jsx
const EmployeesList = () => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const { data, isLoading } = useGetEmployees({
    page,
    rowsPerPage: 10,
    query,
  });

  return (
    <Table>
      {data?.employees.map(employee => (
        <TableRow key={employee.id}>...</TableRow>
      ))}
    </Table>
  );
};
```

## 🚀 Déploiement

### Prérequis production

- Node.js 18.x
- Base de données Supabase configurée
- Variables d'environnement configurées

### Build

```bash
npm run build
```

### Déploiement Vercel

1. Connecter le repository GitHub
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Déploiement On-Premise

1. Build de production : `npm run build`
2. Copier le dossier `.next` + `public` + `package.json`
3. Installer dépendances de production : `npm install --production`
4. Démarrer : `npm start` (port configurable via `$PORT`)

### Déploiement Docker (TODO)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Exigences non fonctionnelles

### Performance
- Temps de réponse moyen < 3s
- Support grand volume données & utilisateurs
- Pagination + lazy loading
- Cache React Query agressif

### Sécurité
- Moindre privilège (RLS)
- Chiffrement transit (HTTPS) + au repos (Supabase)
- Authentification forte (Supabase Auth)
- Audit log complet
- RGPD + législation congolaise

### Fiabilité
- Disponibilité 99,5% (SLA Supabase)
- PRA/PCA (Supabase backups)
- Gestion erreurs robuste
- Toasts notifications utilisateur

### Portabilité
- Responsive (Desktop, Tablet, Mobile)
- Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- OS multi-plateformes (Windows, macOS, Linux)

### Localisation
- Interface multilingue (FR par défaut)
- Formats locaux (dates, devises)
- Support autres langues (ajouter dans i18n)

### Biométrie
- Intégration 24 terminaux biométriques
- Protocole de communication configurable
- Import/sync périodique données
- Support empreintes + reconnaissance oculaire/ISIS

## 📝 Prochaines étapes de développement

### Phase 1 : Compléter les services manquants
- [ ] Créer `attendanceService.js` + `useAttendance.js`
- [ ] Créer `payrollService.js` + `usePayroll.js`
- [ ] Créer `recruitmentService.js` + `useRecruitment.js`
- [ ] Créer `performanceService.js` + `usePerformance.js`
- [ ] Créer `reportsService.js` + `useReports.js`

### Phase 2 : Développer les pages UI
- [ ] Module Employés : liste, détail, formulaires
- [ ] Module ESS : profil, documents, demandes
- [ ] Module Congés : demandes, approbations, planning
- [ ] Module Présence : registre, autorisations, rapports
- [ ] Module Paie : bulletins, génération payroll
- [ ] Module Recrutement : postes, candidats, entretiens
- [ ] Module Performance : évaluations, KPIs, PIP
- [ ] Dashboards & Rapports
- [ ] Paramétrages Super Admin complet

### Phase 3 : Fonctionnalités avancées
- [ ] Génération PDF bulletins de paie
- [ ] Envoi automatique emails (bulletins le 24)
- [ ] Cartes anniversaire électroniques signées
- [ ] Import/Export Excel/CSV
- [ ] Intégration biométrie réelle
- [ ] Notifications temps réel (WebSockets)
- [ ] Workflow configurable
- [ ] Alertes automatiques seuils

### Phase 4 : Tests & Documentation
- [ ] Tests unitaires (services + hooks)
- [ ] Tests d'intégration (workflows)
- [ ] Tests E2E (Playwright/Cypress)
- [ ] Documentation utilisateur
- [ ] Documentation API
- [ ] Vidéos tutoriels

### Phase 5 : Optimisations
- [ ] Code splitting
- [ ] Image optimization
- [ ] Bundle analyzer
- [ ] Performance profiling
- [ ] SEO (pages publiques)

## 🤝 Support & Contact

Pour toute question ou problème :
- **Email technique** : jngamba@sofibanque.com
- **Email admin** : pkabundi@sofibanque.com
- **Email projet** : engunga@sofibanque.com

---

**Développé pour SOFIBANQUE** | Version 0.0.1 | © 2025
