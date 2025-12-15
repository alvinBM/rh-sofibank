export const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export const monthsShort = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
export const containsNumberAndLetterOnly = (string) => {
    const regex = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]*$/;
    return regex.test(string);
};

export const containsNumberOrLetterOnly = (string) => {
    const regex = /^[a-zA-Z0-9]*$/;
    return regex.test(string);
};

export const containsNumberAndLetter = (string) => {
    const regex = /^(?=.*[0-9])(?=.*[a-zA-Z])[0-9a-zA-Z!@#\$%^&*(),.?":{}|<>]+$/;
    return regex.test(string);
};

export const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
};

export const formatDate = (date) => {
    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [day, month, year].join("-");
};

export const formatDateToSend = (date) => {
    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
};

export const formatDateTime = (date) => {
    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear(),
        hours = d.getHours(),
        minutes = d.getMinutes();

    if (day.length < 2) day = "0" + day;
    if (hours.length < 2) hours = "0" + hours;
    if (minutes.length < 2) minutes = "0" + minutes;

    return [day, monthsShort[month - 1], year].join(" ") + " à " + [hours, minutes].join(":");
};

export const formatDateText = (date) => {
    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    return [day, monthsShort[month - 1], year].join(" ");
};

export const formatDateMonthYear = (date) => {
    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        year = d.getFullYear();

    return [months[month - 1], year].join(" ");
};

export const formatDateFullText = (date) => {
    var d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    return [day, months[month - 1], year].join(" ");
};

//Fontion pour formater le montant en devise
export const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

//Fonction pour formater le montant en devise avec 2 décimales
export const formatCurrencyDecimal = (amount) => {
    return parseFloat(amount)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const hasPermission = (permissions, requiredPermissions, isAdmin = false) => {
    // Si l'utilisateur est admin, il a toutes les permissions
    if (isAdmin) return true;

    // Vérifier si toutes les permissions nécessaires sont présentes
    if (Array.isArray(requiredPermissions)) {
        return requiredPermissions.every((perm) => permissions.includes(perm));
    }

    // Vérifier une seule permission
    return permissions.includes(requiredPermissions);
};
