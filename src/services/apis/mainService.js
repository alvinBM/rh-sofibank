import apiClient from "../api-client";

/**
 * Récupère la liste des rôles du compte
 */
export const fetchAccountRoles = async ({ offset = 0, limit = 100, query = "" }) => {
    try {
        // TODO: Créer l'endpoint /settings/roles dans le backend
        // Pour l'instant, retourner un tableau vide
        console.warn('fetchAccountRoles: Endpoint /settings/roles non encore implémenté');
        return {
            roles: [],
            total: 0,
        };
    } catch (error) {
        console.error('Fetch roles error:', error);
        throw error;
    }
};

/**
 * Récupère la liste des paiements du compte
 */
export const fetchAccountPayments = async ({ offset = 0, limit = 100, query = "" }) => {
    try {
        // TODO: Créer l'endpoint /settings/payments dans le backend
        // Pour l'instant, retourner un tableau vide
        console.warn('fetchAccountPayments: Endpoint /settings/payments non encore implémenté');
        return {
            payments: [],
            total: 0,
        };
    } catch (error) {
        console.error('Fetch payments error:', error);
        throw error;
    }
};

/**
 * Récupère la liste des directions
 */
export const fetchDirections = async ({ offset = 0, limit = 100, query = "" }) => {
    try {
        const params = new URLSearchParams();
        if (query) params.append('search', query);
        params.append('offset', offset);
        params.append('limit', limit);

        const response = await apiClient.get(`/settings/directions?${params.toString()}`);

        if (response.status !== 200) {
            throw new Error(response.message || 'Erreur lors de la récupération des directions');
        }

        return {
            directions: response.data || [],
            total: response.data?.length || 0,
        };
    } catch (error) {
        console.error('Fetch directions error:', error);
        throw error;
    }
};

/**
 * Récupère la liste des services
 */
export const fetchServices = async ({ offset = 0, limit = 100, query = "", direction_id = "" }) => {
    try {
        const params = new URLSearchParams();
        if (query) params.append('search', query);
        if (direction_id) params.append('direction_id', direction_id);
        params.append('offset', offset);
        params.append('limit', limit);

        const response = await apiClient.get(`/settings/services?${params.toString()}`);

        if (response.status !== 200) {
            throw new Error(response.message || 'Erreur lors de la récupération des services');
        }

        return {
            services: response.data || [],
            total: response.data?.length || 0,
        };
    } catch (error) {
        console.error('Fetch services error:', error);
        throw error;
    }
};

/**
 * Récupère la liste des grades
 */
export const fetchGrades = async ({ offset = 0, limit = 100, query = "" }) => {
    try {
        const params = new URLSearchParams();
        if (query) params.append('search', query);
        params.append('offset', offset);
        params.append('limit', limit);

        const response = await apiClient.get(`/settings/grades?${params.toString()}`);

        if (response.status !== 200) {
            throw new Error(response.message || 'Erreur lors de la récupération des grades');
        }

        return {
            grades: response.data || [],
            total: response.data?.length || 0,
        };
    } catch (error) {
        console.error('Fetch grades error:', error);
        throw error;
    }
};

/**
 * Récupère la liste des postes
 */
export const fetchJobPositions = async ({ offset = 0, limit = 100, query = "" }) => {
    try {
        const params = new URLSearchParams();
        if (query) params.append('search', query);
        params.append('offset', offset);
        params.append('limit', limit);

        const response = await apiClient.get(`/settings/job-positions?${params.toString()}`);

        if (response.status !== 200) {
            throw new Error(response.message || 'Erreur lors de la récupération des postes');
        }

        return {
            job_positions: response.data || [],
            total: response.data?.length || 0,
        };
    } catch (error) {
        console.error('Fetch job positions error:', error);
        throw error;
    }
};
