# 🔧 Corrections API et Services - Module Recrutement

## ✅ Corrections Appliquées

### 1. ❌ Erreur SQL Fixed: `Unknown column 'approver.username'`

**Problème**: Le modèle `User` n'a pas de colonne `username`, seulement `email`.

**Solution**:
```javascript
// AVANT
{
    model: User,
    as: 'approver',
    attributes: ['id', 'username', 'email'] // ❌ username n'existe pas
}

// APRÈS
{
    model: User,
    as: 'approver',
    attributes: ['id', 'email'] // ✅ Seulement les champs existants
}
```

---

### 2. 📊 Pagination Ajoutée sur Tous les Endpoints GET

#### Backend Controllers - Pattern Standard

**Tous les endpoints GET suivent maintenant ce pattern**:

```javascript
export const getXXX = async (req, res) => {
    try {
        // 1. Extraction et parsing des paramètres
        let { offset = 0, limit = 10, query, ...filters } = req.query;
        offset = parseInt(offset);
        limit = parseInt(limit);
        const stringQuery = query ? query.trim() : '';

        // 2. Construction du WHERE avec filtres
        const where = {};
        if (filter1) where.field1 = filter1;
        if (filter2) where.field2 = filter2;
        if (stringQuery) {
            where[Op.or] = [
                { field1: { [Op.like]: `%${stringQuery}%` } },
                { field2: { [Op.like]: `%${stringQuery}%` } }
            ];
        }

        // 3. findAndCountAll avec pagination
        const result = await Model.findAndCountAll({
            offset,
            limit,
            where,
            include: [...],
            order: [['created_at', 'DESC']],
            distinct: true // Important pour les relations
        });

        // 4. Réponse standardisée
        res.json({
            status: 200,
            message: 'Resources trouvées',
            total: result.count, // ✅ TOUJOURS inclure total
            resources: result.rows // ✅ Nom au pluriel
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            status: 500,
            error: 'Failed to fetch resources' 
        });
    }
};
```

#### Endpoints Corrigés

##### 1. `GET /recruitment/plans`
```javascript
Query params:
- offset (default: 0)
- limit (default: 10)
- year
- direction_id
- status
- query (search in notes)

Response:
{
    status: 200,
    message: "Plans de recrutement trouvés",
    total: 25,
    plans: [...]
}
```

##### 2. `GET /recruitment/postings`
```javascript
Query params:
- offset (default: 0)
- limit (default: 10)
- status
- direction_id
- service_id
- plan_id
- job_position_id
- query (search in title, reference_code, description)

Response:
{
    status: 200,
    message: "Job postings trouvées",
    total: 42,
    postings: [...]
}
```

##### 3. `GET /recruitment/applications`
```javascript
Query params:
- offset (default: 0)
- limit (default: 10)
- posting_id
- status
- assigned_to
- query (search in first_name, last_name, email, application_number)
- sort (default: 'applied_date')
- order (default: 'DESC')

Response:
{
    status: 200,
    message: "Candidatures trouvées",
    total: 156,
    applications: [...]
}
```

---

### 3. 🔄 Services Frontend - URLs Complètes avec Filtres Explicites

**Avant** (Mauvais):
```javascript
export const getJobPostings = async (params = {}) => {
    const { data } = await apiClient.get("/recruitment/postings", { params });
    return data; // ❌ Ne retourne pas total
};
```

**Après** (Correct):
```javascript
export const getJobPostings = async ({ offset = 0, limit = 10, status, plan_id, job_position_id, query } = {}) => {
    // ✅ Construction explicite de l'URL
    let requestUrl = `recruitment/postings?offset=${offset}&limit=${limit}`;
    
    if (status) requestUrl += `&status=${status}`;
    if (plan_id) requestUrl += `&plan_id=${plan_id}`;
    if (job_position_id) requestUrl += `&job_position_id=${job_position_id}`;
    if (query) requestUrl += `&query=${query}`;

    const { data } = await apiClient.get(requestUrl);

    // ✅ Validation et retour structuré
    if (data.status === 200) {
        return {
            postings: data.postings,
            total: data.total // ✅ TOUJOURS inclure total
        };
    } else {
        throw new Error(data.message || 'Failed to fetch job postings');
    }
};
```

#### Services Corrigés

**1. `recruitmentService.js`**

```javascript
// Plans
export const getRecruitmentPlans = async ({ offset = 0, limit = 10, year, direction_id, status, query } = {}) => {
    let requestUrl = `recruitment/plans?offset=${offset}&limit=${limit}`;
    if (year) requestUrl += `&year=${year}`;
    if (direction_id) requestUrl += `&direction_id=${direction_id}`;
    if (status) requestUrl += `&status=${status}`;
    if (query) requestUrl += `&query=${query}`;

    const { data } = await apiClient.get(requestUrl);

    if (data.status === 200) {
        return {
            plans: data.plans,
            total: data.total
        };
    } else {
        throw new Error(data.message || 'Failed to fetch recruitment plans');
    }
};

// Job Postings
export const getJobPostings = async ({ offset = 0, limit = 10, status, plan_id, job_position_id, query } = {}) => {
    let requestUrl = `recruitment/postings?offset=${offset}&limit=${limit}`;
    if (status) requestUrl += `&status=${status}`;
    if (plan_id) requestUrl += `&plan_id=${plan_id}`;
    if (job_position_id) requestUrl += `&job_position_id=${job_position_id}`;
    if (query) requestUrl += `&query=${query}`;

    const { data } = await apiClient.get(requestUrl);

    if (data.status === 200) {
        return {
            postings: data.postings,
            total: data.total
        };
    } else {
        throw new Error(data.message || 'Failed to fetch job postings');
    }
};

// Applications
export const getJobApplications = async ({ offset = 0, limit = 10, status, posting_id, assigned_to, query, sort, order } = {}) => {
    let requestUrl = `recruitment/applications?offset=${offset}&limit=${limit}`;
    if (status) requestUrl += `&status=${status}`;
    if (posting_id) requestUrl += `&posting_id=${posting_id}`;
    if (assigned_to) requestUrl += `&assigned_to=${assigned_to}`;
    if (query) requestUrl += `&query=${query}`;
    if (sort) requestUrl += `&sort=${sort}`;
    if (order) requestUrl += `&order=${order}`;

    const { data } = await apiClient.get(requestUrl);

    if (data.status === 200) {
        return {
            applications: data.applications,
            total: data.total
        };
    } else {
        throw new Error(data.message || 'Failed to fetch job applications');
    }
};
```

---

### 4. 🎣 Hooks React Query - Conversion page/rowsPerPage → offset/limit

**Pattern Standard**:

```javascript
export const useGetXXX = ({ page = 1, rowsPerPage = 10, ...filters } = {}) => {
  // ✅ Conversion automatique
  const offset = (page - 1) * rowsPerPage;
  const limit = rowsPerPage;
  
  return useQuery({
    queryKey: ['resource-name', page, rowsPerPage, filters],
    queryFn: () => xxxService.getXXX({ offset, limit, ...filters }),
  });
};
```

#### Hooks Corrigés

**`useRecruitment.js`**:

```javascript
// Plans
export const useGetRecruitmentPlans = ({ page = 1, rowsPerPage = 10, ...filters } = {}) => {
  const offset = (page - 1) * rowsPerPage;
  const limit = rowsPerPage;
  
  return useQuery({
    queryKey: ['recruitment-plans', page, rowsPerPage, filters],
    queryFn: () => recruitmentService.getRecruitmentPlans({ offset, limit, ...filters }),
  });
};

// Job Postings
export const useGetJobPostings = ({ page = 1, rowsPerPage = 10, ...filters } = {}) => {
  const offset = (page - 1) * rowsPerPage;
  const limit = rowsPerPage;
  
  return useQuery({
    queryKey: ['job-postings', page, rowsPerPage, filters],
    queryFn: () => recruitmentService.getJobPostings({ offset, limit, ...filters }),
  });
};

// Applications
export const useGetJobApplications = ({ page = 1, rowsPerPage = 10, ...filters } = {}) => {
  const offset = (page - 1) * rowsPerPage;
  const limit = rowsPerPage;
  
  return useQuery({
    queryKey: ['job-applications', page, rowsPerPage, filters],
    queryFn: () => recruitmentService.getJobApplications({ offset, limit, ...filters }),
  });
};
```

---

### 5. 📋 Composants Table - Pattern Standard

**Template de composant table avec pagination**:

```jsx
"use client";
import React, { useState, useMemo, useCallback } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    Chip,
    Pagination,
    Spinner,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";

const MyResourcesTable = () => {
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({});

    // ✅ Hook avec page et rowsPerPage
    const { data, isLoading, error } = useGetMyResources({
        page,
        rowsPerPage,
        query: searchQuery,
        ...filters
    });

    // ✅ Extraction des données
    const resources = data?.resources || [];
    const total = data?.total || 0;
    const pages = Math.ceil(total / rowsPerPage);

    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "NOM" },
        { key: "status", label: "STATUT" },
        { key: "actions", label: "ACTIONS" },
    ];

    const renderCell = useCallback((resource, columnKey) => {
        switch (columnKey) {
            case "id":
                return <span className="font-semibold">{resource.id}</span>;
            case "name":
                return <span>{resource.name || "-"}</span>;
            case "status":
                return (
                    <Chip
                        color={getStatusColor(resource.status)}
                        size="sm"
                        variant="flat"
                    >
                        {resource.status}
                    </Chip>
                );
            case "actions":
                return (
                    <Button size="sm" variant="light" isIconOnly>
                        <Icon icon="lucide:eye" width={18} />
                    </Button>
                );
            default:
                return "-";
        }
    }, []);

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Rechercher..."
                        startContent={<Icon icon="lucide:search" />}
                        value={searchQuery}
                        onClear={() => setSearchQuery("")}
                        onValueChange={setSearchQuery}
                    />
                </div>
            </div>
        );
    }, [searchQuery]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="text-small text-default-400">
                    Total: {total} resource{total > 1 ? "s" : ""}
                </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                />
            </div>
        );
    }, [page, pages, total]);

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-danger">Erreur lors du chargement</p>
            </div>
        );
    }

    return (
        <Table
            aria-label="Table des resources"
            topContent={topContent}
            bottomContent={bottomContent}
            classNames={{
                wrapper: "min-h-[400px]",
            }}
        >
            <TableHeader columns={columns}>
                {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
            </TableHeader>
            <TableBody
                items={resources}
                isLoading={isLoading}
                loadingContent={<Spinner />}
                emptyContent={
                    <div className="text-center py-10">
                        <p className="text-default-400">Aucune resource trouvée</p>
                    </div>
                }
            >
                {(item) => (
                    <TableRow key={item.id}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
};

export default MyResourcesTable;
```

---

## 📊 Flux de Données Complet

```
┌──────────────────────────────────────────────────────────────┐
│                      FRONTEND COMPONENT                       │
│  const [page, setPage] = useState(1);                        │
│  const [rowsPerPage] = useState(10);                         │
└────────────────────────────┬─────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       REACT QUERY HOOK                        │
│  useGetResources({ page, rowsPerPage, ...filters })         │
│                                                               │
│  const offset = (page - 1) * rowsPerPage; // 0, 10, 20...   │
│  const limit = rowsPerPage; // 10                            │
└────────────────────────────┬─────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       API SERVICE                             │
│  getResources({ offset, limit, ...filters })                │
│                                                               │
│  let url = `api/resources?offset=${offset}&limit=${limit}`;  │
│  if (filter1) url += `&filter1=${filter1}`;                  │
│  return { resources, total };                                │
└────────────────────────────┬─────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       BACKEND API                             │
│  GET /api/resources?offset=0&limit=10&filter1=value         │
│                                                               │
│  const result = await Model.findAndCountAll({                │
│      offset, limit, where, include, order, distinct: true    │
│  });                                                          │
│                                                               │
│  res.json({                                                   │
│      status: 200,                                             │
│      message: "Resources trouvées",                          │
│      total: result.count, // ✅ Pagination                   │
│      resources: result.rows                                   │
│  });                                                          │
└────────────────────────────┬─────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                       DATABASE (Sequelize)                    │
│  SELECT COUNT(*) FROM resources WHERE ...;                   │
│  SELECT * FROM resources WHERE ... LIMIT 10 OFFSET 0;        │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Migration

### Pour Chaque Endpoint Backend:
- [ ] Ajouter `offset` et `limit` avec defaults (0, 10)
- [ ] Parser les query params: `offset = parseInt(offset);`
- [ ] Utiliser `findAndCountAll` au lieu de `findAll`
- [ ] Ajouter `distinct: true` si relations multiples
- [ ] Retourner `{ status, message, total, resources: rows }`
- [ ] Remplacer `username` par `email` dans User attributes

### Pour Chaque Service Frontend:
- [ ] Construire URL complète avec query params explicites
- [ ] Valider `data.status === 200`
- [ ] Retourner `{ resources, total }`
- [ ] Gérer les erreurs avec `throw new Error()`

### Pour Chaque Hook React Query:
- [ ] Accepter `{ page, rowsPerPage, ...filters }`
- [ ] Convertir: `offset = (page - 1) * rowsPerPage`
- [ ] Query key: `['resource', page, rowsPerPage, filters]`
- [ ] Passer `{ offset, limit, ...filters }` au service

### Pour Chaque Composant Table:
- [ ] State: `page`, `rowsPerPage`, `searchQuery`
- [ ] Hook avec `{ page, rowsPerPage, query, ...filters }`
- [ ] Extraire: `resources = data?.resources || []`
- [ ] Extraire: `total = data?.total || 0`
- [ ] Calculer: `pages = Math.ceil(total / rowsPerPage)`
- [ ] Composant `<Pagination page={page} total={pages} onChange={setPage} />`

---

## 🚀 Prochaines Étapes

1. **Appliquer aux autres modules**:
   - Employees
   - Attendance
   - Leave
   - Payroll
   - Performance
   - Settings

2. **Tests**:
   - Tester pagination (page 1, 2, 3...)
   - Tester filtres combinés
   - Tester recherche
   - Vérifier `total` correct

3. **Optimisations**:
   - Index sur colonnes de recherche
   - Cache React Query
   - Debounce sur recherche

---

**Date**: 17 décembre 2025
**Statut**: ✅ **Corrections Appliquées**
