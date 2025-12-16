import { supabase } from "../../lib/supabase-client";

// Users Management
export const fetchUsers = async ({ offset = 0, limit = 10, query = "" }) => {
    try {
        let queryBuilder = supabase
            .from('users')
            .select(`
                *,
                roles:user_roles(
                    id,
                    role_id,
                    assigned_at,
                    role:roles(*)
                )
            `, { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

        if (query) {
            queryBuilder = queryBuilder.or(`firstname.ilike.%${query}%,lastname.ilike.%${query}%,email.ilike.%${query}%`);
        }

        const { data, error, count } = await queryBuilder;

        if (error) throw error;

        // Ajouter full_name pour la compatibilité avec le frontend
        const usersWithFullName = (data || []).map(user => ({
            ...user,
            full_name: `${user.firstname} ${user.lastname}`
        }));

        return {
            users: usersWithFullName,
            total: count || 0,
        };
    } catch (error) {
        console.error('Fetch users error:', error);
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        // Séparer full_name en firstname et lastname si fourni
        const { full_name, ...rest } = userData;
        let dataToInsert = rest;

        if (full_name) {
            const names = full_name.trim().split(' ');
            const firstname = names[0] || '';
            const lastname = names.slice(1).join(' ') || '';
            dataToInsert = { ...rest, firstname, lastname };
        }

        const { data, error } = await supabase
            .from('users')
            .insert(dataToInsert)
            .select()
            .single();

        if (error) throw error;

        // Ajouter full_name pour la compatibilité
        return {
            ...data,
            full_name: `${data.firstname} ${data.lastname}`
        };
    } catch (error) {
        console.error('Create user error:', error);
        throw error;
    }
};

export const updateUser = async (userId, userData) => {
    try {
        // Séparer full_name en firstname et lastname si fourni
        const { full_name, ...rest } = userData;
        let dataToUpdate = rest;

        if (full_name) {
            const names = full_name.trim().split(' ');
            const firstname = names[0] || '';
            const lastname = names.slice(1).join(' ') || '';
            dataToUpdate = { ...rest, firstname, lastname };
        }

        const { data, error } = await supabase
            .from('users')
            .update(dataToUpdate)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        // Ajouter full_name pour la compatibilité
        return {
            ...data,
            full_name: `${data.firstname} ${data.lastname}`
        };
    } catch (error) {
        console.error('Update user error:', error);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Delete user error:', error);
        throw error;
    }
};

export const toggleUserStatus = async (userId, isActive) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({ is_active: isActive })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Toggle user status error:', error);
        throw error;
    }
};

// Directions Management
export const createDirection = async (directionData) => {
    try {
        const { data, error } = await supabase
            .from('directions')
            .insert(directionData)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Create direction error:', error);
        throw error;
    }
};

export const updateDirection = async (directionId, directionData) => {
    try {
        const { data, error } = await supabase
            .from('directions')
            .update(directionData)
            .eq('id', directionId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Update direction error:', error);
        throw error;
    }
};

export const deleteDirection = async (directionId) => {
    try {
        const { error } = await supabase
            .from('directions')
            .delete()
            .eq('id', directionId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Delete direction error:', error);
        throw error;
    }
};

// Services Management
export const createService = async (serviceData) => {
    try {
        const { data, error } = await supabase
            .from('services')
            .insert(serviceData)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Create service error:', error);
        throw error;
    }
};

export const updateService = async (serviceId, serviceData) => {
    try {
        const { data, error } = await supabase
            .from('services')
            .update(serviceData)
            .eq('id', serviceId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Update service error:', error);
        throw error;
    }
};

export const deleteService = async (serviceId) => {
    try {
        const { error } = await supabase
            .from('services')
            .delete()
            .eq('id', serviceId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Delete service error:', error);
        throw error;
    }
};

// Grades Management
export const createGrade = async (gradeData) => {
    try {
        const { data, error } = await supabase
            .from('grades')
            .insert(gradeData)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Create grade error:', error);
        throw error;
    }
};

export const updateGrade = async (gradeId, gradeData) => {
    try {
        const { data, error } = await supabase
            .from('grades')
            .update(gradeData)
            .eq('id', gradeId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Update grade error:', error);
        throw error;
    }
};

export const deleteGrade = async (gradeId) => {
    try {
        const { error } = await supabase
            .from('grades')
            .delete()
            .eq('id', gradeId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Delete grade error:', error);
        throw error;
    }
};

// Job Positions Management
export const createJobPosition = async (positionData) => {
    try {
        const { data, error } = await supabase
            .from('job_positions')
            .insert(positionData)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Create job position error:', error);
        throw error;
    }
};

export const updateJobPosition = async (positionId, positionData) => {
    try {
        const { data, error } = await supabase
            .from('job_positions')
            .update(positionData)
            .eq('id', positionId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Update job position error:', error);
        throw error;
    }
};

export const deleteJobPosition = async (positionId) => {
    try {
        const { error } = await supabase
            .from('job_positions')
            .delete()
            .eq('id', positionId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Delete job position error:', error);
        throw error;
    }
};

// Holidays Management
export const fetchHolidays = async ({ offset = 0, limit = 100, query = "", year = null }) => {
    try {
        let queryBuilder = supabase
            .from('holidays')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('date', { ascending: true });

        if (query) {
            queryBuilder = queryBuilder.ilike('name', `%${query}%`);
        }

        if (year) {
            queryBuilder = queryBuilder.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
        }

        const { data, error, count } = await queryBuilder;

        if (error) throw error;

        return {
            holidays: data || [],
            total: count || 0,
        };
    } catch (error) {
        console.error('Fetch holidays error:', error);
        throw error;
    }
};

export const createHoliday = async (holidayData) => {
    try {
        const { data, error } = await supabase
            .from('holidays')
            .insert(holidayData)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Create holiday error:', error);
        throw error;
    }
};

export const updateHoliday = async (holidayId, holidayData) => {
    try {
        const { data, error } = await supabase
            .from('holidays')
            .update(holidayData)
            .eq('id', holidayId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Update holiday error:', error);
        throw error;
    }
};

export const deleteHoliday = async (holidayId) => {
    try {
        const { error } = await supabase
            .from('holidays')
            .delete()
            .eq('id', holidayId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Delete holiday error:', error);
        throw error;
    }
};

// Biometric Terminals Management
export const fetchBiometricTerminals = async ({ offset = 0, limit = 100, query = "" }) => {
    try {
        let queryBuilder = supabase
            .from('biometric_terminals')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('name', { ascending: true });

        if (query) {
            queryBuilder = queryBuilder.or(`name.ilike.%${query}%,ip_address.ilike.%${query}%`);
        }

        const { data, error, count } = await queryBuilder;

        if (error) throw error;

        return {
            terminals: data || [],
            total: count || 0,
        };
    } catch (error) {
        console.error('Fetch biometric terminals error:', error);
        throw error;
    }
};

export const createBiometricTerminal = async (terminalData) => {
    try {
        const { data, error } = await supabase
            .from('biometric_terminals')
            .insert(terminalData)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Create biometric terminal error:', error);
        throw error;
    }
};

export const updateBiometricTerminal = async (terminalId, terminalData) => {
    try {
        const { data, error } = await supabase
            .from('biometric_terminals')
            .update(terminalData)
            .eq('id', terminalId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Update biometric terminal error:', error);
        throw error;
    }
};

export const deleteBiometricTerminal = async (terminalId) => {
    try {
        const { error } = await supabase
            .from('biometric_terminals')
            .delete()
            .eq('id', terminalId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Delete biometric terminal error:', error);
        throw error;
    }
};

export const testBiometricConnection = async (terminalId) => {
    // This would typically call an API endpoint to test the connection
    // For now, we'll return a mock response
    try {
        // TODO: Implement actual connection test
        return {
            success: true,
            message: "Connection successful",
            latency: Math.random() * 100,
        };
    } catch (error) {
        console.error('Test biometric connection error:', error);
        throw error;
    }
};

// System Parameters Management
export const fetchSystemParameters = async ({ offset = 0, limit = 100, query = "" }) => {
    try {
        let queryBuilder = supabase
            .from('system_parameters')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1)
            .order('category', { ascending: true });

        if (query) {
            queryBuilder = queryBuilder.or(`key.ilike.%${query}%,description.ilike.%${query}%`);
        }

        const { data, error, count } = await queryBuilder;

        if (error) throw error;

        return {
            parameters: data || [],
            total: count || 0,
        };
    } catch (error) {
        console.error('Fetch system parameters error:', error);
        throw error;
    }
};

export const updateSystemParameter = async (parameterId, parameterData) => {
    try {
        const { data, error } = await supabase
            .from('system_parameters')
            .update(parameterData)
            .eq('id', parameterId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Update system parameter error:', error);
        throw error;
    }
};

export const createSystemParameter = async (parameterData) => {
    try {
        const { data, error } = await supabase
            .from('system_parameters')
            .insert(parameterData)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Create system parameter error:', error);
        throw error;
    }
};

export const deleteSystemParameter = async (parameterId) => {
    try {
        const { error } = await supabase
            .from('system_parameters')
            .delete()
            .eq('id', parameterId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Delete system parameter error:', error);
        throw error;
    }
};
