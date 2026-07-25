/**
 * API Client centralisé pour toutes les requêtes vers l'API Express
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Récupère le token JWT depuis le localStorage
   */
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Sauvegarde le token JWT dans le localStorage
   */
  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Supprime le token JWT du localStorage
   */
  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Prépare les headers pour la requête
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Gère les erreurs de l'API
   */
  handleError(error) {
    console.error('API Error:', error);
    
    if (error.response) {
      // Erreur HTTP avec réponse du serveur
      const { status, data } = error.response;
      
      if (status === 401) {
        // Token invalide ou expiré
        this.removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }

      throw new Error(data?.message || 'Une erreur est survenue');
    } else if (error.request) {
      // Pas de réponse du serveur
      throw new Error('Impossible de contacter le serveur');
    } else {
      // Autre erreur
      throw new Error(error.message || 'Une erreur est survenue');
    }
  }

  /**
   * Effectue une requête GET
   */
  async get(endpoint, params = {}) {
    try {
      const url = new URL(`${this.baseURL}${endpoint}`);
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok || data.status >= 400) {
        throw new Error(data.message || 'Erreur lors de la requête');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Effectue une requête POST
   */
  async post(endpoint, body = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || data.status >= 400) {
        throw new Error(data.message || 'Erreur lors de la requête');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Effectue une requête PUT
   */
  async put(endpoint, body = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || data.status >= 400) {
        throw new Error(data.message || 'Erreur lors de la requête');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Effectue une requête PATCH
   */
  async patch(endpoint, body = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || data.status >= 400) {
        throw new Error(data.message || 'Erreur lors de la requête');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Effectue une requête DELETE
   */
  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok || data.status >= 400) {
        throw new Error(data.message || 'Erreur lors de la requête');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload de fichiers (multipart/form-data)
   */
  async upload(endpoint, formData) {
    try {
      const token = this.getToken();
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.status >= 400) {
        throw new Error(data.message || 'Erreur lors de l\'upload');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

// Instance singleton
export const apiClient = new ApiClient();
export default apiClient;
