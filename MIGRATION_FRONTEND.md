# Migration Frontend: Supabase → Express API

Ce document explique comment migrer le frontend Next.js de Supabase vers la nouvelle API Express.

## 📋 Étapes de migration

### 1. Créer un service API central

Créer `/src/services/api-client.js` :

```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3600/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // L'API retourne toujours status 200 avec un code dans le body
      if (data.status >= 400) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
```

### 2. Mettre à jour authService.js

Remplacer `/src/services/authService.js` :

```javascript
import apiClient from './api-client';

export const authService = {
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    
    if (response.status === 200 && response.data.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response.data;
  },

  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  async updateProfile(updates) {
    const response = await apiClient.put('/auth/profile', updates);
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  async logout() {
    apiClient.clearToken();
  },

  async verifyToken() {
    try {
      const response = await apiClient.get('/auth/verify-token');
      return response.status === 200;
    } catch {
      return false;
    }
  },
};
```

### 3. Créer le nouveau employeeService.js

Créer `/src/services/apis/employeeApiService.js` :

```javascript
import apiClient from '../api-client';

export const employeeApiService = {
  async getAll(params = {}) {
    const response = await apiClient.get('/employees', params);
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },

  async create(employeeData) {
    const response = await apiClient.post('/employees', employeeData);
    return response.data;
  },

  async update(id, updates) {
    const response = await apiClient.put(`/employees/${id}`, updates);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  },

  async getStatistics() {
    const response = await apiClient.get('/employees/statistics');
    return response.data;
  },

  async getSubordinates(id) {
    const response = await apiClient.get(`/employees/${id}/subordinates`);
    return response.data;
  },
};
```

### 4. Créer le nouveau leaveService.js

Créer `/src/services/apis/leaveApiService.js` :

```javascript
import apiClient from '../api-client';

export const leaveApiService = {
  // Leave Types
  async getLeaveTypes() {
    const response = await apiClient.get('/leave/types');
    return response.data;
  },

  async createLeaveType(data) {
    const response = await apiClient.post('/leave/types', data);
    return response.data;
  },

  // Leave Requests
  async getAllRequests(params = {}) {
    const response = await apiClient.get('/leave/requests', params);
    return response.data;
  },

  async getRequestById(id) {
    const response = await apiClient.get(`/leave/requests/${id}`);
    return response.data;
  },

  async createRequest(data) {
    const response = await apiClient.post('/leave/requests', data);
    return response.data;
  },

  async submitRequest(id) {
    const response = await apiClient.post(`/leave/requests/${id}/submit`);
    return response.data;
  },

  async processRequest(id, action, comments) {
    const response = await apiClient.post(`/leave/requests/${id}/process`, {
      action,
      comments,
    });
    return response.data;
  },

  // Leave Balances
  async getBalance(employeeId, year) {
    const response = await apiClient.get('/leave/balances', {
      employee_id: employeeId,
      year,
    });
    return response.data;
  },

  async initializeBalances(employeeId, year) {
    const response = await apiClient.post('/leave/balances/initialize', {
      employee_id: employeeId,
      year,
    });
    return response.data;
  },
};
```

### 5. Créer le nouveau attendanceService.js

Créer `/src/services/apis/attendanceApiService.js` :

```javascript
import apiClient from '../api-client';

export const attendanceApiService = {
  async getAll(params = {}) {
    const response = await apiClient.get('/attendance', params);
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/attendance/${id}`);
    return response.data;
  },

  async checkIn(employeeId) {
    const response = await apiClient.post('/attendance/check-in', {
      employee_id: employeeId,
    });
    return response.data;
  },

  async checkOut(employeeId) {
    const response = await apiClient.post('/attendance/check-out', {
      employee_id: employeeId,
    });
    return response.data;
  },

  async createOrUpdate(data) {
    const response = await apiClient.post('/attendance', data);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`/attendance/${id}`);
    return response.data;
  },

  async getStatistics(params = {}) {
    const response = await apiClient.get('/attendance/statistics', params);
    return response.data;
  },

  async getEmployeeSummary(employeeId, year, month) {
    const response = await apiClient.get('/attendance/summary', {
      employee_id: employeeId,
      year,
      month,
    });
    return response.data;
  },
};
```

### 6. Mettre à jour les hooks React Query

Dans `/src/hooks/useEmployees.js` :

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApiService } from '@/services/apis/employeeApiService';

export function useEmployees(params) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeApiService.getAll(params),
  });
}

export function useEmployee(id) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeApiService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: employeeApiService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => employeeApiService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: employeeApiService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
```

### 7. Mettre à jour le contexte d'authentification

Dans `/src/redux/AuthContext.js` :

```javascript
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import apiClient from '@/services/api-client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const initAuth = async () => {
      const token = apiClient.getToken();
      if (token) {
        try {
          const isValid = await authService.verifyToken();
          if (isValid) {
            const userData = await authService.getProfile();
            setUser(userData);
          } else {
            apiClient.clearToken();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          apiClient.clearToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 8. Variables d'environnement

Ajouter dans `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:3600/api
```

### 9. Supprimer Supabase

Une fois tout migré et testé :

```bash
# Supprimer les packages Supabase
npm uninstall @supabase/supabase-js @supabase/ssr

# Supprimer les fichiers Supabase
rm -rf src/lib/supabase-client.js
rm -rf supabase/

# Supprimer les anciens services
rm -rf src/services/apis/leaveService.js
rm -rf src/services/apis/employeeService.js
# etc...
```

## ✅ Checklist de migration

- [ ] Créer `api-client.js`
- [ ] Migrer `authService.js`
- [ ] Créer les nouveaux services API (employees, leave, attendance)
- [ ] Mettre à jour les hooks React Query
- [ ] Mettre à jour `AuthContext.js`
- [ ] Mettre à jour toutes les pages qui utilisent les anciens services
- [ ] Tester la connexion
- [ ] Tester les opérations CRUD
- [ ] Tester les permissions
- [ ] Supprimer Supabase
- [ ] Mettre à jour la documentation

## 🔧 Exemple de mise à jour d'une page

**Avant (avec Supabase) :**
```javascript
import { leaveService } from '@/services/apis/leaveService';

const { data, error } = await leaveService.getLeaveRequests();
```

**Après (avec API Express) :**
```javascript
import { leaveApiService } from '@/services/apis/leaveApiService';

const response = await leaveApiService.getAllRequests({ page: 1, limit: 10 });
const data = response.requests;
```

## 🚀 Ordre de migration recommandé

1. **Auth** (login/logout) - Critique
2. **Employees** - Beaucoup utilisé
3. **Leave** - Workflow complexe
4. **Attendance** - Simple
5. **Autres modules** - Selon priorité

## 💡 Conseils

- Migrer un module à la fois
- Tester chaque module avant de passer au suivant
- Garder les anciens services jusqu'à ce que tout soit migré
- Utiliser des feature flags si nécessaire pour basculer progressivement
- Vérifier les types de données (UUID vs ID, snake_case vs camelCase)

## 🐛 Débogage

Si quelque chose ne fonctionne pas :

1. Vérifier que l'API Express tourne sur le port 3600
2. Vérifier les CORS dans l'API
3. Vérifier le token JWT dans localStorage
4. Vérifier les console.log dans le navigateur
5. Vérifier les logs de l'API Express
6. Utiliser les DevTools Network pour voir les requêtes

## 📞 Support

En cas de problème, vérifier :
- Le README.md de l'API
- Les logs du serveur Express
- Les erreurs dans la console navigateur
- La structure des données retournées par l'API
