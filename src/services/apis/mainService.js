import { supabase } from "../../lib/supabase-client";

export const fetchAccountRoles = async ({ offset, limit, query }) => {
    try {
        let queryBuilder = supabase
            .from('roles')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('name', { ascending: true });

        if (query) {
            queryBuilder = queryBuilder.or(`name.ilike.%${query}%,code.ilike.%${query}%`);
        }

        const { data, error, count } = await queryBuilder;

        if (error) throw error;

        return {
            roles: data || [],
            total: count || 0,
        };
    } catch (error) {
        console.error('Fetch roles error:', error);
        throw error;
    }
};

export const fetchAccountPayments = async ({ offset, limit, query }) => {
    try {
        let queryBuilder = supabase
            .from('payments')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

        const { data, error, count } = await queryBuilder;

        if (error) throw error;

        return {
            payments: data || [],
            total: count || 0,
        };
    } catch (error) {
        console.error('Fetch payments error:', error);
        throw error;
    }
};

export const fetchDirections = async ({ offset = 0, limit = 100, query = "" }) => {
    try {
        let queryBuilder = supabase
            .from('directions')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('name', { ascending: true });

        if (query) {
            queryBuilder = queryBuilder.ilike('name', `%${query}%`);
        }

        const { data, error, count } = await queryBuilder;

        if (error) throw error;

        return {
            directions: data || [],
            total: count || 0,
        };
    } catch (error) {
        console.error('Fetch directions error:', error);
        throw error;
    }
};

export const fetchServices = async ({ offset = 0, limit = 100, query = "", direction_id = "" }) => {
    try {
        let queryBuilder = supabase
            .from('services')
            .select('*, direction:directions(id, name)', { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('name', { ascending: true });

        if (query) {
            queryBuilder = queryBuilder.ilike('name', `%${query}%`);
        }

        if (direction_id) {
            queryBuilder = queryBuilder.eq('direction_id', direction_id);
        }

        const { data, error, count } = await queryBuilder;

        if (error) throw error;

        return {
            services: data || [],
            total: count || 0,
        };
    } catch (error) {
        console.error('Fetch services error:', error);
        throw error;
    }
};

export const fetchGrades = async ({ offset = 0, limit = 100, query = "" }) => {
    try {
        let queryBuilder = supabase
            .from('grades')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('level', { ascending: true });

        if (query) {
            queryBuilder = queryBuilder.or(`name.ilike.%${query}%,code.ilike.%${query}%`);
        }

        const { data, error, count } = await queryBuilder;

        if (error) throw error;

        return {
            grades: data || [],
            total: count || 0,
        };
    } catch (error) {
        console.error('Fetch grades error:', error);
        throw error;
    }
};

export const fetchJobPositions = async ({ offset = 0, limit = 100, query = "" }) => {
    try {
        let queryBuilder = supabase
            .from('job_positions')
            .select('*, grade:grades(id, name, code)', { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('title', { ascending: true });

        if (query) {
            queryBuilder = queryBuilder.or(`title.ilike.%${query}%,code.ilike.%${query}%`);
        }

        const { data, error, count } = await queryBuilder;

        if (error) throw error;

        return {
            job_positions: data || [],
            total: count || 0,
        };
    } catch (error) {
        console.error('Fetch job positions error:', error);
        throw error;
    }
};
