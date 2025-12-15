import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBranche, fetchBranches, updateBranchInfos } from "../services/apis/storeService";

export const useGetBranches = ({ page, rowsPerPage }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["branches", { page, rowsPerPage }],
        queryFn: () => fetchBranches({ offset, limit: rowsPerPage }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.log("Error fetching branches", error);
        },
    });
};

export const useCreateBranche = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBranche,
        onSuccess: () => {
            // Invalider la requête 'branches' pour forcer le rechargement des données
            queryClient.invalidateQueries({ queryKey: ["branches"] });
        },
        onError: (error) => {
            console.log("Une erreur est survenue lors de la création de la branche ****", error);
            // throw new Error("Une erreur est survenue lors de la création de la branche : ", error);
        },
    });
};

export const useUpdateBranche = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateBranchInfos,
        onSuccess: () => {
            // Invalider la requête 'branches' pour forcer le rechargement des données
            queryClient.invalidateQueries({ queryKey: ["branches"] });
        },
        onError: (error) => {
            console.log("Une erreur est survenue lors de la création de la branche ****", error);
            // throw new Error("Une erreur est survenue lors de la création de la branche : ", error);
        },
    });
};
