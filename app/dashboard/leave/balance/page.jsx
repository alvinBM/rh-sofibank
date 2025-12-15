"use client";

import React, { useState, useMemo, useCallback } from "react";
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
  User,
  Pagination,
  Spinner,
  Select,
  SelectItem,
  Card,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import {
  FiSearch,
  FiDownload,
  FiEdit,
  FiEye,
  FiMoreVertical,
  FiPlusCircle,
  FiMinusCircle,
  FiClock,
} from "react-icons/fi";
import {
  useGetAllLeaveBalances,
  useGetLeaveTypes,
  useAdjustLeaveBalance,
  useGetBalanceAdjustmentHistory,
} from "@/src/hooks/useLeave";
import { toast } from "react-toastify";
import { formatDateToFrench } from "@/src/utils/dateUtils";

export default function LeaveBalancePage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    department_id: "",
    leave_type_id: "",
    employee_id: "",
  });
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({
    adjustment: 0,
    reason: "",
  });

  const {
    isOpen: isAdjustOpen,
    onOpen: onAdjustOpen,
    onClose: onAdjustClose,
  } = useDisclosure();
  const {
    isOpen: isHistoryOpen,
    onOpen: onHistoryOpen,
    onClose: onHistoryClose,
  } = useDisclosure();

  // Hooks
  const { data: balancesData, isLoading } = useGetAllLeaveBalances(
    year,
    filters.department_id,
    filters.employee_id
  );
  const { data: leaveTypesData } = useGetLeaveTypes();
  const { data: historyData } = useGetBalanceAdjustmentHistory(selectedBalance?.id);
  const adjustMutation = useAdjustLeaveBalance();

  // Filtrer et paginer les données
  const filteredBalances = useMemo(() => {
    let filtered = balancesData || [];

    // Filtre par recherche (nom employé ou numéro)
    if (searchQuery) {
      filtered = filtered.filter((balance) => {
        const fullName = `${balance.employee?.first_name} ${balance.employee?.last_name}`.toLowerCase();
        const empNumber = balance.employee?.employee_number?.toLowerCase() || "";
        return (
          fullName.includes(searchQuery.toLowerCase()) ||
          empNumber.includes(searchQuery.toLowerCase())
        );
      });
    }

    // Filtre par type de congé
    if (filters.leave_type_id) {
      filtered = filtered.filter(
        (balance) => balance.leave_type_id === filters.leave_type_id
      );
    }

    return filtered;
  }, [balancesData, searchQuery, filters.leave_type_id]);

  const paginatedBalances = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredBalances.slice(start, end);
  }, [filteredBalances, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredBalances.length / rowsPerPage);

  // Calculer les statistiques globales
  const stats = useMemo(() => {
    if (!balancesData || balancesData.length === 0) {
      return {
        totalAcquired: 0,
        totalUsed: 0,
        totalPending: 0,
        totalAvailable: 0,
      };
    }

    return balancesData.reduce(
      (acc, balance) => {
        acc.totalAcquired += balance.total_days || 0;
        acc.totalUsed += balance.used_days || 0;
        acc.totalPending += balance.pending_days || 0;
        acc.totalAvailable +=
          (balance.total_days || 0) -
          (balance.used_days || 0) -
          (balance.pending_days || 0);
        return acc;
      },
      {
        totalAcquired: 0,
        totalUsed: 0,
        totalPending: 0,
        totalAvailable: 0,
      }
    );
  }, [balancesData]);

  // Handlers
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      department_id: "",
      leave_type_id: "",
      employee_id: "",
    });
    setSearchQuery("");
    setPage(1);
  }, []);

  const handleAdjust = useCallback(
    (balance) => {
      setSelectedBalance(balance);
      setAdjustmentData({ adjustment: 0, reason: "" });
      onAdjustOpen();
    },
    [onAdjustOpen]
  );

  const handleConfirmAdjustment = useCallback(async () => {
    if (!selectedBalance || adjustmentData.adjustment === 0) {
      toast.error("Veuillez entrer un ajustement valide");
      return;
    }

    if (!adjustmentData.reason.trim()) {
      toast.error("Veuillez indiquer la raison de l'ajustement");
      return;
    }

    try {
      await adjustMutation.mutateAsync({
        balanceId: selectedBalance.id,
        adjustment: parseFloat(adjustmentData.adjustment),
        reason: adjustmentData.reason,
        adjustedBy: "current-user-id", // TODO: Récupérer l'ID utilisateur connecté
      });

      toast.success("Solde ajusté avec succès");
      onAdjustClose();
      setSelectedBalance(null);
    } catch (error) {
      toast.error("Erreur lors de l'ajustement du solde");
      console.error(error);
    }
  }, [selectedBalance, adjustmentData, adjustMutation, onAdjustClose]);

  const handleViewHistory = useCallback(
    (balance) => {
      setSelectedBalance(balance);
      onHistoryOpen();
    },
    [onHistoryOpen]
  );

  const handleExport = useCallback(() => {
    // TODO: Implémenter l'export Excel/PDF
    toast.info("Fonctionnalité d'export en cours de développement");
  }, []);

  const renderCell = useCallback(
    (balance, columnKey) => {
      switch (columnKey) {
        case "employee":
          return (
            <User
              name={`${balance.employee?.first_name} ${balance.employee?.last_name}`}
              description={balance.employee?.employee_number}
              avatarProps={{
                name: `${balance.employee?.first_name?.[0]}${balance.employee?.last_name?.[0]}`,
              }}
            />
          );
        case "department":
          return balance.employee?.departments?.name || "-";
        case "leave_type":
          return (
            <Chip variant="flat" size="sm">
              {balance.leave_type?.name}
            </Chip>
          );
        case "total_days":
          return (
            <div className="font-semibold">
              {balance.total_days || 0} jour(s)
            </div>
          );
        case "used_days":
          return (
            <Chip color="danger" variant="flat" size="sm">
              {balance.used_days || 0} jour(s)
            </Chip>
          );
        case "pending_days":
          return (
            <Chip color="warning" variant="flat" size="sm">
              {balance.pending_days || 0} jour(s)
            </Chip>
          );
        case "available_days":
          const available =
            (balance.total_days || 0) -
            (balance.used_days || 0) -
            (balance.pending_days || 0);
          return (
            <Chip color={available > 0 ? "success" : "default"} variant="flat" size="sm">
              {available} jour(s)
            </Chip>
          );
        case "carry_forward":
          return balance.carry_forward_days ? (
            <Chip color="primary" variant="flat" size="sm">
              +{balance.carry_forward_days} jour(s)
            </Chip>
          ) : (
            "-"
          );
        case "actions":
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <FiMoreVertical className="text-default-400" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  key="adjust"
                  startContent={<FiEdit />}
                  onPress={() => handleAdjust(balance)}
                >
                  Ajuster le solde
                </DropdownItem>
                <DropdownItem
                  key="history"
                  startContent={<FiClock />}
                  onPress={() => handleViewHistory(balance)}
                >
                  Voir l'historique
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );
        default:
          return balance[columnKey];
      }
    },
    [handleAdjust, handleViewHistory]
  );

  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Soldes de Congés</h1>
          <Button
            color="primary"
            startContent={<FiDownload />}
            onPress={handleExport}
            variant="flat"
          >
            Exporter
          </Button>
        </div>

        {/* Cartes statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardBody>
              <p className="text-sm text-default-500">Total acquis</p>
              <p className="text-2xl font-bold text-primary">{stats.totalAcquired}</p>
              <p className="text-xs text-default-400">jours</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-default-500">Total utilisé</p>
              <p className="text-2xl font-bold text-danger">{stats.totalUsed}</p>
              <p className="text-xs text-default-400">jours</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-default-500">En attente</p>
              <p className="text-2xl font-bold text-warning">{stats.totalPending}</p>
              <p className="text-xs text-default-400">jours</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-default-500">Disponible</p>
              <p className="text-2xl font-bold text-success">{stats.totalAvailable}</p>
              <p className="text-xs text-default-400">jours</p>
            </CardBody>
          </Card>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            label="Année"
            selectedKeys={[String(year)]}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setPage(1);
            }}
            className="w-full sm:w-32"
          >
            {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => (
              <SelectItem key={String(y)} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </Select>

          <Input
            isClearable
            placeholder="Rechercher un employé..."
            startContent={<FiSearch />}
            value={searchQuery}
            onValueChange={handleSearchChange}
            className="flex-1"
          />

          <Select
            placeholder="Type de congé"
            selectedKeys={filters.leave_type_id ? [filters.leave_type_id] : []}
            onChange={(e) => handleFilterChange("leave_type_id", e.target.value)}
            className="w-full sm:w-48"
          >
            {(leaveTypesData || []).map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </Select>

          <Button variant="flat" onPress={handleClearFilters}>
            Réinitialiser
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-sm">
            Total: {filteredBalances.length} solde(s)
          </span>
          <Select
            label="Lignes par page"
            size="sm"
            selectedKeys={[String(rowsPerPage)]}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="w-40"
          >
            <SelectItem key="10" value="10">
              10
            </SelectItem>
            <SelectItem key="20" value="20">
              20
            </SelectItem>
            <SelectItem key="50" value="50">
              50
            </SelectItem>
            <SelectItem key="100" value="100">
              100
            </SelectItem>
          </Select>
        </div>
      </div>
    ),
    [
      stats,
      year,
      currentYear,
      searchQuery,
      filters,
      leaveTypesData,
      filteredBalances.length,
      rowsPerPage,
      handleSearchChange,
      handleFilterChange,
      handleClearFilters,
      handleExport,
    ]
  );

  const bottomContent = useMemo(
    () => (
      <div className="flex w-full justify-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={totalPages || 1}
          onChange={setPage}
        />
      </div>
    ),
    [page, totalPages]
  );

  return (
    <PermissionGuard requiredPermission={["leave_view", "leave_manage_balance"]}>
      <div className="p-6">
        <Table
          aria-label="Table des soldes de congés"
          topContent={topContent}
          bottomContent={bottomContent}
          classNames={{
            wrapper: "min-h-[400px]",
          }}
        >
          <TableHeader>
            <TableColumn key="employee">EMPLOYÉ</TableColumn>
            <TableColumn key="department">DÉPARTEMENT</TableColumn>
            <TableColumn key="leave_type">TYPE CONGÉ</TableColumn>
            <TableColumn key="total_days">TOTAL</TableColumn>
            <TableColumn key="used_days">UTILISÉS</TableColumn>
            <TableColumn key="pending_days">EN ATTENTE</TableColumn>
            <TableColumn key="available_days">DISPONIBLES</TableColumn>
            <TableColumn key="carry_forward">REPORTS</TableColumn>
            <TableColumn key="actions">ACTIONS</TableColumn>
          </TableHeader>
          <TableBody
            items={paginatedBalances}
            isLoading={isLoading}
            loadingContent={<Spinner label="Chargement..." />}
            emptyContent="Aucun solde trouvé"
          >
            {(balance) => (
              <TableRow key={balance.id}>
                {(columnKey) => <TableCell>{renderCell(balance, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Modal Ajustement */}
        <Modal isOpen={isAdjustOpen} onClose={onAdjustClose}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Ajuster le Solde de Congé</ModalHeader>
                <ModalBody>
                  {selectedBalance && (
                    <div className="space-y-4">
                      <Card className="bg-default-100">
                        <CardBody>
                          <p className="text-sm font-semibold">
                            {selectedBalance.employee?.first_name}{" "}
                            {selectedBalance.employee?.last_name}
                          </p>
                          <p className="text-xs text-default-500">
                            {selectedBalance.leave_type?.name} - {year}
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-default-500">Solde actuel:</span>
                              <span className="ml-2 font-semibold">
                                {selectedBalance.total_days || 0} jours
                              </span>
                            </div>
                            <div>
                              <span className="text-default-500">Disponible:</span>
                              <span className="ml-2 font-semibold text-success">
                                {(selectedBalance.total_days || 0) -
                                  (selectedBalance.used_days || 0) -
                                  (selectedBalance.pending_days || 0)}{" "}
                                jours
                              </span>
                            </div>
                          </div>
                        </CardBody>
                      </Card>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Ajustement (jours)
                        </label>
                        <div className="flex gap-2">
                          <Button
                            isIconOnly
                            color="danger"
                            variant="flat"
                            onPress={() =>
                              setAdjustmentData((prev) => ({
                                ...prev,
                                adjustment: parseFloat(prev.adjustment || 0) - 1,
                              }))
                            }
                          >
                            <FiMinusCircle />
                          </Button>
                          <Input
                            type="number"
                            value={adjustmentData.adjustment}
                            onChange={(e) =>
                              setAdjustmentData((prev) => ({
                                ...prev,
                                adjustment: e.target.value,
                              }))
                            }
                            placeholder="0"
                            className="flex-1"
                          />
                          <Button
                            isIconOnly
                            color="success"
                            variant="flat"
                            onPress={() =>
                              setAdjustmentData((prev) => ({
                                ...prev,
                                adjustment: parseFloat(prev.adjustment || 0) + 1,
                              }))
                            }
                          >
                            <FiPlusCircle />
                          </Button>
                        </div>
                        <p className="text-xs text-default-400 mt-1">
                          Utilisez les valeurs négatives pour déduire, positives pour ajouter
                        </p>
                      </div>

                      {adjustmentData.adjustment !== 0 && (
                        <Card className="bg-primary-50">
                          <CardBody>
                            <p className="text-sm">
                              Nouveau solde:{" "}
                              <span className="font-bold text-primary">
                                {(selectedBalance.total_days || 0) +
                                  parseFloat(adjustmentData.adjustment || 0)}{" "}
                                jours
                              </span>
                            </p>
                          </CardBody>
                        </Card>
                      )}

                      <Textarea
                        label="Raison de l'ajustement"
                        placeholder="Expliquer la raison..."
                        isRequired
                        value={adjustmentData.reason}
                        onChange={(e) =>
                          setAdjustmentData((prev) => ({
                            ...prev,
                            reason: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Annuler
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleConfirmAdjustment}
                    isLoading={adjustMutation.isPending}
                  >
                    Confirmer l'ajustement
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal Historique */}
        <Modal isOpen={isHistoryOpen} onClose={onHistoryClose} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Historique des Ajustements</ModalHeader>
                <ModalBody>
                  {selectedBalance && (
                    <div className="space-y-4">
                      <Card className="bg-default-100">
                        <CardBody>
                          <p className="text-sm font-semibold">
                            {selectedBalance.employee?.first_name}{" "}
                            {selectedBalance.employee?.last_name}
                          </p>
                          <p className="text-xs text-default-500">
                            {selectedBalance.leave_type?.name} - {year}
                          </p>
                        </CardBody>
                      </Card>

                      <div className="space-y-3">
                        {historyData && historyData.length > 0 ? (
                          historyData.map((adjustment, index) => (
                            <Card key={index}>
                              <CardBody>
                                <div className="flex justify-between items-start mb-2">
                                  <Chip
                                    color={adjustment.adjustment > 0 ? "success" : "danger"}
                                    variant="flat"
                                    size="sm"
                                  >
                                    {adjustment.adjustment > 0 ? "+" : ""}
                                    {adjustment.adjustment} jour(s)
                                  </Chip>
                                  <p className="text-xs text-default-400">
                                    {formatDateToFrench(adjustment.adjusted_at)}
                                  </p>
                                </div>
                                <p className="text-sm mb-1">{adjustment.reason}</p>
                                <p className="text-xs text-default-500">
                                  Par:{" "}
                                  {adjustment.adjusted_by_user?.first_name ||
                                    adjustment.adjusted_by_user?.email ||
                                    "Système"}
                                </p>
                              </CardBody>
                            </Card>
                          ))
                        ) : (
                          <p className="text-center text-default-400 py-4">
                            Aucun ajustement enregistré
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={onClose}>
                    Fermer
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
