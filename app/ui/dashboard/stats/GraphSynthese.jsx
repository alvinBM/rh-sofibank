"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Chip, Card, cn, Tab, Tabs, Spacer, CardHeader, Spinner } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSelector } from "react-redux";
import { selectUserData } from "@/src/redux/slices/userSlice";
import { formatCurrencyDecimal, formatDate, formatDateMonthYear, formatDateText, formatDateToSend } from "@/src/helpers/helpers";
import api from "@/src/services/axios";

// Data sample organisées par filtre
// const data = {
//     "10-days": [
//         { key: "sales", title: "Ventes", values: generateLast10Days() },
//         { key: "purchases", title: "Achats", values: generateLast10Days() },
//         { key: "profits", title: "Bénéfices nets", values: generateLast10Days() },
//     ],
//     "12-months": [
//         { key: "sales", title: "Ventes", values: generateLast12Months() },
//         { key: "purchases", title: "Achats", values: generateLast12Months() },
//         { key: "profits", title: "Bénéfices nets", values: generateLast12Months() },
//     ],
// };

// // Fonction pour générer les 10 derniers jours
// function generateLast10Days() {
//     const today = new Date();
//     return Array.from({ length: 10 }, (_, i) => {
//         const date = new Date(today);
//         date.setDate(today.getDate() - (9 - i));
//         return { date: date.toISOString().split("T")[0], value: Math.floor(Math.random() * 100000) + 10000 };
//     });
// }

// // Fonction pour générer les 12 derniers mois
// function generateLast12Months() {
//     const currentMonth = new Date().getMonth();
//     const currentYear = new Date().getFullYear();
//     return Array.from({ length: 12 }, (_, i) => {
//         const month = new Date(currentYear, currentMonth - (11 - i));
//         return {
//             month: new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" }).format(month),
//             value: Math.floor(Math.random() * 1000000) + 100000,
//         };
//     });
// }

// Couleurs par statistique
const chartColors = {
    sales: "success",
    purchases: "primary",
    profits: "warning",
};

export default function GraphSynthese() {
    const user = useSelector(selectUserData);
    const [filter, setFilter] = useState("10-days"); // Filtre actif
    const [activeChart, setActiveChart] = useState("sales"); // Statistique active
    const [hoveredValues, setHoveredValues] = useState({ sales: null, purchases: null, profits: null }); // Valeurs survolées
    const [hoveredDate, setHoveredDate] = useState({ sales: null, purchases: null, profits: null }); // Date survolée
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [data, setData] = useState(null);

    useEffect(() => {
        loadStatsData();
    }, [selectedDate]);

    const loadStatsData = async () => {
        try {
            const { data: response } = await api.get(`/reports/salesPurchasesProfitsStats?date=${formatDateToSend(selectedDate)}`);
            if (response.status === 200) {
                setData(response.data);
            } else {
                setError({ type: "danger", message: response.message });
            }
            console.log("response stats *** ", response);
        } catch (error) {
            setError({
                type: "danger",
                message: error.message || "Une erreur est survenue lors du chargement des statistiques",
            });
        } finally {
            setLoading(false);
        }
    };

    // Données actives selon le filtre et la statistique
    const activeChartData = useMemo(() => {
        if (data == null) return [];
        return data[filter].map((chart) => {
            const currentValue = chart.values[chart.values.length - 1]?.value; // Dernière valeur par défaut
            const currentDate = filter === "10-days" ? chart.values[chart.values.length - 1]?.date : chart.values[chart.values.length - 1]?.month; // Dernière date par défaut
            return { ...chart, currentValue, currentDate, color: activeChart === "sales" ? "success" : activeChart === "profits" ? "warning" : "default" };
        });
    }, [filter, data]);

    const currentActiveData = useMemo(() => activeChartData.find((chart) => chart.key === activeChart), [activeChartData, activeChart]);

    const handleMouseOver = (key, value, date) => {
        // Vérifiez si la nouvelle valeur est différente avant de mettre à jour l'état
        setHoveredValues((prev) => {
            if (prev[key] !== value) {
                return { ...prev, [key]: value };
            }
            return prev;
        });

        setHoveredDate((prev) => {
            if (prev[key] !== date) {
                return { ...prev, [key]: date };
            }
            return prev;
        });
    };

    return (
        <Card as="dl" className="border relative border-transparent dark:border-default-100 min-h-[520px] shadow-none">
            <CardHeader className="border-b border-default-100">
                <h3 className="text-lg font-semibold text-default-900">Statistiques Hors Taxes</h3>
            </CardHeader>
            {data && !loading && !error && (
                <section className="flex flex-col flex-nowrap">
                    <div className="flex flex-col justify-between gap-y-2 p-3">
                        <div className="flex flex-col gap-y-2">
                            <Tabs size="sm" selectedKey={filter} onSelectionChange={setFilter}>
                                <Tab key="10-days" title="10 derniers jours" />
                                <Tab key="12-months" title="12 derniers mois" />
                            </Tabs>
                            <div className="mt-2 flex w-full items-center">
                                <div className="-my-3 flex w-full items-center gap-x-3 overflow-x-auto py-3">
                                    {activeChartData.map(({ key, title, currentValue, currentDate }) => (
                                        <button
                                            key={key}
                                            className={cn("flex w-full flex-col gap-0 rounded-medium p-3 transition-colors text-left", {
                                                "bg-default-100": activeChart === key,
                                            })}
                                            onClick={() => setActiveChart(key)}
                                        >
                                            <span
                                                className={`text-${chartColors[key]}-500 text-small font-medium`}
                                                // className={cn("text-small font-medium text-default-500 transition-colors", {
                                                //     "text-primary-500" : activeChart === key,
                                                // })}
                                            >
                                                {title}
                                            </span>
                                            <div className="flex items-center gap-x-3">
                                                <span className="text-medium font-bold text-foreground">{formatValue(hoveredValues[key] ?? currentValue, "number")}</span> <span>{user.account.main_currency}</span>
                                            </div>
                                            <small className="text-default-500">{filter == "10-days" ? formatDateText(hoveredDate[key] ?? currentDate) : formatDateMonthYear(new Date(hoveredDate[key] ?? currentDate))}</small>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <ResponsiveContainer className="min-h-[295px] p-3 [&_.recharts-surface]:outline-none" height="100%" width="100%">
                        <AreaChart
                            accessibilityLayer
                            data={currentActiveData.values}
                            height={300}
                            margin={{
                                left: 0,
                                right: 0,
                            }}
                            width={500}
                            onMouseLeave={() => handleMouseOver(activeChart, null, null)}
                        >
                            <defs>
                                <linearGradient id="colorGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="10%" stopColor={`hsl(var(--nextui-${chartColors[activeChart]}-500))`} stopOpacity={0.8} />

                                    <stop offset="100%" stopColor={`hsl(var(--nextui-${chartColors[activeChart]}-100))`} stopOpacity={0.5} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid horizontalCoordinatesGenerator={() => [200, 150, 100, 50]} stroke="hsl(var(--nextui-default-200))" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey={filter === "10-days" ? "date" : "month"} axisLine={false} style={{ fontSize: "var(--nextui-font-size-tiny)", transform: "translateY(10px)" }} tickLine={false} />
                            <YAxis tickFormatter={(value) => formatValue(value, "number")} axisLine={false} style={{ fontSize: "var(--nextui-font-size-tiny)", transform: "translateX(-10px)" }} tickLine={false} />
                            <Tooltip
                                content={({ payload }) => {
                                    if (payload && payload.length > 0) {
                                        handleMouseOver(activeChart, payload[0].value, filter === "10-days" ? payload[0].payload.date : payload[0].payload.month);
                                        return (
                                            <div className="flex h-auto min-w-[120px] items-center gap-x-2 rounded-medium bg-foreground p-2 text-tiny shadow-small">
                                                <div className="flex w-full flex-col gap-y-0">
                                                    <div className="p-2 bg-foreground rounded shadow-md">
                                                        <p className="text-sm text-background">{filter === "10-days" ? payload[0].payload.date : payload[0].payload.month}</p>
                                                        <p className="text-sm text-background">
                                                            {formatValue(payload[0].value, "number")} {user.account.main_currency}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={`hsl(var(--nextui-${chartColors[activeChart]}-500))`}
                                fill="url(#colorGradient)"
                                strokeWidth={2}
                                activeDot={{
                                    stroke: `hsl(var(--nextui-${chartColors[activeChart]}-700))`,
                                    strokeWidth: 2,
                                    fill: "white",
                                    r: 5,
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </section>
            )}

            {loading && (
                <section className="flex flex-col items-center justify-center flex-nowrap min-h-96">
                    <Spinner size="lg" />
                    <p>Chargement des statistiques...</p>
                </section>
            )}

            {!loading && error && (
                <section className="flex flex-col items-center justify-center flex-nowrap min-h-96 text-danger-400">
                    <Icon icon="oui:stats" width={50} />
                    <p>{error.message}</p>
                </section>
            )}
        </Card>
    );
}

// Utilitaires
function formatValue(value, type) {
    if (type === "number") {
        if (value >= 1000000) return formatCurrencyDecimal(value / 1000) + "K";
        // if (value >= 1000) return (value / 1000).toFixed(2) + "k";
        return formatCurrencyDecimal(value);
    }
    return value;
}
