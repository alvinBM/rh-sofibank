# Identifiants de Test - SIRH SOFIBANQUE

## Utilisateurs de Démonstration

Tous les utilisateurs ont le même mot de passe : **Password123!**

---

### 1. DRH (Directeur des Ressources Humaines)

**Email**: `drh@sofibanque.com`
**Mot de passe**: `Password123!`
**Rôle**: Directeur RH
**Permissions**: Accès complet à tous les modules SIRH

**Accès**:
- ✅ Tableau de bord complet
- ✅ Gestion des employés (création, modification, suppression)
- ✅ Gestion des congés (approbation à tous les niveaux)
- ✅ Gestion de la paie
- ✅ Gestion du recrutement
- ✅ Gestion de la performance (Performance 360°)
- ✅ Gestion de la présence et pointage
- ✅ Rapports et analyses
- ✅ Paramétrages système (utilisateurs, rôles, paramètres)

**Profil**:
- Nom: Marie Dubois
- Matricule: EMP-2024-001
- Téléphone: +243810000001
- Direction: Direction des Ressources Humaines
- Service: Service Paie et Administration
- Grade: Cadre Supérieur
- Date d'embauche: 15/01/2020

---

### 2. RH Manager (Responsable RH)

**Email**: `rh@sofibanque.com`
**Mot de passe**: `Password123!`
**Rôle**: Responsable RH
**Permissions**: Accès étendu aux modules RH (sauf paramétrages système)

**Accès**:
- ✅ Tableau de bord
- ✅ Gestion des employés (consultation, modification)
- ✅ Gestion des congés (approbation niveau RH)
- ✅ Gestion de la paie (consultation, traitement)
- ✅ Gestion du recrutement
- ✅ Gestion de la performance
- ✅ Gestion de la présence
- ✅ Rapports
- ❌ Paramétrages système (accès limité)

**Profil**:
- Nom: Jean Martin
- Matricule: EMP-2024-002
- Téléphone: +243810000002
- Direction: Direction des Ressources Humaines
- Service: Service Paie et Administration
- Grade: Cadre Supérieur
- Date d'embauche: 10/03/2021

---

### 3. Manager (Chef de Service)

**Email**: `manager@sofibanque.com`
**Mot de passe**: `Password123!`
**Rôle**: Manager
**Permissions**: Accès modéré aux modules (gestion de son équipe)

**Accès**:
- ✅ Tableau de bord (vue limitée)
- ✅ Consultation des employés de son équipe
- ✅ Gestion des congés de son équipe (approbation superviseur)
- ✅ Validation des présences de son équipe
- ✅ Évaluation de la performance de son équipe
- ❌ Gestion de la paie
- ❌ Gestion du recrutement
- ❌ Paramétrages

**Profil**:
- Nom: Sophie Leroy
- Matricule: EMP-2024-003
- Téléphone: +243810000003
- Direction: Direction des Ressources Humaines
- Service: Service Paie et Administration
- Date d'embauche: 01/06/2021

---

### 4. Employé

**Email**: `employe@sofibanque.com`
**Mot de passe**: `Password123!`
**Rôle**: Employé
**Permissions**: Accès ESS (Employee Self-Service) uniquement

**Accès**:
- ✅ Mon Profil (ESS) - consultation et mise à jour
- ✅ Mes demandes de congés (création, consultation)
- ✅ Mes fiches de paie (consultation)
- ✅ Mon pointage (consultation)
- ✅ Mes évaluations (consultation)
- ❌ Gestion des autres employés
- ❌ Approbation des demandes
- ❌ Gestion de la paie
- ❌ Recrutement
- ❌ Paramétrages

**Profil**:
- Nom: Pierre Durand
- Matricule: EMP-2024-004
- Téléphone: +243810000004
- Direction: Direction des Ressources Humaines
- Service: Service Paie et Administration
- Date d'embauche: 15/01/2023

---

## URLs d'Accès

**Page de connexion**: http://localhost:3000/auth/login

**Tableau de bord**: http://localhost:3000/dashboard

---

## Hiérarchie des Permissions

### Niveau 1: DRH (Accès Total)
- Toutes les permissions
- Gestion des utilisateurs et rôles
- Configuration système
- Approbation finale des demandes

### Niveau 2: RH Manager (Accès Étendu)
- Gestion des employés
- Traitement de la paie
- Recrutement
- Approbation niveau RH

### Niveau 3: Manager (Accès Modéré)
- Vue de son équipe uniquement
- Approbation des demandes de son équipe
- Évaluation de performance

### Niveau 4: Employé (Accès ESS)
- Accès à ses propres données uniquement
- Soumission de demandes
- Consultation de documents personnels

---

## Structure des Rôles dans la Base de Données

Les rôles sont configurés avec les codes suivants:
- `drh` - Directeur RH
- `rh_manager` - Responsable RH
- `manager` - Chef de Service/Manager
- `employee` - Employé

Chaque rôle a des permissions associées dans la table `role_permissions`.

---

## Notes de Test

1. **Test des permissions**: Connectez-vous avec différents profils pour vérifier que les menus et fonctionnalités sont correctement restreints selon le rôle.

2. **Workflow des congés**:
   - L'employé crée une demande
   - Le remplaçant valide (pending_backup)
   - Le superviseur valide (pending_supervisor)
   - La RH valide (pending_hr)
   - Le DG valide (pending_dg)
   - Demande approuvée

3. **Sécurité**: Les données sont protégées par Row Level Security (RLS) au niveau de la base de données Supabase.

4. **Session**: La session est gérée automatiquement par Supabase Auth avec rafraîchissement automatique des tokens.

---

## Support

Pour toute question ou problème, consultez le fichier `README_SIRH.md` pour la documentation complète du système.
