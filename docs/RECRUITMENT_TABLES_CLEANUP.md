# ANALYSE DES TABLES DE RECRUTEMENT - IDENTIFICATION DES REDONDANCES

## 📊 SITUATION ACTUELLE

Votre base de données contient **DEUX SYSTÈMES PARALLÈLES** pour gérer les candidatures :

### ✅ **SYSTÈME ACTUEL (Utilisé)**
1. **`job_applications`** - Candidatures
   - Utilisé pour les candidatures via le site web public
   - Champs: first_name, last_name, email, phone, cv_file_path, cover_letter_file_path, status, source, etc.
   - Référence: `job_posting_id` → `job_postings.id`

2. **`job_interviews`** - Entretiens
   - Entretiens liés aux candidatures
   - Référence: `application_id` → `job_applications.id`
   - Champs: interview_type, scheduled_date, location, meeting_link, status, etc.

3. **`interview_evaluations`** - Évaluations
   - Évaluations des entretiens
   - Référence: `interview_id` → `job_interviews.id`
   - Champs: scores, recommendation, strengths, weaknesses, etc.

### ❌ **SYSTÈME ANCIEN (Non utilisé - REDONDANT)**
1. **`candidates`** - DOUBLON de `job_applications`
   - Même fonction : stocker les candidatures
   - Champs identiques : first_name, last_name, email, phone, cv_url, status
   - Référence: `job_opening_id` (ancien nom)

2. **`candidate_interviews`** - DOUBLON de `job_interviews`
   - Même fonction : planifier les entretiens
   - Référence: `candidate_id` → `candidates.id`

3. **`candidate_evaluations`** - DOUBLON de `interview_evaluations`
   - Même fonction : évaluer les entretiens
   - Référence: `candidate_id` et `interview_id`

---

## 🔍 COMPARAISON DÉTAILLÉE

| Aspect | job_applications | candidates | Verdict |
|--------|-----------------|------------|---------|
| **Fonction** | Stocker candidatures | Stocker candidatures | ❌ DOUBLON |
| **Champs** | first_name, last_name, email, phone, cv, status | first_name, last_name, email, phone, cv, status | ❌ IDENTIQUES |
| **Référence** | job_posting_id | job_opening_id | ❌ MÊME CHOSE (nom différent) |
| **Utilisé** | ✅ OUI (site web public) | ❌ NON | ⚠️ candidates inutile |
| **Modèle Sequelize** | ✅ JobApplication.js existe | ❌ Aucun modèle | ⚠️ Non implémenté |

---

## 🎯 RECOMMANDATION : SUPPRIMER LES TABLES REDONDANTES

### Tables à supprimer :
1. ❌ `candidates`
2. ❌ `candidate_interviews`
3. ❌ `candidate_evaluations`

### Raisons :
- **Duplication complète** des fonctionnalités
- **Aucun code ne les utilise** (pas de modèles Sequelize)
- **Confusion** dans l'architecture
- **Maintenance complexe** si on garde les deux systèmes

---

## ✅ ARCHITECTURE FINALE RECOMMANDÉE

```
FLUX DE RECRUTEMENT:

1. recruitment_plans (Plans de recrutement annuels)
   ↓
2. recruitment_plan_positions (Postes planifiés)
   ↓
3. job_postings (Offres d'emploi publiées sur le site)
   ↓
4. job_applications (Candidatures - via site web, email, etc.)
   ↓ (status: new → screening → shortlisted)
   ↓
5. job_interviews (Entretiens planifiés)
   ↓ (status: scheduled → completed)
   ↓
6. interview_evaluations (Évaluations par les recruteurs)
   ↓ (recommendation: highly_recommended, recommended, etc.)
   ↓
7. employment_offers (Offres d'emploi envoyées aux candidats)
   ↓ (status: draft → sent → accepted/declined)
   ↓
8. employees (Candidat devient employé)
```

### Tables de support :
- **`application_status_history`** - Historique des changements de statut des candidatures
- **`job_positions`** - Référentiel des postes (ex: Caissier, Manager, etc.)
- **`directions`** - Directions/Départements
- **`services`** - Services au sein des directions
- **`grades`** - Grades/Échelons salariaux

---

## 📝 SCRIPT DE MIGRATION

Un script SQL a été créé : **`api/database/drop_redundant_tables.sql`**

### Contenu :
```sql
-- Suppression des contraintes FK
ALTER TABLE candidate_evaluations DROP FOREIGN KEY IF EXISTS ...
ALTER TABLE candidate_interviews DROP FOREIGN KEY IF EXISTS ...
ALTER TABLE candidates DROP FOREIGN KEY IF EXISTS ...

-- Suppression des tables
DROP TABLE IF EXISTS candidate_evaluations;
DROP TABLE IF EXISTS candidate_interviews;
DROP TABLE IF EXISTS candidates;
```

---

## ⚠️ VÉRIFICATIONS AVANT SUPPRESSION

Avant d'exécuter le script, vérifiez :

1. **Aucune donnée importante** dans ces tables :
   ```sql
   SELECT COUNT(*) FROM candidates;
   SELECT COUNT(*) FROM candidate_interviews;
   SELECT COUNT(*) FROM candidate_evaluations;
   ```

2. **Aucune référence** dans le code backend :
   ```bash
   cd api/src
   grep -r "candidates" . --include="*.js"
   grep -r "candidate_interviews" . --include="*.js"
   grep -r "candidate_evaluations" . --include="*.js"
   ```

3. **Backup de la base** (par précaution) :
   ```bash
   mysqldump -u root -p sofibank_db > backup_before_cleanup.sql
   ```

---

## 🚀 EXÉCUTION DU NETTOYAGE

```bash
# Se connecter à MySQL
mysql -u root -p sofibank_db

# Exécuter le script
source /Users/alvin/Dev/NextJSProjects/rh-sofibank/api/database/drop_redundant_tables.sql

# Vérifier que les tables n'existent plus
SHOW TABLES LIKE 'candidate%';
```

---

## 📌 RÉSUMÉ

| Action | Tables | Statut |
|--------|--------|--------|
| **CONSERVER** | job_applications, job_interviews, interview_evaluations | ✅ Utilisées |
| **SUPPRIMER** | candidates, candidate_interviews, candidate_evaluations | ❌ Redondantes |
| **RAISON** | Duplication complète de fonctionnalités, non utilisées dans le code | ⚠️ Nettoyage |

---

## ✅ AVANTAGES APRÈS NETTOYAGE

1. **Architecture claire** : Un seul flux de recrutement
2. **Moins de confusion** : Pas de tables en doublon
3. **Code maintenable** : Moins de tables à gérer
4. **Performance** : Moins d'espace disque, moins de tables à scanner
5. **Documentation claire** : Un schéma facile à comprendre

---

**Date:** 2025-12-17  
**Auteur:** GitHub Copilot  
**Version:** 1.0
