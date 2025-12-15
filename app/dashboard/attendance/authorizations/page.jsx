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
  Textarea,
} from "@nextui-org/react";
import { FiSearch, FiPlus, FiCheck, FiX, FiEdit, FiCalendar } from "react-icons/fi";
import {
  useGetExitAuthorizations,
  useCreateExitAuthorization,
  useUpdateExitAuthorization,
  useApproveExitAuthorization,
  useRejectExitAuthorization,
} from "@/src/hooks/useAttendance";
import { useGetEmployees } from "@/src/hooks/useEmployees";
import { toast } from "react-toastify";
import { formatDateToFrench, getTodayISO } from "@/src/utils/dateUtils";

/**
 * MODULE 3 - PRÉSENCE
 * Page: Autorisations de sortie
 * Workflow: employé demande → supérieur approuve
 */

const TYPE_OPTIONS = [
  { value: "early_leave", label: "Sortie anticipée" },
  { value: "short_absence", label: "Absence courte" },
  { value: "appointment", label: "Rendez-vous" },
  { value: "personal", label: "Personnel" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "pending", label: "En attente" },
  { value: "approved", label: "Approuvé" },
  { value: "rejected", label: "Rejeté" },
  { value: "used", label: "Utilisé" },
];

const STATUS_COLORS = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  used: "default",
};

export default function ExitAuthorizationsPage() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    date_from: "",
    date_to: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isApproveOpen,
    onOpen: onApproveOpen,
    onClose: onApproveClose,
  } = useDisclosure();

  const [formData, setFormData] = useState({
    employee_id: "",
    type: "",
    date: getTodayISO(),
    start_time: "",
    end_time: "",
    duration_minutes: 0,
    reason: "",
  });

  const [selectedAuth, setSelectedAuth] = useState(null);
  const [approvalComments, setApprovalComments] = useState("");

  // Queries
  const { data: authData, isLoading } = useGetExitAuthorizations({
    page,
    rowsPerPage,
    query: searchQuery,
    filters,
  });

  const { data: employeesData } = useGetEmployees({
    page: 1,
    rowsPerPage: 1000,
    query: "",
    filters: { status: "active" },
  });

  // Mutations
  const createMutation = useCreateExitAuthorization();
  const updateMutation = useUpdateExitAuthorization();
  const approveMutation = useApproveExitAuthorization();
  const rejectMutation = useRejectExitAuthorization();

  const authorizations = authData?.authorizations || [];
  const total = authData?.total || 0;
  const pages = Math.ceil(total / rowsPerPage);
  const employees = employeesData?.employees || [];

  // Handlers
  const handleCreate = () => {
    setFormData({
      employee_id: "",
      type: "",
      date: getTodayISO(),
      start_time: "",
      end_time: "",
      duration_minutes: 0,
      reason: "",
    });
    onOpen();
  };

  const handleEdit = (auth) => {
    setFormData({
      employee_id: auth.employee_id,
      type: auth.type,
      date: auth.date,
      start_time: auth.start_time,
      end_time: auth.end_time,
      duration_minutes: auth.duration_minutes,
      reason: auth.reason,
    });
    setSelectedAuth(auth);
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      if (selectedAuth) {
        await updateMutation.mutateAsync({
          id: selectedAuth.id,
          payload: formData,
        });
        toast.success("Autorisation modifiée avec succès");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Autorisation créée avec succès");
      }
      onClose();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync({
        id: selectedAuth.id,
        approverId: "current-user-id", // À remplacer par l'ID de l'utilisateur connecté
        comments: approvalComments,
      });
      toast.success("Autorisation approuvée");
      onApproveClose();
    } catch (error) {
      toast.error("Erreur lors de l'approbation");
    }
  };

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync({
        id: selectedAuth.id,
        approverId: "current-user-id",
        reason: approvalComments,
      });
      toast.success("Autorisation rejetée");
      onApproveClose();
    } catch (error) {
      toast.error("Erreur lors du rejet");
    }
  };

  const openApprovalModal = (auth) => {
    setSelectedAuth(auth);
    setApprovalComments("");
    onApproveOpen();
  };

  const calculateDuration = () => {
    if (!formData.start_time || !formData.end_time) return;
    const start = new Date(`2000-01-01T${formData.start_time}`);
    const end = new Date(`2000-01-01T${formData.end_time}`);
    const diff = (end - start) / (1000 * 60); // minutes
    setFormData({ ...formData, duration_minutes: Math.round(diff) });
  };

  return (
    <PermissionGuard module="attendance" action="read">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Autorisations de Sortie</h1>
            <p className="text-default-500 mt-1">
              Gestion des demandes d'autorisation de sortie anticipée
            </p>
          </div>
          <Button color="primary" startContent={<FiPlus />} onPress={handleCreate}>
            Nouvelle Autorisation
          </Button>
        </div>

        {/* Filtres */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                isClearable
                placeholder="Rechercher..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<FiSearch />}
              />

              <Select
                label="Statut"
                placeholder="Tous"
                selectedKeys={filters.status ? [filters.status] : []}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Type"
                placeholder="Tous"
                selectedKeys={filters.type ? [filters.type] : []}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <SelectItem key="" value="">
                  Tous
                </SelectItem>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>

              <Input
                type="date"
                label="Période"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              />
            </div>
          </CardBody>
        </Card>

        {/* Table */}
        <Card>
          <CardBody>
            <Table
              aria-label="Autorisations de sortie"
              bottomContent={
                pages > 1 && (
                  <div className="flex w-full justify-center">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="primary"
                      page={page}
                      total={pages}
                      onChange={setPage}
                    />
                  </div>
                )
              }
            >
              <TableHeader>
                <TableColumn>EMPLOYÉ</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>HORAIRE</TableColumn>
                <TableColumn>DURÉE</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                items={authorizations}
                isLoading={isLoading}
                loadingContent={<Spinner />}
                emptyContent="Aucune autorisation trouvée"
              >
                {(auth) => (
                  <TableRow key={auth.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {auth.employee?.first_name} {auth.employee?.last_name}
                        </p>
                        <p className="text-sm text-default-500">
                          {auth.employee?.department?.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {TYPE_OPTIONS.find((t) => t.value === auth.type)?.label}
                    </TableCell>
                    <TableCell>{formatDateToFrench(auth.date)}</TableCell>
                    <TableCell>
                      <span className="font-mono">
                        {auth.start_time} - {auth.end_time}
                      </span>
                    </TableCell>
                    <TableCell>{auth.duration_minutes} min</TableCell>
                    <TableCell>
                      <Chip color={STATUS_COLORS[auth.status]} variant="flat" size="sm">
                        {STATUS_OPTIONS.find((s) => s.value === auth.status)?.label}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {auth.status === "pending" && (
                          <>
                            <Button
                              isIconOnly
                              size="sm"
                              color="success"
                              variant="flat"
                              onPress={() => openApprovalModal(auth)}
                            >
                              <FiCheck />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              variant="flat"
                              onPress={() => openApprovalModal(auth)}
                            >
                              <FiX />
                            </Button>
                          </>
                        )}
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleEdit(auth)}
                        >
                          <FiEdit />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Modal CRUD */}
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            <ModalHeader>
              {selectedAuth ? "Modifier" : "Nouvelle"} Autorisation
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Select
                  label="Employé"
                  placeholder="Sélectionner"
                  selectedKeys={formData.employee_id ? [formData.employee_id] : []}
                  onChange={(e) =>
                    setFormData({ ...formData, employee_id: e.target.value })
                  }
                  isRequired
                >
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Type"
                  placeholder="Sélectionner"
                  selectedKeys={formData.type ? [formData.type] : []}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  isRequired
                >
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>

                <Input
                  type="date"
                  label="Date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  isRequired
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="time"
                    label="Heure début"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    onBlur={calculateDuration}
                    isRequired
                  />
                  <Input
                    type="time"
                    label="Heure fin"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    onBlur={calculateDuration}
                    isRequired
                  />
                </div>

                <Input
                  label="Durée (minutes)"
                  value={formData.duration_minutes.toString()}
                  isReadOnly
                  description="Calculée automatiquement"
                />

                <Textarea
                  label="Raison"
                  placeholder="Expliquez la raison de cette autorisation..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  minRows={3}
                  isRequired
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Annuler
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                {selectedAuth ? "Modifier" : "Créer"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Approbation/Rejet */}
        <Modal isOpen={isApproveOpen} onClose={onApproveClose}>
          <ModalContent>
            <ModalHeader>
              {selectedAuth?.status === "pending" ? "Approuver/Rejeter" : "Détails"}
            </ModalHeader>
            <ModalBody>
              <Textarea
                label="Commentaires"
                placeholder="Commentaires optionnels..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                minRows={3}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onApproveClose}>
                Annuler
              </Button>
              <Button
                color="danger"
                onPress={handleReject}
                isLoading={rejectMutation.isPending}
              >
                Rejeter
              </Button>
              <Button
                color="success"
                onPress={handleApprove}
                isLoading={approveMutation.isPending}
              >
                Approuver
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
