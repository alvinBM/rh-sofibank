/**
 * Contrôle d'accès temporaire basé sur l'email de l'utilisateur connecté.
 *
 * Le vrai système de rôles/permissions (main_roles / main_permissions) n'est pas
 * encore fiabilisé côté backend. En attendant, on dérive un niveau d'accès à
 * partir du préfixe de l'email pour piloter l'affichage de la sidebar et du
 * tableau de bord :
 *   - admin@...  -> accès complet (Dashboard, Modules RH, Paramétrages)
 *   - rh@...     -> Dashboard + Modules RH (Paramétrages masqué)
 *   - tout autre -> Dashboard + Mon Espace (ESS) uniquement
 */

export const ACCESS_LEVELS = {
    ADMIN: "admin",
    RH: "rh",
    EMPLOYEE: "employee",
};

export const getAccessLevelFromEmail = (email) => {
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (normalizedEmail.startsWith("admin@")) return ACCESS_LEVELS.ADMIN;
    if (normalizedEmail.startsWith("rh@")) return ACCESS_LEVELS.RH;

    return ACCESS_LEVELS.EMPLOYEE;
};

export const getAccessLevel = (user) => getAccessLevelFromEmail(user?.email);

export const isAdminAccess = (user) => getAccessLevel(user) === ACCESS_LEVELS.ADMIN;
export const isRHAccess = (user) => getAccessLevel(user) === ACCESS_LEVELS.RH;
export const isEmployeeAccess = (user) => getAccessLevel(user) === ACCESS_LEVELS.EMPLOYEE;

/**
 * Filtre les sections de la sidebar selon le niveau d'accès dérivé de l'email.
 * - admin  : toutes les sections
 * - rh     : toutes les sections sauf "settings" (Paramétrages)
 * - employee : uniquement la section "main" (Dashboard + Mon Espace ESS)
 */
export const filterSidebarByAccessLevel = (sections, accessLevel) => {
    if (accessLevel === ACCESS_LEVELS.ADMIN) return sections;

    if (accessLevel === ACCESS_LEVELS.RH) {
        return sections.filter((section) => section.key !== "settings");
    }

    return sections.filter((section) => section.key === "main");
};
