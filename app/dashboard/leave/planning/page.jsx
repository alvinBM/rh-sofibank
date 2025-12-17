"use client";

import React, { useState, useMemo, useCallback } from "react";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Select,
  SelectItem,
  Chip,
  Spinner,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from "@nextui-org/react";
import {
  FiCalendar,
  FiDownload,
  FiList,
  FiPieChart,
  FiAlertTriangle,
  FiPrinter,
} from "react-icons/fi";
import {
  useGetAllApprovedLeaveRequests,
  useGetLeaveTypes,
  useGetLeaveStatsByDepartment,
  useDetectLeaveConflicts,
} from "@/src/hooks/useLeave";
import { toast } from "react-toastify";
import {
  formatDateToFrench,
  getMonthsForYear,
  getDaysInMonth,
  formatDateToISO,
} from "@/src/utils/dateUtils";

const LEAVE_TYPE_COLORS = {
  default: "bg-danger-200 text-danger-800",
  annual: "bg-blue-200 text-blue-800",
  sick: "bg-red-200 text-red-800",
  maternity: "bg-pink-200 text-pink-800",
  paternity: "bg-purple-200 text-purple-800",
  unpaid: "bg-gray-200 text-gray-800",
};

export default function LeavePlanningPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [departmentId, setDepartmentId] = useState("");
  const [viewMode, setViewMode] = useState("calendar"); // calendar | list | stats
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // Hooks
  const { data: leaveRequests, isLoading } = useGetAllApprovedLeaveRequests(
    year,
    departmentId
  );
  const { data: leaveTypes } = useGetLeaveTypes();
  const { data: statsData } = useGetLeaveStatsByDepartment(year);
  const detectConflictsMutation = useDetectLeaveConflicts();

  const months = getMonthsForYear(year);

  // Grouper les congés par mois
  const leavesByMonth = useMemo(() => {
    if (!leaveRequests) return {};

    const grouped = {};
    months.forEach((month) => {
      grouped[month.index] = leaveRequests.filter((leave) => {
        const startDate = new Date(leave.start_date);
        const endDate = new Date(leave.end_date);
        const monthStart = new Date(year, month.index, 1);
        const monthEnd = new Date(year, month.index + 1, 0);

        return (
          (startDate >= monthStart && startDate <= monthEnd) ||
          (endDate >= monthStart && endDate <= monthEnd) ||
          (startDate <= monthStart && endDate >= monthEnd)
        );
      });
    });

    return grouped;
  }, [leaveRequests, months, year]);

  // Obtenir la couleur pour un type de congé
  const getLeaveTypeColor = useCallback((leaveType) => {
    const code = leaveType?.code?.toLowerCase() || "default";
    return LEAVE_TYPE_COLORS[code] || LEAVE_TYPE_COLORS.default;
  }, []);

  // Vérifier si un employé est en congé à une date donnée
  const isEmployeeOnLeave = useCallback((employeeId, date) => {
    if (!leaveRequests) return false;
    const dateStr = formatDateToISO(date);
    return leaveRequests.some(
      (leave) =>
        leave.employee_id === employeeId &&
        dateStr >= leave.start_date &&
        dateStr <= leave.end_date
    );
  }, [leaveRequests]);

  // Obtenir les congés d'un jour spécifique
  const getLeavesForDate = useCallback((date) => {
    if (!leaveRequests) return [];
    const dateStr = formatDateToISO(date);
    return leaveRequests.filter(
      (leave) => dateStr >= leave.start_date && dateStr <= leave.end_date
    );
  }, [leaveRequests]);

  // Statistiques par type de congé
  const leaveTypeStats = useMemo(() => {
    if (!leaveRequests || !leaveTypes) return [];

    const stats = {};
    leaveTypes.forEach((type) => {
      stats[type.id] = {
        type: type,
        count: 0,
        totalDays: 0,
      };
    });

    leaveRequests.forEach((leave) => {
      if (stats[leave.leave_type_id]) {
        stats[leave.leave_type_id].count += 1;
        stats[leave.leave_type_id].totalDays += leave.duration || 0;
      }
    });

    return Object.values(stats).filter((s) => s.count > 0);
  }, [leaveRequests, leaveTypes]);

  // Handlers
  const handleGeneratePDF = useCallback(() => {
    // TODO: Implémenter la génération de PDF
    toast.info("Génération du planning consolidé en cours...");
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDetectConflicts = useCallback(async () => {
    if (!departmentId) {
      toast.error("Veuillez sélectionner un département");
      return;
    }

    try {
      const result = await detectConflictsMutation.mutateAsync({
        departmentId: departmentId,
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
      });

      if (result && result.length > 0) {
        toast.warning(`${result.length} conflit(s) détecté(s)`);
        // TODO: Afficher les conflits dans un modal
      } else {
        toast.success("Aucun conflit détecté");
      }
    } catch (error) {
      toast.error("Erreur lors de la détection des conflits");
      console.error(error);
    }
  }, [departmentId, year, detectConflictsMutation]);

  // Rendu du calendrier mensuel
  const renderMonthCalendar = useCallback(
    (monthIndex) => {
      const days = getDaysInMonth(year, monthIndex);
      const monthLeaves = leavesByMonth[monthIndex] || [];

      return (
        <Card key={monthIndex} className="mb-4">
          <CardHeader className="flex justify-between">
            <h3 className="text-lg font-semibold">{months[monthIndex].name}</h3>
            <Chip size="sm" variant="flat">
              {monthLeaves.length} congé(s)
            </Chip>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-7 gap-1">
              {/* En-têtes des jours */}
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                <div key={day} className="text-center text-xs font-semibold p-1">
                  {day}
                </div>
              ))}

              {/* Padding pour le début du mois */}
              {Array.from({ length: (days[0]?.date.getDay() + 6) % 7 }).map((_, i) => (
                <div key={`pad-${i}`} className="p-1"></div>
              ))}

              {/* Jours du mois */}
              {days.map((day) => {
                const leavesForDay = getLeavesForDate(day.date);
                const hasLeaves = leavesForDay.length > 0;

                return (
                  <div
                    key={day.day}
                    className={`relative min-h-[60px] p-1 border rounded ${
                      day.isWeekend ? "bg-default-100" : "bg-white"
                    } ${hasLeaves ? "border-danger" : "border-default-200"}`}
                  >
                    <div className="text-xs font-semibold mb-1">{day.day}</div>
                    {hasLeaves && (
                      <div className="space-y-0.5">
                        {leavesForDay.slice(0, 2).map((leave, idx) => (
                          <div
                            key={idx}
                            className={`text-[8px] px-1 py-0.5 rounded truncate ${getLeaveTypeColor(
                              leave.leave_type
                            )}`}
                            title={`${leave.employee?.first_name} ${leave.employee?.last_name} - ${leave.leave_type?.name}`}
                          >
                            {leave.employee?.first_name?.[0]}.{" "}
                            {leave.employee?.last_name}
                          </div>
                        ))}
                        {leavesForDay.length > 2 && (
                          <div className="text-[8px] text-center text-default-500">
                            +{leavesForDay.length - 2}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      );
    },
    [year, months, leavesByMonth, getLeavesForDate, getLeaveTypeColor]
  );

  // Rendu de la vue liste
  const renderListView = useCallback(() => {
    if (!leaveRequests || leaveRequests.length === 0) {
      return (
        <div className="text-center py-8 text-default-400">
          Aucun congé planifié pour cette année
        </div>
      );
    }

    return (
      <Table aria-label="Liste des congés planifiés">
        <TableHeader>
          <TableColumn>EMPLOYÉ</TableColumn>
          <TableColumn>DÉPARTEMENT</TableColumn>
          <TableColumn>TYPE</TableColumn>
          <TableColumn>PÉRIODE</TableColumn>
          <TableColumn>DURÉE</TableColumn>
        </TableHeader>
        <TableBody>
          {leaveRequests.map((leave) => (
            <TableRow key={leave.id}>
              <TableCell>
                {leave.employee?.first_name} {leave.employee?.last_name}
              </TableCell>
              <TableCell>{leave.employee?.departments?.name || "-"}</TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  variant="flat"
                  className={getLeaveTypeColor(leave.leave_type)}
                >
                  {leave.leave_type?.name}
                </Chip>
              </TableCell>
              <TableCell>
                {formatDateToFrench(leave.start_date)} -{" "}
                {formatDateToFrench(leave.end_date)}
              </TableCell>
              <TableCell>{leave.duration} jour(s)</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }, [leaveRequests, getLeaveTypeColor]);

  // Rendu de la vue statistiques
  const renderStatsView = useCallback(() => {
    return (
      <div className="space-y-6">
        {/* Statistiques par type de congé */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Congés par Type</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaveTypeStats.map((stat) => (
                <Card key={stat.type.id} className="bg-default-50">
                  <CardBody>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold">{stat.type.name}</p>
                      <Chip size="sm" color="danger" variant="flat">
                        {stat.count}
                      </Chip>
                    </div>
                    <p className="text-sm text-default-600">
                      Total: {stat.totalDays} jour(s)
                    </p>
                    <p className="text-xs text-default-400">
                      Moyenne: {(stat.totalDays / stat.count).toFixed(1)} jour(s) / demande
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Statistiques par département */}
        {statsData && statsData.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Congés par Département</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {statsData.map((deptStat) => (
                  <Card key={deptStat.departmentId} className="bg-default-50">
                    <CardBody>
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold">{deptStat.departmentName}</p>
                        <Chip size="sm" color="danger" variant="flat">
                          {deptStat.requestCount} demandes
                        </Chip>
                      </div>
                      <p className="text-sm text-default-600">
                        Total: {deptStat.totalDays} jour(s)
                      </p>
                      <Divider className="my-2" />
                      <div className="space-y-1">
                        {Object.entries(deptStat.byLeaveType).map(([type, days]) => (
                          <div key={type} className="flex justify-between text-xs">
                            <span className="text-default-500">{type}:</span>
                            <span className="font-semibold">{days} jour(s)</span>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Statistiques par mois */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Répartition Mensuelle</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {months.map((month) => {
                const monthLeaves = leavesByMonth[month.index] || [];
                const totalDays = monthLeaves.reduce(
                  (sum, leave) => sum + (leave.duration || 0),
                  0
                );

                return (
                  <Card key={month.index} className="bg-default-50">
                    <CardBody className="text-center p-3">
                      <p className="text-sm font-semibold mb-1">{month.shortName}</p>
                      <p className="text-2xl font-bold text-danger">
                        {monthLeaves.length}
                      </p>
                      <p className="text-xs text-default-500">{totalDays} jour(s)</p>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }, [leaveTypeStats, statsData, months, leavesByMonth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner label="Chargement de la planification..." />
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission={["leave_view", "leave_manage_types"]}>
      <div className="p-0">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Planification des Congés</h1>
            <p className="text-sm text-default-500">
              Vue consolidée des congés approuvés pour l'année {year}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              color="warning"
              variant="flat"
              startContent={<FiAlertTriangle />}
              onPress={handleDetectConflicts}
              isLoading={detectConflictsMutation.isPending}
            >
              Détecter conflits
            </Button>
            <Button
              color="danger"
              variant="flat"
              startContent={<FiPrinter />}
              onPress={handlePrint}
            >
              Imprimer
            </Button>
            <Button
              color="danger"
              startContent={<FiDownload />}
              onPress={handleGeneratePDF}
            >
              Générer PDF
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                label="Année"
                selectedKeys={[String(year)]}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full sm:w-40"
              >
                {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => (
                  <SelectItem key={String(y)} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Département"
                placeholder="Tous les départements"
                selectedKeys={departmentId ? [departmentId] : []}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="flex-1"
              >
                {/* TODO: Charger la liste des départements */}
                <SelectItem key="all" value="">
                  Tous les départements
                </SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Légende */}
        <Card className="mb-6">
          <CardBody>
            <p className="text-sm font-semibold mb-3">Légende des types de congés:</p>
            <div className="flex flex-wrap gap-2">
              {leaveTypes?.map((type) => (
                <Chip
                  key={type.id}
                  size="sm"
                  variant="flat"
                  className={getLeaveTypeColor(type)}
                >
                  {type.name}
                </Chip>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Vues */}
        <Tabs
          selectedKey={viewMode}
          onSelectionChange={(key) => setViewMode(key)}
          aria-label="Modes de vue"
          color="danger"
          variant="bordered"
          className="mb-6"
        >
          <Tab
            key="calendar"
            title={
              <div className="flex items-center gap-2">
                <FiCalendar />
                <span>Calendrier</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
              {months.map((month) => renderMonthCalendar(month.index))}
            </div>
          </Tab>

          <Tab
            key="list"
            title={
              <div className="flex items-center gap-2">
                <FiList />
                <span>Liste</span>
              </div>
            }
          >
            <div className="mt-6">{renderListView()}</div>
          </Tab>

          <Tab
            key="stats"
            title={
              <div className="flex items-center gap-2">
                <FiPieChart />
                <span>Statistiques</span>
              </div>
            }
          >
            <div className="mt-6">{renderStatsView()}</div>
          </Tab>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
