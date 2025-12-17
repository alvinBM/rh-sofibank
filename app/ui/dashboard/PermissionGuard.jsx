"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { selectUserPermissions, selectUserData } from "@/src/redux/slices/userSlice";
import { Button, Link, Spinner } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import subscriptionPlans from "@/src/helpers/subscriptionPlans";

/**
 * PermissionGuard Component
 * - Vérifie les permissions et l'état du compte.
 *
 * Props:
 * - `requiredPermission`: (string | string[]) Permission(s) requise(s) pour accéder au contenu.
 * - `requireAll`: (boolean) Si true, toutes les permissions sont requises. Sinon, une seule suffit.
 * - `requiredFeature`: (string) Fonctionnalité requise pour accéder au contenu.
 * - `fallback`: (JSX) Composant ou contenu affiché en cas d'absence d'accès.
 * - `redirectTo`: (string) Redirection si l'utilisateur n'a pas accès (ex: `/403`).
 * - `children`: (JSX) Contenu à afficher si l'utilisateur a les droits requis.
 */
const PermissionGuard = ({
    requiredPermission,
    requireAll = false,
    requiredFeature,
    fallback,
    redirectTo,
    children
}) => {
    const permissions = useSelector(selectUserPermissions);
    const user = useSelector(selectUserData);
    const router = useRouter();

    // Récupérer le plan d'abonnement et la date d'expiration
    const { billing_plan, expired_at } = user?.account || {};
    const isAccountExpired = expired_at && new Date(expired_at) < new Date();
    const { features } = getPlanDetails(billing_plan);

    // Vérifier si l'utilisateur est RH ou DRH ou SUPER_ADMIN
    const isDRH = user?.main_roles?.some((role) => role.role_code === "RH") || user?.main_roles?.some((role) => role.role_code === "DRH") || user?.main_roles?.some((role) => role.role_code === "SUPER_ADMIN");
    // Si le compte est expiré, afficher un message
    if (isAccountExpired) {
        return (
            <div className="flex flex-col gap-2 justify-center items-center h-full bg-background rounded-xl p-8">
                <Icon icon="fluent:lock-closed-key-16-regular" className="text-danger" width={60} height={60} />
                <p className="text-danger text-lg text-center px-5">Votre abonnement a expiré</p>
                <p className="font-light text-center">Votre abonnement est arrivé à expiration. Veuillez vous réabonner pour débloquer les fonctionnalités de votre compte.</p>
                <Button className="mt-5 px-10" as={Link} href={`/subscription?plan=${billing_plan}`} color="danger">
                    Se réabonner
                </Button>
            </div>
        );
    }

    // Vérifier si la fonctionnalité est requise et non disponible pour le plan actuel
    if (requiredFeature && features && !features[requiredFeature]) {
        return (
            <div className="flex flex-col gap-2 justify-center items-center h-full bg-background rounded-xl p-8">
                <Icon icon="fluent:cloud-error-24-regular" className="text-danger" width={60} height={60} />
                <p className="text-danger text-lg text-center">Fonctionnalité non disponible pour votre abonnement.</p>
                <p className="text-center">Cette fonctionnalité n&apos;est pas disponible pour votre plan d&apos;abonnement actuel. Veuillez mettre à niveau votre abonnement pour y accéder.</p>
                <Button className="mt-5 px-10" as={Link} href={`/subscription?plan=Essentiel`} color="danger">
                    Mettre à niveau
                </Button>
            </div>
        );
    }

    // Vérifier si la permission requise est accordée
    if (!isDRH && requiredPermission) {
        const permissionCodes = permissions?.map(p => p?.code) || [];
        const requiredPermissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];

        let hasPermission = false;

        if (requireAll) {
            hasPermission = requiredPermissions.every(perm => permissionCodes.includes(perm));
        } else {
            hasPermission = requiredPermissions.some(perm => permissionCodes.includes(perm));
        }

        if (!hasPermission) {
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
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-background rounded-lg p-8">
                        <Icon icon="solar:folder-error-bold-duotone" width={96} className="text-rose-500" />
                        <h1 className="text-rose-500 text-lg mt-4 text-center">Vous n&apos;avez pas la permission d&apos;accéder à cette page.</h1>
                        <p className="text-default-500 text-sm mt-2 text-center">Contactez votre administrateur pour obtenir les accès nécessaires.</p>
                        <Button
                            className="mt-6"
                            color="danger"
                            variant="flat"
                            as={Link}
                            href="/dashboard"
                        >
                            Retour au tableau de bord
                        </Button>
                    </div>
                )
            );
        }
    }

    // Si tout est validé, afficher le contenu protégé
    return children;
};

// Fonction pour récupérer les fonctionnalités et limites en fonction du `billing_plan`
const getPlanDetails = (billing_plan) => {
    return subscriptionPlans?.[billing_plan] || subscriptionPlans?.["Basic"] || { features: {} };
};

export default PermissionGuard;
