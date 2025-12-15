"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import { Button, Card, CardBody, CardHeader, Chip, Spinner } from "@nextui-org/react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { selectUserData } from "@/src/redux/slices/userSlice";
import { supabase } from "@/src/lib/supabase-client";

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
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      const { count: activeEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('employment_status', 'active');

      const { count: pendingLeaveRequests } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending_backup', 'pending_supervisor', 'pending_hr', 'pending_dg']);

      const { count: approvedLeaveRequests } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      const { data: employeesByDirection } = await supabase
        .from('employees')
        .select('direction_id, directions(name)')
        .eq('employment_status', 'active');

      const directionCounts = {};
      employeesByDirection?.forEach(emp => {
        const directionName = emp.directions?.name || 'Non assigné';
        directionCounts[directionName] = (directionCounts[directionName] || 0) + 1;
      });

      const employeesByDirectionData = Object.entries(directionCounts).map(([name, value]) => ({
        name,
        value
      }));

      const { data: employeesByStatus } = await supabase
        .from('employees')
        .select('employment_status');

      const statusCounts = {
        active: 0,
        inactive: 0,
        on_leave: 0,
        suspended: 0,
        terminated: 0,
      };

      employeesByStatus?.forEach(emp => {
        if (statusCounts.hasOwnProperty(emp.employment_status)) {
          statusCounts[emp.employment_status]++;
        }
      });

      const employeesByStatusData = Object.entries(statusCounts)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => ({
          name: name === 'active' ? 'Actif' :
                name === 'inactive' ? 'Inactif' :
                name === 'on_leave' ? 'En congé' :
                name === 'suspended' ? 'Suspendu' : 'Terminé',
          value
        }));

      const currentYear = new Date().getFullYear();
      const { data: leaveRequests } = await supabase
        .from('leave_requests')
        .select('created_at')
        .gte('created_at', `${currentYear}-01-01`)
        .lte('created_at', `${currentYear}-12-31`);

      const monthCounts = {
        'Jan': 0, 'Fév': 0, 'Mar': 0, 'Avr': 0, 'Mai': 0, 'Jun': 0,
        'Jul': 0, 'Aoû': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Déc': 0
      };

      leaveRequests?.forEach(req => {
        const month = new Date(req.created_at).getMonth();
        const monthNames = Object.keys(monthCounts);
        monthCounts[monthNames[month]]++;
      });

      const leaveRequestsByMonthData = Object.entries(monthCounts).map(([name, demandes]) => ({
        name,
        demandes
      }));

      setStats({
        totalEmployees: totalEmployees || 0,
        activeEmployees: activeEmployees || 0,
        pendingLeaveRequests: pendingLeaveRequests || 0,
        approvedLeaveRequests: approvedLeaveRequests || 0,
        employeesByDirection: employeesByDirectionData,
        employeesByStatus: employeesByStatusData,
        leaveRequestsByMonth: leaveRequestsByMonthData,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
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
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
        <p className="text-default-500">Bienvenue, {user?.user?.firstname} {user?.user?.lastname}</p>
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
                <Pie
                  data={stats.employeesByDirection}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
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
                <Pie
                  data={stats.employeesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
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
            <Button
              color="primary"
              variant="flat"
              startContent={<Icon icon="mdi:account-plus" />}
              as="a"
              href="/dashboard/employees"
            >
              Gestion des Employés
            </Button>
            <Button
              color="primary"
              variant="flat"
              startContent={<Icon icon="mdi:calendar-clock" />}
              as="a"
              href="/dashboard/leave/requests"
            >
              Demandes de Congés
            </Button>
            <Button
              color="primary"
              variant="flat"
              startContent={<Icon icon="mdi:chart-box" />}
              as="a"
              href="/dashboard/reports"
            >
              Rapports
            </Button>
            <Button
              color="primary"
              variant="flat"
              startContent={<Icon icon="mdi:cog" />}
              as="a"
              href="/dashboard/settings"
            >
              Paramètres
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
