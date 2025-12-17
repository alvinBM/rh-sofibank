# REFACTORISATION DU SERVICE EMPLOYEE

## 📋 RÉSUMÉ DES MODIFICATIONS

Standardisation du service `employeeService` pour suivre le même pattern que `recruitmentService` avec construction d'URL propre et utilisation de `offset/limit` au lieu de `page/limit`.

**Date:** 2025-12-17

---

## 🔄 CHANGEMENTS BACKEND

### 1. **Controller: `employeeController.js`**

#### Avant :
```javascript
const {
  page = 1,
  limit = 10,
  search,
  direction_id,
  service_id,
  employment_status,
  contract_type
} = req.query;

const offset = (parseInt(page) - 1) * parseInt(limit);

// Réponse avec pagination object
return res.status(200).json({
  status: 200,
  data: {
    employees: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit))
    }
  }
});
```

#### Après :
```javascript
const {
  offset = 0,
  limit = 10,
  search,
  direction_id,
  service_id,
  employment_status,
  contract_type,
  user_id  // ✅ NOUVEAU FILTRE
} = req.query;

// Réponse simplifiée
return res.status(200).json({
  status: 200,
  data: {
    employees: rows,
    total: count
  }
});
```

**Ajouts :**
- ✅ Filtre `user_id` pour rechercher par ID utilisateur
- ✅ Paramètre `offset` au lieu de `page`
- ✅ Réponse simplifiée (suppression de l'objet `pagination`)

---

## 🔄 CHANGEMENTS FRONTEND

### 1. **Service: `employeeService.js`**

#### Avant :
```javascript
export const fetchEmployees = async ({ offset = 0, limit = 10, query, filters = {} }) => {
  try {
    const page = Math.floor(offset / limit) + 1;
    
    const params = {
      page,
      limit,
      ...filters,
    };

    if (query) {
      params.search = query;
    }

    const response = await apiClient.get('/employees', params);
    
    return {
      employees: response.data.employees || [],
      total: response.data.total || 0,
    };
  } catch (error) {
    console.error('Fetch employees error:', error);
    throw error;
  }
};
```

#### Après :
```javascript
export const fetchEmployees = async ({ offset = 0, limit = 10, query, filters = {} }) => {
  try {
    let requestUrl = `/employees?offset=${offset}&limit=${limit}`;
    
    if (query) requestUrl += `&search=${query}`;
    if (filters.direction_id) requestUrl += `&direction_id=${filters.direction_id}`;
    if (filters.service_id) requestUrl += `&service_id=${filters.service_id}`;
    if (filters.employment_status) requestUrl += `&employment_status=${filters.employment_status}`;
    if (filters.contract_type) requestUrl += `&contract_type=${filters.contract_type}`;
    if (filters.status) requestUrl += `&status=${filters.status}`;
    if (filters.user_id) requestUrl += `&user_id=${filters.user_id}`;

    const response = await apiClient.get(requestUrl);
    
    if (response.status === 200) {
      return {
        employees: response.data.employees || [],
        total: response.data.total || 0,
      };
    } else {
      throw new Error(response.message || 'Failed to fetch employees');
    }
  } catch (error) {
    console.error('Fetch employees error:', error);
    throw error;
  }
};
```

**Changements :**
- ✅ Construction d'URL avec query string au lieu d'objet params
- ✅ Ajout de tous les filtres explicitement
- ✅ Vérification du status de réponse
- ✅ Pattern identique à `getJobApplications`

---

### 2. **Service: `fetchEmployeeByUserId`**

#### Avant :
```javascript
export const fetchEmployeeByUserId = async (userId) => {
  try {
    const response = await apiClient.get('/employees', { user_id: userId });
    return response.data.employees && response.data.employees.length > 0 
      ? response.data.employees[0] 
      : null;
  } catch (error) {
    console.error('Fetch employee by user id error:', error);
    throw error;
  }
};
```

#### Après :
```javascript
export const fetchEmployeeByUserId = async (userId) => {
  try {
    const requestUrl = `/employees?offset=0&limit=1&user_id=${userId}`;
    const response = await apiClient.get(requestUrl);
    
    if (response.status === 200) {
      return response.data.employees && response.data.employees.length > 0 
        ? response.data.employees[0] 
        : null;
    } else {
      throw new Error(response.message || 'Failed to fetch employee by user id');
    }
  } catch (error) {
    console.error('Fetch employee by user id error:', error);
    throw error;
  }
};
```

---

## 📄 PAGES CORRIGÉES

Les pages suivantes ont été mises à jour pour appeler `useGetEmployees` correctement avec les paramètres requis :

### 1. `/app/dashboard/recruitment/candidates/page.jsx`
```javascript
// ❌ Avant
const { data: employees } = useGetEmployees();

// ✅ Après
const { data: employees } = useGetEmployees({ page: 1, rowsPerPage: 1000, query: "", filters: {} });
```

### 2. `/app/dashboard/recruitment/interviews/page.jsx`
```javascript
// ❌ Avant
const { data: employees } = useGetEmployees();

// ✅ Après
const { data: employees } = useGetEmployees({ page: 1, rowsPerPage: 1000, query: "", filters: {} });
```

### 3. `/app/dashboard/recruitment/onboarding/page.jsx`
```javascript
// ❌ Avant
const { data: employees } = useGetEmployees();

// ✅ Après
const { data: employees } = useGetEmployees({ page: 1, rowsPerPage: 1000, query: "", filters: {} });
```

### 4. `/app/dashboard/recruitment/offers/page.jsx`
```javascript
// ❌ Avant
const { data: employees } = useGetEmployees();

// ✅ Après
const { data: employees } = useGetEmployees({ page: 1, rowsPerPage: 1000, query: "", filters: {} });
```

### 5. Pages déjà correctes (pas de changement) :
- ✅ `/app/dashboard/attendance/authorizations/page.jsx`
- ✅ `/app/dashboard/employees/page.jsx`
- ✅ `/app/dashboard/employees/[id]/page.jsx`
- ✅ `/app/dashboard/leave/requests/page.jsx`
- ✅ `/app/ui/dashboard/forms/AddEmployeeModal.jsx`

---

## 📊 IMPACT

### Avant la refactorisation :
- ❌ Appels inconsistants (`useGetEmployees()` sans paramètres)
- ❌ Backend utilise `page` pour pagination
- ❌ Pas de filtre `user_id`
- ❌ Pattern différent de `recruitmentService`

### Après la refactorisation :
- ✅ Tous les appels avec paramètres explicites
- ✅ Backend utilise `offset` (standard REST)
- ✅ Filtre `user_id` ajouté
- ✅ Pattern uniforme avec `recruitmentService`
- ✅ Construction d'URL propre et lisible

---

## 🎯 AVANTAGES

1. **Cohérence** : Même pattern que `recruitmentService`, `attendanceService`, etc.
2. **Clarté** : Construction d'URL explicite et lisible
3. **Maintenabilité** : Plus facile à débugger avec les URLs complètes
4. **Filtrage** : Support de `user_id` pour recherche par utilisateur
5. **Standards REST** : Utilisation de `offset/limit` au lieu de `page/limit`

---

## 🧪 TESTS REQUIS

Après ces modifications, testez :

1. **Liste des employés** (`/dashboard/employees`)
   - Pagination fonctionne
   - Filtres (direction, service, statut) fonctionnent
   - Recherche fonctionne

2. **Pages de recrutement**
   - `/dashboard/recruitment/candidates` - Liste des employés pour assignation
   - `/dashboard/recruitment/interviews` - Liste des interviewers
   - `/dashboard/recruitment/offers` - Liste des employés
   - `/dashboard/recruitment/onboarding` - Liste des employés

3. **Pages d'attendance**
   - `/dashboard/attendance/authorizations` - Sélection d'employé

4. **Pages de congés**
   - `/dashboard/leave/requests` - Sélection remplaçant/employé

5. **Recherche par user_id**
   - Vérifier que `fetchEmployeeByUserId` fonctionne correctement

---

## 📝 NOTES TECHNIQUES

### Pattern URL utilisé :
```javascript
let requestUrl = `/endpoint?offset=${offset}&limit=${limit}`;

if (filter1) requestUrl += `&filter1=${filter1}`;
if (filter2) requestUrl += `&filter2=${filter2}`;
// ...

const response = await apiClient.get(requestUrl);
```

### Pourquoi ce pattern ?
1. **Lisibilité** : L'URL construite est visible dans les logs
2. **Debugging** : Facile de copier/coller l'URL dans un outil REST
3. **Standard** : Correspond aux bonnes pratiques REST API
4. **Cohérence** : Même pattern dans tout le projet

---

## ✅ CHECKLIST DE VALIDATION

- [x] Backend modifié pour accepter `offset` au lieu de `page`
- [x] Backend retourne `{ status, data: { employees, total } }`
- [x] Backend supporte le filtre `user_id`
- [x] Service `fetchEmployees` utilise construction d'URL
- [x] Service `fetchEmployeeByUserId` utilise construction d'URL
- [x] Toutes les pages appellent `useGetEmployees` avec paramètres
- [x] Pattern identique à `recruitmentService`
- [x] Documentation créée

---

**Auteur:** GitHub Copilot  
**Date:** 2025-12-17  
**Version:** 1.0
