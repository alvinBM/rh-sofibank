import api from "../axios";
import qs from "qs";

export const fetchClients = async ({ offset, limit, query, type, debt }) => {
    let requestUrl = query ? `crm/clients?offset=${offset}&limit=${limit}&query=${query}` : `crm/clients?offset=${offset}&limit=${limit}`;

    if (type && type != "") {
        requestUrl += "&type=" + type;
    }

    if (debt && debt != "") {
        requestUrl += "&debt=" + debt;
    }

    const { data } = await api.get(requestUrl);

    if (data.status === 200) {
        return {
            clients: data.clients,
            total: data.total,
            clientTypes: data.clientTypes,
            totalClient: data.totalClient,
        };
    } else {
        throw new Error(data.message);
    }
};

export const createClient = async (clientData) => {
    const requestBody = {
        fullname: clientData.fullname,
        email: clientData.email,
        telephone: clientData.phone,
        address: clientData.address,
        notes: clientData.note,
        type: clientData.type,
        company_name: clientData.companyName,
        national_id_number: clientData.nationalId,
        tva_number: clientData.vatNumber,
    };

    const { data } = await api.post("/crm/clients", qs.stringify(requestBody));

    if (data.status !== 200) {
        throw new Error(data.message || "Une erreur s'est produite lors de la création du client");
    }

    return data;
};
