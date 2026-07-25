import React, { useState } from "react";
import { Card, CardBody, Button, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner } from "@nextui-org/react";
import { FiDownload, FiDollarSign } from "react-icons/fi";
import { downloadPayslip } from "@/src/services/apis/payrollService";

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const STATUS_COLORS = {
    draft: "default",
    approved: "success",
    paid: "success",
    processing: "warning",
};

const STATUS_LABELS = {
    draft: "Brouillon",
    approved: "Approuvé",
    paid: "Payé",
    processing: "En cours",
};

export default function PayrollSection({ employeeId, paymentHistory }) {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [downloading, setDownloading] = useState(null);

    const { payslips = [], summary = {} } = paymentHistory || {};

    const handleDownload = async (payslipId) => {
        try {
            setDownloading(payslipId);
            await downloadPayslip(employeeId, payslipId);
        } catch (error) {
            console.error("Download error:", error);
        } finally {
            setDownloading(null);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("fr-CD", {
            style: "currency",
            currency: "CDF",
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    return (
        <Card className="mt-4">
            <CardBody>
                <div className="mb-6">
                    <h3 className="text-lg font-bold mb-4">Résumé des Paiements</h3>
                    <div className="grid grid-cols-4 gap-4">
                        <Card shadow="sm">
                            <CardBody className="text-center">
                                <p className="text-sm text-default-500">Total Paiements</p>
                                <p className="text-2xl font-bold">{summary.total_payments || 0}</p>
                            </CardBody>
                        </Card>
                        <Card shadow="sm">
                            <CardBody className="text-center">
                                <p className="text-sm text-default-500">Salaire Brut Total</p>
                                <p className="text-2xl font-bold text-success">{formatCurrency(summary.total_gross)}</p>
                            </CardBody>
                        </Card>
                        <Card shadow="sm">
                            <CardBody className="text-center">
                                <p className="text-sm text-default-500">Salaire Net Total</p>
                                <p className="text-2xl font-bold text-primary">{formatCurrency(summary.total_net)}</p>
                            </CardBody>
                        </Card>
                        <Card shadow="sm">
                            <CardBody className="text-center">
                                <p className="text-sm text-default-500">Total Déductions</p>
                                <p className="text-2xl font-bold text-danger">{formatCurrency(summary.total_deductions)}</p>
                            </CardBody>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Historique des Paiements</h3>
                </div>

                {payslips && payslips.length > 0 ? (
                    <Table aria-label="Historique des paiements">
                        <TableHeader>
                            <TableColumn>PÉRIODE</TableColumn>
                            <TableColumn>N° BULLETIN</TableColumn>
                            <TableColumn align="end">SALAIRE BRUT</TableColumn>
                            <TableColumn align="end">DÉDUCTIONS</TableColumn>
                            <TableColumn align="end">SALAIRE NET</TableColumn>
                            <TableColumn>DATE PAIEMENT</TableColumn>
                            <TableColumn align="center">ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {payslips.map((payslip) => (
                                <TableRow key={payslip.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-semibold">{payslip.payroll_period?.period_name}</p>
                                            <p className="text-xs text-default-400">
                                                {MONTHS[payslip.payroll_period?.month - 1]} {payslip.payroll_period?.year}
                                            </p>
                                            <Chip size="sm" color={STATUS_COLORS[payslip.status]} variant="flat">
                                                {STATUS_LABELS[payslip.status]}
                                            </Chip>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-sm">{payslip.payslip_number}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-success">{formatCurrency(payslip.gross_salary)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-danger">{formatCurrency(payslip.total_deductions)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-primary text-lg">{formatCurrency(payslip.net_salary)}</span>
                                    </TableCell>
                                    <TableCell>{payslip.payment_date ? new Date(payslip.payment_date).toLocaleDateString("fr-FR") : "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-center gap-2">
                                            <Button 
                                                size="sm" 
                                                color="danger" 
                                                variant="flat" 
                                                startContent={downloading === payslip.id ? <Spinner size="sm" color="danger" /> : <FiDownload />}
                                                onPress={() => handleDownload(payslip.id)}
                                                isDisabled={downloading === payslip.id || !payslip.pdf_url}
                                            >
                                                {downloading === payslip.id ? "Téléchargement..." : "Bulletin"}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-center text-default-400 py-8">Aucun historique de paiement</p>
                )}
            </CardBody>
        </Card>
    );
}
