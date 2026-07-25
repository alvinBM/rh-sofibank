"use client";

import React, { useState } from "react";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Chip,
} from "@nextui-org/react";
import { FiDownload, FiBarChart2, FiTrendingUp, FiClock, FiAlertTriangle } from "react-icons/fi";
import {
  useGenerateLatenessReport,
  useGenerateMissingPunchReport,
  useGenerateDepartmentSummary,
  useGetAttendanceStats,
  useGetMonthlyAttendanceTrend,
} from "@/src/hooks/useAttendance";
import { toast } from "react-toastify";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

/**
 * MODULE 3 - PRÉSENCE
 * Page: Rapports de présence
 * 3 types: Retards, Absences de pointage, Synthèse département
 */

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function AttendanceReportsPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [filters, setFilters] = useState({
    start_date: `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`,
    end_date: new Date().toISOString().split("T")[0],
    department_id: "",
    employee_id: "",
  });

  const [selectedTab, setSelectedTab] = useState("lateness");

  // Mutations pour générer les rapports
  const latenessMutation = useGenerateLatenessReport();
  const missingPunchMutation = useGenerateMissingPunchReport();
  const deptSummaryMutation = useGenerateDepartmentSummary();

  // Queries pour les statistiques et graphiques
  // const { data: stats, isLoading: statsLoading } = useGetAttendanceStats(
  //   filters.start_date,
  //   filters.end_date,
  //   filters.department_id
  // );

  // const { data: monthlyTrend, isLoading: trendLoading } = useGetMonthlyAttendanceTrend(
  //   currentYear,
  //   filters.department_id
  // );

  // TEST DATA - Statistiques
  const statsLoading = false;
  const trendLoading = false;
  const stats = {
    overall_attendance_rate: 92.5,
    average_daily_hours: 8.3,
    average_late_arrivals_per_day: 4.2,
    total_overtime_hours: 156,
  };

  // TEST DATA - Évolution mensuelle
  const monthlyTrend = [
    { month: "Jan", attendance_rate: 91.2, lateness_count: 45 },
    { month: "Fév", attendance_rate: 89.8, lateness_count: 52 },
    { month: "Mar", attendance_rate: 93.5, lateness_count: 38 },
    { month: "Avr", attendance_rate: 92.1, lateness_count: 41 },
    { month: "Mai", attendance_rate: 94.3, lateness_count: 35 },
    { month: "Jun", attendance_rate: 91.7, lateness_count: 48 },
    { month: "Jul", attendance_rate: 90.5, lateness_count: 55 },
    { month: "Aoû", attendance_rate: 92.8, lateness_count: 42 },
    { month: "Sep", attendance_rate: 93.9, lateness_count: 37 },
    { month: "Oct", attendance_rate: 91.4, lateness_count: 46 },
    { month: "Nov", attendance_rate: 92.6, lateness_count: 43 },
    { month: "Déc", attendance_rate: 90.2, lateness_count: 51 },
  ];

  // TEST DATA - Rapport des retards
  const mockLatenessReport = [
    {
      employee_id: 1,
      employee_name: "Jean Dupont",
      department_name: "Ressources Humaines",
      lateness_count: 8,
      total_minutes: 156,
      average_minutes: 19.5,
    },
    {
      employee_id: 2,
      employee_name: "Marie Kabila",
      department_name: "Finance",
      lateness_count: 12,
      total_minutes: 245,
      average_minutes: 20.4,
    },
    {
      employee_id: 3,
      employee_name: "Pierre Tshisekedi",
      department_name: "IT",
      lateness_count: 5,
      total_minutes: 78,
      average_minutes: 15.6,
    },
    {
      employee_id: 4,
      employee_name: "Sophie Mukendi",
      department_name: "Marketing",
      lateness_count: 15,
      total_minutes: 312,
      average_minutes: 20.8,
    },
    {
      employee_id: 5,
      employee_name: "Jacques Lumbu",
      department_name: "Opérations",
      lateness_count: 7,
      total_minutes: 134,
      average_minutes: 19.1,
    },
    {
      employee_id: 6,
      employee_name: "Christine Mbuyi",
      department_name: "Ventes",
      lateness_count: 10,
      total_minutes: 198,
      average_minutes: 19.8,
    },
    {
      employee_id: 7,
      employee_name: "David Kalala",
      department_name: "Comptabilité",
      lateness_count: 6,
      total_minutes: 102,
      average_minutes: 17.0,
    },
    {
      employee_id: 8,
      employee_name: "Antoinette Ngoy",
      department_name: "Logistique",
      lateness_count: 9,
      total_minutes: 176,
      average_minutes: 19.6,
    },
  ];

  // TEST DATA - Absences de pointage
  const mockMissingPunchReport = [
    {
      employee_id: 1,
      employee_name: "François Kasongo",
      department_name: "IT",
      date: "2026-01-10",
      missing_type: "out",
      has_leave_request: false,
    },
    {
      employee_id: 2,
      employee_name: "Jeanne Mutombo",
      department_name: "Finance",
      date: "2026-01-12",
      missing_type: "both",
      has_leave_request: true,
    },
    {
      employee_id: 3,
      employee_name: "Emmanuel Kibwe",
      department_name: "Marketing",
      date: "2026-01-09",
      missing_type: "in",
      has_leave_request: false,
    },
    {
      employee_id: 4,
      employee_name: "Claudine Ilunga",
      department_name: "Ventes",
      date: "2026-01-11",
      missing_type: "out",
      has_leave_request: false,
    },
    {
      employee_id: 5,
      employee_name: "Michel Kambale",
      department_name: "Opérations",
      date: "2026-01-13",
      missing_type: "both",
      has_leave_request: true,
    },
    {
      employee_id: 6,
      employee_name: "Brigitte Mwamba",
      department_name: "RH",
      date: "2026-01-08",
      missing_type: "in",
      has_leave_request: false,
    },
  ];

  // TEST DATA - Synthèse par département
  const mockDeptSummary = [
    {
      department_id: 1,
      department_name: "Ressources Humaines",
      employee_count: 18,
      attendance_rate: 94.5,
      average_hours_per_day: 8.4,
      total_lates: 12,
      total_absences: 3,
    },
    {
      department_id: 2,
      department_name: "Finance",
      employee_count: 25,
      attendance_rate: 92.8,
      average_hours_per_day: 8.6,
      total_lates: 18,
      total_absences: 5,
    },
    {
      department_id: 3,
      department_name: "IT",
      employee_count: 22,
      attendance_rate: 96.2,
      average_hours_per_day: 8.2,
      total_lates: 8,
      total_absences: 2,
    },
    {
      department_id: 4,
      department_name: "Marketing",
      employee_count: 15,
      attendance_rate: 89.3,
      average_hours_per_day: 8.1,
      total_lates: 22,
      total_absences: 7,
    },
    {
      department_id: 5,
      department_name: "Ventes",
      employee_count: 30,
      attendance_rate: 91.7,
      average_hours_per_day: 8.3,
      total_lates: 25,
      total_absences: 6,
    },
    {
      department_id: 6,
      department_name: "Opérations",
      employee_count: 28,
      attendance_rate: 93.1,
      average_hours_per_day: 8.5,
      total_lates: 16,
      total_absences: 4,
    },
    {
      department_id: 7,
      department_name: "Comptabilité",
      employee_count: 12,
      attendance_rate: 95.8,
      average_hours_per_day: 8.7,
      total_lates: 6,
      total_absences: 1,
    },
    {
      department_id: 8,
      department_name: "Logistique",
      employee_count: 20,
      attendance_rate: 90.4,
      average_hours_per_day: 8.2,
      total_lates: 19,
      total_absences: 5,
    },
  ];

  const [latenessReport, setLatenessReport] = useState(mockLatenessReport);
  const [missingPunchReport, setMissingPunchReport] = useState(mockMissingPunchReport);
  const [deptSummary, setDeptSummary] = useState(mockDeptSummary);

  // Handlers
  const handleGenerateLateness = async () => {
    try {
      const data = await latenessMutation.mutateAsync({
        startDate: filters.start_date,
        endDate: filters.end_date,
        departmentId: filters.department_id || null,
      });
      setLatenessReport(data);
      toast.success("Rapport généré avec succès");
    } catch (error) {
      toast.error("Erreur lors de la génération du rapport");
    }
  };

  const handleGenerateMissingPunch = async () => {
    try {
      const data = await missingPunchMutation.mutateAsync({
        startDate: filters.start_date,
        endDate: filters.end_date,
        departmentId: filters.department_id || null,
      });
      setMissingPunchReport(data);
      toast.success("Rapport généré avec succès");
    } catch (error) {
      toast.error("Erreur lors de la génération du rapport");
    }
  };

  const handleGenerateDeptSummary = async () => {
    try {
      const data = await deptSummaryMutation.mutateAsync({
        startDate: filters.start_date,
        endDate: filters.end_date,
      });
      setDeptSummary(data);
      toast.success("Rapport généré avec succès");
    } catch (error) {
      toast.error("Erreur lors de la génération du rapport");
    }
  };

  const handleExport = () => {
    toast.info("Export Excel/PDF en cours de développement...");
  };

  return (
    <PermissionGuard module="attendance" action="read">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Rapports de Présence</h1>
            <p className="text-default-500 mt-1">
              Analyses et statistiques de présence
            </p>
          </div>
          <Button color="danger" startContent={<FiDownload />} onPress={handleExport}>
            Exporter
          </Button>
        </div>

        {/* Filtres globaux */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                type="date"
                label="Date début"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              />
              <Input
                type="date"
                label="Date fin"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              />
              <Select
                label="Département"
                placeholder="Tous"
                selectedKeys={filters.department_id ? [filters.department_id] : []}
                onChange={(e) =>
                  setFilters({ ...filters, department_id: e.target.value })
                }
              >
                <SelectItem key="" value="">
                  Tous les départements
                </SelectItem>
                {/* Ajouter les départements dynamiquement */}
              </Select>
              <div className="flex items-end">
                <Button
                  color="danger"
                  variant="flat"
                  className="w-full"
                  onPress={() => {
                    if (selectedTab === "lateness") handleGenerateLateness();
                    else if (selectedTab === "missing") handleGenerateMissingPunch();
                    else handleGenerateDeptSummary();
                  }}
                >
                  Générer Rapport
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Cards statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success-100 rounded-lg">
                  <FiBarChart2 className="text-success text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Taux de présence</p>
                  <p className="text-2xl font-bold">
                    {stats?.overall_attendance_rate?.toFixed(1) || 0}%
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-danger-100 rounded-lg">
                  <FiClock className="text-danger text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Moy. heures/jour</p>
                  <p className="text-2xl font-bold">
                    {stats?.average_daily_hours?.toFixed(1) || 0}h
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-warning-100 rounded-lg">
                  <FiAlertTriangle className="text-warning text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Retards/jour</p>
                  <p className="text-2xl font-bold">
                    {stats?.average_late_arrivals_per_day?.toFixed(1) || 0}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-danger-100 rounded-lg">
                  <FiTrendingUp className="text-danger text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Heures sup.</p>
                  <p className="text-2xl font-bold">
                    {stats?.total_overtime_hours?.toFixed(0) || 0}h
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Graphique évolution mensuelle */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Évolution Mensuelle</h3>
          </CardHeader>
          <CardBody>
            {trendLoading ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="attendance_rate"
                    stroke="#0088FE"
                    name="Taux présence"
                  />
                  <Line
                    type="monotone"
                    dataKey="lateness_count"
                    stroke="#FF8042"
                    name="Retards"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        {/* Tabs pour les différents rapports */}
        <Card>
          <CardBody>
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={setSelectedTab}
              aria-label="Rapports"
            >
              {/* Rapport Retards */}
              <Tab key="lateness" title="Retards">
                <div className="py-4">
                  <Table aria-label="Rapport des retards">
                    <TableHeader>
                      <TableColumn>EMPLOYÉ</TableColumn>
                      <TableColumn>DÉPARTEMENT</TableColumn>
                      <TableColumn>NOMBRE RETARDS</TableColumn>
                      <TableColumn>TOTAL MINUTES</TableColumn>
                      <TableColumn>MOYENNE</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={latenessReport}
                      isLoading={latenessMutation.isPending}
                      loadingContent={<Spinner />}
                      emptyContent="Générez un rapport pour voir les données"
                    >
                      {(item) => (
                        <TableRow key={item.employee_id}>
                          <TableCell>
                            {item.employee_name || "N/A"}
                          </TableCell>
                          <TableCell>{item.department_name || "N/A"}</TableCell>
                          <TableCell>
                            <Chip color="warning" variant="flat">
                              {item.lateness_count}
                            </Chip>
                          </TableCell>
                          <TableCell>{item.total_minutes} min</TableCell>
                          <TableCell>
                            {item.average_minutes?.toFixed(1)} min
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Tab>

              {/* Rapport Absences de pointage */}
              <Tab key="missing" title="Absences de Pointage">
                <div className="py-4">
                  <Table aria-label="Rapport des absences de pointage">
                    <TableHeader>
                      <TableColumn>EMPLOYÉ</TableColumn>
                      <TableColumn>DÉPARTEMENT</TableColumn>
                      <TableColumn>DATE</TableColumn>
                      <TableColumn>TYPE ABSENCE</TableColumn>
                      <TableColumn>STATUT</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={missingPunchReport}
                      isLoading={missingPunchMutation.isPending}
                      loadingContent={<Spinner />}
                      emptyContent="Générez un rapport pour voir les données"
                    >
                      {(item) => (
                        <TableRow key={`${item.employee_id}-${item.date}`}>
                          <TableCell>{item.employee_name}</TableCell>
                          <TableCell>{item.department_name}</TableCell>
                          <TableCell>{item.date}</TableCell>
                          <TableCell>
                            <Chip color="danger" variant="flat">
                              {item.missing_type === "both"
                                ? "Entrée & Sortie"
                                : item.missing_type === "in"
                                ? "Entrée"
                                : "Sortie"}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Chip
                              color={
                                item.has_leave_request ? "success" : "danger"
                              }
                              variant="flat"
                              size="sm"
                            >
                              {item.has_leave_request ? "Justifié" : "Non justifié"}
                            </Chip>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Tab>

              {/* Synthèse par département */}
              <Tab key="department" title="Synthèse Département">
                <div className="py-4 space-y-6">
                  <Table aria-label="Synthèse par département">
                    <TableHeader>
                      <TableColumn>DÉPARTEMENT</TableColumn>
                      <TableColumn>EFFECTIF</TableColumn>
                      <TableColumn>TAUX PRÉSENCE</TableColumn>
                      <TableColumn>MOY. HEURES/JOUR</TableColumn>
                      <TableColumn>RETARDS</TableColumn>
                      <TableColumn>ABSENCES</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={deptSummary}
                      isLoading={deptSummaryMutation.isPending}
                      loadingContent={<Spinner />}
                      emptyContent="Générez un rapport pour voir les données"
                    >
                      {(item) => (
                        <TableRow key={item.department_id}>
                          <TableCell className="font-medium">
                            {item.department_name}
                          </TableCell>
                          <TableCell>{item.employee_count}</TableCell>
                          <TableCell>
                            <Chip
                              color={
                                item.attendance_rate >= 95
                                  ? "success"
                                  : item.attendance_rate >= 85
                                  ? "warning"
                                  : "danger"
                              }
                              variant="flat"
                            >
                              {item.attendance_rate?.toFixed(1)}%
                            </Chip>
                          </TableCell>
                          <TableCell>
                            {item.average_hours_per_day?.toFixed(1)}h
                          </TableCell>
                          <TableCell>
                            <Chip color="warning" variant="flat">
                              {item.total_lates}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <Chip color="danger" variant="flat">
                              {item.total_absences}
                            </Chip>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Graphique comparaison départements */}
                  {deptSummary.length > 0 && (
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-semibold">
                          Comparaison Départements
                        </h3>
                      </CardHeader>
                      <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={deptSummary}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="department_name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="attendance_rate"
                              fill="#0088FE"
                              name="Taux présence"
                            />
                            <Bar
                              dataKey="average_hours_per_day"
                              fill="#00C49F"
                              name="Heures/jour"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardBody>
                    </Card>
                  )}
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </PermissionGuard>
  );
}
