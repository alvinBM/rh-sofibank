"use client";

import React, { useMemo } from "react";
import { Avatar, Button, Card, CardBody, CardHeader, Chip, Divider, Progress } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from "@fullcalendar/core/locales/fr";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "react-toastify";

import StatTile from "./StatTile";
import { getEmployeeDashboardMock, getUpcomingHolidays, getRdcPublicHolidays } from "@/src/mocks/dashboardMockData";
import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/src/constants/chartColors";

const LEAVE_STATUS_LABELS = {
    draft: "Brouillon",
    submitted: "En attente",
    approved: "Approuvé",
    rejected: "Rejeté",
    cancelled: "Annulé",
};

const LEAVE_STATUS_COLORS = {
    draft: "default",
    submitted: "warning",
    approved: "success",
    rejected: "danger",
    cancelled: "default",
};

const SEVERITY_STYLES = {
    warning: { bg: "bg-warning-50", text: "text-warning-600" },
    primary: { bg: "bg-primary-50", text: "text-primary-600" },
    success: { bg: "bg-success-50", text: "text-success-600" },
    default: { bg: "bg-default-100", text: "text-default-600" },
};

const formatDate = (isoDate) => new Date(isoDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
const formatShortDate = (isoDate) => new Date(isoDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
const formatCurrency = (value, currency) => `${new Intl.NumberFormat("fr-FR").format(value)} ${currency}`;

export default function EmployeeDashboard({ user }) {
    const data = useMemo(() => getEmployeeDashboardMock(user), [user]);
    const currentYear = new Date().getFullYear();
    const upcomingHolidays = useMemo(() => getUpcomingHolidays(new Date(), 4), []);

    const calendarEvents = useMemo(() => {
        const holidayEvents = [...getRdcPublicHolidays(currentYear), ...getRdcPublicHolidays(currentYear + 1)].map((holiday) => ({
            title: holiday.name,
            date: holiday.date,
            display: "block",
            backgroundColor: CATEGORICAL_COLORS[6],
            borderColor: CATEGORICAL_COLORS[6],
        }));

        const leaveEvents = data.personalLeaveDays.map((leaveDay) => ({
            title: leaveDay.type,
            date: leaveDay.date,
            display: "block",
            backgroundColor: CATEGORICAL_COLORS[0],
            borderColor: CATEGORICAL_COLORS[0],
        }));

        return [...holidayEvents, ...leaveEvents];
    }, [data, currentYear]);

    const handleDownloadPayslip = () => {
        toast.info("Le téléchargement des bulletins de paie sera bientôt disponible.");
    };

    return (
        <div className="w-full flex flex-col gap-6">
            {/* En-tête */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-4">
                    <Avatar src={data.employee.photo} size="lg" name={`${data.employee.firstName?.[0] ?? ""}${data.employee.lastName?.[0] ?? ""}`} />
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Bonjour, {data.employee.firstName}</h1>
                        <p className="text-default-500">
                            {data.employee.position} — {data.employee.department}
                        </p>
                    </div>
                </div>
                {/* <Chip color="warning" variant="flat" startContent={<Icon icon="solar:info-circle-linear" width={16} />}>
                    Données de démonstration
                </Chip> */}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatTile icon="solar:calendar-mark-linear" label="Solde de Congés" value={`${data.totalLeaveRemaining} j`} hint="Tous types confondus" tone="danger" />
                <StatTile
                    icon="solar:clock-circle-linear"
                    label="Taux de Présence (mois)"
                    value={`${data.attendanceThisMonth.rate}%`}
                    hint={`${data.attendanceThisMonth.present + data.attendanceThisMonth.late}/${data.attendanceThisMonth.workingDays} jours`}
                    tone="success"
                />
                <StatTile icon="solar:case-linear" label="Jours Travaillés (mois)" value={data.attendanceThisMonth.present + data.attendanceThisMonth.late} tone="primary" />
                <StatTile icon="solar:bell-linear" label="Actions en Attente" value={data.pendingActions.length} tone="warning" />
            </div>

            {/* Accès rapides */}
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold">Accès Rapides</h2>
                </CardHeader>
                <CardBody className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button color="danger" variant="flat" startContent={<Icon icon="solar:user-circle-linear" />} as="a" href="/dashboard/ess/profile">
                        Mon Profil
                    </Button>
                    <Button color="danger" variant="flat" startContent={<Icon icon="solar:calendar-add-linear" />} as="a" href="/dashboard/ess/profile">
                        Nouvelle Demande de Congé
                    </Button>
                    <Button color="danger" variant="flat" startContent={<Icon icon="solar:file-text-linear" />} as="a" href="/dashboard/ess/documents">
                        Mes Documents & Fiches de Paie
                    </Button>
                    <Button color="danger" variant="flat" startContent={<Icon icon="solar:bell-linear" />} as="a" href="/dashboard/ess/announcements">
                        Annonces Internes
                    </Button>
                </CardBody>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Calendrier */}
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h2 className="text-lg font-semibold">Mon Calendrier</h2>
                            <div className="flex items-center gap-4 text-xs text-default-500">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: CATEGORICAL_COLORS[6] }} />
                                    Jours fériés (RDC)
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: CATEGORICAL_COLORS[0] }} />
                                    Mes congés
                                </span>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" locale={frLocale} height="auto" headerToolbar={{ left: "prev,next today", center: "title", right: "" }} events={calendarEvents} />
                        </CardBody>
                    </Card>

                    {/* Présence par mois */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">Présence & Absences par Mois ({currentYear})</h2>
                        </CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={data.attendanceByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                    <YAxis tickLine={false} axisLine={false} width={30} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="present" name="Présent" stackId="a" fill={STATUS_COLORS.good} />
                                    <Bar dataKey="late" name="Retard" stackId="a" fill={STATUS_COLORS.warning} />
                                    <Bar dataKey="absent" name="Absent" stackId="a" fill={STATUS_COLORS.critical} />
                                    <Bar dataKey="conge" name="Congé" stackId="a" fill={CATEGORICAL_COLORS[0]} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>

                    {/* Taux de présence par an */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">Évolution du Taux de Présence par An</h2>
                        </CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={data.attendanceRateByYear}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="year" tickLine={false} axisLine={false} />
                                    <YAxis domain={[80, 100]} unit="%" tickLine={false} axisLine={false} width={30} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="rate" name="Taux de présence" stroke={CATEGORICAL_COLORS[0]} strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Solde de congés */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">Solde de Congés</h2>
                        </CardHeader>
                        <CardBody className="gap-4">
                            {data.leaveBalances.map((balance) => (
                                <div key={balance.type}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">{balance.type}</span>
                                        <span className="text-default-500">
                                            {balance.remaining}/{balance.allocated} j restants
                                        </span>
                                    </div>
                                    <Progress value={(balance.used / balance.allocated) * 100} color="danger" size="sm" />
                                </div>
                            ))}
                        </CardBody>
                    </Card>

                    {/* Fiche de paie */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">Ma Fiche de Paie</h2>
                        </CardHeader>
                        <CardBody className="gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-default-500 text-sm">Période</span>
                                <span className="font-semibold">{data.lastPayslip.period}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-default-500 text-sm">Net à payer</span>
                                <span className="font-bold text-lg text-danger">{formatCurrency(data.lastPayslip.netAmount, data.lastPayslip.currency)}</span>
                            </div>
                            <Divider />
                            <Button color="danger" variant="flat" fullWidth startContent={<Icon icon="solar:download-minimalistic-linear" />} onPress={handleDownloadPayslip}>
                                Télécharger le Bulletin
                            </Button>
                        </CardBody>
                    </Card>

                    {/* Prochains jours fériés */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">Prochains Jours Fériés</h2>
                        </CardHeader>
                        <CardBody className="gap-3">
                            {upcomingHolidays.map((holiday) => (
                                <div key={holiday.date} className="flex items-center justify-between text-sm gap-2">
                                    <span className="truncate">{holiday.name}</span>
                                    <Chip size="sm" variant="flat" className="shrink-0">
                                        {formatShortDate(holiday.date)}
                                    </Chip>
                                </div>
                            ))}
                        </CardBody>
                    </Card>

                    {/* Actions à faire */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">Mes Actions à Faire</h2>
                        </CardHeader>
                        <CardBody className="gap-0 divide-y divide-default-100">
                            {data.pendingActions.map((action) => {
                                const styles = SEVERITY_STYLES[action.severity] || SEVERITY_STYLES.default;
                                return (
                                    <a key={action.id} href={action.href} className="flex items-start gap-3 py-3 hover:opacity-80 transition-opacity">
                                        <div className={`p-2 rounded-lg shrink-0 ${styles.bg}`}>
                                            <Icon icon={action.icon} className={`text-lg ${styles.text}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm">{action.label}</p>
                                            <p className="text-xs text-default-500">{action.description}</p>
                                        </div>
                                    </a>
                                );
                            })}
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Dernières demandes de congé */}
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold">Mes Dernières Demandes de Congé</h2>
                </CardHeader>
                <CardBody className="gap-0 divide-y divide-default-100">
                    {data.recentLeaveRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between py-3 text-sm">
                            <div>
                                <p className="font-medium">{request.type}</p>
                                <p className="text-default-500">
                                    {formatDate(request.start)} - {formatDate(request.end)} ({request.days} j)
                                </p>
                            </div>
                            <Chip size="sm" color={LEAVE_STATUS_COLORS[request.status]} variant="flat">
                                {LEAVE_STATUS_LABELS[request.status]}
                            </Chip>
                        </div>
                    ))}
                </CardBody>
            </Card>
        </div>
    );
}
