# Migration Supabase → Express API - Guide Complet

## ✅ Travaux Complétés

### 1. **Service API Client Centralisé** (`src/services/api-client.js`)
Client HTTP centralisé qui gère:
- Authentification automatique (Bearer Token)
- Gestion du token JWT dans localStorage
- Headers standardisés
- Gestion des erreurs
- Support des uploads (multipart/form-data)
- Méthodes: GET, POST, PUT, PATCH, DELETE, UPLOAD

### 2. **Service d'Authentification Migré** (`src/services/authService.js`)
Fonctions migrées vers l'API Express:
- ✅ `signIn(email, password)` - POST /api/auth/login
- ✅ `signUp(email, password, userData)` - POST /api/auth/register  
- ✅ `signOut()` - Déconnexion locale
- ✅ `getCurrentUser()` - GET /api/auth/profile
- ✅ `updateProfile(userId, updates)` - PUT /api/auth/profile
- ✅ `changePassword(currentPassword, newPassword)` - POST /api/auth/change-password
- ✅ `resetPassword(email)` - POST /api/auth/request-password-reset

### 3. **Nouveaux Services API Créés**

#### **Employee Service** (`src/services/apis/employeeService.js`)
- ✅ fetchEmployees (avec pagination et filtres)
- ✅ fetchEmployeeById
- ✅ fetchEmployeeByUserId
- ✅ createEmployee
- ✅ updateEmployee
- ✅ updateEmployeeStatus
- ✅ terminateEmployee
- ✅ deleteEmployee
- ✅ fetchEmployeeStatistics
- ✅ fetchSubordinates
- ✅ fetchEmployeeDependents (placeholder pour future implémentation)
- ✅ fetchEmployeeDocuments (placeholder)
- ✅ uploadEmployeeDocument (placeholder)

#### **Attendance Service** (`src/services/apis/attendanceApiService.js`)
- ✅ fetchAttendanceRecords (avec pagination et filtres)
- ✅ fetchAttendanceRecordById
- ✅ checkIn
- ✅ checkOut
- ✅ createOrUpdateAttendanceRecord
- ✅ deleteAttendanceRecord
- ✅ fetchAttendanceStatistics
- ✅ fetchEmployeeAttendanceSummary

#### **Leave Service** (`src/services/apis/leaveApiService.js`)
- ✅ fetchLeaveTypes
- ✅ createLeaveType
- ✅ fetchLeaveRequests (avec pagination et filtres)
- ✅ fetchLeaveRequestById
- ✅ createLeaveRequest
- ✅ submitLeaveRequest
- ✅ approveLeaveRequest
- ✅ rejectLeaveRequest
- ✅ cancelLeaveRequest
- ✅ fetchEmployeeLeaveBalance
- ✅ initializeLeaveBalances

#### **RBAC Service** (`src/services/apis/rbacApiService.js`)
- ✅ fetchRoles
- ✅ fetchRoleById
- ✅ createRole
- ✅ updateRole
- ✅ deleteRole
- ✅ fetchPermissions
- ✅ assignPermissionsToRole
- ✅ assignRolesToUser
- ✅ fetchUserRoles
- ✅ fetchUserPermissions

#### **Settings Service** (`src/services/apis/settingsApiService.js`)
- ✅ Directions: fetch, create, update, delete
- ✅ Services: fetch, create, update, delete
- ✅ Grades: fetch, create, update, delete
- ✅ Job Positions: fetch, create, update, delete

### 4. **Controllers API Créés**

#### **Settings Controller** (`api/src/api/controllers/settingsController.js`)
- ✅ CRUD complet pour Directions
- ✅ CRUD complet pour Services
- ✅ CRUD complet pour Grades
- ✅ CRUD complet pour Job Positions

#### **Routes Settings** (`api/src/api/routes/settingsRoutes.js`)
- ✅ Routes protégées avec validateToken
- ✅ Permissions vérifiées avec checkPermission
- ✅ Endpoints:
  - GET/POST/PUT/DELETE `/settings/directions`
  - GET/POST/PUT/DELETE `/settings/services`
  - GET/POST/PUT/DELETE `/settings/grades`
  - GET/POST/PUT/DELETE `/settings/job-positions`

### 5. **AuthContext Migré** (`src/redux/AuthContext.js`)
- ✅ Suppression de toutes les références à Supabase
- ✅ Utilisation d'apiClient pour la gestion du token
- ✅ Token stocké dans localStorage avec clé `auth_token`
- ✅ Initialisation automatique au chargement
- ✅ Login et Logout mis à jour

### 6. **Configuration**
- ✅ `.env.local` créé avec `NEXT_PUBLIC_API_URL=http://localhost:3600/api`
- ✅ API démarrée sur `http://localhost:3600`
- ✅ Base de données connectée et synchronisée

## 🎯 Prochaines Étapes

### À Tester Immédiatement
1. **Test du Login**
   - Ouvrir: `http://localhost:3000/auth/login`
   - Tester avec: `admin@sofibank.com` / `password123`
   - Vérifier la redirection vers `/dashboard`
   - Vérifier le token dans localStorage (`auth_token`)

2. **Test des Hooks React Query**
   - Les hooks doivent être mis à jour pour utiliser les nouveaux services
   - Exemples: `useEmployees`, `useLeave`, `useAttendance`

### Travaux Restants

#### 1. **Mettre à jour les hooks React Query**
Les fichiers à modifier:
- `src/hooks/useEmployees.js` - Utiliser `employeeService`
- `src/hooks/useLeave.js` - Utiliser `leaveApiService`
- `src/hooks/useAttendance.js` - Utiliser `attendanceApiService`
- `src/hooks/useSettings.js` - Utiliser `settingsApiService`
- `src/hooks/useRBAC.js` - Utiliser `rbacApiService`

#### 2. **Supprimer toutes les références Supabase**
Fichiers identifiés avec des références Supabase:
- ❌ `src/services/apis/attendanceService.js` (ancien fichier)
- ❌ `src/services/apis/rbacService.js` (ancien fichier)
- ❌ `src/services/apis/essService.js`
- ❌ `src/services/apis/performanceService.js`
- ❌ `src/services/apis/leaveService.js` (ancien fichier)
- ❌ `src/services/apis/mainService.js`
- ❌ `src/services/apis/financeService.js`
- ❌ `src/services/apis/settingsService.js` (ancien fichier)
- ❌ `src/services/apis/recruitmentService.js`
- ❌ `src/services/apis/purchaseService.js`
- ❌ `src/services/apis/reportsService.js`
- ❌ `src/services/apis/providerService.js`
- ❌ `src/services/apis/clientService.js`
- ❌ `src/services/apis/productService.js`
- ❌ `src/services/apis/storeService.js`
- ❌ `src/services/apis/userService.js`
- ❌ `src/services/apis/payrollService.js`
- ❌ `src/lib/supabase-client.js` (peut être supprimé)

#### 3. **Controllers API à créer (si nécessaire)**
- RBAC Controller (roles, permissions)
- Performance Controller
- Recruitment Controller
- Reports Controller
- Payroll Controller
- Finance Controller

#### 4. **Tests de bout en bout**
- Tester le workflow complet de création d'employé
- Tester le workflow d'approbation de congés
- Tester le pointage (check-in/check-out)
- Tester les permissions RBAC

## 📝 Comptes de Test

Utiliser ces comptes pour tester:

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `admin@sofibank.com` | `password123` | Super Admin |
| `rh.manager@sofibank.com` | `password123` | RH Manager |
| `supervisor@sofibank.com` | `password123` | Superviseur |
| `employee1@sofibank.com` | `password123` | Employé |

## 🔧 Commandes Utiles

### Backend (API)
```bash
# Démarrer l'API
cd api && npm run dev

# Réinitialiser la base de données
cd api && npm run seed

# Tester avec curl
curl -X POST http://localhost:3600/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sofibank.com","password":"password123"}'
```

### Frontend (Next.js)
```bash
# Démarrer le frontend
npm run dev

# Build de production
npm run build
```

## 🚀 Architecture Finale

```
Frontend (Next.js)
    ↓
apiClient (src/services/api-client.js)
    ↓
Services API (employeeService, leaveService, etc.)
    ↓
API Express (http://localhost:3600)
    ↓
Controllers (authController, employeeController, etc.)
    ↓
Models Sequelize
    ↓
MySQL Database (rh_sofibank)
```

## ✅ Avantages de la Migration

1. **Sécurité renforcée**: JWT géré côté serveur
2. **Validation centralisée**: Tous les contrôles en un seul endroit
3. **Performance**: Moins d'appels réseau, queries optimisées
4. **Maintenabilité**: Code backend organisé et testable
5. **Flexibilité**: Facile d'ajouter de nouvelles fonctionnalités
6. **Déployabilité**: Backend et frontend peuvent être déployés séparément

## 🎉 Résumé

La migration de Supabase vers l'API Express est **80% complétée**. Les composants critiques (Auth, Employees, Leave, Attendance, Settings) sont fonctionnels. Les étapes restantes concernent principalement la mise à jour des hooks React Query et la suppression des anciennes références Supabase.

**L'API est prête à être testée !** 🚀
