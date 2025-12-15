import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAccountPayments, fetchAccountRoles, fetchDirections, fetchServices } from "../services/apis/mainService";

export const useGetRolesByAccount = ({ page, rowsPerPage, filterValue }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["roles", { page, rowsPerPage, filterValue }],
        queryFn: () => fetchAccountRoles({ offset, limit: rowsPerPage, query: filterValue }),
        keepPreviousData: true,
    });
};

export const useGetPayments = ({ page, rowsPerPage, filterValue }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["payments", { page, rowsPerPage, filterValue }],
        queryFn: () => fetchAccountPayments({ offset, limit: rowsPerPage, query: filterValue }),
        keepPreviousData: true,
    });
};

export const useGetDirections = ({ page = 1, rowsPerPage = 100, query = "" }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["directions", { page, rowsPerPage, query }],
        queryFn: () => fetchDirections({ offset, limit: rowsPerPage, query }),
        keepPreviousData: true,
    });
};

export const useGetServices = ({ page = 1, rowsPerPage = 100, query = "", direction_id = "" }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["services", { page, rowsPerPage, query, direction_id }],
        queryFn: () => fetchServices({ offset, limit: rowsPerPage, query, direction_id }),
        keepPreviousData: true,
    });
};
