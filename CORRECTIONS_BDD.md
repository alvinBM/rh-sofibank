# 🔧 CORRECTIONS DES INCOHÉRENCES BASE DE DONNÉES

**Date:** 17 décembre 2025  
**Module:** Paramétrages (Settings)  
**Statut:** ✅ Corrigé

---

## 📋 PROBLÈMES IDENTIFIÉS ET RÉSOLUS

### 1. ❌ **Erreur: Unknown column 'employee.photo_url'**

**Cause:** Le contrôleur `settingsController.js` essayait d'accéder à `photo_url` alors que le modèle `Employee` et la table `employees` utilisent `profile_photo_url`.

**Solution appliquée:**
```javascript
// AVANT (ligne 423)
attributes: ['id', 'first_name', 'last_name', 'employee_number', 'photo_url'],

// APRÈS
attributes: ['id', 'first_name', 'last_name', 'employee_number', 'profile_photo_url'],
```

**Fichier modifié:** `/api/src/api/controllers/settingsController.js`

---

### 2. ⚠️ **Colonne 'description' manquante dans table holidays**

**Cause:** Le modèle `Holiday.js` définit une colonne `description`, mais le schema.sql original ne l'incluait pas.

**Solutions appliquées:**

#### A. Mise à jour du schema.sql
```sql
-- AVANT
CREATE TABLE holidays (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date DATE NOT NULL UNIQUE,
    year INT NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ...
);

-- APRÈS
CREATE TABLE holidays (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date DATE NOT NULL UNIQUE,
    year INT NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    description TEXT,  -- ✅ AJOUTÉ
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ...
);
```

**Fichier modifié:** `/api/database/schema.sql`

#### B. Script de migration créé
Un script SQL intelligent a été créé pour ajouter la colonne si elle n'existe pas déjà.

**Fichier créé:** `/api/database/migrations/001_add_description_to_holidays.sql`

**Pour appliquer la migration:**
```bash
cd api
mysql -u root -p rh_sofibank < database/migrations/001_add_description_to_holidays.sql
```

---

### 3. ✅ **Tables biometric_devices et system_settings**

**Statut:** Déjà présentes dans le patch.

Ces tables sont correctement définies dans `/api/database/patch_settings_module.sql` et correspondent parfaitement aux modèles Sequelize.

**Tables concernées:**
- `biometric_devices` → Modèle `BiometricDevice.js` ✓
- `system_settings` → Modèle `SystemParameter.js` ✓

**Patch à appliquer:**
```bash
cd api
mysql -u root -p rh_sofibank < database/patch_settings_module.sql
```

---

## 📊 VÉRIFICATION DE COHÉRENCE

### ✅ Modèles 100% cohérents (9/11)
- ✓ User
- ✓ Role  
- ✓ Permission
- ✓ Direction
- ✓ Service
- ✓ Grade
- ✓ JobPosition
- ✓ Employee
- ✓ Holiday (après correction)

### 🟢 Modèles cohérents après application du patch (2/11)
- 🟢 BiometricDevice (nécessite `patch_settings_module.sql`)
- 🟢 SystemParameter (nécessite `patch_settings_module.sql`)

---

## 🚀 PROCÉDURE DE MISE EN PRODUCTION

### Étape 1: Appliquer le patch des paramétrages
```bash
cd /Users/alvin/Dev/NextJSProjects/rh-sofibank/api
mysql -u root -palvinpass rh_sofibank < database/patch_settings_module.sql
```

Ce patch va créer:
- ✅ Table `holidays` (avec `description`)
- ✅ Table `biometric_devices`
- ✅ Table `system_settings`
- ✅ Seed data pour les jours fériés 2024-2025
- ✅ Permissions pour le module Paramétrages

### Étape 2: (Optionnel) Appliquer la migration description
Si vous aviez déjà créé la table `holidays` sans la colonne `description`:
```bash
mysql -u root -palvinpass rh_sofibank < database/migrations/001_add_description_to_holidays.sql
```

### Étape 3: Redémarrer le backend
```bash
cd api
npm run dev
```

### Étape 4: Tester l'API
Vérifier que l'endpoint `/api/settings/users` fonctionne correctement:
```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:3001/api/settings/users?offset=0&limit=10"
```

---

## 🔍 VÉRIFICATIONS POST-CORRECTIONS

### Test 1: Vérifier la structure des tables
```sql
DESCRIBE employees;  -- Chercher 'profile_photo_url'
DESCRIBE holidays;   -- Chercher 'description'
SHOW TABLES LIKE 'biometric%';
SHOW TABLES LIKE 'system%';
```

### Test 2: Tester les endpoints Settings
- ✅ GET `/api/settings/users` → Liste des utilisateurs
- ✅ GET `/api/settings/roles` → Liste des rôles
- ✅ GET `/api/settings/directions` → Liste des directions
- ✅ GET `/api/settings/services` → Liste des services
- ✅ GET `/api/settings/grades` → Liste des grades
- ✅ GET `/api/settings/job-positions` → Liste des postes
- ✅ GET `/api/settings/holidays` → Liste des jours fériés
- ✅ GET `/api/settings/biometric-devices` → Liste des terminaux
- ✅ GET `/api/settings/system-parameters` → Paramètres système

### Test 3: Vérifier les logs backend
S'assurer qu'il n'y a plus d'erreurs du type:
- ❌ `Unknown column 'employee.photo_url'`
- ❌ `Table 'biometric_devices' doesn't exist`
- ❌ `Unknown column 'holidays.description'`

---

## 📁 FICHIERS MODIFIÉS

### Modifiés
1. `/api/src/api/controllers/settingsController.js` (ligne 423)
2. `/api/database/schema.sql` (ligne 326)

### Créés
3. `/api/database/migrations/001_add_description_to_holidays.sql`
4. `/CORRECTIONS_BDD.md` (ce document)

### Existants (inchangés mais essentiels)
5. `/api/database/patch_settings_module.sql` (à appliquer)
6. `/api/src/api/models/Holiday.js` ✓
7. `/api/src/api/models/BiometricDevice.js` ✓
8. `/api/src/api/models/SystemParameter.js` ✓
9. `/api/src/api/models/Employee.js` ✓

---

## 📝 NOTES IMPORTANTES

### Pour l'avenir
1. **Toujours créer les tables AVANT les modèles** ou vice-versa, mais maintenir la cohérence
2. **Documenter les migrations** dans le dossier `database/migrations/`
3. **Tester localement** avant de pousser en production
4. **Vérifier les schémas** avec `DESCRIBE table_name` après chaque modification

### Documentation de référence
- `MODULE_PARAMETRAGES_README.md` → Documentation complète du module
- `API_ENDPOINTS_PARAMETRAGES.md` → Référence API
- `QUICK_START_PARAMETRAGES.md` → Guide de démarrage rapide

---

## ✅ CHECKLIST DE VALIDATION

Avant de considérer les corrections comme terminées:

- [x] Erreur `photo_url` corrigée dans settingsController.js
- [x] Colonne `description` ajoutée à la table holidays dans schema.sql
- [x] Script de migration créé pour holidays.description
- [x] Documentation des corrections complète
- [ ] Patch `patch_settings_module.sql` appliqué sur la base de données
- [ ] Migration `001_add_description_to_holidays.sql` appliquée (si nécessaire)
- [ ] Backend redémarré sans erreurs
- [ ] Tests API réussis pour tous les endpoints Settings
- [ ] Frontend testé avec les pages Settings

---

**Prochaines étapes:** Appliquer le patch SQL et tester l'application complète.
