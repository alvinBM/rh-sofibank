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
  const { data: stats, isLoading: statsLoading } = useGetAttendanceStats(
    filters.start_date,
    filters.end_date,
    filters.department_id
  );

  const { data: monthlyTrend, isLoading: trendLoading } = useGetMonthlyAttendanceTrend(
    currentYear,
    filters.department_id
  );

  const [latenessReport, setLatenessReport] = useState([]);
  const [missingPunchReport, setMissingPunchReport] = useState([]);
  const [deptSummary, setDeptSummary] = useState([]);

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
