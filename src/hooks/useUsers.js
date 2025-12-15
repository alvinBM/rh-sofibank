import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUsersByAccount } from "../services/apis/userService";

export const useGetUsersByAccount = ({ page, rowsPerPage, filterValue }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["users", { page, rowsPerPage, filterValue }],
        queryFn: () => fetchUsersByAccount({ offset, limit: rowsPerPage, query: filterValue }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching users", error);
        },
    });
};
