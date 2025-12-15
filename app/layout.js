import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "SIRH SOFIBANQUE",
    description: "Application de gestion des SIRH SOFIBANQUE et des chefs coutumiers en République Démocratique du Congo.",
    image: "/logo.jpg",
    url: "https://sofibanque.com",
    type: "website",
    siteName: "SIRH SOFIBANQUE",
    locale: "fr_FR",
};

export default function RootLayout({ children }) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
