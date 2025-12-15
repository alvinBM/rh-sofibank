import { useMutation, useQuery } from "@tanstack/react-query";
import { createExpense, createExpenseCategory, getExpenses, getExpensesCategories } from "../services/apis/financeService";
import queryClient from "../lib/react-query-client";

export const useGetExpensesCategories = ({ page, rowsPerPage, query = "" }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["expenses_categories", { page, rowsPerPage }],
        queryFn: () => getExpensesCategories({ offset, limit: rowsPerPage, query }),
        keepPreviousData: true,
        onError: (error) => {
            console.error("Error fetching clients", error);
        },
    });
};

export const useGetExpenses = ({ page, rowsPerPage, category_id, expense_status, query, date_start, date_end }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["expenses", { page, rowsPerPage }],
        queryFn: () => getExpenses({ offset, limit: rowsPerPage, category_id, expense_status, query, date_start, date_end }),
        keepPreviousData: true,
        onError: (error) => {
            console.error("Error fetching clients", error);
        },
    });
};

export const useCreateFinanceExpense = () => {
    return useMutation({
        mutationFn: createExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
        onError: (error) => {
            console.error("Error creating account", error);
        },
    });
};

export const useCreateFinanceExpenseCategory = () => {
    return useMutation({
        mutationFn: createExpenseCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses_categories"] });
        },
        onError: (error) => {
            console.error("Error creating account", error);
        },
    });
};
