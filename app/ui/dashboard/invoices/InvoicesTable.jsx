"use client";
import React, { useState, useMemo, useCallback } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    Chip,
    Pagination,
    Spinner,
    useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { formatCurrencyDecimal, formatDate } from "@/src/helpers/helpers";
import { useGetInvoices } from "@/src/hooks/useInvoices";
import PayInvoiceFormModal from "../forms/PayInvoiceFormModal";

const statusColorMap = {
    paid: "success",
    unpaid: "danger",
    partial: "warning",
};

const InvoicesTable = () => {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const { data, isLoading, error } = useGetInvoices({
        page,
        rowsPerPage,
        query: searchQuery,
    });

    const invoices = data?.invoices || [];
    const total = data?.total || 0;
    const pages = Math.ceil(total / rowsPerPage);

    const handlePayment = useCallback(
        (invoice) => {
            setSelectedInvoice(invoice);
            onOpen();
        },
        [onOpen]
    );

    const handlePaymentResult = (result) => {
        if (result?.success) {
            console.log("Payment processed:", result.data);
        }
    };

    const columns = [
        { key: "invoice_number", label: "N° FACTURE" },
        { key: "client", label: "CLIENT" },
        { key: "date", label: "DATE" },
        { key: "amount", label: "MONTANT" },
        { key: "status", label: "STATUT" },
        { key: "actions", label: "ACTIONS" },
    ];

    const renderCell = useCallback(
        (invoice, columnKey) => {
            switch (columnKey) {
                case "invoice_number":
                    return <span className="font-semibold">{invoice.invoice_number || "-"}</span>;
                case "client":
                    return <span>{invoice.client_name || "Client inconnu"}</span>;
                case "date":
                    return <span>{formatDate(invoice.created_at)}</span>;
                case "amount":
                    return <span className="font-semibold">{formatCurrencyDecimal(invoice.total_amount)}</span>;
                case "status":
                    return (
                        <Chip className="capitalize" color={statusColorMap[invoice.payment_status]} size="sm" variant="flat">
                            {invoice.payment_status === "paid" ? "Payée" : invoice.payment_status === "partial" ? "Partiel" : "Impayée"}
                        </Chip>
                    );
                case "actions":
                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                onPress={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                            >
                                <Icon icon="lucide:eye" width={18} />
                            </Button>
                            {invoice.payment_status !== "paid" && (
                                <Button
                                    size="sm"
                                    variant="light"
                                    color="success"
                                    isIconOnly
                                    onPress={() => handlePayment(invoice)}
                                >
                                    <Icon icon="lucide:credit-card" width={18} />
                                </Button>
                            )}
                        </div>
                    );
                default:
                    return "-";
            }
        },
        [router, handlePayment]
    );

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Rechercher une facture..."
                        startContent={<Icon icon="lucide:search" />}
                        value={searchQuery}
                        onClear={() => setSearchQuery("")}
                        onValueChange={setSearchQuery}
                    />
                </div>
            </div>
        );
    }, [searchQuery]);

    const bottomContent = useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="text-small text-default-400">
                    Total: {total} facture{total > 1 ? "s" : ""}
                </span>
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                />
            </div>
        );
    }, [page, pages, total]);

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-danger">Erreur lors du chargement des factures</p>
            </div>
        );
    }

    return (
        <>
            <Table
                aria-label="Table des factures"
                topContent={topContent}
                bottomContent={bottomContent}
                classNames={{
                    wrapper: "min-h-[400px]",
                }}
            >
                <TableHeader columns={columns}>
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody
                    items={invoices}
                    isLoading={isLoading}
                    loadingContent={<Spinner />}
                    emptyContent={
                        <div className="text-center py-10">
                            <p className="text-default-400">Aucune facture trouvée</p>
                        </div>
                    }
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {selectedInvoice && (
                <PayInvoiceFormModal
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    invoice={selectedInvoice}
                    onSubmitResult={handlePaymentResult}
                />
            )}
        </>
    );
};

export default InvoicesTable;
