import api from "../axios";
import qs from "qs";

export const fetchUsersByAccount = async ({ offset, limit, query }) => {
    const requestUrl = query ? `user/searchUsersByAccount?offset=${offset}&limit=${limit}&query=${query}` : `user/getUsersByAccount?offset=${offset}&limit=${limit}`;

    const { data } = await api.get(requestUrl);

    if (data.status === 200) {
        return {
            users: data.users,
            total: data.total,
        };
    } else {
        throw new Error("Erreur du serveur: " + data.message);
    }
};

export const fetchUserById = async (userId) => {
    const { data } = await api.get(`user/getUserById?userId=${userId}`);

    if (data.status === 200) {
        return data.user;
    } else {
        throw new Error("Erreur du serveur: " + data.message);
    }
};

