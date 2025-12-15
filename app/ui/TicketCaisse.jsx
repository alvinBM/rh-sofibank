// components/Ticket.js
"use client";
import { formatCurrencyDecimal, formatDateFullText, formatDateText, formatDateTime } from "@/src/helpers/helpers";
import { selectUserData } from "@/src/redux/slices/userSlice";
import React from "react";
import { useSelector } from "react-redux";

const TicketCaisse = React.forwardRef(function TicketCaisse({ products = [] }, ref) {
    const user = useSelector(selectUserData);
    const tva = user.account.tva;
    // Calcul d'un total global si besoin (pour les produits passés en prop)
    const totalGlobal = products.length ? products.reduce((acc, prod) => acc + prod.total, 0) : 25.0; // valeur par défaut
    const totalTva = totalGlobal * (tva / 100);
    const totalTtc = totalGlobal + totalTva;

    return (
        <div
            ref={ref}
            style={{
                width: "80mm",
                fontFamily: "monospace",
                margin: "20px auto",
                fontSize: "8px",
                padding: "10px",
            }}
        >
            <h2
                style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    textAlign: "center",
                    margin: "0",
                }}
            >
                SIRH
            </h2>
            <p style={{ textAlign: "center", margin: "0" }}>
                {user.main_store.city}, {user.main_store.address}
            </p>
            <p style={{ textAlign: "center", margin: "0" }}>{user.main_store.phone}</p>
            <p style={{ textAlign: "center", margin: "0" }}>Caissier : {user.firstname}</p>
            <p style={{ textAlign: "center", margin: "0" }}>Date : {formatDateTime(new Date().toLocaleString())}</p>
            <hr style={{ margin: "5px 0", borderStyle: "dashed" }} />
            <h2 style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center", margin: "0" }}>TICKET DE CAISSE</h2>
            <h2 style={{ fontSize: "14px", fontWeight: "bold", textAlign: "center", margin: "0" }}>N° 12321321</h2>
            <hr style={{ margin: "5px 0", borderStyle: "dashed" }} />

            {/* Tableau des produits */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px", marginTop: "20px" }}>
                <thead>
                    <tr>
                        <th style={{ borderBottom: "1px solid #000", textAlign: "left" }}>Article</th>
                        <th style={{ borderBottom: "1px solid #000", textAlign: "right", minWidth: "80px" }}>PU</th>
                        <th style={{ borderBottom: "1px solid #000", textAlign: "right", minWidth: "80px" }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? (
                        products.map((product, index) => (
                            <tr key={index}>
                                <td>
                                    {product.quantity} {product.designation}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    {formatCurrencyDecimal(product.price)}
                                    {user.account.main_currency}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    {formatCurrencyDecimal(product.total)}
                                    {user.account.main_currency}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <>
                            <tr>
                                <td>Article sajkdhsajkdas sajdhsaldas sahdlsad aslhdlkasd aslhdlask sadlas</td>
                                <td style={{ textAlign: "right" }}>10,00{user.account.main_currency}</td>
                                <td style={{ textAlign: "right" }}>10,00{user.account.main_currency}</td>
                            </tr>
                            <tr>
                                <td>Article saldjslakd salkdhjsalkd asdklhsald aslhdlsa saldhlsad asldhalsk</td>
                                <td style={{ textAlign: "right" }}>15,00{user.account.main_currency}</td>
                                <td style={{ textAlign: "right" }}>15,00{user.account.main_currency}</td>
                            </tr>
                        </>
                    )}
                </tbody>
            </table>

            <hr style={{ margin: "5px 0" }} />
            <p style={{ textAlign: "right", margin: "0" }}>
                Total HT : {formatCurrencyDecimal(totalGlobal)}
                {user.account.main_currency}
            </p>
            <p style={{ textAlign: "right", margin: "0" }}>
                TVA ({user.account.tva}%) : {formatCurrencyDecimal(totalTva)}
                {user.account.main_currency}
            </p>
            <p style={{ textAlign: "right", fontWeight: "bold", margin: "0" }}>
                Total : {formatCurrencyDecimal(totalTtc)}
                {user.account.main_currency}
            </p>
            {user.account.secondary_currency && (
                <p style={{ textAlign: "right", margin: "0" }}>
                    Total en {user.account.secondary_currency} : {formatCurrencyDecimal(totalTtc * user.account.exchange_rate)}
                    {user.account.secondary_currency}
                </p>
            )}

            <p style={{ textAlign: "center", margin: "0", marginTop: "20px" }}>{"Merci d'avoir effectué vos achats chez nous, n'hésitez pas à revenir"}</p>
        </div>
    );
});

export default TicketCaisse;
