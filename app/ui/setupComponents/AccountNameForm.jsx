"use client";

import React from "react";
import { Input, Checkbox, Link, Select, SelectItem, Avatar } from "@nextui-org/react";
import { cn } from "@nextui-org/react";
import companyIndustries from "./company-industries";
import countries from "@/src/constants/countries";

const AccountNameForm = React.forwardRef(({ className, onChange, formData, ...props }, ref) => {
    const inputProps = {
        labelPlacement: "inside",
        size: "lg",
        classNames: {
            label: "text-lg font-medium text-default-700 group-data-[filled-within=true]:text-default-700",
        },
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onChange?.(name, value); // Appeler le callback du parent
    };

    const handleSelectChange = (field, value) => {
        onChange?.(field, value); // Gestion des sélections
    };

    return (
        <div className="w-full lg:max-w-screen-sm">
            <div className="text-4xl font-bold leading-9 text-default-foreground text-left">{"Nom de l'entriprise"}</div>
            <div className="py-2 text-medium text-default-500 text-left">Commençons par le nom de votre entreprise/activité</div>
            <form ref={ref} {...props} className={cn("grid grid-cols-12 flex-col gap-4 py-5", className)}>
                <Input defaultValue={formData.companyName || ""} onChange={handleInputChange} className="col-span-12" label="Nom de l'entreprise" name="companyName" placeholder="Veuillez fournir le nom légal de votre entreprise" {...inputProps} />

                <Select
                    onSelectionChange={(value) => handleSelectChange("category", value)}
                    className="col-span-12"
                    items={companyIndustries}
                    label="Secteur d'activité"
                    name="category"
                    placeholder="Choisissez la catégorie de votre entreprise"
                    {...inputProps}
                    defaultSelectedKeys={[formData.category ? Array.from(formData.category)[0] : ""]}
                >
                    {(companyIndustry) => <SelectItem key={companyIndustry.value}>{companyIndustry.title}</SelectItem>}
                </Select>
            </form>
        </div>
    );
});

AccountNameForm.displayName = "AccountNameForm";

export default AccountNameForm;
