import api from "../axios";
import qs from "qs";

export const getExpensesCategories = async ({ offset, limit, query }) => {
    try {
        let requestUrl = `finances/expenses/categories?offset=${offset}&limit=${limit}`;

        if (query != "") {
            requestUrl += `&query=${query}`;
        }

        const { data } = await api.get(requestUrl);

        if (data.status === 200) {
            return {
                categories: data.categories,
                total: data.total,
            };
        } else {
            return { status: 500, message: data.message };
        }
    } catch (error) {
        console.log("Error fetching expenses categories", error);
        return { status: 500, message: "Une erreur s'est produite lors de la récupération des catégories de dépenses" };
    }
};

export const getExpenses = async ({ offset, limit, category_id, expense_status, query, date_start, date_end }) => {
    try {
        let requestUrl = `finances/expenses?offset=${offset}&limit=${limit}`;
        if (category_id && category_id > 0) {
            requestUrl += "&category_id=" + category_id;
        }
        if (expense_status && expense_status != "") {
            requestUrl += "&expense_status=" + expense_status;
        }
        if (query && query != "") {
            requestUrl += "&query=" + query;
        }

        if (date_start && date_start != "" && date_end && date_end != "") {
            requestUrl += "&date_start=" + date_start + "&date_end=" + date_end;
        }

        console.log("requestUrl : ****", requestUrl);

        const { data } = await api.get(requestUrl);

        if (data.status === 200) {
            return {
                expenses: data.expenses,
                total: data.total,
            };
        } else {
            return { status: 500, message: data.message };
        }
    } catch (error) {
        console.log("Error fetching expenses", error);
        return { status: 500, message: "Une erreur s'est produite lors de la récupération des dépenses" };
    }
};

export const createExpense = async (dataForm) => {
    try {
        const requestBody = {
            title: dataForm.title,
            category_id: dataForm.category_id,
            description: dataForm.description,
            amount: dataForm.amount,
            payment_account_id: dataForm.payment_account_id,
            expense_id: dataForm.expense_id,
        };

        const { data } = await api.post("/finances/expense", qs.stringify(requestBody));

        return data;
    } catch (error) {
        console.log("Error creating expense", error);
        return { status: 500, message: "Une erreur s'est produite lors de la création de la dépense" };
    }
};

export const createExpenseCategory = async (dataForm) => {
    try {
        const requestBody = {
            name: dataForm.name,
            description: dataForm.description,
            accounting_account_id: dataForm.accounting_account_id,
            category_id: dataForm.category_id,
        };

        const { data } = await api.post("/finances/expenses/category", qs.stringify(requestBody));

        return data;
    } catch (error) {
        console.log("Error creating expense", error);
        return { status: 500, message: "Une erreur s'est produite lors de la création de la catégorie" };
    }
};
