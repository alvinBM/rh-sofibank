# API Endpoints - Module Paramétrages

Base URL: `http://localhost:5000/api/settings`

Tous les endpoints nécessitent un token d'authentification dans le header :
```
Authorization: Bearer YOUR_TOKEN
```

---

## 👥 USERS (Utilisateurs)

### Liste des utilisateurs
```http
GET /settings/users?offset=0&limit=10&query=
```
**Permissions** : `users_manage`, `settings_access`

**Réponse** :
```json
{
  "status": 200,
  "message": "Utilisateurs récupérés avec succès",
  "data": [...],
  "total": 25
}
```

### Créer un utilisateur
```http
POST /settings/users
```
**Permissions** : `users_manage`

**Body** :
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role_ids": ["uuid1", "uuid2"],
  "employee_data": {
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Modifier un utilisateur
```http
PUT /settings/users/:id
```
**Permissions** : `users_manage`

### Supprimer un utilisateur
```http
DELETE /settings/users/:id
```
**Permissions** : `users_manage`

### Activer/Désactiver un utilisateur
```http
PATCH /settings/users/:id/toggle-status
```
**Body** : `{ "is_active": true }`
**Permissions** : `users_manage`

---

## 🛡️ ROLES & PERMISSIONS

### Liste des rôles
```http
GET /settings/roles?offset=0&limit=100&query=
```
**Permissions** : `roles_manage`, `settings_access`

### Créer un rôle
```http
POST /settings/roles
```
**Body** :
```json
{
  "name": "Manager",
  "code": "MANAGER",
  "description": "Gestionnaire",
  "permission_ids": ["uuid1", "uuid2"]
}
```
**Permissions** : `roles_manage`

### Modifier un rôle
```http
PUT /settings/roles/:id
```
**Permissions** : `roles_manage`

### Supprimer un rôle
```http
DELETE /settings/roles/:id
```
**Permissions** : `roles_manage`  
**Note** : Les rôles système ne peuvent pas être supprimés

### Liste des permissions
```http
GET /settings/permissions
```
**Permissions** : `roles_manage`, `settings_access`

**Réponse** :
```json
{
  "status": 200,
  "data": [...],
  "grouped": {
    "settings": [...],
    "hr": [...],
    ...
  }
}
```

---

## 🏢 DIRECTIONS (Structure organisationnelle)

### Liste des directions
```http
GET /settings/directions
```
**Permissions** : `validateToken` (authentifié)

### Créer une direction
```http
POST /settings/directions
```
**Body** :
```json
{
  "name": "Direction des Ressources Humaines",
  "code": "DRH",
  "description": "..."
}
```
**Permissions** : `org_manage`, `manage_settings`

### Modifier une direction
```http
PUT /settings/directions/:id
```
**Permissions** : `org_manage`, `manage_settings`

### Supprimer une direction
```http
DELETE /settings/directions/:id
```
**Permissions** : `org_manage`, `manage_settings`

---

## 🏭 SERVICES (Départements)

### Liste des services
```http
GET /settings/services?direction_id=uuid
```
**Permissions** : `validateToken`

### Créer un service
```http
POST /settings/services
```
**Body** :
```json
{
  "name": "Service Paie",
  "code": "PAIE",
  "direction_id": "uuid"
}
```
**Permissions** : `org_manage`, `manage_settings`

### Modifier un service
```http
PUT /settings/services/:id
```

### Supprimer un service
```http
DELETE /settings/services/:id
```

---

## 🎓 GRADES

### Liste des grades
```http
GET /settings/grades
```

### Créer un grade
```http
POST /settings/grades
```
**Body** :
```json
{
  "name": "Cadre Supérieur",
  "code": "CS1",
  "level": 5,
  "base_salary": 5000.00,
  "min_salary": 4500.00,
  "max_salary": 6000.00,
  "description": "...",
  "benefits": "..."
}
```
**Permissions** : `payroll_settings_manage`, `manage_settings`

### Modifier un grade
```http
PUT /settings/grades/:id
```

### Supprimer un grade
```http
DELETE /settings/grades/:id
```

---

## 💼 JOB POSITIONS (Postes)

### Liste des postes
```http
GET /settings/job-positions
```

### Créer un poste
```http
POST /settings/job-positions
```
**Body** :
```json
{
  "title": "Développeur Senior",
  "code": "DEV_SR",
  "description": "...",
  "requirements": "..."
}
```
**Permissions** : `positions_manage`, `manage_settings`

### Modifier un poste
```http
PUT /settings/job-positions/:id
```

### Supprimer un poste
```http
DELETE /settings/job-positions/:id
```

---

## 📅 HOLIDAYS (Jours fériés)

### Liste des jours fériés
```http
GET /settings/holidays?offset=0&limit=100&query=&year=2025
```

### Créer un jour férié
```http
POST /settings/holidays
```
**Body** :
```json
{
  "name": "Jour de l'An",
  "date": "2026-01-01",
  "year": 2026,
  "is_recurring": true,
  "description": "Premier jour de l'année"
}
```
**Permissions** : `holidays_manage`, `manage_settings`

### Modifier un jour férié
```http
PUT /settings/holidays/:id
```

### Supprimer un jour férié
```http
DELETE /settings/holidays/:id
```

---

## 🔐 BIOMETRIC DEVICES (Terminaux biométriques)

### Liste des terminaux
```http
GET /settings/biometric-devices?offset=0&limit=100&query=
```

### Créer un terminal
```http
POST /settings/biometric-devices
```
**Body** :
```json
{
  "device_name": "Terminal Principal",
  "device_code": "TERM_001",
  "location": "Entrée principale",
  "site": "Siège",
  "device_type": "fingerprint",
  "ip_address": "192.168.1.100",
  "protocol": "TCP",
  "is_active": true
}
```
**Permissions** : `attendance_settings_manage`, `manage_settings`

### Modifier un terminal
```http
PUT /settings/biometric-devices/:id
```

### Supprimer un terminal
```http
DELETE /settings/biometric-devices/:id
```

### Tester la connexion
```http
POST /settings/biometric-devices/:id/test
```
**Réponse** :
```json
{
  "status": 200,
  "message": "Connexion réussie",
  "data": {
    "connected": true,
    "device_name": "Terminal Principal",
    "ip_address": "192.168.1.100",
    "last_sync": "2025-12-17T10:30:00Z"
  }
}
```

---

## ⚙️ SYSTEM PARAMETERS (Paramètres système)

### Liste des paramètres
```http
GET /settings/system-parameters?offset=0&limit=100&query=
```
**Permissions** : `system_settings_manage`, `settings_access`

### Créer un paramètre
```http
POST /settings/system-parameters
```
**Body** :
```json
{
  "setting_key": "max_leave_days",
  "setting_value": "30",
  "setting_type": "number",
  "module": "leave",
  "description": "Nombre maximum de jours de congés par an",
  "is_encrypted": false
}
```
**Permissions** : `system_settings_manage`

### Modifier un paramètre
```http
PUT /settings/system-parameters/:id
```

### Supprimer un paramètre
```http
DELETE /settings/system-parameters/:id
```

---

## 📝 Notes

- Tous les endpoints retournent un objet avec `status`, `message`, et optionnellement `data` et `total`
- Les soft deletes sont utilisés (champs `is_active` mis à `false`)
- La pagination utilise `offset` et `limit`
- Les recherches utilisent le paramètre `query`

## 🧪 Test avec curl

```bash
# Exemple : Récupérer les utilisateurs
curl -X GET http://localhost:5000/api/settings/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# Exemple : Créer un jour férié
curl -X POST http://localhost:5000/api/settings/holidays \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fête Nationale",
    "date": "2026-06-30",
    "year": 2026,
    "is_recurring": true
  }'
```

---

**Documentation générée le** : 17 décembre 2025
