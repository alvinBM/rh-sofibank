# Guide de Démarrage Rapide - Module Paramétrages

## 🚀 Lancement rapide

### 1. Appliquer le patch base de données

```bash
cd api
mysql -u root -p rh_sofibank < database/patch_settings_module.sql
```

Cela créera :
- Tables : `holidays`, `biometric_devices`, `system_settings`
- Permissions pour le module Paramétrages
- Données initiales (jours fériés 2024-2025, paramètres système)

### 2. Démarrer le backend

```bash
# Dans le dossier api/
npm run dev
```

### 3. Démarrer le frontend

```bash
# À la racine du projet
npm run dev
```

### 4. Se connecter et tester

1. Connectez-vous à l'application
2. Vérifiez que le menu **Paramétrages** apparaît dans la sidebar
3. Testez chaque sous-module :
   - ✅ Utilisateurs
   - ✅ Rôles & Permissions
   - ✅ Structure organisationnelle
   - ✅ Grades & Rémunérations
   - ✅ Postes/Fonctions
   - ✅ Jours fériés
   - ✅ Terminaux biométriques
   - ✅ Paramètres système

## 📋 Permissions requises

Si vous ne voyez pas certains menus, vérifiez que votre rôle possède les permissions suivantes :

- `settings_access` - Accès au module Paramétrages (requis)
- `users_manage` - Gérer les utilisateurs
- `roles_manage` - Gérer les rôles et permissions
- `org_manage` - Gérer la structure organisationnelle
- `payroll_settings_manage` - Gérer les grades
- `positions_manage` - Gérer les postes
- `holidays_manage` - Gérer les jours fériés
- `attendance_settings_manage` - Gérer les terminaux biométriques
- `system_settings_manage` - Gérer les paramètres système

## 🔧 En cas de problème

### Le menu Paramétrages n'apparaît pas
➡️ Vérifiez que vous avez la permission `settings_access`

### Erreur "Table doesn't exist"
➡️ Exécutez le patch SQL : `mysql -u root -p rh_sofibank < api/database/patch_settings_module.sql`

### Erreur 401 Unauthorized
➡️ Reconnectez-vous à l'application

### Les mutations ne fonctionnent pas
➡️ Vérifiez que le backend est démarré sur le bon port

## 📖 Documentation complète

Pour plus de détails, consultez `MODULE_PARAMETRAGES_README.md`

---

✅ **Module complètement fonctionnel et prêt à l'emploi !**
