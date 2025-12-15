import api from "../axios";
import qs from "qs";

export const fetchInvoices = async ({ offset, limit, query }) => {
    const requestUrl = `/sales/invoices?offset=${offset}&limit=${limit}&query=${query}`;

    const { data } = await api.get(requestUrl);

    if (data.status === 200) {
        return {
            invoices: data.invoices,
            total: data.total,
        };
    } else {
        throw new Error("Erreur du serveur: " + data.message);
    }
};

export const fetchInvoiceById = async (id) => {
    try {
        const { data } = await api.get(`/sales/getInvoice/${id}`);
        return data;
    } catch (error) {
        throw error;
    }
};
