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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { FiSearch, FiPlus, FiEye, FiCheck, FiX, FiMoreVertical } from "react-icons/fi";
import { useGetLeaveRequests, useGetLeaveTypes } from "@/src/hooks/useLeave";
import { toast } from "react-toastify";

const LEAVE_STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon" },
  { value: "pending_backup", label: "En attente remplaçant" },
  { value: "pending_supervisor", label: "En attente superviseur" },
  { value: "pending_hr", label: "En attente RH" },
  { value: "pending_dg", label: "En attente DG" },
  { value: "approved", label: "Approuvé" },
  { value: "rejected", label: "Rejeté" },
  { value: "cancelled", label: "Annulé" },
];

const LEAVE_STATUS_COLORS = {
  draft: "default",
  pending_backup: "warning",
  pending_supervisor: "warning",
  pending_hr: "warning",
  pending_dg: "warning",
  approved: "success",
  rejected: "danger",
  cancelled: "danger",
};

export default function LeaveRequestsPage() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    leave_type_id: "",
    start_date: "",
    end_date: "",
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: leaveTypesData } = useGetLeaveTypes();

  const { data, isLoading, error } = useGetLeaveRequests({
    page,
    rowsPerPage,
    query: searchQuery,
    filters,
  });

  const requests = data?.requests || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / rowsPerPage);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      status: "",
      leave_type_id: "",
      start_date: "",
      end_date: "",
    });
    setSearchQuery("");
    setPage(1);
  }, []);

  const handleViewRequest = useCallback((request) => {
    setSelectedRequest(request);
    onOpen();
  }, [onOpen]);

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const renderCell = useCallback((request, columnKey) => {
    switch (columnKey) {
      case "request_number":
        return (
          <div className="flex flex-col">
            <p className="text-sm font-semibold">{request.request_number}</p>
            <p className="text-xs text-default-400">
              {new Date(request.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        );
      case "employee":
        return (
          <User
            name={`${request.employee?.first_name} ${request.employee?.last_name}`}
            description={request.employee?.employee_number}
            avatarProps={{
              name: `${request.employee?.first_name?.[0]}${request.employee?.last_name?.[0]}`,
            }}
          />
        );
      case "leave_type":
        return (
          <Chip variant="flat" size="sm">
            {request.leave_type?.name}
          </Chip>
        );
      case "period":
        return (
          <div className="flex flex-col">
            <p className="text-sm">
              {new Date(request.start_date).toLocaleDateString("fr-FR")} - {new Date(request.end_date).toLocaleDateString("fr-FR")}
            </p>
            <p className="text-xs text-default-400">
              {calculateDuration(request.start_date, request.end_date)} jour(s)
            </p>
          </div>
        );
      case "backup_person":
        return request.backup_person ? (
          <User
            name={`${request.backup_person.first_name} ${request.backup_person.last_name}`}
            avatarProps={{
              size: "sm",
              name: `${request.backup_person.first_name?.[0]}${request.backup_person.last_name?.[0]}`,
            }}
          />
        ) : (
          <span className="text-default-400">-</span>
        );
      case "status":
        return (
          <Chip
            color={LEAVE_STATUS_COLORS[request.status] || "default"}
            variant="flat"
            size="sm"
          >
            {LEAVE_STATUS_OPTIONS.find(opt => opt.value === request.status)?.label || request.status}
          </Chip>
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
                key="view"
                startContent={<FiEye />}
                onPress={() => handleViewRequest(request)}
              >
                Voir détails
              </DropdownItem>
              {(request.status.startsWith("pending_")) && (
                <>
                  <DropdownItem
                    key="approve"
                    startContent={<FiCheck />}
                    className="text-success"
                    color="success"
                  >
                    Approuver
                  </DropdownItem>
                  <DropdownItem
                    key="reject"
                    startContent={<FiX />}
                    className="text-danger"
                    color="danger"
                  >
                    Rejeter
                  </DropdownItem>
                </>
              )}
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return request[columnKey];
    }
  }, [handleViewRequest]);

  const topContent = useMemo(() => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Demandes de Congés</h1>
        <Button
          color="primary"
          startContent={<FiPlus />}
        >
          Nouvelle Demande
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          isClearable
          placeholder="Rechercher par numéro..."
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

        <Select
          placeholder="Statut"
          selectedKeys={filters.status ? [filters.status] : []}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="w-full sm:w-48"
        >
          {LEAVE_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>

        <Button
          variant="flat"
          onPress={handleClearFilters}
        >
          Réinitialiser
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-default-400 text-sm">
          Total: {total} demande(s)
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
          <SelectItem key="10" value="10">10</SelectItem>
          <SelectItem key="20" value="20">20</SelectItem>
          <SelectItem key="50" value="50">50</SelectItem>
          <SelectItem key="100" value="100">100</SelectItem>
        </Select>
      </div>
    </div>
  ), [
    searchQuery,
    filters,
    leaveTypesData,
    total,
    rowsPerPage,
    handleSearchChange,
    handleFilterChange,
    handleClearFilters,
  ]);

  const bottomContent = useMemo(() => (
    <div className="flex w-full justify-center">
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={page}
        total={totalPages}
        onChange={setPage}
      />
    </div>
  ), [page, totalPages]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-danger">Erreur lors du chargement des demandes</p>
          <p className="text-sm text-default-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission={["leave_requests_view", "ess_access"]}>
      <div className="p-6">
        <Table
        aria-label="Table des demandes de congés"
        topContent={topContent}
        bottomContent={bottomContent}
        classNames={{
          wrapper: "min-h-[400px]",
        }}
      >
        <TableHeader>
          <TableColumn key="request_number">N° DEMANDE</TableColumn>
          <TableColumn key="employee">EMPLOYÉ</TableColumn>
          <TableColumn key="leave_type">TYPE</TableColumn>
          <TableColumn key="period">PÉRIODE</TableColumn>
          <TableColumn key="backup_person">REMPLAÇANT</TableColumn>
          <TableColumn key="status">STATUT</TableColumn>
          <TableColumn key="actions">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={requests}
          isLoading={isLoading}
          loadingContent={<Spinner label="Chargement..." />}
          emptyContent="Aucune demande trouvée"
        >
          {(request) => (
            <TableRow key={request.id}>
              {(columnKey) => (
                <TableCell>{renderCell(request, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Détails de la Demande
              </ModalHeader>
              <ModalBody>
                {selectedRequest && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-default-500">Numéro</p>
                      <p className="font-semibold">{selectedRequest.request_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Statut</p>
                      <Chip
                        color={LEAVE_STATUS_COLORS[selectedRequest.status]}
                        variant="flat"
                      >
                        {LEAVE_STATUS_OPTIONS.find(opt => opt.value === selectedRequest.status)?.label}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Employé</p>
                      <p className="font-semibold">
                        {selectedRequest.employee?.first_name} {selectedRequest.employee?.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Type de congé</p>
                      <p className="font-semibold">{selectedRequest.leave_type?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Date de début</p>
                      <p className="font-semibold">
                        {new Date(selectedRequest.start_date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Date de fin</p>
                      <p className="font-semibold">
                        {new Date(selectedRequest.end_date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Durée</p>
                      <p className="font-semibold">
                        {calculateDuration(selectedRequest.start_date, selectedRequest.end_date)} jour(s)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Remplaçant</p>
                      <p className="font-semibold">
                        {selectedRequest.backup_person
                          ? `${selectedRequest.backup_person.first_name} ${selectedRequest.backup_person.last_name}`
                          : "-"
                        }
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-default-500">Motif</p>
                      <p className="font-semibold">{selectedRequest.reason || "-"}</p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
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
