import { useMutation, useQuery } from "@tanstack/react-query";
import { createAccountingAccount, fetchAccountingAccounts, fetchAccountingSubAccounts, getAccountingAccountById } from "../services/apis/accounting/accountService";
import queryClient from "../lib/react-query-client";

export const useGetAccountingAccounts = ({ page, rowsPerPage, query }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["accounting_accounts", { page, rowsPerPage, query }],
        queryFn: () => fetchAccountingAccounts({ offset, limit: rowsPerPage, query }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching journal", error);
        },
    });
};

export const useGetAccountingSubAccounts = ({ parent_code, page, rowsPerPage, query }) => {
    const offset = (page - 1) * rowsPerPage;
    return useQuery({
        queryKey: ["accounting_subaccounts", { parent_code, page, rowsPerPage, query }],
        queryFn: () => fetchAccountingSubAccounts({ parent_code, offset, limit: rowsPerPage, query }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching journal", error);
        },
    });
};

export const useCreateAccountingAccount = () => {
    return useMutation({
        mutationFn: createAccountingAccount,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounting_accounts"] });
        },
        onError: (error) => {
            console.error("Error creating account", error);
        },
    });
};

export const useGetAccountAccountById = ({ id }) => {
    return useQuery({
        queryKey: ["accounting_account", { id }],
        queryFn: () => getAccountingAccountById(id),
        keepPreviousData: true,
        onError: (error) => {
            console.error("Error fetching account by id", error);
        },
    });
};
