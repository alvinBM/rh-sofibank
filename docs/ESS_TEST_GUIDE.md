# Guide de Test - Module ESS

## Étapes d'Installation

### 1. Créer les tables dans la base de données

```bash
cd /Users/alvin/Dev/NextJSProjects/rh-sofibank/api
mysql -u root -p sofibank_db < database/ess_module_schema.sql
```

Cela va créer :
- `employee_documents`
- `employee_contracts`
- `request_types`
- `employee_requests`
- `internal_announcements`
- `announcement_reads`
- `employee_feedback`
- `career_history`
- `employee_dependents`

Et insérer 8 types de demandes par défaut.

### 2. Redémarrer le backend

```bash
cd /Users/alvin/Dev/NextJSProjects/rh-sofibank/api
npm run dev
```

### 3. Redémarrer le frontend (si nécessaire)

```bash
cd /Users/alvin/Dev/NextJSProjects/rh-sofibank
npm run dev
```

## Tests à Effectuer

### Test 1 : Consulter Mon Profil

1. Se connecter avec `admin@sofibank.cd`
2. Aller dans **Mon Espace ESS > Mon Profil**
3. Vérifier que toutes les informations s'affichent correctement
4. Naviguer entre les onglets :
   - ✅ **Informations** : Voir les infos non-modifiables et modifiables
   - ✅ **Adresse** : Coordonnées
   - ✅ **Contact d'Urgence** : Personne à contacter
   - ✅ **Contrats** : Liste des contrats (vide pour l'instant)
   - ✅ **Carrière** : Historique de carrière (vide pour l'instant)
   - ✅ **Dépendants** : Liste des dépendants (vide pour l'instant)

### Test 2 : Modifier Mon Profil

1. Cliquer sur **Modifier**
2. Changer :
   - Email personnel : `jean.mukendi@gmail.com`
   - Téléphone : `+243 970 123 456`
   - Adresse ligne 1 : `123 Avenue de la Paix`
   - Ville : `Kinshasa`
   - Province : `Kinshasa`
   - Situation matrimoniale : Marié(e)
   - Nom du conjoint : `Marie MUKENDI`
   - Nombre d'enfants : `2`
   - Contact d'urgence : `Paul MUKENDI`
   - Téléphone contact : `+243 970 987 654`
   - Relation : `Frère`
3. Cliquer sur **Enregistrer**
4. Vérifier que le message de succès s'affiche
5. Rafraîchir la page et vérifier que les changements sont sauvegardés

### Test 3 : Vérifier les Endpoints Backend

Utilisez Postman ou curl pour tester :

#### Récupérer mon profil
```bash
curl -X GET http://localhost:3001/api/ess/my-profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Réponse attendue :
```json
{
  "status": 200,
  "data": {
    "id": "...",
    "user_id": "...",
    "employee_number": "EMP001",
    "first_name": "Jean",
    "last_name": "MUKENDI",
    "email": "admin@sofibank.cd",
    "phone": "+243 970 123 456",
    "personal_email": "jean.mukendi@gmail.com",
    "direction": {...},
    "service": {...},
    "job_position": {...},
    "grade": {...}
  }
}
```

#### Récupérer mes contrats
```bash
curl -X GET http://localhost:3001/api/ess/my-contracts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Récupérer les types de demandes
```bash
curl -X GET http://localhost:3001/api/ess/request-types \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Devrait retourner 8 types de demandes.

### Test 4 : Créer des Données de Test

#### Créer un contrat
```bash
curl -X POST http://localhost:3001/api/ess/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "ID_DE_VOTRE_EMPLOYEE",
    "document_type": "contract",
    "document_name": "Contrat CDI 2015",
    "file_path": "/uploads/contracts/contract_2015.pdf",
    "notes": "Contrat initial"
  }'
```

#### Créer un historique de carrière
```bash
curl -X POST http://localhost:3001/api/ess/history \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "ID_DE_VOTRE_EMPLOYEE",
    "change_type": "promotion",
    "effective_date": "2020-01-15",
    "new_grade_id": "ID_DU_GRADE",
    "new_salary": 2500000,
    "previous_salary": 2000000,
    "reason": "Promotion suite à excellentes performances"
  }'
```

#### Créer un dépendant
```bash
curl -X POST http://localhost:3001/api/ess/dependents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "ID_DE_VOTRE_EMPLOYEE",
    "first_name": "Marie",
    "last_name": "MUKENDI",
    "relationship": "spouse",
    "date_of_birth": "1985-03-20",
    "gender": "F",
    "is_beneficiary": true
  }'
```

Ensuite retourner sur la page **Mon Profil** et vérifier que les données apparaissent dans les onglets respectifs.

## Problèmes Courants

### Erreur : "Table doesn't exist"
**Solution** : Exécuter le script SQL pour créer les tables.

### Erreur : "Cannot read property 'employee' of undefined"
**Solution** : Vérifier que l'utilisateur connecté a un profil employé associé.

### Les données ne s'affichent pas
**Solution** : 
1. Vérifier la console du navigateur pour les erreurs
2. Vérifier les logs du backend
3. Vérifier que les relations Sequelize sont correctement configurées

### Erreur 401 Unauthorized
**Solution** : Vérifier que le token JWT est valide et présent dans les headers.

## Prochaines Fonctionnalités à Tester

Une fois les tests de base validés :

1. **Page Documents** : Upload et gestion des documents
2. **Page Demandes** : Création et suivi des demandes administratives
3. **Page Annonces** : Consultation des annonces internes
4. **Feedback** : Envoi de suggestions et réclamations

## Structure des Données Retournées

### Mon Profil (useGetMyProfile)
```javascript
{
  id: "uuid",
  email: "admin@sofibank.cd",
  is_active: true,
  roles: [{...}],
  employee: {
    id: "uuid",
    employee_number: "EMP001",
    first_name: "Jean",
    last_name: "MUKENDI",
    email: "admin@sofibank.cd",
    phone: "+243 970 000 001",
    personal_email: "jean@gmail.com",
    address_line1: "...",
    city: "...",
    direction: { name: "Direction Générale" },
    service: null,
    job_position: { title: "Directeur Général" },
    grade: { name: "Directeur" }
  },
  permissions: ["..."]
}
```

### Mes Contrats (useGetMyContracts)
```javascript
[{
  id: "uuid",
  employee_id: "uuid",
  contract_type: "permanent",
  start_date: "2015-01-10",
  end_date: null,
  salary: "2000000.00",
  position: "Directeur Général",
  status: "active"
}]
```

### Historique de Carrière (useGetEmployeeHistory)
```javascript
[{
  id: "uuid",
  employee_id: "uuid",
  change_type: "promotion",
  effective_date: "2020-01-15",
  previous_salary: "2000000.00",
  new_salary: "2500000.00",
  job_position: { title: "Directeur Général" },
  grade: { name: "Directeur" },
  reason: "..."
}]
```

## Validation du Module

✅ **Backend**
- Contrôleur ESS créé avec tous les endpoints
- Routes ESS configurées et sécurisées
- 9 nouveaux modèles Sequelize
- Associations configurées dans models/index.js
- Script SQL pour créer les tables

✅ **Frontend**
- Hooks React Query pour toutes les fonctionnalités ESS
- Page Mon Profil avec 6 onglets
- Formulaire de modification des informations modifiables
- Affichage des contrats, historique, et dépendants

✅ **Documentation**
- README complet du module ESS
- Guide de test avec exemples curl
- Liste des permissions requises
