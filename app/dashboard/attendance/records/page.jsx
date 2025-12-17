"use client";

import React, { useState } from "react";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Chip,
  Pagination,
  Spinner,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Card,
  CardBody,
  CardHeader,
  Divider,
  DateRangePicker,
} from "@nextui-org/react";
import { FiSearch, FiRefreshCw, FiEye, FiDownload, FiClock, FiUsers, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import {
  useGetAttendanceRecords,
  useGetDailySummary,
  useGetEmployeeDailyAttendance,
  useSynchronizeAttendance,
} from "@/src/hooks/useAttendance";
import { useGetEmployees } from "@/src/hooks/useEmployees";
import { toast } from "react-toastify";
import { formatDateToFrench, getTodayISO } from "@/src/utils/dateUtils";

/**
 * MODULE 3 - PRÉSENCE
 * Page: Registre de présence (Attendance Records)
 * Fonctionnalités: Table de pointages, synchronisation biométrique, résumé journalier
 */

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "present", label: "Présent" },
  { value: "late", label: "Retard" },
  { value: "absent", label: "Absent" },
  { value: "half_day", label: "Demi-journée" },
];

const STATUS_COLORS = {
  present: "success",
  late: "warning",
  absent: "danger",
  half_day: "danger",
};

export default function AttendanceRecordsPage() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [filters, setFilters] = useState({
    date_from: getTodayISO(),
    date_to: getTodayISO(),
    status: "",
    department_id: "",
    employee_id: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Queries
  const { data: recordsData, isLoading } = useGetAttendanceRecords({
    page,
    rowsPerPage,
    query: searchQuery,
    filters,
  });

  const { data: dailySummary, isLoading: summaryLoading } = useGetDailySummary(
    filters.date_from || getTodayISO(),
    filters.department_id
  );

  const { data: employeeDailyData } = useGetEmployeeDailyAttendance(
    selectedEmployee?.employee_id,
    selectedDate
  );

  // Mutations
  const syncMutation = useSynchronizeAttendance();

  const records = recordsData?.records || [];
  const total = recordsData?.total || 0;
  const pages = Math.ceil(total / rowsPerPage);

  const summary = dailySummary || {
    total_present: 0,
    total_late: 0,
    total_absent: 0,
    total_half_day: 0,
  };

  // Handlers
  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync(filters.date_from || getTodayISO());
      toast.success("Synchronisation réussie avec les terminaux biométriques");
    } catch (error) {
      toast.error("Erreur lors de la synchronisation");
    }
  };

  const handleViewDetails = (record) => {
    setSelectedEmployee(record);
    setSelectedDate(record.date);
    onOpen();
  };

  const handleExport = () => {
    toast.info("Export en cours de développement...");
  };

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "N/A";
    const start = new Date(`2000-01-01T${checkIn}`);
    const end = new Date(`2000-01-01T${checkOut}`);
    const diff = (end - start) / (1000 * 60 * 60); // heures
    return `${diff.toFixed(1)}h`;
  };

  const getLateMinutes = (checkIn, expectedTime = "08:00") => {
    if (!checkIn) return 0;
    const actual = new Date(`2000-01-01T${checkIn}`);
    const expected = new Date(`2000-01-01T${expectedTime}`);
    const diff = (actual - expected) / (1000 * 60); // minutes
    return diff > 0 ? Math.round(diff) : 0;
  };

  return (
    <PermissionGuard module="attendance" action="read">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Registre de Présence</h1>
            <p className="text-default-500 mt-1">
              Gestion des pointages et suivi de la présence
            </p>
          </div>
          <Button
            color="danger"
            startContent={<FiRefreshCw />}
            onPress={handleSync}
            isLoading={syncMutation.isPending}
          >
            Synchroniser Terminaux
          </Button>
        </div>

        {/* Résumé Journalier */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success-100 rounded-lg">
                  <FiCheckCircle className="text-success text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Présents</p>
                  <p className="text-2xl font-bold">{summary.total_present}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-warning-100 rounded-lg">
                  <FiClock className="text-warning text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Retards</p>
                  <p className="text-2xl font-bold text-warning">{summary.total_late}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-danger-100 rounded-lg">
                  <FiAlertCircle className="text-danger text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Absents</p>
                  <p className="text-2xl font-bold text-danger">{summary.total_absent}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-danger-100 rounded-lg">
                  <FiUsers className="text-danger text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Demi-journée</p>
                  <p className="text-2xl font-bold text-danger">{summary.total_half_day}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                isClearable
                placeholder="Rechercher un employé..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<FiSearch />}
              />

              <Input
                type="date"
                label="Date début"
                value={filters.date_from}
                onChange={(e) =>
                  setFilters({ ...filters, date_from: e.target.value })
                }
              />

              <Input
                type="date"
                label="Date fin"
                value={filters.date_to}
                onChange={(e) =>
                  setFilters({ ...filters, date_to: e.target.value })
                }
              />

              <Select
                label="Statut"
                placeholder="Sélectionner"
                selectedKeys={filters.status ? [filters.status] : []}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>

              <Button color="danger" variant="flat" onPress={handleExport}>
                <FiDownload /> Exporter
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Table */}
        <Card>
          <CardBody>
            <Table
              aria-label="Table de présence"
              bottomContent={
                pages > 1 && (
                  <div className="flex w-full justify-center">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="danger"
                      page={page}
                      total={pages}
                      onChange={(page) => setPage(page)}
                    />
                  </div>
                )
              }
            >
              <TableHeader>
                <TableColumn>DATE</TableColumn>
                <TableColumn>EMPLOYÉ</TableColumn>
                <TableColumn>ARRIVÉE</TableColumn>
                <TableColumn>DÉPART</TableColumn>
                <TableColumn>DURÉE</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>RETARD</TableColumn>
                <TableColumn>TERMINAL</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                items={records}
                isLoading={isLoading}
                loadingContent={<Spinner />}
                emptyContent="Aucun enregistrement trouvé"
              >
                {(record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDateToFrench(record.date)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {record.employee?.first_name} {record.employee?.last_name}
                        </p>
                        <p className="text-sm text-default-500">
                          {record.employee?.employee_number}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">{record.check_in_time || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">{record.check_out_time || "—"}</span>
                    </TableCell>
                    <TableCell>
                      {calculateDuration(record.check_in_time, record.check_out_time)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={STATUS_COLORS[record.status]}
                        variant="flat"
                        size="sm"
                      >
                        {STATUS_OPTIONS.find((s) => s.value === record.status)?.label}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {record.status === "late" && (
                        <Chip color="danger" variant="flat" size="sm">
                          {getLateMinutes(record.check_in_time)} min
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-default-500">
                        {record.terminal_name || "Manuel"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleViewDetails(record)}
                      >
                        <FiEye />
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Modal Détails */}
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            <ModalHeader>
              Détails de présence - {selectedEmployee?.employee?.first_name}{" "}
              {selectedEmployee?.employee?.last_name}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <p className="text-sm text-default-500">
                  Date: {formatDateToFrench(selectedDate)}
                </p>
                {employeeDailyData && employeeDailyData.length > 0 ? (
                  <div className="space-y-2">
                    {employeeDailyData.map((punch, idx) => (
                      <Card key={idx}>
                        <CardBody>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Pointage #{idx + 1}</p>
                              <p className="text-sm text-default-500">
                                Arrivée: {punch.check_in_time || "N/A"} | Départ:{" "}
                                {punch.check_out_time || "N/A"}
                              </p>
                            </div>
                            <Chip color={STATUS_COLORS[punch.status]} variant="flat">
                              {STATUS_OPTIONS.find((s) => s.value === punch.status)?.label}
                            </Chip>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-default-500">Aucun pointage trouvé</p>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Fermer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
