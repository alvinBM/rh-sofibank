"use client";
import React from "react";
import { Icon } from "@iconify/react";
import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider, Link, Spacer, Tab, Tabs } from "@nextui-org/react";
import { cn } from "@nextui-org/react";
import { useRouter } from "next/navigation";

let FrequencyEnum = {
    Monthly: "Monthly",
    Yearly: "Yearly",
};

let TiersEnum = {
    Basic: "Basic",
    Essentiel: "Essentiel",
    Pro: "Pro",
};

const frequencies = [
    { key: FrequencyEnum.Monthly, label: "Par mois", priceSuffix: "par mois" },
    { key: FrequencyEnum.Yearly, label: "Par an", priceSuffix: "par an" },
];

const tiers = [
    {
        key: TiersEnum.Basic,
        title: TiersEnum.Basic,
        price: {
            Monthly: "$10",
            Yearly: "$90",
        },
        href: "#",
        featured: false,
        mostPopular: false,
        description: "Conçu pour les petites entreprises souhaitant gérer leurs opérations essentielles.",
        features: ["2 utilisateurs inclus", "1 magasin/branche", "Module de facturation", "Gestion de l'inventaire (stocks)", "Rapports basiques", "Support 24/7 (par email)"],
        buttonText: "Payer",
        buttonColor: "default",
        buttonVariant: "flat",
    },
    {
        key: TiersEnum.Essentiel,
        title: TiersEnum.Essentiel,
        price: {
            Monthly: "$20",
            Yearly: "$180",
        },
        href: "#",
        featured: false,
        mostPopular: true,
        description: "Idéal pour les entreprises en croissance ayant besoin d'une gestion avancée.",
        features: ["10 utilisateurs inclus", "Jusqu'à 5 magasins/branches", "Module de facturation avancé", "Gestion des ventes et des achats", "Comptabilité conforme OHADA", "Rapports avancés", "Support 24/7 (email et téléphone)"],
        buttonText: "Payer",
        buttonColor: "success",
        buttonVariant: "solid",
    },
    {
        key: TiersEnum.Pro,
        title: TiersEnum.Pro,
        price: {
            Monthly: "$45",
            Yearly: "$400",
        },
        href: "#",
        featured: true,
        mostPopular: false,
        description: "Une solution personnalisée pour les grandes entreprises avec des besoins spécifiques.",
        features: ["Utilisateurs illimités", "Magasins/branches illimités", "Modules avancés (RH, production)", "Gestion complète de l'inventaire", "Analyse et rapports personnalisés", "Support premium 24/7"],
        buttonText: "Payer",
        buttonColor: "default",
        buttonVariant: "flat",
    },
];

const ChoosePlanForm = React.forwardRef(({ className, onChange, formData, handleSubmit, fromLanding = false, ...props }, ref) => {
    const [selectedFrequency, setSelectedFrequency] = React.useState(frequencies[0]);
    const [selectedOption, setSelectedOption] = React.useState("Basic");
    const router = useRouter();

    const onFrequencyChange = (selectedKey) => {
        const frequencyIndex = frequencies.findIndex((f) => f.key === selectedKey);

        setSelectedFrequency(frequencies[frequencyIndex]);
    };

    const handleSelectPlan = (plan, tryFree = true) => {
        if (fromLanding) {
            router.push("/auth/signup?plan=" + plan + "&tryFree=" + tryFree);
        } else {
            console.log("Selected plan", plan);
            handleSubmit({ billingPlan: plan, tryFree: tryFree });
        }
    };

    return (
        <div className={`flex max-w-4xl flex-col items-center pb-20 ${fromLanding ? "pt-0" : "pt-40"}`}>
            <div className="flex max-w-xl flex-col text-center mt-20">
                <h1 className="text-4xl font-bold tracking-tight">Trouvez un plan qui vous convient</h1>
                <Spacer y={4} />
                {/* <h2 className="text-large text-default-500">Découvrez le plan idéal pour votre entreprise, à partir de $10 par mois.</h2> */}
            </div>
            <Spacer y={4} />
            <Tabs
                classNames={{
                    tab: "data-[hover-unselected=true]:opacity-90",
                }}
                radius="full"
                size="lg"
                onSelectionChange={onFrequencyChange}
            >
                <Tab key={FrequencyEnum.Monthly} title="Payer par mois" />
                <Tab
                    key={FrequencyEnum.Yearly}
                    aria-label="Payer par an"
                    className="pr-1.5"
                    title={
                        <div className="flex items-center gap-2">
                            <p>Payer par an</p>
                            <Chip color="success" className="bg-red-600 text-white">
                                -25%
                            </Chip>
                        </div>
                    }
                />
            </Tabs>
            <Spacer y={12} />
            <div className="grid grid-cols-1 gap-10 md:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {tiers.map((tier) => (
                    <Card
                        key={tier.key}
                        className={cn("relative p-3", {
                            "overflow-visible bg-red-600 shadow-2xl shadow-danger/20": tier.mostPopular,
                            "!border-medium border-default-100 bg-transparent lg:mt-12": !tier.mostPopular,
                        })}
                        shadow="none"
                    >
                        {tier.mostPopular ? (
                            <Chip
                                classNames={{
                                    base: "absolute -top-3 left-1/2 -translate-x-1/2 bg-danger-foreground shadow-large border-medium border-red-700",
                                    content: "font-medium text-red-700",
                                }}
                                color="danger"
                            >
                                Le plus populaire
                            </Chip>
                        ) : null}
                        <CardHeader className="flex flex-col items-center gap-2 pb-6 justify-center">
                            <h2
                                className={cn("text-xl font-bold text-center", {
                                    "text-danger-foreground": tier.mostPopular,
                                })}
                            >
                                {tier.title}
                            </h2>
                            <p
                                className={cn("text-sm text-center text-default-500", {
                                    "text-danger-foreground/70": tier.mostPopular,
                                })}
                            >
                                {tier.description}
                            </p>
                        </CardHeader>
                        <Divider className="bg-danger-foreground/20" />
                        <CardBody className="justify-between">
                            <div className="flex flex-col gap-8">
                                <p className="flex items-end justify-center gap-1 pt-2">
                                    <span
                                        className={cn("inline bg-gradient-to-br from-foreground to-foreground-600 bg-clip-text text-4xl font-semibold leading-7 tracking-tight text-transparent", {
                                            "text-danger-foreground": tier.mostPopular,
                                        })}
                                    >
                                        {tier.price[selectedFrequency.key]}
                                    </span>
                                    <span
                                        className={cn("text-sm font-medium text-default-400", {
                                            "text-danger-foreground/50": tier.mostPopular,
                                        })}
                                    >
                                        /{selectedFrequency.priceSuffix}
                                    </span>
                                </p>
                                <ul className="flex flex-col gap-1">
                                    {tier.features?.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2">
                                            <Icon
                                                className={cn("text-red-600", {
                                                    "text-red-100": tier.mostPopular,
                                                })}
                                                icon="ci:check"
                                                width={24}
                                            />

                                            <p
                                                className={cn("text-default-500 text-small", {
                                                    "text-danger-foreground/70": tier.mostPopular,
                                                })}
                                            >
                                                {feature}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardBody>
                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                onPress={() => handleSelectPlan(tier.key, false)}
                                fullWidth
                                as={Link}
                                className={cn({
                                    "bg-red-800 font-medium text-white shadow-sm shadow-default-500/50": tier.mostPopular,
                                    "bg-red-600 font-medium text-white shadow-sm shadow-default-500/50": !tier.mostPopular,
                                })}
                                color={tier.buttonColor}
                                href={tier.href}
                                variant={tier.buttonVariant}
                            >
                                {fromLanding ? "Créer un compte" : tier.buttonText}
                            </Button>
                            <Button
                                onPress={() => handleSelectPlan(tier.key, true)}
                                fullWidth
                                as={Link}
                                className={cn({
                                    "bg-danger-foreground font-medium text-red-600 shadow-sm shadow-default-500/50": tier.mostPopular,
                                })}
                                color={tier.buttonColor}
                                href={tier.href}
                                variant={tier.buttonVariant}
                            >
                                Essayer gratuitement (7 jours)
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            <Spacer y={12} />
            <div className="flex py-2">
                <p className="text-default-400 text-center">
                    {"Besoin d'une solution personnalisée ? "}
                    <Link color="foreground" href="tel:+243840409642" underline="always">
                        Contacez-nous
                    </Link>
                </p>
            </div>
        </div>
    );
});

ChoosePlanForm.displayName = "ChoosePlanForm";

export default ChoosePlanForm;
