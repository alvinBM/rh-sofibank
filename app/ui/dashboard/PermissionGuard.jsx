"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { selectUserPermissions, selectUserData } from "@/src/redux/slices/userSlice";
import { Button, Link, Spinner } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import subscriptionPlans from "@/src/helpers/subscriptionPlans";

/**
 * PermissionGuard Component
 * - Vérifie les permissions, l'accès aux fonctionnalités et l'état du compte.
 *
 * Props:
 * - `requiredPermission`: (string) Permission requise pour accéder au contenu.
 * - `requiredFeature`: (string) Fonctionnalité requise pour accéder au contenu.
 * - `fallback`: (JSX) Composant ou contenu affiché en cas d'absence d'accès.
 * - `redirectTo`: (string) Redirection si l'utilisateur n'a pas accès (ex: `/403`).
 * - `children`: (JSX) Contenu à afficher si l'utilisateur a les droits requis.
 */
const PermissionGuard = ({ requiredPermission, requiredFeature, fallback, redirectTo, children }) => {
    const permissions = useSelector(selectUserPermissions);
    const user = useSelector(selectUserData);
    const router = useRouter();

    // Récupérer le plan d'abonnement et la date d'expiration
    const { billing_plan, expired } = user.account || {};
    const isAccountExpired = new Date(expired) < new Date();
    const { features } = getPlanDetails(billing_plan);

    // Vérifier si l'utilisateur est Admin (bypass toutes les permissions et fonctionnalités)
    const isAdmin = user?.main_roles?.some((role) => role.role_name === "Admin");

    // Si le compte est expiré, afficher un message
    if (isAccountExpired) {
        return (
            <div className="flex flex-col gap-2 justify-center items-center h-full bg-background rounded-xl">
                <Icon icon="fluent:lock-closed-key-16-regular" className="text-danger" width={60} height={60} />
                <p className="text-danger text-lg text-center px-5">Votre abonnement a expiré</p>
                <p className="font-light">Votre abonnement est arrivé à expiration. Veuillez vous réabonner pour débloquer les fonctionnalités de votre compte.</p>
                <Button className="mt-5 px-10" as={Link} href={`/subscription?plan=${user.account.billing_plan}`} color="danger">
                    Se réabonner
                </Button>
            </div>
        );
    }

    // Vérifier si la fonctionnalité est requise et non disponible pour le plan actuel
    if (requiredFeature && !features[requiredFeature]) {
        return (
            <div className="flex flex-col gap-2 justify-center items-center h-full bg-background rounded-xl">
                <Icon icon="fluent:cloud-error-24-regular" className="text-danger" width={60} height={60} />
                <p className="text-danger text-lg">Fonctionnalité non disponible pour votre abonnement.</p>
                <p>{"Cette fonctionnalité n'est pas disponible pour votre plan d'abonnement actuel. Veuillez mettre à niveau votre abonnement pour y accéder."}</p>
                <Button className="mt-5 px-10" as={Link} href={`/subscription?plan=Essentiel`} color="danger">
                    Mettre à niveau
                </Button>
            </div>
        );
    }

    // Vérifier si la permission requise est accordée
    if (!isAdmin && requiredPermission && !permissions.includes(requiredPermission)) {
        if (redirectTo) {
            router.push(redirectTo);
            return (
                <div className="flex items-center justify-center h-screen">
                    <Spinner size="lg" />
                </div>
            );
        }

        return (
            fallback || (
                <div className="flex flex-col items-center justify-center h-screen-pos bg-background rounded-lg">
                    <Icon icon="solar:folder-error-bold-duotone" width={96} className="text-rose-500" />
                    <h1 className="text-rose-500 text-lg">{"Vous n'avez pas la permission d'accéder à cette page."}</h1>
                </div>
            )
        );
    }

    // Si tout est validé, afficher le contenu protégé
    return children;
};

// Fonction pour récupérer les fonctionnalités et limites en fonction du `billing_plan`
const getPlanDetails = (billing_plan) => {
    return subscriptionPlans[billing_plan] || subscriptionPlans["Basic"]; // Par défaut, Basic
};

export default PermissionGuard;
