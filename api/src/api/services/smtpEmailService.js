import dotenv from "dotenv";

import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SUPPORT_HOST,
    port: process.env.SMTP_SUPPORT_PORT,
    secure: process.env.SMTP_SUPPORT_PORT == 465, // SSL si port 465
    auth: {
        user: process.env.FROM_SUPPORT_EMAIL,
        pass: process.env.SMTP_SUPPORT_PASSWORD,
    },
});

// Configuration des templates Handlebars
transporter.use(
    "compile",
    hbs({
        viewEngine: {
            extName: ".hbs",
            partialsDir: path.resolve("src/views/emailTemplates"),
            defaultLayout: false,
        },
        viewPath: path.resolve("src/views/emailTemplates"),
        extName: ".hbs",
    })
);

export const sendInvoiceEmail = async (to, clientName, amount, date, invoiceLink, attachments = []) => {
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to,
        subject: "Votre facture",
        template: "invoice",
        context: { clientName, amount, date, invoiceLink },
        // attachments: attachments.map((filePath) => ({ path: filePath })),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email envoyé à ${to}`);
    } catch (error) {
        console.error("Erreur d'envoi d'email:", error);
    }
};
