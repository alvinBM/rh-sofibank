import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient, fetchClients } from "../services/apis/clientService";

export const useClients = ({ page, rowsPerPage, filterValue, type, debt }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["clients", { page, rowsPerPage, filterValue, type, debt }],
        queryFn: () => fetchClients({ offset, limit: rowsPerPage, query: filterValue, type, debt }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching clients", error);
        },
    });
};

export const useCreateClient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createClient, // La fonction qui exécute la mutation
        onSuccess: () => {
            // Invalider la requête 'clients' pour forcer le rechargement des données
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
        onError: (error) => {
            console.error("Error creating client", error);
        },
    });
};
