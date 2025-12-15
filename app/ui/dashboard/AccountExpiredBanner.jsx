import { formatDateFullText } from "@/src/helpers/helpers";
import { selectUserData } from "@/src/redux/slices/userSlice";
import { Icon } from "@iconify/react";
import { Alert, Button, Link, Tooltip } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const AccountExpiredBanner = () => {
    const user = useSelector(selectUserData);
    const [isAccountExpired, setIsAccountExpired] = useState(false);

    useEffect(() => {
        if (user.account.expired) {
            setIsAccountExpired(new Date(user.account.expired) < new Date());
        }
    }, [user.account.expired]);

    if (!isAccountExpired) return null;

    return (
        <div className="w-full flex items-center my-3">
            <Alert
                variant={"faded"}
                color={"danger"}
                endContent={
                    <Button as={Link} href={`/subscription?plan=${user.account.billing_plan}`} color="danger">
                        Se réabonner
                    </Button>
                }
                title={`Votre abonnement a expiré le ${formatDateFullText(user.account.expired)}`}
                description={
                    <div className="flex-1">
                        <p className="font-light">Votre abonnement est arrivé à expiration. Veuillez vous réabonner pour débloquer les fonctionnalités de votre compte.</p>
                        <Tooltip
                            content={
                                <div className="px-1 py-2 max-w-lg flex flex-col gap-2">
                                    <div className="text-small font-bold">Votre abonnement a expiré</div>
                                    <p>
                                        <b className="text-danger">Période de grâce de 60 jours :</b>{" "}
                                        {
                                            "Pendant cette période, vous pouvez toujours télécharger la fiche complète de vos produits et stocks. Profitez-en pour récupérer vos données essentielles avant qu'elles ne soient définitivement inaccessibles."
                                        }
                                    </p>
                                    <p>
                                        <b className="text-danger">{"Suppression après 6 mois d'inactivité :"}</b>
                                        {"Si votre compte reste inactif pendant 6 mois après l'expiration de votre abonnement, nous nous réservons le droit de désactiver et supprimer définitivement votre compte ainsi que toutes vos données."}
                                    </p>
                                    <p className="mt-2">Renouvelez votre abonnement dès maintenant pour continuer à utiliser nos services et éviter toute perte de données.</p>
                                    <hr />
                                    <p>
                                        <b>{"Besoin d'aide ?"}</b>
                                        <br /> {"Contactez notre support pour plus d'informations. (+243 995 502 981)"}
                                    </p>
                                </div>
                            }
                        >
                            <p className="flex gap-1 items-center cursor-pointer">
                                <Icon width={12} className="font-light text-danger" icon="quill:warning-alt" />
                                <small className="font-light text-danger">Lire ce message important</small>
                            </p>
                        </Tooltip>
                    </div>
                }
            />
        </div>
    );
};

export default AccountExpiredBanner;
