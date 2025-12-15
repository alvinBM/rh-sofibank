"use client";

import { selectUserPermissions, selectUserData } from "@/src/redux/slices/userSlice";
import { useSelector } from "react-redux";

const PermissionCheck = ({ requiredPermission, children }) => {
    const permissions = useSelector(selectUserPermissions);
    const user = useSelector(selectUserData);
    // Vérifier si l'utilisateur est Admin (bypass toutes les permissions)
    const isAdmin = user?.main_roles?.some((role) => role.role_name === "Admin");

    // Si l'utilisateur est admin ou possède la permission, afficher le contenu
    if (isAdmin || permissions.includes(requiredPermission)) {
        return <>{children}</>;
    }

    // Sinon, ne rien afficher
    return null;
};

export default PermissionCheck;
