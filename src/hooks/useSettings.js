import { useMutation, useQuery } from "@tanstack/react-query";
import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    createDirection,
    updateDirection,
    deleteDirection,
    createService,
    updateService,
    deleteService,
    createGrade,
    updateGrade,
    deleteGrade,
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
} from "../services/apis/settingsService";
import queryClient from "../lib/react-query-client";

// Users Hooks
export const useGetUsers = ({ page = 1, rowsPerPage = 10, query = "" }) => {
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

// Directions Hooks
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

// Services Hooks
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

// Grades Hooks
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

// Job Positions Hooks
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

// Holidays Hooks
export const useGetHolidays = ({ page = 1, rowsPerPage = 100, query = "", year = null }) => {
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

// Biometric Terminals Hooks
export const useGetBiometricTerminals = ({ page = 1, rowsPerPage = 100, query = "" }) => {
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

// System Parameters Hooks
export const useGetSystemParameters = ({ page = 1, rowsPerPage = 100, query = "" }) => {
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
