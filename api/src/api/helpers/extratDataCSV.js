import Papa from "papaparse";
import fs from "fs";

export const parseCsvWithPapaParse = (filePath) => {
    try {
        const fileContent = fs.readFileSync(filePath, "utf-8");

        const result = Papa.parse(fileContent, {
            header: true, // Utiliser la première ligne comme en-têtes de colonnes
            skipEmptyLines: true, // Ignorer les lignes vides
            delimiter: ";", // Définir le délimiteur comme ";"
        });

        if (result.errors.length > 0) {
            console.error("Erreurs lors de l'analyse du fichier :", result.errors);
            throw new Error("Le fichier contient des erreurs.");
        }

        return { columns: result.meta.fields, data: result.data };
    } catch (error) {
        console.error("Erreur lors de l'analyse du fichier CSV :", error.message);
        throw new Error("Erreur lors de la lecture du fichier CSV.");
    }
};
