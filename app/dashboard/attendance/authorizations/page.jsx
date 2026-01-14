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
  // const { data: authData, isLoading } = useGetExitAuthorizations({
  //   page,
  //   rowsPerPage,
  //   query: searchQuery,
  //   filters,
  // });

  // const { data: employeesData } = useGetEmployees({
  //   page: 1,
  //   rowsPerPage: 1000,
  //   query: "",
  //   filters: { status: "active" },
  // });

  // Mutations
  const createMutation = useCreateExitAuthorization();
  const updateMutation = useUpdateExitAuthorization();
  const approveMutation = useApproveExitAuthorization();
  const rejectMutation = useRejectExitAuthorization();

  // TEST DATA - Autorisations de sortie
  const isLoading = false;
  const mockAuthorizations = [
    {
      id: 1,
      employee_id: 1,
      employee: {
        first_name: "Jean",
        last_name: "Dupont",
        department: { name: "Ressources Humaines" },
      },
      type: "appointment",
      date: "2026-01-14",
      start_time: "14:00",
      end_time: "16:00",
      duration_minutes: 120,
      reason: "Rendez-vous médical urgent",
      status: "pending",
      created_at: "2026-01-14T08:30:00",
    },
    {
      id: 2,
      employee_id: 2,
      employee: {
        first_name: "Marie",
        last_name: "Kabila",
        department: { name: "Finance" },
      },
      type: "early_leave",
      date: "2026-01-14",
      start_time: "15:30",
      end_time: "17:00",
      duration_minutes: 90,
      reason: "Urgence familiale - Rendez-vous scolaire",
      status: "approved",
      created_at: "2026-01-13T16:20:00",
      approved_at: "2026-01-13T16:45:00",
    },
    {
      id: 3,
      employee_id: 3,
      employee: {
        first_name: "Pierre",
        last_name: "Tshisekedi",
        department: { name: "IT" },
      },
      type: "short_absence",
      date: "2026-01-14",
      start_time: "10:00",
      end_time: "11:30",
      duration_minutes: 90,
      reason: "Rendez-vous bancaire",
      status: "approved",
      created_at: "2026-01-13T14:00:00",
      approved_at: "2026-01-13T14:15:00",
    },
    {
      id: 4,
      employee_id: 4,
      employee: {
        first_name: "Sophie",
        last_name: "Mukendi",
        department: { name: "Marketing" },
      },
      type: "personal",
      date: "2026-01-15",
      start_time: "13:00",
      end_time: "14:30",
      duration_minutes: 90,
      reason: "Démarches administratives",
      status: "pending",
      created_at: "2026-01-14T09:00:00",
    },
    {
      id: 5,
      employee_id: 5,
      employee: {
        first_name: "Jacques",
        last_name: "Lumbu",
        department: { name: "Opérations" },
      },
      type: "early_leave",
      date: "2026-01-13",
      start_time: "16:00",
      end_time: "17:00",
      duration_minutes: 60,
      reason: "Récupération enfant à l'école",
      status: "used",
      created_at: "2026-01-12T15:30:00",
      approved_at: "2026-01-12T16:00:00",
      used_at: "2026-01-13T16:05:00",
    },
    {
      id: 6,
      employee_id: 6,
      employee: {
        first_name: "Christine",
        last_name: "Mbuyi",
        department: { name: "Ressources Humaines" },
      },
      type: "appointment",
      date: "2026-01-15",
      start_time: "09:00",
      end_time: "11:00",
      duration_minutes: 120,
      reason: "Consultation médicale de contrôle",
      status: "approved",
      created_at: "2026-01-14T07:45:00",
      approved_at: "2026-01-14T08:00:00",
    },
    {
      id: 7,
      employee_id: 7,
      employee: {
        first_name: "David",
        last_name: "Kalala",
        department: { name: "Comptabilité" },
      },
      type: "personal",
      date: "2026-01-14",
      start_time: "11:00",
      end_time: "12:00",
      duration_minutes: 60,
      reason: "Rendez-vous notaire",
      status: "rejected",
      created_at: "2026-01-14T08:00:00",
      rejected_at: "2026-01-14T08:30:00",
      rejection_reason: "Période de forte activité, merci de reporter",
    },
    {
      id: 8,
      employee_id: 8,
      employee: {
        first_name: "Antoinette",
        last_name: "Ngoy",
        department: { name: "Ventes" },
      },
      type: "short_absence",
      date: "2026-01-16",
      start_time: "14:00",
      end_time: "15:30",
      duration_minutes: 90,
      reason: "Récupération documents administratifs",
      status: "pending",
      created_at: "2026-01-14T10:15:00",
    },
    {
      id: 9,
      employee_id: 9,
      employee: {
        first_name: "François",
        last_name: "Kasongo",
        department: { name: "Logistique" },
      },
      type: "early_leave",
      date: "2026-01-14",
      start_time: "15:00",
      end_time: "17:00",
      duration_minutes: 120,
      reason: "Problème familial urgent",
      status: "approved",
      created_at: "2026-01-14T11:00:00",
      approved_at: "2026-01-14T11:15:00",
    },
    {
      id: 10,
      employee_id: 10,
      employee: {
        first_name: "Jeanne",
        last_name: "Mutombo",
        department: { name: "Service Client" },
      },
      type: "appointment",
      date: "2026-01-17",
      start_time: "10:30",
      end_time: "12:00",
      duration_minutes: 90,
      reason: "Rendez-vous médical spécialisé",
      status: "pending",
      created_at: "2026-01-14T12:00:00",
    },
  ];

  const mockEmployees = [
    { id: 1, first_name: "Jean", last_name: "Dupont" },
    { id: 2, first_name: "Marie", last_name: "Kabila" },
    { id: 3, first_name: "Pierre", last_name: "Tshisekedi" },
    { id: 4, first_name: "Sophie", last_name: "Mukendi" },
    { id: 5, first_name: "Jacques", last_name: "Lumbu" },
    { id: 6, first_name: "Christine", last_name: "Mbuyi" },
    { id: 7, first_name: "David", last_name: "Kalala" },
    { id: 8, first_name: "Antoinette", last_name: "Ngoy" },
    { id: 9, first_name: "François", last_name: "Kasongo" },
    { id: 10, first_name: "Jeanne", last_name: "Mutombo" },
  ];

  const authorizations = mockAuthorizations;
  const total = mockAuthorizations.length;
  const pages = Math.ceil(total / rowsPerPage);
  const employees = mockEmployees;

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
          <Button color="danger" startContent={<FiPlus />} onPress={handleCreate}>
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
                      color="danger"
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
                color="danger"
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
