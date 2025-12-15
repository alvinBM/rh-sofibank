const subscriptionPlans = {
    Basic: {
        features: {
            feature_debt_management: true,
            feature_crm: true,
            feature_inventory: true,
            feature_pos: true,
            feature_finance: true,
            feature_hr: true,
            feature_suppliers: true,
            feature_reports: true,
            feature_multistore: false, // ❌ Non disponible pour Basic
            feature_production: true,
            feature_purchase_management: true,
            feature_sales_management: true,
            feature_products: true,
            feature_accounting: true,
            feature_users: true,
        },
        limits: {
            max_stores: 1, // Basic peut créer 1 magasin maximum
            max_users: 3, // Basic peut créer 2 utilisateurs maximum
        },
    },
    Essentiel: {
        features: {
            feature_debt_management: true,
            feature_crm: true,
            feature_inventory: true,
            feature_pos: true,
            feature_finance: true,
            feature_hr: true,
            feature_suppliers: true,
            feature_multistore: true,
            feature_production: true,
            feature_purchase_management: true,
            feature_sales_management: true,
            feature_products: true,
            feature_reports: true, // ✅ Disponible pour Essentiel
            feature_accounting: true, // ✅ Disponible pour Essentiel
            feature_users: true,
        },
        limits: {
            max_stores: 5, // Essentiel peut créer jusqu'à 5 magasins
            max_users: 10, // Essentiel peut créer jusqu'à 10 utilisateurs
        },
    },
    Pro: {
        features: {
            feature_debt_management: true,
            feature_crm: true,
            feature_inventory: true,
            feature_pos: true,
            feature_finance: true,
            feature_hr: true,
            feature_suppliers: true,
            feature_multistore: true,
            feature_production: true,
            feature_purchase_management: true,
            feature_sales_management: true,
            feature_products: true,
            feature_reports: true,
            feature_accounting: true,
            feature_users: true,
        },
        limits: {
            max_stores: 20, // Pro peut créer jusqu'à 20 magasins
            max_users: 50, // Pro peut créer jusqu'à 50 utilisateurs
        },
    },
};

export default subscriptionPlans;
