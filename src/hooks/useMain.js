import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAccountPayments, fetchAccountRoles } from "../services/apis/mainService";

export const useGetRolesByAccount = ({ page, rowsPerPage, filterValue }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["roles", { page, rowsPerPage, filterValue }],
        queryFn: () => fetchAccountRoles({ offset, limit: rowsPerPage, query: filterValue }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching users", error);
        },
    });
};

export const useGetPayments = ({ page, rowsPerPage, filterValue }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["payments", { page, rowsPerPage, filterValue }],
        queryFn: () => fetchAccountPayments({ offset, limit: rowsPerPage, query: filterValue }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching payments", error);
        },
    });
};
