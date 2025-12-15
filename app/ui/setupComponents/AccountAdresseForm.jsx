"use client";

import React from "react";
import { Input, Checkbox, Link, Select, SelectItem, Avatar, Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { cn } from "@nextui-org/react";
import companyIndustries from "./company-industries";
import countries from "@/src/constants/countries";

const AccountAdresseForm = React.forwardRef(({ className, onChange, formData, ...props }, ref) => {
    const inputProps = {
        labelPlacement: "inside",
        size: "lg",
        classNames: {
            label: "text-small font-medium text-default-700 group-data-[filled-within=true]:text-default-700",
        },
    };

    const nbEmployees = [
        { value: "1", title: "1-10" },
        { value: "2-10", title: "2-10" },
        { value: "11-50", title: "11-50" },
        { value: "51-200", title: "51-200" },
        { value: "201-500", title: "201-500" },
        { value: "500+", title: "500+" },
    ];

    const currencies = [
        { value: "USD", title: "USD" },
        { value: "CDF", title: "CDF" },
        { value: "EUR", title: "EUR" },
        { value: "XOF", title: "XOF" },
        { value: "XAF", title: "XAF" },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onChange?.(name, value); // Appeler le callback du parent
    };

    const handleSelectChange = (field, value) => {
        onChange?.(field, value); // Gestion des sélections
    };
    return (
        <div className="w-full lg:max-w-screen-sm">
            <div className="text-4xl font-bold leading-9 text-default-foreground text-left">Adresse</div>
            <div className="py-2 text-medium text-default-500 text-left">Ajouter une adresse pour votre entreprise</div>
            <form ref={ref} {...props} className={cn("grid grid-cols-12 flex-col gap-4 py-5", className)}>
                <Autocomplete
                    className="col-span-12"
                    {...inputProps}
                    onSelectionChange={(value) => handleSelectChange("country", value)}
                    defaultSelectedKey={formData.country}
                    defaultItems={countries}
                    label={"Pays"}
                    placeholder="Choisir le pays"
                    name="country"
                    size="lg"
                >
                    {countries.map((country) => (
                        <AutocompleteItem key={country.code} startContent={<Avatar alt="Argentina" className="w-6 h-6" src={`https://flagcdn.com/${country.code.toLowerCase()}.svg`} />}>
                            {country.name}
                        </AutocompleteItem>
                    ))}
                </Autocomplete>
                <Input defaultValue={formData.city || ""} onChange={handleInputChange} className="col-span-12" size="lg" label="Ville" name="city" placeholder="eg. Kinshasa" radius="sm" />
                <Input defaultValue={formData.address || ""} onChange={handleInputChange} className="col-span-12" size="lg" label="Adresse" name="address" placeholder="XXX, Avenue/Rue, Commune...." radius="sm" />
            </form>
        </div>
    );
});

AccountAdresseForm.displayName = "AccountAdresseForm";

export default AccountAdresseForm;
