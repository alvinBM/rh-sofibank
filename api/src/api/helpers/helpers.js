import randomstring from "randomstring";
import fs from "fs";
import axios from "axios";
import Posts from "../models/Posts.js";
import { Vonage } from "@vonage/server-sdk";
import { SMS } from "@vonage/messages";
import https from "https";
import Invoices from "../models/Invoices.js";
import PurchaseReceipts from "../models/PurchaseReceipts.js";
import { Op } from "sequelize";

const helpers = {
    createTokenValue: async () => {
        let token = randomstring.generate(20);
        return token;
    },
    dateFormat: () => {
        return formatDate("yyyy-MM-dd hh:mm:ss", new Date());
    },
    deleteFile: async (filePath) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(err);
            }
        });
    },
    serverError: async (res, error) => {
        console.log(error);
        return res.status(200).json({
            status: 500,
            message: "Un probléme est survenu lors de la connexion au serveur, Veuillez réessayer plus tard svp",
            message_fr: "Un probléme est survenu lors de la connexion au serveur, Veuillez réessayer plus tard svp",
        });
    },
    sendSms: async (telephone, message) => {
        let isSMSSent = false;
        let url = "https://api.bulksms.com:443/v1/messages";
        let data = {
            from: "Tezzou",
            to: telephone,
            body: message,
            encoding: "UNICODE",
            routingGroup: "PREMIUM",
        };
        let config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: process.env.BULKSMS_BASIC_AUTH,
            },
        };

        try {
            let result = await axios.post(url, data, config);
            if (result) {
                isSMSSent = true;
            }
        } catch (error) {
            console.error(error);
        }
        return isSMSSent;
    },
    sendSmsByNexmo: async (telephone, message) => {
        let isSMSSent = false;
        const vonage = new Vonage({
            apiKey: process.env.NEXMO_API_KEY,
            apiSecret: process.env.NEXMO_API_SECRET,
        });

        const from = "Stock243";
        const to = telephone;
        const text = message;

        await vonage.sms
            .send({ to: to, from, text })
            .then((resp) => {
                isSMSSent = true;
                console.log("*****Message sent successfully*****");
                console.log(resp);
            })
            .catch((err) => {
                console.log("**** NEXMO ERROR : There was an error sending the messages.****");
                console.error(err);
            });

        return isSMSSent;
    },
    sendSMSByBulkSMS: async (telephone, message) => {
        let postData = JSON.stringify({
            from: "stock243",
            to: [telephone],
            body: message,
        });

        let options = {
            hostname: "api.bulksms.com",
            port: 443,
            path: "/v1/messages",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": postData.length,
                Authorization: process.env.BULKSMS_BASIC_AUTH,
            },
        };

        let req = https.request(options, (resp) => {
            console.log("statusCode:", resp.statusCode);
            let data = "";
            resp.on("data", (chunk) => {
                data += chunk;
            });
            resp.on("end", () => {
                console.log("Response:", data);
            });
        });

        req.on("error", (e) => {
            console.error(e);
        });

        req.write(postData);
        req.end();
    },
    /** Generate a token by legnt */
    generateRandomToken: async (length) => {
        return randomstring.generate(length);
    },
    parseNumericValue: (value) => {
        if (!value) return 0; // Si la valeur est vide, retourne 0
        const sanitizedValue = value.replace(",", "."); // Remplace les virgules par des points
        return parseFloat(sanitizedValue) || 0; // Convertit en float ou retourne 0 si invalide
    },
    /**
     * gereate reference "${prefix}${acccount}-JJMMYYYY-"
     * @param {*} documentType
     * @param {*} accountId
     * @returns
     */
    generateReferenceDocument: async (document_type, accountId) => {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();
        let prefix = "DOC";
        let sequenceNumber = 0;
        let allowedTypes = ["invoice", "receipt", "pos"];

        mm = mm < 10 ? "0" + mm : mm;
        dd = dd < 10 ? "0" + dd : dd;

        const dateStr = `${yyyy}${mm}${dd}`;

        // Définir le début de la journée (00:00:00)
        const startOfDay = today.setHours(0, 0, 0, 0);

        // Définir la fin de la journée (23:59:59.999)
        const endOfDay = today.setHours(23, 59, 59, 999);

        if (!document_type || !allowedTypes.includes(document_type)) {
            return null;
        }

        if (document_type === "invoice" || document_type === "pos") {
            const nbInvoices = await Invoices.count({
                where: {
                    account_id: accountId,
                    status: 1,
                    created: {
                        [Op.between]: [startOfDay, endOfDay],
                    },
                },
            });
            sequenceNumber = nbInvoices + 1;
            prefix = document_type === "pos" ? "POS" : "INV";
        } else if (document_type === "receipt") {
            //recupere le nombre de bon d'achat faite aujourd'hui
            const nbReceipts = await PurchaseReceipts.count({
                where: {
                    account_id: accountId,
                    status: 1,
                    created: {
                        [Op.between]: [startOfDay, endOfDay],
                    },
                },
            });
            sequenceNumber = nbReceipts + 1;
            prefix = "ACH";
        }

        // Si le numéro est inférieur à 10000, on l'affiche avec un padding de 4 chiffres
        let sequenceStr;
        if (sequenceNumber < 10000) {
            sequenceStr = sequenceNumber.toString().padStart(4, "0");
        } else {
            sequenceStr = sequenceNumber.toString();
        }

        return `${prefix}${accountId}-${dateStr}-${sequenceStr}`;
    },
};

export default helpers;
