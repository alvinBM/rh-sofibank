"use client";
import React from "react";
import { Card, CardBody, CardHeader, Divider, Spinner, Button, Chip } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchInvoiceById } from "@/src/services/apis/saleService";
import { formatCurrencyDecimal, formatDate } from "@/src/helpers/helpers";

const InvoiceDetail = ({ id }) => {
    const router = useRouter();

    const { data: invoice, isLoading, error } = useQuery({
        queryKey: ["invoice", id],
        queryFn: () => fetchInvoiceById(id),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col gap-3 justify-center items-center h-full bg-background rounded-xl p-10">
                <Spinner color="default" className="text-teal-500" size="lg" />
                <p className="text-default-500">Chargement des détails de la facture...</p>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="flex flex-col gap-3 justify-center items-center h-full bg-background rounded-xl p-10">
                <Icon icon="lucide:alert-circle" className="text-danger" width={48} />
                <p className="text-danger">Erreur lors du chargement de la facture</p>
                <Button onPress={() => router.back()} variant="flat">
                    Retour
                </Button>
            </div>
        );
    }

    const statusColorMap = {
        paid: "success",
        unpaid: "danger",
        partial: "warning",
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <Button
                    variant="light"
                    startContent={<Icon icon="lucide:arrow-left" width={20} />}
                    onPress={() => router.back()}
                >
                    Retour
                </Button>
                <div className="flex gap-2">
                    <Button
                        color="danger"
                        variant="flat"
                        startContent={<Icon icon="lucide:printer" width={20} />}
                    >
                        Imprimer
                    </Button>
                    <Button
                        color="danger"
                        startContent={<Icon icon="lucide:download" width={20} />}
                    >
                        Télécharger PDF
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col items-start gap-2 p-6">
                    <div className="flex justify-between w-full items-start">
                        <div>
                            <h1 className="text-2xl font-bold">Facture #{invoice.invoice_number}</h1>
                            <p className="text-default-500 mt-1">Date: {formatDate(invoice.created_at)}</p>
                        </div>
                        <Chip
                            className="capitalize"
                            color={statusColorMap[invoice.payment_status]}
                            size="lg"
                            variant="flat"
                        >
                            {invoice.payment_status === "paid" ? "Payée" : invoice.payment_status === "partial" ? "Partiellement payée" : "Impayée"}
                        </Chip>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <h3 className="text-sm font-semibold text-default-600 mb-2">INFORMATIONS CLIENT</h3>
                            <p className="font-semibold">{invoice.client_name || "Client inconnu"}</p>
                            {invoice.client_email && <p className="text-sm text-default-500">{invoice.client_email}</p>}
                            {invoice.client_phone && <p className="text-sm text-default-500">{invoice.client_phone}</p>}
                            {invoice.client_address && <p className="text-sm text-default-500 mt-1">{invoice.client_address}</p>}
                        </div>

                        <div className="text-left md:text-right">
                            <h3 className="text-sm font-semibold text-default-600 mb-2">INFORMATIONS DE PAIEMENT</h3>
                            <div className="space-y-1">
                                <div className="flex justify-between md:justify-end gap-4">
                                    <span className="text-default-500">Montant total:</span>
                                    <span className="font-semibold">{formatCurrencyDecimal(invoice.total_amount)}</span>
                                </div>
                                <div className="flex justify-between md:justify-end gap-4">
                                    <span className="text-default-500">Montant payé:</span>
                                    <span className="font-semibold text-success">{formatCurrencyDecimal(invoice.paid_amount || 0)}</span>
                                </div>
                                <div className="flex justify-between md:justify-end gap-4">
                                    <span className="text-default-500">Reste à payer:</span>
                                    <span className="font-semibold text-danger">{formatCurrencyDecimal(invoice.remaining_amount || invoice.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {invoice.items && invoice.items.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-semibold text-default-600 mb-4">DÉTAILS DE LA FACTURE</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-default-200">
                                            <th className="text-left py-3 px-2">Article</th>
                                            <th className="text-right py-3 px-2">Quantité</th>
                                            <th className="text-right py-3 px-2">Prix unitaire</th>
                                            <th className="text-right py-3 px-2">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.items.map((item, index) => (
                                            <tr key={index} className="border-b border-default-100">
                                                <td className="py-3 px-2">{item.name}</td>
                                                <td className="text-right py-3 px-2">{item.quantity}</td>
                                                <td className="text-right py-3 px-2">{formatCurrencyDecimal(item.unit_price)}</td>
                                                <td className="text-right py-3 px-2 font-semibold">{formatCurrencyDecimal(item.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {invoice.note && (
                        <div className="mt-6">
                            <h3 className="text-sm font-semibold text-default-600 mb-2">NOTES</h3>
                            <p className="text-default-500">{invoice.note}</p>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default InvoiceDetail;
