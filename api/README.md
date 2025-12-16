# RH Sofibank API

API REST complète pour le système de gestion des ressources humaines de Sofibank.

## 🚀 Technologies

- **Node.js** v18+
- **Express.js** v4.21.2
- **MySQL** v8.0+
- **Sequelize** v6.37.5 (ORM)
- **JWT** pour l'authentification
- **Bcrypt** pour le hachage des mots de passe

## 📁 Structure du projet

```
api/
├── database/
│   ├── schema.sql          # Schéma MySQL complet
│   └── seeders.js          # Données de test
├── src/
│   ├── api/
│   │   ├── controllers/    # Logique métier
│   │   ├── middlewares/    # JWT, RBAC, validation
│   │   ├── models/         # Modèles Sequelize
│   │   └── routes/         # Routes API
│   └── config/
│       └── database.js     # Configuration Sequelize
├── app.js                  # Configuration Express
├── server.js               # Point d'entrée
├── package.json
└── .env.example
```

## 🔧 Installation

### 1. Configuration de la base de données MySQL

```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE rh_sofibank CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Importer le schéma
mysql -u root -p rh_sofibank < database/schema.sql
```

### 2. Installation des dépendances

```bash
cd api
npm install
```

### 3. Configuration des variables d'environnement

```bash
cp .env.example .env
```

Modifiez le fichier `.env` avec vos paramètres :

```env
# Server
PORT=3600
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=rh_sofibank

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Lancer le seeder (données de test)

```bash
npm run seed
```

Cela va créer :
- 5 rôles (Super Admin, Admin, RH Manager, Superviseur, Employé)
- 17 permissions
- 6 utilisateurs avec leurs rôles
- 6 employés
- 4 directions et 4 services
- 5 grades et 6 postes
- 7 types de congés
- Soldes de congés pour tous les employés
- 2 demandes de congé
- 30 enregistrements de présence (5 jours pour 6 employés)

### 5. Démarrer le serveur

```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3600`

## 🔐 Comptes de test

| Email                      | Mot de passe    | Rôle        |
|---------------------------|-----------------|-------------|
| admin@sofibank.cd         | Password@123    | Super Admin |
| rh@sofibank.cd            | Password@123    | RH Manager  |
| superviseur@sofibank.cd   | Password@123    | Superviseur |
| employe1@sofibank.cd      | Password@123    | Employé     |
| employe2@sofibank.cd      | Password@123    | Employé     |
| employe3@sofibank.cd      | Password@123    | Employé     |

## 📚 Documentation API

### Authentification

#### POST `/api/auth/login`
Connexion utilisateur

```json
{
  "email": "admin@sofibank.cd",
  "password": "Password@123"
}
```

**Réponse :**
```json
{
  "status": 200,
  "message": "Connexion réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "admin@sofibank.cd",
      "roles": [...],
      "permissions": [...],
      "employee": {...}
    }
  }
}
```

#### POST `/api/auth/register`
Créer un nouveau compte

#### GET `/api/auth/profile`
Obtenir le profil utilisateur (JWT requis)

#### POST `/api/auth/change-password`
Changer le mot de passe (JWT requis)

### Employés

Toutes les routes employés requièrent un token JWT et des permissions.

#### GET `/api/employees`
Liste des employés avec pagination

**Query params :**
- `page` (default: 1)
- `limit` (default: 10)
- `search` (recherche par nom, matricule, email)
- `direction_id`
- `service_id`
- `employment_status`
- `contract_type`

#### GET `/api/employees/:id`
Détails d'un employé

#### POST `/api/employees`
Créer un employé (Permission: `create_employee`)

#### PUT `/api/employees/:id`
Modifier un employé (Permission: `update_employee`)

#### DELETE `/api/employees/:id`
Désactiver un employé (Permission: `delete_employee`)

#### GET `/api/employees/statistics`
Statistiques des employés (Permission: `view_employees`)

#### GET `/api/employees/:id/subordinates`
Subordonnés d'un employé (Permission: `view_employees`)

### Congés

#### GET `/api/leave/types`
Liste des types de congés

#### POST `/api/leave/types`
Créer un type de congé (Permission: `manage_leave_types`)

#### GET `/api/leave/requests`
Liste des demandes de congés (Permission: `view_leaves`)

**Query params :**
- `page`, `limit`
- `status` (draft, pending_backup, pending_supervisor, pending_hr, pending_dg, approved, rejected, cancelled)
- `employee_id`
- `leave_type_id`
- `start_date`, `end_date`

#### GET `/api/leave/requests/:id`
Détails d'une demande (Permission: `view_leaves`)

#### POST `/api/leave/requests`
Créer une demande de congé (Permission: `create_leave_request`)

```json
{
  "employee_id": "uuid",
  "leave_type_id": "uuid",
  "start_date": "2025-01-20",
  "end_date": "2025-01-24",
  "total_days": 5,
  "return_date": "2025-01-27",
  "reason": "Vacances familiales",
  "backup_employee_id": "uuid"
}
```

#### POST `/api/leave/requests/:id/submit`
Soumettre une demande pour approbation (Permission: `create_leave_request`)

#### POST `/api/leave/requests/:id/process`
Approuver/rejeter une demande (Permission: `approve_leave`)

```json
{
  "action": "approved", // "approved" | "rejected" | "returned"
  "comments": "Approuvé"
}
```

#### GET `/api/leave/balances`
Soldes de congés (Permission: `view_leaves`)

**Query params :**
- `employee_id` (requis)
- `year` (default: année courante)

#### POST `/api/leave/balances/initialize`
Initialiser les soldes pour un employé (Permission: `manage_leave_types`)

### Présences

#### GET `/api/attendance`
Liste des enregistrements de présence (Permission: `view_attendance`)

**Query params :**
- `page`, `limit`
- `employee_id`
- `start_date`, `end_date`
- `status` (present, absent, late, half_day, on_leave, holiday)

#### GET `/api/attendance/:id`
Détails d'un enregistrement (Permission: `view_attendance`)

#### POST `/api/attendance/check-in`
Pointer l'arrivée (Permission: `record_attendance`)

```json
{
  "employee_id": "uuid"
}
```

#### POST `/api/attendance/check-out`
Pointer le départ (Permission: `record_attendance`)

```json
{
  "employee_id": "uuid"
}
```

#### POST `/api/attendance`
Créer/modifier un enregistrement (Permission: `record_attendance`)

#### GET `/api/attendance/statistics`
Statistiques de présence (Permission: `view_attendance`)

**Query params :**
- `employee_id`
- `start_date`, `end_date`

#### GET `/api/attendance/summary`
Résumé mensuel pour un employé (Permission: `view_attendance`)

**Query params :**
- `employee_id` (requis)
- `year` (requis)
- `month` (requis)

## 🔒 Système RBAC

### Rôles système

- **SUPER_ADMIN** : Accès complet à tout le système
- **ADMIN** : Accès administratif complet
- **RH_MANAGER** : Gestion RH complète (employés, congés, présences, paies)
- **SUPERVISOR** : Gestion de son équipe (voir employés, approuver congés, gérer présences)
- **EMPLOYEE** : Accès limité (voir ses propres congés, créer des demandes)

### Permissions par module

**Employees :** `view_employees`, `create_employee`, `update_employee`, `delete_employee`

**Leave :** `view_leaves`, `create_leave_request`, `approve_leave`, `manage_leave_types`

**Attendance :** `view_attendance`, `record_attendance`, `update_attendance`

**Payroll :** `view_payroll`, `create_payroll`, `approve_payroll`

**Settings :** `manage_settings`, `manage_users`, `manage_roles`

## 🛡️ Sécurité

- **Authentification JWT** avec expiration 24h
- **Mots de passe hachés** avec bcrypt (10 rounds)
- **RBAC** : Vérification des permissions sur chaque endpoint
- **Admin bypass** : SUPER_ADMIN et ADMIN ignorent les vérifications de permissions
- **Validation des entrées** (à implémenter avec Joi)
- **Protection CORS** configurée pour le frontend

## 📊 Modèles de données

### Principaux modèles

- **User** : Comptes utilisateurs
- **Role** : Rôles système
- **Permission** : Permissions granulaires
- **Employee** : Données employés
- **Direction** : Directions organisationnelles
- **Service** : Services/départements
- **Grade** : Grades salariaux
- **JobPosition** : Postes de travail
- **LeaveType** : Types de congés
- **LeaveBalance** : Soldes de congés
- **LeaveRequest** : Demandes de congés
- **LeaveApproval** : Historique approbations
- **AttendanceRecord** : Enregistrements de présence

## 🔄 Workflow d'approbation des congés

1. **draft** : Brouillon (création)
2. **pending_backup** : En attente validation backup (si requis)
3. **pending_supervisor** : En attente superviseur direct
4. **pending_hr** : En attente RH
5. **pending_dg** : En attente Direction Générale
6. **approved** : Approuvé (final)
7. **rejected** : Rejeté (final)
8. **cancelled** : Annulé (final)

## 🧪 Tests

```bash
# Lancer les tests (à implémenter)
npm test
```

## 📝 Scripts npm

```bash
npm start          # Démarrer en production
npm run dev        # Démarrer en développement (nodemon)
npm run seed       # Lancer le seeder
npm test           # Lancer les tests (à implémenter)
```

## 🐛 Debugging

Activer les logs Sequelize en mode développement dans `.env` :

```env
NODE_ENV=development
```

Les requêtes SQL seront affichées dans la console.

## 📞 Support

Pour toute question ou problème :
- Consulter la documentation
- Vérifier les logs du serveur
- Tester avec Postman/Insomnia

## 📜 Licence

© 2025 RH Sofibank. Tous droits réservés.
