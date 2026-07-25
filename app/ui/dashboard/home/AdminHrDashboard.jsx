"use client";

import React, { useMemo } from "react";
import { Button, Card, CardBody, CardHeader, Chip, Divider } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import StatTile from "./StatTile";
import { getAdminHrDashboardMock } from "@/src/mocks/dashboardMockData";
import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/src/constants/chartColors";

const STATUS_BREAKDOWN_COLORS = [STATUS_COLORS.good, CATEGORICAL_COLORS[0], STATUS_COLORS.warning, "#9ca3af"];

const formatDate = (isoDate) => new Date(isoDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

export default function AdminHrDashboard({ accessLevelLabel, isAdmin = false }) {
    const data = useMemo(() => getAdminHrDashboardMock(), []);
    const { kpis } = data;

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                    <h1 className="text-3xl font-bold">Tableau de Bord</h1>
                    <p className="text-default-500">
                        Vue d'ensemble RH — {accessLevelLabel} —{" "}
                        {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                </div>
                {/* <Chip color="warning" variant="flat" startContent={<Icon icon="solar:info-circle-linear" width={16} />}>
                    Données de démonstration
                </Chip> */}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatTile icon="solar:users-group-rounded-linear" label="Effectif Total" value={kpis.totalEmployees} hint={`Actifs : ${kpis.activeEmployees}`} tone="danger" />
                <StatTile icon="solar:user-plus-linear" label="Embauches (mois)" value={kpis.newHiresThisMonth} hint={`Sorties : ${kpis.exitsThisMonth}`} tone="success" />
                <StatTile icon="solar:graph-up-linear" label="Taux de Rotation" value={`${kpis.turnoverRate}%`} tone="secondary" />
                <StatTile icon="solar:clock-circle-linear" label="Présence Aujourd'hui" value={`${kpis.attendanceRateToday}%`} hint={`Absents : ${kpis.absentToday} · Retards : ${kpis.lateToday}`} tone="primary" />
                <StatTile icon="solar:calendar-add-linear" label="Congés en Attente" value={kpis.pendingLeaveRequests} hint={`Approuvés (mois) : ${kpis.approvedLeaveRequestsThisMonth}`} tone="warning" />
                <StatTile icon="solar:medal-star-linear" label="Score Éval. Moyen" value={`${kpis.averageEvaluationScore}/100`} tone="default" />
            </div>

            {/* Graphiques principaux */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Demandes de Congés par Mois ({new Date().getFullYear()})</h2>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.leaveRequestsByMonth} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} width={30} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="demandes" name="Demandes" fill={CATEGORICAL_COLORS[0]} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="approuvees" name="Approuvées" fill={CATEGORICAL_COLORS[1]} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Taux de Présence par Mois</h2>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.attendanceRateByMonth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                <YAxis domain={[80, 100]} tickLine={false} axisLine={false} width={30} unit="%" />
                                <Tooltip />
                                <Line type="monotone" dataKey="taux" name="Taux de présence" stroke={CATEGORICAL_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Employés par Direction</h2>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.employeesByDirection} layout="vertical" margin={{ left: 24 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={150} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="value" name="Employés" radius={[0, 4, 4, 0]}>
                                    {data.employeesByDirection.map((entry, index) => (
                                        <Cell key={entry.name} fill={CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Répartition par Statut</h2>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={data.employeesByStatus} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name} : ${entry.value}`} outerRadius={90} dataKey="value">
                                    {data.employeesByStatus.map((entry, index) => (
                                        <Cell key={entry.name} fill={STATUS_BREAKDOWN_COLORS[index % STATUS_BREAKDOWN_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
            </div>

            {/* Graphiques secondaires */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Répartition par Genre</h2>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={data.genderDistribution} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name} : ${entry.value}`} outerRadius={80} dataKey="value">
                                    {data.genderDistribution.map((entry, index) => (
                                        <Cell key={entry.name} fill={CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Répartition par Type de Contrat</h2>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={data.contractTypeDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                <YAxis tickLine={false} axisLine={false} width={30} />
                                <Tooltip />
                                <Bar dataKey="value" name="Employés" radius={[4, 4, 0, 0]}>
                                    {data.contractTypeDistribution.map((entry, index) => (
                                        <Cell key={entry.name} fill={CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Top Absentéisme par Direction</h2>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={data.topDepartmentsByAbsenteeism} layout="vertical" margin={{ left: 24 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" unit="%" tickLine={false} axisLine={false} />
                                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={140} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="rate" name="Taux d'absentéisme" fill={CATEGORICAL_COLORS[0]} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
            </div>

            {/* Activité récente & alertes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Activité Récente</h2>
                    </CardHeader>
                    <CardBody className="gap-0 divide-y divide-default-100">
                        {data.recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 py-3">
                                <div className="p-2 rounded-lg bg-danger-50 shrink-0">
                                    <Icon icon={activity.icon} className="text-danger-500 text-lg" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium">{activity.label}</p>
                                    <p className="text-sm text-default-500 truncate">{activity.meta}</p>
                                </div>
                                <p className="text-xs text-default-400 whitespace-nowrap">{activity.date}</p>
                            </div>
                        ))}
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Alertes</h2>
                    </CardHeader>
                    <CardBody className="gap-4">
                        <div>
                            <p className="text-sm font-semibold text-default-600 mb-2">Contrats arrivant à échéance ({data.alerts.contractsEndingSoon.length})</p>
                            <div className="flex flex-col gap-2">
                                {data.alerts.contractsEndingSoon.map((item) => (
                                    <div key={item.employee} className="flex items-center justify-between text-sm">
                                        <span className="truncate">{item.employee}</span>
                                        <Chip size="sm" color="warning" variant="flat">
                                            {formatDate(item.endDate)}
                                        </Chip>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Divider />
                        <div>
                            <p className="text-sm font-semibold text-default-600 mb-2">Fin de période d'essai ({data.alerts.probationEnding.length})</p>
                            <div className="flex flex-col gap-2">
                                {data.alerts.probationEnding.map((item) => (
                                    <div key={item.employee} className="flex items-center justify-between text-sm">
                                        <span className="truncate">{item.employee}</span>
                                        <Chip size="sm" color="secondary" variant="flat">
                                            {formatDate(item.endDate)}
                                        </Chip>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Divider />
                        <div className="flex items-center justify-between text-sm">
                            <span>Dossiers avec documents manquants</span>
                            <Chip size="sm" color="danger" variant="flat">
                                {data.alerts.missingDocuments}
                            </Chip>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Accès rapides */}
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold">Accès Rapides</h2>
                </CardHeader>
                <CardBody className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button color="danger" variant="flat" startContent={<Icon icon="mdi:account-plus" />} as="a" href="/dashboard/employees">
                        Gestion des Employés
                    </Button>
                    <Button color="danger" variant="flat" startContent={<Icon icon="mdi:calendar-clock" />} as="a" href="/dashboard/leave/requests">
                        Demandes de Congés
                    </Button>
                    <Button color="danger" variant="flat" startContent={<Icon icon="mdi:chart-box" />} as="a" href="/dashboard/reports/hr-dashboard">
                        Dashboard RH Détaillé
                    </Button>
                    {isAdmin && (
                        <Button color="danger" variant="flat" startContent={<Icon icon="mdi:cog" />} as="a" href="/dashboard/settings">
                            Paramètres
                        </Button>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
