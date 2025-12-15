import api from "../axios";
import qs from "qs";

export const fetchAccountRoles = async ({ offset, limit, query }) => {
    const requestUrl = query ? `main/roles/search?offset=${offset}&limit=${limit}&query=${query}` : `main/roles?offset=${offset}&limit=${limit}`;

    const { data } = await api.get(requestUrl);

    if (data.status === 200) {
        return {
            roles: data.roles,
            total: data.total,
        };
    } else {
        throw new Error("Erreur du serveur: " + data.message);
    }
};

export const fetchAccountPayments = async ({ offset, limit, query }) => {
    const requestUrl = `payments?offset=${offset}&limit=${limit}`;

    const { data } = await api.get(requestUrl);

    if (data.status === 200) {
        return {
            payments: data.payments,
            total: data.total,
        };
    } else {
        throw new Error("Erreur du serveur: " + data.message);
    }
};
