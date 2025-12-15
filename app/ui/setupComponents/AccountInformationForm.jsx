"use client";

import React from "react";
import { Input, Checkbox, Link, Select, SelectItem, Avatar, Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { cn } from "@nextui-org/react";
import companyIndustries from "./company-industries";
import countries from "@/src/constants/countries";
import currencies from "@/src/constants/currencies";

const AccountInformationForm = React.forwardRef(({ className, onChange, formData, ...props }, ref) => {
    const inputProps = {
        labelPlacement: "inside",
        size: "lg",
        classNames: {
            label: "text-small font-medium text-default-700 group-data-[filled-within=true]:text-default-700",
        },
    };

    const nbEmployees = [
        { value: "1", title: "1" },
        { value: "2-10", title: "2-10" },
        { value: "11-50", title: "11-50" },
        { value: "51-200", title: "51-200" },
        { value: "201-500", title: "201-500" },
        { value: "500+", title: "500+" },
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
            <div className="text-4xl font-bold leading-9 text-default-foreground text-left">{"Information de l'entreprise"}</div>
            <div className="py-2 text-medium text-default-500 text-left">Commencez par fournir les informations de base de votre entreprise.</div>
            <form ref={ref} {...props} className={cn("grid grid-cols-12 flex-col gap-4 py-5", className)}>
                <Select
                    onSelectionChange={(value) => handleSelectChange("nbEmployees", value)}
                    defaultSelectedKeys={[formData.nbEmployees ? Array.from(formData.nbEmployees)[0] : ""]}
                    className="col-span-12"
                    items={nbEmployees}
                    label="Nombre d'employés"
                    name="nbEmployees"
                    placeholder=""
                    {...inputProps}
                >
                    {(item) => <SelectItem key={item.value}>{item.title}</SelectItem>}
                </Select>

                <Autocomplete
                    defaultSelectedKey={formData.primaryCurrency}
                    onSelectionChange={(value) => handleSelectChange("primaryCurrency", value)}
                    className="col-span-12"
                    defaultItems={currencies}
                    label={"Devise principal"}
                    name="primaryCurrency"
                    placeholder=""
                    {...inputProps}
                >
                    {currencies.map((currency) => (
                        <AutocompleteItem key={currency.code} startContent={<Avatar alt="Argentina" className="w-6 h-6" src={`https://flagcdn.com/${currency.code_country.toLowerCase()}.svg`} />}>
                            {`${currency.name_fr} - ${currency.code}`}
                        </AutocompleteItem>
                    ))}
                </Autocomplete>
            </form>
        </div>
    );
});

AccountInformationForm.displayName = "AccountInformationForm";

export default AccountInformationForm;
