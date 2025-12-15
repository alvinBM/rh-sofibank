import api from "../../axios";
import qs from "qs";

export const fetchAccountingAccounts = async ({ offset, limit, query }) => {
    const requestUrl = `/accounting/accounts?offset=${offset}&limit=${limit}&query=${query || ""}`;

    const { data } = await api.get(requestUrl);

    if (data.status === 200) {
        return {
            accounts: data.accounts || [],
            total: data.total || 0,
        };
    } else {
        throw new Error("Erreur du serveur: " + data.message);
    }
};

export const fetchAccountingSubAccounts = async ({ parent_code, offset, limit, query }) => {
    const requestUrl = `/accounting/accounts/subaccounts?parent_code=${parent_code}&offset=${offset}&limit=${limit}&query=${query || ""}`;

    const { data } = await api.get(requestUrl);

    if (data.status === 200) {
        return {
            accounts: data.accounts || [],
            total: data.total || 0,
        };
    } else {
        throw new Error("Erreur du serveur: " + data.message);
    }
};

export const createAccountingAccount = async (accountData) => {
    try {
        const { data } = await api.post("/accounting/accounts", accountData);
        return data;
    } catch (error) {
        throw error;
    }
};

export const getAccountingAccountById = async (id) => {
    try {
        const { data } = await api.get(`/accounting/accounts/${id}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const updateAccountingAccount = async (id, accountData) => {
    try {
        const { data } = await api.put(`/accounting/accounts/${id}`, accountData);
        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteAccountingAccount = async (id) => {
    try {
        const { data } = await api.delete(`/accounting/accounts/${id}`);
        return data;
    } catch (error) {
        throw error;
    }
};
