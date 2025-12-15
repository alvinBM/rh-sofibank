"use client";
import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { Icon } from "@iconify/react";
const faqsData = [
    {
        title: "Qu’est-ce que cette application et comment peut-elle m’aider ?",
        content:
            "Notre application est une solution tout-en-un qui vous permet de gérer facilement votre stock, vos ventes, vos achats et votre comptabilité. Gagnez du temps, réduisez les erreurs et optimisez votre rentabilité avec un tableau de bord intuitif et automatisé.",
    },
    {
        title: "L'application est-elle adaptée aux petites entreprises et aux entrepreneurs ?",
        content: "Absolument ! Que vous soyez un auto-entrepreneur, une PME ou une grande entreprise, notre solution s’adapte à vos besoins en offrant une gestion simplifiée et efficace de votre activité.",
    },
    {
        title: "Puis-je gérer plusieurs magasins avec la même application ?",
        content: "Oui ! Vous pouvez gérer plusieurs magasins, suivre leurs performances séparément et synchroniser les stocks en temps réel entre vos différents points de vente.",
    },
    {
        title: "Comment puis-je suivre mes ventes et mes stocks en temps réel ?",
        content: "Grâce à notre tableau de bord interactif, vous pouvez voir en temps réel vos ventes, vos stocks, vos achats et vos finances. Plus besoin de passer des heures à faire des calculs manuels !",
    },
    {
        title: "Quels types de rapports puis-je générer avec l’application ?",
        content:
            "Notre application vous permet de générer des rapports détaillés sur les ventes, les achats, les profits, les dettes clients, les stocks en rupture et bien plus encore. Accédez à des statistiques claires pour prendre de meilleures décisions.",
    },
    {
        title: "Puis-je accéder à mon compte depuis mon téléphone ou une tablette ?",
        content: "Oui ! Notre application est accessible depuis n’importe quel appareil connecté à Internet : ordinateur, tablette et smartphone. Gérez votre activité où que vous soyez !",
    },
    {
        title: "Quels sont les tarifs et existe-t-il une version d’essai ?",
        content: "Nous proposons plusieurs formules adaptées à tous les besoins. Vous pouvez tester gratuitement l’application avant de souscrire à une offre. Contactez-nous pour en savoir plus sur nos abonnements et nos offres spéciales.",
    },
];

const Faqs = () => {
    return (
        <Accordion
            fullWidth
            keepContentMounted
            className="gap-3"
            itemClasses={{
                base: "px-0 sm:px-6",
                title: "font-medium",
                trigger: "py-6 flex-row-reverse",
                content: "pt-0 pb-6 text-base text-default-500",
            }}
            items={faqsData}
            selectionMode="multiple"
        >
            {faqsData.map((item, i) => (
                <AccordionItem key={i} indicator={<Icon icon="lucide:plus" width={24} />} title={item.title}>
                    {item.content}
                </AccordionItem>
            ))}
        </Accordion>
    );
};

export default Faqs;
