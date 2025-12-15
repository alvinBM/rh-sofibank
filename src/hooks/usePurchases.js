import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPurchaseById, fetchPurchases } from "../services/apis/purchaseService";

export const useGetPurchases = ({ page, rowsPerPage, filterValue }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["purchases", { page, rowsPerPage, filterValue }],
        queryFn: () => fetchPurchases({ offset, limit: rowsPerPage, query: filterValue }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching clients", error);
        },
    });
};

export const useGetPurchaseById = ({ purchaseId }) => {
    return useQuery({
        queryKey: ["purchase", { purchaseId }],
        queryFn: () => fetchPurchaseById(purchaseId),
        keepPreviousData: true,
        onError: (error) => {
            console.error("Error fetching purchase by id", error);
        },
    });
};
