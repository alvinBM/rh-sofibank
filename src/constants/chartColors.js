/**
 * Palette de couleurs partagée pour les graphiques (recharts) du tableau de bord.
 *
 * L'ordre catégoriel est fixe et validé (séparation suffisante en vision normale
 * et daltonienne) : ne jamais le faire tourner ni le réordonner par graphique.
 */
export const CATEGORICAL_COLORS = [
    "#2a78d6", // bleu
    "#eb6834", // orange
    "#1baf7a", // aqua
    "#eda100", // jaune
    "#e87ba4", // magenta
    "#008300", // vert
    "#4a3aa7", // violet
    "#e34948", // rouge
];

// Réservées aux états (jamais réutilisées pour une simple série catégorielle).
export const STATUS_COLORS = {
    good: "#0ca30c",
    warning: "#fab219",
    serious: "#ec835a",
    critical: "#d03b3b",
};
