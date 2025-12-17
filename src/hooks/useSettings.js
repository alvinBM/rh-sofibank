import { useMutation, useQuery } from "@tanstack/react-query";
import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    fetchPermissions,
    fetchDirections,
    createDirection,
    updateDirection,
    deleteDirection,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    fetchServices,
    createService,
    updateService,
    deleteService,
    fetchGrades,
    createGrade,
    updateGrade,
    deleteGrade,
    fetchJobPositions,
    createJobPosition,
    updateJobPosition,
    deleteJobPosition,
    fetchHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
    fetchBiometricTerminals,
    createBiometricTerminal,
    updateBiometricTerminal,
    deleteBiometricTerminal,
    testBiometricConnection,
    fetchSystemParameters,
    updateSystemParameter,
    createSystemParameter,
    deleteSystemParameter,
} from "../services/apis/settingsApiService";
import queryClient from "../lib/react-query-client";

// ==================== USERS HOOKS ====================

export const useGetUsers = ({ page = 1, rowsPerPage = 10, query = "" } = {}) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["settings-users", { page, rowsPerPage, query }],
        queryFn: () => fetchUsers({ offset, limit: rowsPerPage, query }),
        keepPreviousData: true,
    });
};

export const useCreateUser = () => {
    return useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings-users"] });
        },
    });
};

export const useUpdateUser = () => {
    return useMutation({
        mutationFn: ({ userId, userData }) => updateUser(userId, userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings-users"] });
        },
    });
};

export const useDeleteUser = () => {
    return useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings-users"] });
        },
    });
};

export const useToggleUserStatus = () => {
    return useMutation({
        mutationFn: ({ userId, isActive }) => toggleUserStatus(userId, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings-users"] });
        },
    });
};

// ==================== ROLES & PERMISSIONS HOOKS ====================

export const useGetRoles = ({ page = 1, rowsPerPage = 100, query = "" } = {}) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["settings-roles", { page, rowsPerPage, query }],
        queryFn: () => fetchRoles({ offset, limit: rowsPerPage, query }),
        keepPreviousData: true,
    });
};

export const useCreateRole = () => {
    return useMutation({
        mutationFn: createRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings-roles"] });
        },
    });
};

export const useUpdateRole = () => {
    return useMutation({
        mutationFn: ({ roleId, roleData }) => updateRole(roleId, roleData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings-roles"] });
        },
    });
};

export const useDeleteRole = () => {
    return useMutation({
        mutationFn: deleteRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings-roles"] });
        },
    });
};

export const useGetPermissions = () => {
    return useQuery({
        queryKey: ["settings-permissions"],
        queryFn: fetchPermissions,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// ==================== DIRECTIONS HOOKS ====================

export const useGetDirections = () => {
    return useQuery({
        queryKey: ["directions"],
        queryFn: fetchDirections,
    });
};

export const useCreateDirection = () => {
    return useMutation({
        mutationFn: createDirection,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["directions"] });
        },
    });
};

export const useUpdateDirection = () => {
    return useMutation({
        mutationFn: ({ directionId, directionData }) => updateDirection(directionId, directionData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["directions"] });
        },
    });
};

export const useDeleteDirection = () => {
    return useMutation({
        mutationFn: deleteDirection,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["directions"] });
        },
    });
};

// ==================== DEPARTMENTS HOOKS ====================

export const useGetDepartments = () => {
    return useQuery({
        queryKey: ["departments"],
        queryFn: fetchDepartments,
    });
};

export const useCreateDepartment = () => {
    return useMutation({
        mutationFn: createDepartment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
        },
    });
};

export const useUpdateDepartment = () => {
    return useMutation({
        mutationFn: ({ departmentId, departmentData }) => updateDepartment(departmentId, departmentData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
        },
    });
};

export const useDeleteDepartment = () => {
    return useMutation({
        mutationFn: deleteDepartment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
        },
    });
};

// ==================== SERVICES HOOKS ====================

export const useGetServices = (directionId = null) => {
    return useQuery({
        queryKey: ["services", directionId],
        queryFn: () => fetchServices(directionId),
    });
};

export const useCreateService = () => {
    return useMutation({
        mutationFn: createService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });
        },
    });
};

export const useUpdateService = () => {
    return useMutation({
        mutationFn: ({ serviceId, serviceData }) => updateService(serviceId, serviceData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });
        },
    });
};

export const useDeleteService = () => {
    return useMutation({
        mutationFn: deleteService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });
        },
    });
};

// ==================== GRADES HOOKS ====================

export const useGetGrades = () => {
    return useQuery({
        queryKey: ["grades"],
        queryFn: fetchGrades,
    });
};

export const useCreateGrade = () => {
    return useMutation({
        mutationFn: createGrade,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["grades"] });
        },
    });
};

export const useUpdateGrade = () => {
    return useMutation({
        mutationFn: ({ gradeId, gradeData }) => updateGrade(gradeId, gradeData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["grades"] });
        },
    });
};

export const useDeleteGrade = () => {
    return useMutation({
        mutationFn: deleteGrade,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["grades"] });
        },
    });
};

// ==================== JOB POSITIONS HOOKS ====================

export const useGetJobPositions = () => {
    return useQuery({
        queryKey: ["job_positions"],
        queryFn: fetchJobPositions,
    });
};

export const useCreateJobPosition = () => {
    return useMutation({
        mutationFn: createJobPosition,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["job_positions"] });
        },
    });
};

export const useUpdateJobPosition = () => {
    return useMutation({
        mutationFn: ({ positionId, positionData }) => updateJobPosition(positionId, positionData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["job_positions"] });
        },
    });
};

export const useDeleteJobPosition = () => {
    return useMutation({
        mutationFn: deleteJobPosition,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["job_positions"] });
        },
    });
};

// ==================== HOLIDAYS HOOKS ====================

export const useGetHolidays = ({ page = 1, rowsPerPage = 100, query = "", year = null } = {}) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["holidays", { page, rowsPerPage, query, year }],
        queryFn: () => fetchHolidays({ offset, limit: rowsPerPage, query, year }),
        keepPreviousData: true,
    });
};

export const useCreateHoliday = () => {
    return useMutation({
        mutationFn: createHoliday,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["holidays"] });
        },
    });
};

export const useUpdateHoliday = () => {
    return useMutation({
        mutationFn: ({ holidayId, holidayData }) => updateHoliday(holidayId, holidayData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["holidays"] });
        },
    });
};

export const useDeleteHoliday = () => {
    return useMutation({
        mutationFn: deleteHoliday,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["holidays"] });
        },
    });
};

// ==================== BIOMETRIC TERMINALS HOOKS ====================

export const useGetBiometricTerminals = ({ page = 1, rowsPerPage = 100, query = "" } = {}) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["biometric-terminals", { page, rowsPerPage, query }],
        queryFn: () => fetchBiometricTerminals({ offset, limit: rowsPerPage, query }),
        keepPreviousData: true,
    });
};

export const useCreateBiometricTerminal = () => {
    return useMutation({
        mutationFn: createBiometricTerminal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["biometric-terminals"] });
        },
    });
};

export const useUpdateBiometricTerminal = () => {
    return useMutation({
        mutationFn: ({ terminalId, terminalData }) => updateBiometricTerminal(terminalId, terminalData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["biometric-terminals"] });
        },
    });
};

export const useDeleteBiometricTerminal = () => {
    return useMutation({
        mutationFn: deleteBiometricTerminal,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["biometric-terminals"] });
        },
    });
};

export const useTestBiometricConnection = () => {
    return useMutation({
        mutationFn: testBiometricConnection,
    });
};

// ==================== SYSTEM PARAMETERS HOOKS ====================

export const useGetSystemParameters = ({ page = 1, rowsPerPage = 100, query = "" } = {}) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["system-parameters", { page, rowsPerPage, query }],
        queryFn: () => fetchSystemParameters({ offset, limit: rowsPerPage, query }),
        keepPreviousData: true,
    });
};

export const useUpdateSystemParameter = () => {
    return useMutation({
        mutationFn: ({ parameterId, parameterData }) => updateSystemParameter(parameterId, parameterData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["system-parameters"] });
        },
    });
};

export const useCreateSystemParameter = () => {
    return useMutation({
        mutationFn: createSystemParameter,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["system-parameters"] });
        },
    });
};

export const useDeleteSystemParameter = () => {
    return useMutation({
        mutationFn: deleteSystemParameter,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["system-parameters"] });
        },
    });
};
