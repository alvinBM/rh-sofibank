"use client";
import React, { useState } from "react";
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { IoDownloadOutline } from "react-icons/io5";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ExportData = ({ columns, fetchAllData, fileName = "export", pdfTitle = "Rapport", btnSize = "sm" }) => {
    const [loading, setLoading] = useState(false);

    const handleExport = async (format) => {
        Swal.fire({
            title: "Préparation de l'export",
            text: "Chargement des données en cours...",
            icon: "info",
            iconColor: "#0F766E",
            showConfirmButton: false,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        setLoading(true);
        try {
            const data = await fetchAllData();
            if (!data || data.length === 0) {
                Swal.fire("Erreur", "Aucune donnée à exporter !", "error");
                return;
            }

            const today = new Date();
            const formattedDate = today.toLocaleDateString("fr-FR").replace(/\//g, "_");
            const fullFileName = `${fileName}_${formattedDate}`;

            // Exclure la colonne "actions"
            const exportableColumns = columns.filter((col) => col.uid !== "actions");

            if (format === "csv") {
                exportCSV(data, fullFileName, exportableColumns);
            } else if (format === "excel") {
                exportExcel(data, fullFileName, exportableColumns);
            } else if (format === "pdf") {
                exportPDF(data, fullFileName, exportableColumns);
            }

            Swal.fire({
                title: "Export réussi",
                text: "Votre fichier a été généré avec succès.",
                icon: "success",
                iconColor: "#0F766E",
                confirmButtonColor: "#0F766E",
                confirmButtonText: "Fermer",
            });
        } catch (error) {
            Swal.fire("Erreur", "Une erreur est survenue lors de l'exportation.", "error");
            console.error("Erreur lors de l'exportation :", error);
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = (data, fullFileName, exportableColumns) => {
        const csvContent = [exportableColumns.map((col) => col.name).join(";"), ...data.map((row) => exportableColumns.map((col) => row[col.uid]).join(";"))].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${fullFileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportExcel = (data, fullFileName, exportableColumns) => {
        const worksheet = XLSX.utils.json_to_sheet(
            data.map((row) => {
                let formattedRow = {};
                exportableColumns.forEach((col) => (formattedRow[col.name] = row[col.uid]));
                return formattedRow;
            })
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${fullFileName}.xlsx`);
    };

    const exportPDF = (data, fullFileName, exportableColumns) => {
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString("fr-FR");

        doc.setFontSize(18);
        doc.text(pdfTitle, 14, 15);
        doc.setFontSize(12);
        doc.text(`Date d'exportation : ${today}`, 14, 25);

        const tableData = data.map((row) => exportableColumns.map((col) => row[col.uid]));

        doc.autoTable({
            startY: 30,
            head: [exportableColumns.map((col) => col.name)],
            body: tableData,
        });

        doc.save(`${fullFileName}.pdf`);
    };

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button color="default" startContent={<IoDownloadOutline size={20} />} size={btnSize}>
                    {loading ? "Chargement..." : "Exporter"}
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Options d'export">
                <DropdownItem key="excel" onPress={() => handleExport("excel")}>
                    Exporter en Excel
                </DropdownItem>
                <DropdownItem key="csv" onPress={() => handleExport("csv")}>
                    Exporter en CSV
                </DropdownItem>
                <DropdownItem key="pdf" onPress={() => handleExport("pdf")}>
                    Exporter en PDF
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
};

export default ExportData;
