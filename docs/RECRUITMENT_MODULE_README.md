# Module de Recrutement et Onboarding - Guide Complet

## Vue d'ensemble

Le module de recrutement et onboarding de SofiBank SIRH est une solution complète qui couvre l'ensemble du cycle de vie de l'acquisition de talents, depuis la planification annuelle jusqu'à l'intégration des nouveaux employés.

## Architecture du Module

### 5 Étapes Principales

#### **Étape 1 : Planification Annuelle des Besoins**
- Les Directions soumettent leurs besoins annuels en recrutement
- Définition des postes, grades, services, quantités et budgets
- Workflow d'approbation (Brouillon → Soumis → Approuvé/Rejeté)
- Justification et priorités pour chaque position

#### **Étape 2 : Publication des Offres d'Emploi**
- Création d'annonces d'emploi détaillées
- Publication multi-canal (site web, réseaux sociaux, job boards)
- Configuration d'email de réception pour candidatures automatiques
- Génération de référence unique pour chaque offre
- Gestion du cycle de vie des offres (Brouillon → Publié → Fermé/Rempli/Annulé)

#### **Étape 3 : Gestion des Candidatures et Entretiens**
- Réception automatique des candidatures par email
- Analyse et tri des candidats
- Planification des entretiens (téléphone, vidéo, en personne, technique, panel, final)
- Évaluations standardisées avec notation multi-critères
- Historique complet des changements de statut
- Système de recommandation et décision

#### **Étape 4 : Offres d'Emploi**
- Génération d'offres d'emploi avec contrat détaillé
- Workflow d'approbation interne
- Génération de PDF signé
- Envoi automatique par email
- Suivi des réponses (Accepté/Décliné)
- Gestion de la date d'expiration

#### **Étape 5 : Onboarding et Création d'Employé**
- Création automatique d'une checklist d'onboarding à partir de templates
- Tâches pré-configurées (administratif, équipement, formation, accès système)
- Attribution des tâches aux responsables RH
- Suivi du pourcentage de complétion
- Création automatique de l'employé et du compte utilisateur
- Email de bienvenue avec identifiants
- Intégration avec le module ESS

## Modèles de Données

### 1. RecruitmentPlan
**Objectif** : Plans annuels de recrutement par Direction

**Champs principaux** :
- `year` : Année du plan
- `direction_id` : Direction concernée
- `status` : draft | submitted | approved | rejected
- `approved_by` : Utilisateur ayant approuvé
- `approved_date` : Date d'approbation
- `rejection_reason` : Raison du rejet

**Relations** :
- BelongsTo Direction
- BelongsTo User (approver)
- HasMany RecruitmentPlanPosition

### 2. RecruitmentPlanPosition
**Objectif** : Positions détaillées dans un plan de recrutement

**Champs principaux** :
- `recruitment_plan_id` : Plan parent
- `job_position_id` : Poste à recruter
- `grade_id` : Grade du poste
- `service_id` : Service concerné
- `quantity_needed` : Nombre de postes
- `priority` : low | medium | high | urgent
- `expected_start_date` : Date de début souhaitée
- `justification` : Justification du besoin
- `budget_allocated` : Budget alloué

**Relations** :
- BelongsTo RecruitmentPlan
- BelongsTo JobPosition
- BelongsTo Grade
- BelongsTo Service

### 3. JobPosting
**Objectif** : Annonces d'emploi publiées

**Champs principaux** :
- `reference_code` : Code unique (ex: JOB-2025-0001)
- `title` : Titre de l'annonce
- `description` : Description du poste
- `responsibilities` : Responsabilités
- `requirements` : Exigences
- `qualifications` : Qualifications requises
- `benefits` : Avantages offerts
- `application_deadline` : Date limite de candidature
- `receiving_email` : Email pour recevoir les candidatures
- `auto_process_emails` : Activer le traitement automatique
- `publish_on_website` : Publier sur le site
- `publish_on_social_media` : Publier sur les réseaux sociaux
- `status` : draft | published | closed | cancelled | filled

**Relations** :
- BelongsTo RecruitmentPlanPosition
- BelongsTo Direction, Service, JobPosition
- BelongsTo User (creator)
- HasMany JobApplication

### 4. JobApplication
**Objectif** : Candidatures reçues

**Champs principaux** :
- `application_number` : Numéro unique (ex: APP-202501-0001)
- `first_name`, `last_name`, `email`, `phone`
- `date_of_birth`, `nationality`, `address`
- `linkedin_url`, `portfolio_url`
- `cv_file_path`, `cover_letter_file_path`, `other_documents_path`
- `application_source` : website | email | linkedin | referral | job_board | other
- `source_email_id` : ID de l'email source si automatique
- `raw_email_data` : Données brutes de l'email
- `status` : new | screening | shortlisted | interview_scheduled | interviewed | assessment | offer_pending | offer_sent | offer_accepted | offer_declined | rejected | withdrawn
- `rating` : Note de 1 à 5
- `notes` : Notes du recruteur
- `assigned_to` : Utilisateur assigné

**Relations** :
- BelongsTo JobPosting
- BelongsTo User (assigned_user)
- HasMany ApplicationStatusHistory
- HasMany JobInterview
- HasMany EmploymentOffer

### 5. ApplicationStatusHistory
**Objectif** : Historique des changements de statut

**Champs principaux** :
- `application_id`
- `previous_status`
- `new_status`
- `changed_by` : Utilisateur ayant fait le changement
- `reason` : Raison du changement
- `notes` : Notes additionnelles
- `changed_at` : Timestamp

### 6. JobInterview
**Objectif** : Entretiens planifiés

**Champs principaux** :
- `application_id`
- `interview_type` : phone | video | in_person | technical | panel | final
- `interview_stage` : 1, 2, 3, etc.
- `scheduled_date`
- `duration_minutes`
- `location` : Lieu physique
- `meeting_link` : Lien pour visio
- `interviewers` : Liste des interviewers (JSON)
- `status` : scheduled | in_progress | completed | cancelled | no_show | rescheduled
- `notes`, `feedback`
- `overall_rating` : Note globale
- `recommendation` : strong_yes | yes | maybe | no | strong_no

**Relations** :
- BelongsTo JobApplication
- BelongsTo User (scheduler)
- HasMany InterviewEvaluation

### 7. InterviewEvaluation
**Objectif** : Évaluations détaillées des entretiens

**Champs principaux** :
- `interview_id`
- `evaluator_id`
- `technical_skills` : Note /10
- `communication` : Note /10
- `problem_solving` : Note /10
- `cultural_fit` : Note /10
- `motivation` : Note /10
- `experience_relevance` : Note /10
- `overall_score` : Moyenne calculée automatiquement
- `strengths` : Points forts
- `weaknesses` : Points faibles
- `detailed_notes`
- `recommendation` : strongly_recommend | recommend | neutral | not_recommend | strongly_not_recommend
- `decision` : advance | reject | pending

**Relations** :
- BelongsTo JobInterview
- BelongsTo User (evaluator)

### 8. EmploymentOffer
**Objectif** : Offres d'emploi aux candidats

**Champs principaux** :
- `offer_number` : Numéro unique (ex: OFFER-2025-0001)
- `application_id`
- `job_position_id`, `grade_id`, `service_id`, `direction_id`
- `manager_id` : Superviseur
- `offered_salary` : Salaire offert
- `currency` : Devise (CFD par défaut)
- `salary_frequency` : hourly | monthly | annual
- `benefits_package` : Package d'avantages
- `contract_type` : cdi | cdd | stage | prestation | apprentissage
- `start_date` : Date de début
- `probation_period_months` : Période d'essai
- `work_schedule`, `remote_work_policy`
- `offer_letter_path` : PDF généré
- `offer_sent_date`, `offer_expiry_date`
- `status` : draft | pending_approval | approved | sent | accepted | declined | expired | cancelled
- `candidate_response_date`, `candidate_comments`

**Relations** :
- BelongsTo JobApplication
- BelongsTo JobPosition, Grade, Service, Direction
- BelongsTo Employee (manager)
- BelongsTo User (approver, creator)

### 9. OnboardingChecklist
**Objectif** : Checklists d'intégration pour nouveaux employés

**Champs principaux** :
- `employee_id`
- `employment_offer_id`
- `checklist_name`
- `start_date`, `target_completion_date`, `actual_completion_date`
- `status` : not_started | in_progress | completed | on_hold
- `completion_percentage` : 0-100%
- `assigned_hr_id` : RH responsable

**Relations** :
- BelongsTo Employee
- BelongsTo EmploymentOffer
- BelongsTo User (assigned_hr)
- HasMany OnboardingTask

### 10. OnboardingTask
**Objectif** : Tâches individuelles d'onboarding

**Champs principaux** :
- `checklist_id`
- `task_template_id` : Template source
- `task_name`, `description`
- `category` : administrative | equipment | training | team_introduction | system_access | documentation | other
- `priority` : low | medium | high | critical
- `due_date`
- `assigned_to` : Responsable de la tâche
- `status` : pending | in_progress | completed | skipped | blocked
- `completion_date`, `completed_by`
- `notes`, `attachments`
- `order_index` : Ordre d'affichage

**Relations** :
- BelongsTo OnboardingChecklist
- BelongsTo OnboardingTaskTemplate
- BelongsTo User (assigned_user, completer)

### 11. OnboardingTaskTemplate
**Objectif** : Templates de tâches réutilisables

**Champs principaux** :
- `task_name`, `description`
- `category`, `priority`
- `days_from_start` : Nombre de jours après la date de début
- `responsible_role` : Rôle responsable
- `order_index`
- `is_active` : Actif ou non

### 12. RecruitmentEmail
**Objectif** : Emails de candidature reçus automatiquement

**Champs principaux** :
- `message_id` : ID unique de l'email
- `from_email`, `from_name`
- `subject`, `body_text`, `body_html`
- `received_date`
- `attachments` : Liste des pièces jointes (JSON)
- `job_posting_id` : Offre liée
- `application_id` : Candidature créée
- `processing_status` : pending | processing | processed | failed | ignored
- `error_message`
- `processed_date`
- `raw_email_path` : Fichier .eml sauvegardé

**Relations** :
- BelongsTo JobPosting
- BelongsTo JobApplication

### 13. EmailTemplate
**Objectif** : Templates d'emails réutilisables

**Champs principaux** :
- `template_name`, `template_code`
- `subject`, `body_html`, `body_text`
- `category` : recruitment | onboarding | general | birthday | anniversary
- `available_variables` : Variables disponibles (JSON)
- `is_active`

**Templates par défaut** :
1. `application_received` : Confirmation de réception
2. `interview_invitation` : Invitation à un entretien
3. `job_offer` : Offre d'emploi
4. `onboarding_welcome` : Bienvenue lors de l'onboarding
5. `birthday_card` : Carte d'anniversaire automatique

### 14. SentEmail
**Objectif** : Historique des emails envoyés

**Champs principaux** :
- `template_id` : Template utilisé
- `recipient_email`, `recipient_name`
- `subject`, `body_html`, `body_text`
- `sent_date`
- `status` : pending | sent | failed | bounced
- `error_message`
- `related_entity_type`, `related_entity_id` : Entité liée
- `sent_by` : Utilisateur ayant envoyé
- `cc_emails`, `bcc_emails`, `attachments`

## API Endpoints

### Plans de Recrutement
- `GET /api/recruitment/plans` - Liste des plans
- `GET /api/recruitment/plans/:id` - Détails d'un plan
- `POST /api/recruitment/plans` - Créer un plan
- `PUT /api/recruitment/plans/:id` - Modifier un plan
- `POST /api/recruitment/plans/:id/submit` - Soumettre pour approbation
- `POST /api/recruitment/plans/:id/approve` - Approuver/rejeter
- `POST /api/recruitment/plans/:id/positions` - Ajouter une position
- `PUT /api/recruitment/plan-positions/:positionId` - Modifier une position
- `DELETE /api/recruitment/plan-positions/:positionId` - Supprimer une position

### Offres d'Emploi
- `GET /api/recruitment/postings` - Liste des offres
- `GET /api/recruitment/postings/:id` - Détails d'une offre
- `POST /api/recruitment/postings` - Créer une offre
- `PUT /api/recruitment/postings/:id` - Modifier une offre
- `POST /api/recruitment/postings/:id/publish` - Publier
- `POST /api/recruitment/postings/:id/close` - Fermer

### Candidatures
- `GET /api/recruitment/applications` - Liste des candidatures
- `GET /api/recruitment/applications/:id` - Détails d'une candidature
- `POST /api/recruitment/applications` - Créer une candidature (manuel)
- `PUT /api/recruitment/applications/:id` - Modifier
- `POST /api/recruitment/applications/:id/assign` - Assigner à un utilisateur
- `POST /api/recruitment/applications/:id/rate` - Noter

### Entretiens
- `GET /api/recruitment/applications/:applicationId/interviews` - Entretiens d'une candidature
- `POST /api/recruitment/interviews` - Planifier un entretien
- `PUT /api/recruitment/interviews/:id` - Modifier un entretien
- `GET /api/recruitment/interviews/:interviewId/evaluations` - Évaluations
- `POST /api/recruitment/evaluations` - Soumettre une évaluation

### Offres d'Emploi (Contracts)
- `GET /api/recruitment/offers` - Liste des offres
- `GET /api/recruitment/offers/:id` - Détails d'une offre
- `POST /api/recruitment/offers` - Créer une offre
- `PUT /api/recruitment/offers/:id` - Modifier
- `POST /api/recruitment/offers/:id/approve` - Approuver
- `POST /api/recruitment/offers/:id/send` - Envoyer au candidat
- `POST /api/recruitment/offers/:id/respond` - Réponse du candidat

### Onboarding
- `GET /api/recruitment/onboarding` - Liste des checklists
- `GET /api/recruitment/onboarding/:id` - Détails d'une checklist
- `POST /api/recruitment/onboarding` - Créer une checklist
- `PUT /api/recruitment/onboarding/:id` - Modifier
- `POST /api/recruitment/onboarding/:checklistId/tasks` - Ajouter une tâche
- `PUT /api/recruitment/tasks/:taskId` - Modifier une tâche
- `GET /api/recruitment/task-templates` - Templates de tâches
- `POST /api/recruitment/task-templates` - Créer un template

### Emails
- `GET /api/recruitment/email-templates` - Templates d'emails
- `GET /api/recruitment/sent-emails` - Emails envoyés
- `GET /api/recruitment/recruitment-emails` - Emails de candidature reçus
- `PUT /api/recruitment/recruitment-emails/:id` - Modifier le statut

### Statistiques
- `GET /api/recruitment/statistics` - Statistiques globales

## Permissions Requises

- `recruitment.view` : Voir les données de recrutement
- `recruitment.create` : Créer des entrées
- `recruitment.edit` : Modifier des entrées
- `recruitment.delete` : Supprimer des entrées
- `recruitment.approve` : Approuver des plans/offres
- `recruitment.admin` : Administration complète du module

## Workflow Complet : Exemple de Processus

### 1. Planification (Janvier)
1. Direction Finance crée un plan de recrutement pour 2025
2. Ajoute 3 positions : 2 Comptables (Grade C2), 1 Analyste Financier (Grade C3)
3. Soumet le plan pour approbation
4. DRH approuve le plan

### 2. Publication d'Offre (Février)
1. RH crée une offre d'emploi pour "Comptable - Direction Finance"
2. Configure l'email `recrutement-compta@sofibank.cm` pour recevoir les candidatures
3. Active le traitement automatique des emails
4. Publie l'offre sur le site web et LinkedIn
5. Système génère le code `JOB-2025-0001`

### 3. Réception Automatique (Février-Mars)
1. Candidat envoie CV par email à `recrutement-compta@sofibank.cm`
2. Système reçoit l'email via IMAP/webhook
3. Crée automatiquement une entrée `RecruitmentEmail`
4. Parse l'email pour extraire : nom, email, CV (pièce jointe)
5. Crée automatiquement une `JobApplication` avec statut "new"
6. Génère le numéro `APP-202502-0001`
7. Envoie email de confirmation automatique au candidat

### 4. Tri et Entretiens (Mars)
1. RH consulte le dashboard des candidatures
2. Filtre par offre JOB-2025-0001
3. Note les candidatures (1 à 5 étoiles)
4. Change statut des meilleurs à "shortlisted"
5. Planifie 5 entretiens téléphoniques
6. Système envoie email d'invitation automatique
7. Après entretiens téléphoniques, planifie 2 entretiens en personne
8. 2 managers font des évaluations indépendantes avec grille standardisée

### 5. Offre d'Emploi (Avril)
1. RH crée une offre d'emploi pour le meilleur candidat
2. Renseigne : salaire 800 000 CFD, CDI, Grade C2, date début 01/05/2025
3. Soumet pour approbation du DRH
4. DRH approuve
5. Système génère un PDF signé de l'offre
6. RH envoie l'offre au candidat avec date d'expiration 15/04/2025
7. Candidat accepte l'offre le 10/04/2025

### 6. Onboarding (Mai)
1. Système crée automatiquement un Employé à partir des données du candidat
2. Génère un compte User avec identifiants temporaires
3. Crée une checklist d'onboarding avec 10 tâches :
   - Jour 1 : Signature contrat, badge, email professionnel
   - Jour 2 : Visite des locaux, présentation équipe
   - Jour 3-5 : Formation aux outils, accès systèmes
   - Semaine 2 : Formation métier, objectifs
   - Jour 30 : Évaluation fin de période d'essai
4. Envoie email de bienvenue avec identifiants
5. RH suit la progression : 70% complété après 2 semaines
6. Toutes les tâches terminées → Checklist à 100% → Employé opérationnel

## Fonctionnalités Avancées

### Email Automation
- **Parsing automatique** : Extraction des informations du CV
- **Détection de l'offre** : Matching avec l'offre via l'adresse email
- **Sauvegarde des pièces jointes** : CV, lettre de motivation, diplômes
- **Réponses automatiques** : Confirmation de réception

### PDF Generation
- **Offres d'emploi** : Génération avec logo et signature
- **Contrats** : Templates personnalisables par type de contrat
- **Certificats** : Fin de période d'essai, confirmation

### Notifications
- **Email** : Tous les événements importants
- **Dashboard** : Notifications en temps réel
- **Rappels** : Entretiens à venir, offres expirantes

### Rapports & Analytics
- **Funnel de recrutement** : Conversion à chaque étape
- **Time-to-hire** : Temps moyen de recrutement
- **Source tracking** : Meilleurs canaux de recrutement
- **Coût par recrutement** : Budget vs réalisé

## Intégration avec Autres Modules

### ESS (Employee Self-Service)
- Nouveau employé accède à son profil
- Complète ses informations personnelles
- Upload documents manquants
- Consulte son contrat

### Payroll
- Données salariales de l'offre d'emploi
- Grade et échelon automatiques
- Date de début pour calcul prorata

### Performance
- Objectifs définis lors de l'onboarding
- Évaluation de fin de période d'essai
- Plan de développement personnel

## Sécurité & Conformité

### RGPD
- Consentement explicite pour conservation des données
- Durée de conservation limitée (2 ans)
- Droit à l'oubli (suppression sur demande)
- Anonymisation des données rejetées

### Audit Trail
- Toutes les actions sont loggées
- Historique complet des changements de statut
- Traçabilité des approbations

## Prochaines Étapes

1. ✅ **Base de données** : Schema complet créé (13 tables)
2. ✅ **Backend** : Models Sequelize créés
3. ✅ **Backend** : Controller avec 50+ fonctions
4. ✅ **Backend** : Routes sécurisées avec permissions
5. ⏳ **Email Automation** : Service IMAP/SMTP pour traitement automatique
6. ⏳ **PDF Generation** : Service de génération de documents
7. ⏳ **Frontend** : Pages React pour les 5 étapes
8. ⏳ **React Query Hooks** : useRecruitment.js
9. ⏳ **Tests** : Tests unitaires et d'intégration
10. ⏳ **Documentation** : Guide utilisateur complet

## Migration de la Base de Données

Pour créer les tables, exécutez :

```bash
mysql -u root -p sofibank_db < /Users/alvin/Dev/NextJSProjects/rh-sofibank/api/database/recruitment_module_schema.sql
```

## Démarrage du Module

Une fois la migration effectuée, le module sera accessible via :

```
http://localhost:5005/api/recruitment/*
```

Toutes les routes nécessitent une authentification JWT et les permissions appropriées.
