# Module ESS (Employee Self-Service) - Documentation

## Vue d'ensemble

Le module ESS permet aux employés de gérer leurs informations personnelles, consulter leurs documents, contrats, historique de carrière, et soumettre des demandes administratives.

## Structure du Module

### Backend (`/api`)

#### Modèles Sequelize

1. **EmployeeDocument** - Documents des employés (CNI, diplômes, contrats, etc.)
2. **EmployeeContract** - Contrats de travail
3. **RequestType** - Types de demandes administratives
4. **EmployeeRequest** - Demandes des employés
5. **InternalAnnouncement** - Annonces internes de l'entreprise
6. **AnnouncementRead** - Suivi de lecture des annonces
7. **EmployeeFeedback** - Retours et suggestions des employés
8. **CareerHistory** - Historique de carrière (promotions, mutations, etc.)
9. **EmployeeDependent** - Dépendants/Bénéficiaires

#### Contrôleur (`essController.js`)

**Mon Profil**
- `GET /api/ess/my-profile` - Récupérer mon profil complet
- `PUT /api/ess/my-profile` - Mettre à jour mes informations modifiables

**Documents**
- `GET /api/ess/my-documents` - Mes documents
- `GET /api/ess/employees/:employeeId/documents` - Documents d'un employé
- `POST /api/ess/documents` - Télécharger un document
- `DELETE /api/ess/documents/:id` - Supprimer un document

**Contrats**
- `GET /api/ess/my-contracts` - Mes contrats
- `GET /api/ess/employees/:employeeId/contracts` - Contrats d'un employé

**Demandes Employés**
- `GET /api/ess/my-requests` - Mes demandes
- `GET /api/ess/requests` - Toutes les demandes (admin)
- `POST /api/ess/requests` - Créer une demande
- `PUT /api/ess/requests/:id` - Mettre à jour une demande
- `GET /api/ess/request-types` - Types de demandes disponibles

**Annonces Internes**
- `GET /api/ess/announcements` - Annonces publiées
- `GET /api/ess/announcements/all` - Toutes les annonces (admin)
- `POST /api/ess/announcements` - Créer une annonce (admin)
- `PUT /api/ess/announcements/:id` - Modifier une annonce (admin)
- `POST /api/ess/announcements/:announcementId/read` - Marquer comme lu

**Feedback Employés**
- `GET /api/ess/my-feedback` - Mes feedbacks
- `GET /api/ess/feedback` - Tous les feedbacks (admin)
- `POST /api/ess/feedback` - Créer un feedback
- `PUT /api/ess/feedback/:id` - Traiter un feedback (admin)

**Historique de Carrière**
- `GET /api/ess/employees/:employeeId/history` - Historique de carrière
- `POST /api/ess/history` - Créer un enregistrement d'historique

**Dépendants**
- `GET /api/ess/employees/:employeeId/dependents` - Dépendants
- `POST /api/ess/dependents` - Ajouter un dépendant
- `PUT /api/ess/dependents/:id` - Modifier un dépendant
- `DELETE /api/ess/dependents/:id` - Supprimer un dépendant

### Frontend (`/app`)

#### React Query Hooks (`/src/hooks/useESS.js`)

**Profil**
- `useGetMyProfile()` - Récupère le profil de l'utilisateur connecté
- `useUpdateMyProfile()` - Met à jour le profil

**Documents**
- `useGetMyDocuments()` - Mes documents
- `useGetEmployeeDocuments(employeeId)` - Documents d'un employé
- `useUploadEmployeeDocument()` - Upload document
- `useDeleteEmployeeDocument()` - Supprimer document

**Contrats**
- `useGetMyContracts()` - Mes contrats
- `useGetEmployeeContracts(employeeId)` - Contrats d'un employé

**Demandes**
- `useGetMyRequests()` - Mes demandes
- `useGetEmployeeRequests(filters)` - Toutes les demandes
- `useCreateEmployeeRequest()` - Créer demande
- `useUpdateEmployeeRequest()` - Modifier demande
- `useGetRequestTypes()` - Types de demandes

**Annonces**
- `useGetInternalAnnouncements()` - Annonces publiées
- `useGetAllAnnouncements(filters)` - Toutes les annonces
- `useCreateAnnouncement()` - Créer annonce
- `useUpdateAnnouncement()` - Modifier annonce
- `useMarkAnnouncementAsRead()` - Marquer comme lu

**Feedback**
- `useGetMyFeedback()` - Mes feedbacks
- `useGetAllFeedback(filters)` - Tous les feedbacks
- `useCreateFeedback()` - Créer feedback
- `useUpdateFeedback()` - Traiter feedback

**Historique**
- `useGetEmployeeHistory(employeeId)` - Historique de carrière
- `useCreateEmployeeHistory()` - Créer enregistrement

**Dépendants**
- `useGetEmployeeDependents(employeeId)` - Dépendants
- `useCreateEmployeeDependent()` - Ajouter
- `useUpdateEmployeeDependent()` - Modifier
- `useDeleteEmployeeDependent()` - Supprimer

#### Pages

**Mon Profil** (`/app/dashboard/ess/profile/page.jsx`)
- Onglet **Informations** : Informations personnelles modifiables/non-modifiables
- Onglet **Adresse** : Coordonnées et adresse
- Onglet **Contact d'Urgence** : Personne à contacter en cas d'urgence
- Onglet **Contrats** : Historique des contrats
- Onglet **Carrière** : Historique des promotions, mutations, augmentations
- Onglet **Dépendants** : Famille et bénéficiaires

**Documents** (`/app/dashboard/ess/documents/`)
- Consultation et téléchargement de documents
- Types : CNI, passeport, diplômes, certificats, contrats

**Demandes** (`/app/dashboard/ess/requests/`)
- Soumettre des demandes administratives
- Suivre le statut des demandes
- Types : Attestation de travail, fiche de paie, badge, matériel IT, etc.

**Annonces** (`/app/dashboard/ess/announcements/`)
- Consulter les annonces de l'entreprise
- Catégories : Général, Événement, Politique, Alerte, Célébration

## Installation et Configuration

### 1. Créer les tables de base de données

```bash
cd api
mysql -u root -p sofibank_db < database/ess_module_schema.sql
```

### 2. Redémarrer le backend

```bash
npm run dev
```

### 3. Tester les endpoints

Les endpoints sont protégés par authentification JWT. Utilisez un token valide dans les headers :

```
Authorization: Bearer <votre_token>
```

## Permissions Requises

- **Employé standard** : Accès à son propre profil, documents, demandes
- **RH/Admin** (`manage_settings`) : Accès à tous les profils, gestion des annonces et feedbacks
- **Manager** (`update_employee`) : Gestion de l'historique de carrière

## Types de Données

### Document Types
- `id_card` - Carte d'identité
- `passport` - Passeport
- `birth_certificate` - Acte de naissance
- `diploma` - Diplôme
- `certificate` - Certificat
- `contract` - Contrat
- `other` - Autre

### Contract Types
- `permanent` - CDI
- `fixed_term` - CDD
- `temporary` - Temporaire
- `internship` - Stage
- `consultant` - Consultant

### Request Categories
- `administrative` - Administratif
- `technical` - Technique
- `hr` - Ressources Humaines
- `it` - Informatique
- `other` - Autre

### Change Types (Career History)
- `promotion` - Promotion
- `transfer` - Transfert
- `salary_increase` - Augmentation de salaire
- `position_change` - Changement de poste
- `grade_change` - Changement de grade
- `demotion` - Rétrogradation

## Champs Modifiables par l'Employé

L'employé peut uniquement modifier :
- Email personnel
- Téléphone
- Adresse (ligne 1, ligne 2, ville, province, code postal)
- Situation matrimoniale
- Nom du conjoint
- Nombre d'enfants
- Contact d'urgence (nom, téléphone, relation)

Tous les autres champs (nom, prénom, email professionnel, date de naissance, etc.) sont en lecture seule et ne peuvent être modifiés que par les RH.

## Prochaines Étapes

1. ✅ Backend complet avec tous les endpoints
2. ✅ Hooks React Query pour toutes les fonctionnalités
3. ✅ Page Mon Profil avec onglets (Infos, Adresse, Urgence, Contrats, Carrière, Dépendants)
4. 🔄 Page Documents (en cours)
5. 🔄 Page Demandes (en cours)
6. 🔄 Page Annonces (en cours)
7. ⏳ Gestion administrative des feedbacks
8. ⏳ Upload de fichiers avec gestion de stockage

## Support

Pour toute question ou problème :
1. Vérifier les logs du backend
2. Vérifier les permissions de l'utilisateur
3. Consulter la documentation des endpoints dans le contrôleur
