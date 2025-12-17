export default function (errors) {
    let details = errors.details[0];
    let type_error = details.type;
    let context = details.context;
    let message = errors.details[0].message;

    switch (type_error) {
        case "any.empty":
            message = `Le champ ${context.label} ne doit pas avoir une valeur vide!`;
            break;

        case "string.empty":
            message = `Le champ ${context.label} ne doit pas être vide!`;
            break;

        case "any.required":
            message = `Le champ ${context.label} est obligatoire!`;
            break;

        case "string.min":
            message = `La valeur du champ ${context.label} doit avoir au moins ${context.limit} caractères!`;
            break;

        case "string.max":
            message = `La valeur du champ ${context.label} ne doit pas dépasser ${context.limit} caractères!`;
            break;

        case "string.email":
            message = `La valeur du champ ${context.label} doit être un email valide!`;
            break;

        case "string.uri":
            message = `La valeur du champ ${context.label} doit être une URL valide!`;
            break;

        case "string.pattern.base":
            message = `Le format du champ ${context.label} est invalide!`;
            break;

        case "number.base":
            message = `La valeur du champ ${context.label} doit être un nombre!`;
            break;

        case "number.min":
            message = `La valeur du champ ${context.label} doit être au moins ${context.limit}!`;
            break;

        case "number.max":
            message = `La valeur du champ ${context.label} ne doit pas dépasser ${context.limit}!`;
            break;

        case "number.integer":
            message = `La valeur du champ ${context.label} doit être un entier!`;
            break;

        case "date.base":
            message = `Le champ ${context.label} doit être une date valide!`;
            break;

        case "date.min":
            message = `La date du champ ${context.label} doit être après ${context.limit}!`;
            break;

        case "date.max":
            message = `La date du champ ${context.label} doit être avant ${context.limit}!`;
            break;

        case "array.base":
            message = `La valeur du champ ${context.label} doit être un tableau (array)!`;
            break;

        case "array.min":
            message = `Le tableau ${context.label} doit contenir au moins ${context.limit} éléments!`;
            break;

        case "array.max":
            message = `Le tableau ${context.label} ne doit pas contenir plus de ${context.limit} éléments!`;
            break;

        case "boolean.base":
            message = `La valeur du champ ${context.label} doit être un booléen!`;
            break;

        case "object.base":
            message = `La valeur du champ ${context.label} doit être un objet!`;
            break;

        case "object.unknown":
            message = `Le champ ${context.label} est inconnu!`;
            break;

        case "any.only":
            message = `La valeur du champ ${context.label} doit être l'une des suivantes : ${context.valids.join(", ")}!`;
            break;

        case "any.invalid":
            message = `La valeur du champ ${context.label} est invalide!`;
            break;

        default:
            message = `Erreur inconnue sur le champ ${context.label}!`;
            break;
    }

    return message;
}
