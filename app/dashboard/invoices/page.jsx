"use client";
import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem, Chip, User, Pagination, Spinner, useDisclosure } from "@nextui-org/react";
import { capitalize } from "@/src/lib/utils";
import { useRouter } from "next/navigation";
import api from "@/src/services/axios";
import qs from "qs";
import { useSelector } from "react-redux";
import Link from "next/link";
import AddClientModal from "@/app/ui/dashboard/forms/AddClientModal";
import AlertMessage from "@/app/ui/AlertMessage";
import { Icon } from "@iconify/react";
import { formatCurrencyDecimal, formatDate, formatDateFullText, formatDateText } from "@/src/helpers/helpers";
import { selectUserData } from "@/src/redux/slices/userSlice";
import { useGetInvoices } from "@/src/hooks/useInvoices";
import PayInvoiceFormModal from "@/app/ui/dashboard/forms/PayInvoiceFormModal";
import InvoicesTable from "@/app/ui/dashboard/invoices/InvoicesTable";

const Invoices = () => {
    const user = useSelector(selectUserData);
    const router = useRouter();

    return (
        <main className="flex w-full flex-col items-center">
            <div className="w-full max-w-100 px-0">
                <header className="mb-6 flex w-full items-start justify-between">
                    <div className="flex flex-col flex-1">
                        <h1 className="text-lg font-bold text-default-900 lg:text-3xl">Factures</h1>
                        <p className="text-small text-default-400">Gérer vos ventes et vos factures</p>
                    </div>
                    <Button onPress={() => router.push("/document/new?t=invoice")} className="bg-teal-700 text-background" startContent={<Icon className="flex-none text-background/60" icon="lucide:plus" width={16} />}>
                        Créer une facture
                    </Button>
                </header>
                <InvoicesTable />
            </div>
        </main>
    );
};

export default Invoices;
