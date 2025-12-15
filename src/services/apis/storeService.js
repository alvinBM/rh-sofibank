import { hasPermission } from "@/src/helpers/helpers";
import api from "../axios";
import qs from "qs";
import { selectUserData, selectUserPermissions } from "@/src/redux/slices/userSlice";

export const fetchBranches = async ({ offset, limit }) => {
    const requestUrl = `main/branches?offset=${offset}&limit=${limit}`;
    const { data } = await api.get(requestUrl);
    if (data.status === 200) {
        return {
            branches: data.branches,
            total: data.total,
        };
    } else {
        throw new Error("Erreur du serveur: " + data.message);
    }
};

export const createBranche = async (branchData) => {
    try {
        const requestBody = {
            name: branchData.name,
            address: branchData.address,
            phone: branchData.phone,
            email: branchData.email,
            city: branchData.city,
            country: branchData.country,
        };

        const { data } = await api.post("/main/branches", qs.stringify(requestBody));
        console.log(data);
        // if (data.status !== 200) {
        //     throw new Error(data.message || "Une erreur s'est produite lors de la création de la branche");
        // }

        return data;
    } catch (error) {
        return {
            status: 500,
            message: error.message,
        };
    }
};

export const updateBranchInfos = async (branchData) => {
    try {
        const requestBody = {
            name: branchData.name,
            address: branchData.address,
            phone: branchData.phone,
            email: branchData.email,
            city: branchData.city,
            country: branchData.country,
        };

        const { data } = await api.put(`/main/branches/${branchData.branch_id}`, qs.stringify(requestBody));
        console.log(data);
        // if (data.status !== 200) {
        //     throw new Error(data.message || "Une erreur s'est produite lors de la mise à jour des informations de la branche");
        // }

        return data;
    } catch (error) {
        return {
            status: 500,
            message: error.message,
        };
    }
};
