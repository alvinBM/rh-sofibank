import api from "../axios";
import qs from "qs";

export const fetchProviders = async ({ offset, limit, query }) => {
    const requestUrl = query ? `crm/suppliers/search?offset=${offset}&limit=${limit}&query=${query}` : `crm/suppliers?offset=${offset}&limit=${limit}`;

    const { data } = await api.get(requestUrl);

    if (data.status === 200) {
        return {
            suppliers: data.suppliers,
            total: data.total,
        };
    } else {
        throw new Error("Erreur du serveur: " + data.message);
    }
};

export const createProvider = async (providerData) => {
    const requestBody = {
        fullname: providerData.fullname,
        email: providerData.email,
        telephone: providerData.phone,
        address: providerData.address,
        notes: providerData.note,
        type: providerData.type,
        company_name: providerData.companyName,
        national_id_number: providerData.nationalId,
        tva_number: providerData.vatNumber,
    };

    const { data } = await api.post("/crm/suppliers", qs.stringify(requestBody));

    if (data.status !== 200) {
        throw new Error(data.message || "Une erreur s'est produite lors de la création du fournisseur");
    }

    return data;
};
