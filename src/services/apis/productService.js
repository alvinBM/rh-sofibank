import api from "../axios";
import qs from "qs";

export const fetchProducts = async ({ offset, limit, query }) => {
    const requestUrl = query ? `stock/products/search?offset=${offset}&limit=${limit}&query=${query}` : `stock/products?offset=${offset}&limit=${limit}`;

    const { data } = await api.get(requestUrl);

    if (data.status === 200) {
        return {
            products: data.products,
            total: data.total,
        };
    } else {
        throw new Error("Erreur du serveur: " + data.message);
    }
};

export const fetchProductsOutOfStock = async ({ offset, limit, query }) => {
    const requestUrl = query ? `stock/products/search?offset=${offset}&limit=${limit}&query=${query}` : `stock/products/outofstock?offset=${offset}&limit=${limit}`;

    const { data } = await api.get(requestUrl);

    if (data.status === 200) {
        return {
            products: data.products,
            total: data.total,
        };
    } else {
        throw new Error("Erreur du serveur: " + data.message);
    }
};

export const fetchStockByStoreId = async ({ offset, limit, query, storeId }) => {
    const requestUrl = query ? `stock/products/stocksByStore/search?offset=${offset}&limit=${limit}&query=${query}&store_id=${storeId}` : `stock/products/stocksByStore?offset=${offset}&limit=${limit}&store_id=${storeId}`;

    const { data } = await api.get(requestUrl);

    if (data.status === 200) {
        return {
            products: data.products,
            total: data.total,
        };
    } else {
        throw new Error("Erreur du serveur: " + data.message);
    }
};

export const fetchProductCategories = async ({ offset, limit }) => {
    const { data } = await api.get(`stock/products/categories?offset=${offset}&limit=${limit}`);

    if (data.status === 200) {
        return {
            categories: data.categories,
            total: data.total,
        };
    } else {
        throw new Error("Erreur du serveur: " + data.message);
    }
};

export const createProduct = async (productData) => {
    try {
        api.defaults.headers["Content-Type"] = "multipart/form-data";
        const requestBody = {
            designation: productData.designation,
            category_id: productData.category_id != "" ? productData.category_id : 0,
            type: productData.type,
            bar_code: productData.bar_code,
            description: productData.description,
            buying_price: productData.buying_price,
            selling_price: productData.selling_price,
            alert_stock: productData.alert_stock,
            unit_measurement: productData.unit_measurement,
            product_id: productData.product_id != "" ? productData.product_id : 0,
            photos: productData.image,
        };

        const formData = new FormData();
        for (const key in requestBody) {
            formData.append(key, requestBody[key]);
        }

        const { data } = await api.post("/stock/products", formData);
        console.log(data);
        if (data.status !== 200) {
            throw new Error(data.message || "Une erreur s'est produite lors de la création du produit");
        }

        return data;
    } catch (error) {
        throw error;
    } finally {
        api.defaults.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
};

export const createCategory = async (categoryData) => {
    const requestBody = {
        name: categoryData.name,
        description: categoryData.description,
    };

    try {
        const { data } = await api.post("/stock/products/categories", qs.stringify(requestBody));
        return data;
    } catch (err) {
        console.log("Response create categories", err);
        return { status: 500, message: "API Error : Une erreur s'est produite lors de la création de la catégorie" };
    }
};

export const fetchProductById = async (id) => {
    try {
        const { data } = await api.get(`/stock/products/getProduct?id=${id}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const fetchStockEntries = async ({ offset, limit, storeId, query = null }) => {
    try {
        let url = `/stock/entries?offset=${offset}&limit=${limit}`;
        if (storeId && storeId > 0) {
            url += `&store_id=${storeId}`;
        }
        if (query && query != "") {
            url += `&query=${query}`;
        }
        const { data } = await api.get(url);
        return data;
    } catch (error) {
        throw error;
    }
};

export const fetchStockEntriesByProductId = async ({ offset, limit, storeId, productId }) => {
    try {
        let url = `/stock/entries/byProductId?offset=${offset}&limit=${limit}&product_id=${productId}`;
        if (storeId && storeId > 0) {
            url += `&store_id=${storeId}`;
        }
        const { data } = await api.get(url);
        return data;
    } catch (error) {
        throw error;
    }
};

export const fetchStockExits = async ({ offset, limit, storeId, query = null }) => {
    try {
        let url = `/stock/exits?offset=${offset}&limit=${limit}`;
        if (storeId && storeId > 0) {
            url += `&store_id=${storeId}`;
        }
        if (query && query != "") {
            url += `&query=${query}`;
        }
        const { data } = await api.get(url);
        return data;
    } catch (error) {
        throw error;
    }
};

export const fetchStockExitsByProductId = async ({ offset, limit, storeId, productId }) => {
    try {
        let url = `/stock/exits/byProductId?offset=${offset}&limit=${limit}&product_id=${productId}`;
        if (storeId && storeId > 0) {
            url += `&store_id=${storeId}`;
        }
        const { data } = await api.get(url);
        return data;
    } catch (error) {
        throw error;
    }
};

export const fetchStockTransfers = async ({ offset, limit }) => {
    try {
        const { data } = await api.get(`/stock/transfers?offset=${offset}&limit=${limit}`);
        return data;
    } catch (error) {
        throw error;
    }
};
