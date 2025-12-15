import { useMutation, useQuery } from "@tanstack/react-query";
import { createAccountingOperation, fetchAccountingJournal, fetchAccountingPeriods } from "../services/apis/accounting/journalService";
import queryClient from "../lib/react-query-client";

export const useGetJournal = ({ page, rowsPerPage, startDate = null, endDate = null, period_id = null, compte_id = null, filterValue = null }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["accounting_journal", { page, rowsPerPage, startDate, endDate, period_id, compte_id, filterValue }],
        queryFn: () => fetchAccountingJournal({ offset, limit: rowsPerPage, startDate, endDate, period_id, compte_id, filterValue }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching journal", error);
        },
    });
};

export const useGetAccountingPeriods = ({ page, rowsPerPage }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["accounting_periods", { page, rowsPerPage }],
        queryFn: () => fetchAccountingPeriods({ offset, limit: rowsPerPage }),
        keepPreviousData: true,
        onError: (error) => {
            console.error("Error fetching accounting periods", error);
        },
    });
};

export const useCreateAccountingOperation = () => {
    return useMutation({
        mutationFn: createAccountingOperation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounting_journal"] });
        },
        onError: (error) => {
            console.error("Error creating operation", error);
        },
    });
};
