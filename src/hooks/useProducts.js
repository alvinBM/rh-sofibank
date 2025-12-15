import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createCategory,
    createProduct,
    fetchProductById,
    fetchProductCategories,
    fetchProducts,
    fetchProductsOutOfStock,
    fetchStockByStoreId,
    fetchStockEntries,
    fetchStockEntriesByProductId,
    fetchStockExits,
    fetchStockExitsByProductId,
    fetchStockTransfers,
} from "../services/apis/productService";

export const useGetProducts = ({ page, rowsPerPage, filterValue }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["products", { page, rowsPerPage, filterValue }],
        queryFn: () => fetchProducts({ offset, limit: rowsPerPage, query: filterValue }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching products", error);
        },
    });
};

export const useGetProductsOutOfStock = ({ page, rowsPerPage, filterValue }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["products", { page, rowsPerPage, filterValue }],
        queryFn: () => fetchProductsOutOfStock({ offset, limit: rowsPerPage, query: filterValue }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching products", error);
        },
    });
};

export const useGetStockByStoreId = ({ page, rowsPerPage, filterValue, storeId = null }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["stock", { page, rowsPerPage, filterValue, storeId }],
        queryFn: () => fetchStockByStoreId({ offset, limit: rowsPerPage, query: filterValue, storeId }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching stock by store", error);
        },
    });
};

export const useGetProductById = ({ id }) => {
    return useQuery({
        queryKey: ["product", { id }],
        queryFn: () => fetchProductById(id),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching product by id", error);
        },
    });
};

export const useGetProductCategories = ({ page, limit }) => {
    const offset = (page - 1) * limit;

    return useQuery({
        queryKey: ["categories", { page, limit }],
        queryFn: () => fetchProductCategories({ offset, limit }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching categories", error);
        },
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            // Invalider la requête 'products' pour forcer le rechargement des données
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error) => {
            console.error("Une erreur est survenue lors de la création du produits ****", error);
        },
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
        onError: (error) => {
            console.error("Hook Error : Une erreur est survenue lors de la création de la catégorie", error);
        },
    });
};

export const useGetStockEntries = ({ page, rowsPerPage, storeId = null, query = null }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["entries", { page, rowsPerPage, storeId, query }],
        queryFn: () => fetchStockEntries({ offset, limit: rowsPerPage, storeId, query }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching entries", error);
        },
    });
};

export const useGetStockEntriesByProductId = ({ page, rowsPerPage, storeId, productId }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["entries", { page, rowsPerPage, storeId, productId }],
        queryFn: () => fetchStockEntriesByProductId({ offset, limit: rowsPerPage, storeId, productId }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching entries by product id", error);
        },
    });
};

export const useGetStockExits = ({ page, rowsPerPage, storeId = null, query = null }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["exits", { page, rowsPerPage, storeId, query }],
        queryFn: () => fetchStockExits({ offset, limit: rowsPerPage, storeId, query }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching exits", error);
        },
    });
};

export const useGetStockExitsByProductId = ({ page, rowsPerPage, storeId, productId }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["exits", { page, rowsPerPage, storeId, productId }],
        queryFn: () => fetchStockExitsByProductId({ offset, limit: rowsPerPage, storeId, productId }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching exits by product id", error);
        },
    });
};

export const useGetStockTransfers = ({ page, rowsPerPage }) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["transfers", { page, rowsPerPage }],
        queryFn: () => fetchStockTransfers({ offset, limit: rowsPerPage }),
        keepPreviousData: true, // Garde les données précédentes pendant le rechargement
        onError: (error) => {
            console.error("Error fetching stock transfers", error);
        },
    });
};
