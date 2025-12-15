import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProvider, fetchProviders } from "../services/apis/providerService";

export const useGetSuppliers = ({ page, rowsPerPage, filterValue }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["suppliers", { page, rowsPerPage, filterValue }],
        queryFn: () => fetchProviders({ offset, limit: rowsPerPage, query: filterValue }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching suppliers", error);
        },
    });
};

export const useCreateSupplier = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProvider, // La fonction qui exécute la mutation
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        },
        onError: (error) => {
            console.error("Error creating provider", error);
        },
    });
};
