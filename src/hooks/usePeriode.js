import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPeriode, createPeriode, updatePeriode, deletePeriode } from "@/src/services/apis/accounting/periodeService";

// Récupérer les périodes avec pagination et filtre
export const usePeriode = ({ page, rowsPerPage, filterValue }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["periode", { page, rowsPerPage, filterValue }],
        queryFn: () => fetchPeriode({ offset, limit: rowsPerPage, query: filterValue }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching periods", error); // Message d'erreur corrigé
        },
    });
};

// Créer une nouvelle période
export const useCreatePeriode = () => {
    const queryPeriode = useQueryClient(); // Corrigé de useQueryperiode à useQuery

    return useMutation({
        mutationFn: createPeriode, // La fonction qui exécute la mutation
        onSuccess: () => {
            queryPeriode.invalidateQueries({ queryKey: ["periode"] }); // Invalider la requête 'periode' pour forcer le rechargement des données
        },
        onError: (error) => {
            console.error("Error creating period", error); // Message d'erreur corrigé
        },
    });
};

// Mettre à jour une période
export const useUpdatePeriode = () => {
    const queryPeriode = useQueryClient(); // Corrigé de useQueryperiode à useQuery

    return useMutation({
        mutationFn: updatePeriode, // La fonction qui exécute la mutation
        onSuccess: () => {
            queryPeriode.invalidateQueries({ queryKey: ["periode"] }); // Invalider la requête 'periode' pour forcer le rechargement des données
        },
        onError: (error) => {
            console.error("Error updating period", error); // Message d'erreur corrigé
        },
    });
};

// Supprimer une période
export const useDeletePeriode = () => {
    const queryPeriode = useQueryClient(); // Corrigé de useQueryperiode à useQuery

    return useMutation({
        mutationFn: deletePeriode, // La fonction qui exécute la mutation
        onSuccess: () => {
            queryPeriode.invalidateQueries({ queryKey: ["periode"] }); // Invalider la requête 'periode' pour forcer le rechargement des données
        },
        onError: (error) => {
            console.error("Error deleting period", error); // Message d'erreur corrigé
        },
    });
};
