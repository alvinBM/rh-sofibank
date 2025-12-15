import api from "../axios";
import qs from "qs";

export const fetchPurchases = async ({ offset, limit, query }) => {
    const requestUrl = `/stock/purchases?offset=${offset}&limit=${limit}&query=${query}`;

    const { data } = await api.get(requestUrl);

    if (data.status === 200) {
        return {
            purchases: data.purchases,
            total: data.total,
        };
    } else {
        throw new Error("Erreur du serveur: " + data.message);
    }
};

export const fetchPurchaseById = async (id) => {
    try {
        const { data } = await api.get(`/stock/purchases/getPurchase/${id}`);
        return data;
    } catch (error) {
        throw error;
    }
};
