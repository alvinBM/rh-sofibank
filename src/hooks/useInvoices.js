import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchInvoiceById, fetchInvoices } from "../services/apis/saleService";

export const useGetInvoices = ({ page, rowsPerPage, filterValue }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["invoices", { page, rowsPerPage, filterValue }],
        queryFn: () => fetchInvoices({ offset, limit: rowsPerPage, query: filterValue }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching clients", error);
        },
    });
};

export const useGetInvoiceById = ({ invoiceId }) => {
    return useQuery({
        queryKey: ["invoice", { invoiceId }],
        queryFn: () => fetchInvoiceById(invoiceId),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching invoice by id", error);
        },
    });
};
