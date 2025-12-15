"use client";

import React from "react";
import { Button, Image, ScrollShadow } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { cn } from "@nextui-org/react";

import MultistepNavigationButtons from "./multistep-navigation-buttons";
import VerticalSteps from "../VerticalSteps";
import RowSteps from "../RowSteps";

const stepperClasses = cn(
    // light
    "[--step-color:hsl(var(--nextui-success-700))]",
    "[--active-color:hsl(var(--nextui-success-700))]",
    "[--inactive-border-color:hsl(var(--nextui-default-200))]",
    "[--inactive-bar-color:hsl(var(--nextui-default-200))]",
    "[--inactive-color:hsl(var(--nextui-default-300))]",
    // dark
    "dark:[--step-color:rgba(255,255,255,0.1)]",
    "dark:[--active-color:hsl(var(--nextui-foreground-600))]",
    "dark:[--active-border-color:rgba(255,255,255,0.5)]",
    "dark:[--inactive-border-color:rgba(255,255,255,0.1)]",
    "dark:[--inactive-bar-color:rgba(255,255,255,0.1)]",
    "dark:[--inactive-color:rgba(255,255,255,0.2)]"
);

const MultiStepSidebar = React.forwardRef(({ children, className, currentPage, onBack, onNext, onChangePage, ...props }, ref) => {
    return (
        <div ref={ref} className={cn("flex h-screen w-full gap-x-2", className)} {...props}>
            <div className="flex hidden h-full w-[344px] flex-shrink-0 flex-col items-start gap-y-8 rounded-large bg-gradient-to-b from-white via-white to-red-100 px-8 py-6 shadow-small lg:flex">
                <Button className="bg-default-50 text-small font-medium text-default-500 shadow-lg" isDisabled={currentPage === 0} radius="full" variant="flat" onPress={onBack}>
                    <Icon icon="solar:arrow-left-outline" width={18} />
                    Retour
                </Button>
                <div>
                    <div className="w-full text-left">
                        <Image alt="LOGO" height={50} width={250} radius="sm" src={"../../logo_sofibank.png"} />
                    </div>
                    <div className="mt-1 text-base font-medium leading-6 text-default-500">Suivez les étapes suivantes pour configurer votre compte</div>
                </div>
                {/* Desktop Steps */}
                <VerticalSteps
                    className={stepperClasses}
                    currentStep={currentPage}
                    steps={[
                        {
                            title: "Informations personnelles",
                            description: "Créez votre compte",
                        },
                        {
                            title: "Nom de l'entreprise",
                            description: "Ajoutez votre entreprise",
                        },
                        {
                            title: "Details de l'entreprise",
                            description: "Ajoutez les détails de votre entreprise",
                        },
                        {
                            title: "Adresse",
                            description: "Ajoutez une adresse du siège social",
                        },
                        {
                            title: "Plan de paiement",
                            description: "Choisissez un plan de paiement",
                        },
                    ]}
                    onStepChange={onChangePage}
                />
            </div>
            <div className="flex h-full w-full flex-col items-center gap-4 md:p-4">
                <div className="sticky top-0 z-10 w-full rounded-large bg-gradient-to-r from-default-100 via-danger-100 to-secondary-100 py-4 shadow-small md:max-w-xl lg:hidden">
                    <div className="flex justify-center">
                        {/* Mobile Steps */}
                        <RowSteps
                            className={cn("pl-6", stepperClasses)}
                            currentStep={currentPage}
                            color="success"
                            steps={[
                                {
                                    title: "Informations personnelles",
                                },
                                {
                                    title: "Nom de l'entreprise",
                                },
                                {
                                    title: "Details de l'entreprise",
                                },
                                {
                                    title: "Adresse",
                                },
                                {
                                    title: "Plan de paiement",
                                },
                            ]}
                            onStepChange={onChangePage}
                        />
                    </div>
                </div>
                <ScrollShadow size={4} className="h-full w-full p-4 lg:max-w-screen-lg flex flex-col lg:flex-row justify-center items-center">
                    {children} 
                    <MultistepNavigationButtons
                        backButtonProps={{ isDisabled: currentPage === 0 }}
                        className="lg:hidden"
                        nextButtonProps={{
                            children: currentPage === 0 ? "Sign Up for Free" : currentPage === 3 ? "Go to Payment" : "Suivant",
                        }}
                        onBack={onBack}
                        onNext={onNext}
                        page={currentPage}
                    />
                </ScrollShadow>
            </div>
        </div>
    );
});

MultiStepSidebar.displayName = "MultiStepSidebar";

export default MultiStepSidebar;
