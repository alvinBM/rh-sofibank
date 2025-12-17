"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import { Button, Card, CardBody, CardHeader, Chip, Spinner } from "@nextui-org/react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { selectUserData } from "@/src/redux/slices/userSlice";
import { fetchDashboardStats } from "@/src/services/apis/dashboardService";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Dashboard = () => {
    const user = useSelector(selectUserData);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        pendingLeaveRequests: 0,
        approvedLeaveRequests: 0,
        employeesByDirection: [],
        employeesByStatus: [],
        leaveRequestsByMonth: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Loading dashboard stats...");
        loadDashboardStats();
    }, [user]);

    const loadDashboardStats = async () => {
        try {
            setLoading(true);

            const response = await fetchDashboardStats();

            console.log("Dashboard stats response **** :", response.success);

            setStats({
                totalEmployees: response.data.totalEmployees || 0,
                activeEmployees: response.data.activeEmployees || 0,
                pendingLeaveRequests: response.data.pendingLeaveRequests || 0,
                approvedLeaveRequests: response.data.approvedLeaveRequests || 0,
                employeesByDirection: response.data.employeesByDirection || [],
                employeesByStatus: response.data.employeesByStatus || [],
                leaveRequestsByMonth: response.data.leaveRequestsByMonth || [],
            });
        } catch (error) {
            console.log("Error loading dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" label="Chargement du tableau de bord..." />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-6 p-6">
            <p>{JSON.stringify(stats)}</p>
            <div>
                <h1 className="text-3xl font-bold">Tableau de Bord</h1>
                <p className="text-default-500">
                    Bienvenue, {user?.employee?.first_name} {user?.employee?.last_name} ({user?.employee?.employee_number})
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardBody className="flex flex-row items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                            <Icon icon="mdi:account-group" className="text-primary text-3xl" />
                        </div>
                        <div>
                            <p className="text-sm text-default-500">Total Employés</p>
                            <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="flex flex-row items-center gap-4">
                        <div className="p-3 rounded-lg bg-success/10">
                            <Icon icon="mdi:account-check" className="text-success text-3xl" />
                        </div>
                        <div>
                            <p className="text-sm text-default-500">Employés Actifs</p>
                            <p className="text-2xl font-bold">{stats.activeEmployees}</p>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="flex flex-row items-center gap-4">
                        <div className="p-3 rounded-lg bg-warning/10">
                            <Icon icon="mdi:clock-alert" className="text-warning text-3xl" />
                        </div>
                        <div>
                            <p className="text-sm text-default-500">Congés en attente</p>
                            <p className="text-2xl font-bold">{stats.pendingLeaveRequests}</p>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="flex flex-row items-center gap-4">
                        <div className="p-3 rounded-lg bg-success/10">
                            <Icon icon="mdi:check-circle" className="text-success text-3xl" />
                        </div>
                        <div>
                            <p className="text-sm text-default-500">Congés approuvés</p>
                            <p className="text-2xl font-bold">{stats.approvedLeaveRequests}</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Demandes de congés par mois ({new Date().getFullYear()})</h2>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.leaveRequestsByMonth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="demandes" fill="#0088FE" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Employés par Direction</h2>
                    </CardHeader>
                    <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={stats.employeesByDirection} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                                    {stats.employeesByDirection.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
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
                                <Pie data={stats.employeesByStatus} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                                    {stats.employeesByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Accès rapides</h2>
                    </CardHeader>
                    <CardBody className="flex flex-col gap-3">
                        <Button color="primary" variant="flat" startContent={<Icon icon="mdi:account-plus" />} as="a" href="/dashboard/employees">
                            Gestion des Employés
                        </Button>
                        <Button color="primary" variant="flat" startContent={<Icon icon="mdi:calendar-clock" />} as="a" href="/dashboard/leave/requests">
                            Demandes de Congés
                        </Button>
                        <Button color="primary" variant="flat" startContent={<Icon icon="mdi:chart-box" />} as="a" href="/dashboard/reports">
                            Rapports
                        </Button>
                        <Button color="primary" variant="flat" startContent={<Icon icon="mdi:cog" />} as="a" href="/dashboard/settings">
                            Paramètres
                        </Button>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
