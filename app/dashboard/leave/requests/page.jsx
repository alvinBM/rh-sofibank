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
  Textarea,
  Checkbox,
  Card,
  CardBody,
  Divider,
} from "@nextui-org/react";
import { FiSearch, FiPlus, FiEye, FiCheck, FiX, FiMoreVertical, FiUpload, FiDownload } from "react-icons/fi";
import {
  useGetLeaveRequests,
  useGetLeaveTypes,
  useGetLeaveRequestById,
  useCreateLeaveRequest,
  useUpdateLeaveRequest,
  useSubmitLeaveRequest,
  useApproveByBackup,
  useApproveBySupervisor,
  useApproveByHR,
  useApproveByDG,
  useRejectLeaveRequest,
  useCancelLeaveRequest,
  useUploadHandoverDocument,
  useCalculateWorkingDays,
  useGetLeaveBalances,
} from "@/src/hooks/useLeave";
import { useGetEmployees } from "@/src/hooks/useEmployees";
import { toast } from "react-toastify";
import WorkflowTimeline from "@/app/ui/dashboard/leave/WorkflowTimeline";
import { formatDateToFrench, formatDateToISO, getTodayISO } from "@/src/utils/dateUtils";

const LEAVE_STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon" },
  { value: "pending_backup", label: "En attente remplaçant" },
  { value: "backup_confirmed", label: "Remplaçant confirmé" },
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
  backup_confirmed: "danger",
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
  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    backup_person_id: "",
    reason: "",
    handover_completed: false,
  });
  const [workingDays, setWorkingDays] = useState(0);
  const [handoverFile, setHandoverFile] = useState(null);
  const [approvalComments, setApprovalComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isApproveOpen, onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure();
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();

  // Hooks
  const { data: leaveTypesData } = useGetLeaveTypes();
  const { data: employeesData } = useGetEmployees({ page: 1, rowsPerPage: 1000 });
  const { data, isLoading, error } = useGetLeaveRequests({
    page,
    rowsPerPage,
    query: searchQuery,
    filters,
  });
  const { data: selectedRequestDetail } = useGetLeaveRequestById(selectedRequest?.id);

  const createMutation = useCreateLeaveRequest();
  const updateMutation = useUpdateLeaveRequest();
  const submitMutation = useSubmitLeaveRequest();
  const approveByBackupMutation = useApproveByBackup();
  const approveBySupervisorMutation = useApproveBySupervisor();
  const approveByHRMutation = useApproveByHR();
  const approveByDGMutation = useApproveByDG();
  const rejectMutation = useRejectLeaveRequest();
  const cancelMutation = useCancelLeaveRequest();
  const uploadDocMutation = useUploadHandoverDocument();
  const calculateDaysMutation = useCalculateWorkingDays();

  const requests = data?.requests || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / rowsPerPage);
  const employees = employeesData?.employees || [];

  // Calculer automatiquement les jours ouvrables
  const handleDateChange = useCallback(
    async (field, value) => {
      setFormData((prev) => {
        const updated = { ...prev, [field]: value };

        if (updated.start_date && updated.end_date) {
          calculateDaysMutation.mutate(
            { startDate: updated.start_date, endDate: updated.end_date },
            {
              onSuccess: (data) => {
                setWorkingDays(data.working_days || 0);
              },
            }
          );
        }

        return updated;
      });
    },
    [calculateDaysMutation]
  );

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
      status: "",
      leave_type_id: "",
      start_date: "",
      end_date: "",
    });
    setSearchQuery("");
    setPage(1);
  }, []);

  const handleViewRequest = useCallback(
    (request) => {
      setSelectedRequest(request);
      onDetailOpen();
    },
    [onDetailOpen]
  );

  const handleCreateRequest = useCallback(() => {
    setFormData({
      leave_type_id: "",
      start_date: "",
      end_date: "",
      backup_person_id: "",
      reason: "",
      handover_completed: false,
    });
    setWorkingDays(0);
    setHandoverFile(null);
    onCreateOpen();
  }, [onCreateOpen]);

  const handleSubmitCreate = useCallback(async () => {
    if (!formData.leave_type_id || !formData.start_date || !formData.end_date || !formData.backup_person_id) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const payload = {
        ...formData,
        duration: workingDays,
        status: "draft",
        workflow_status: "draft",
      };

      const result = await createMutation.mutateAsync(payload);

      // Upload du document si présent
      if (handoverFile && result.id) {
        await uploadDocMutation.mutateAsync({
          leaveRequestId: result.id,
          file: handoverFile,
        });
      }

      // Soumettre automatiquement la demande
      await submitMutation.mutateAsync(result.id);

      toast.success("Demande de congé créée avec succès");
      onCreateClose();
    } catch (error) {
      toast.error("Erreur lors de la création de la demande");
      console.error(error);
    }
  }, [formData, workingDays, handoverFile, createMutation, uploadDocMutation, submitMutation, onCreateClose]);

  const handleApprove = useCallback(
    async (request) => {
      setSelectedRequest(request);
      setApprovalComments("");
      onApproveOpen();
    },
    [onApproveOpen]
  );

  const handleConfirmApprove = useCallback(async () => {
    if (!selectedRequest) return;

    try {
      const status = selectedRequest.status || selectedRequest.workflow_status;

      // Déterminer quelle mutation utiliser selon le statut
      if (status === "pending_backup") {
        await approveByBackupMutation.mutateAsync({
          id: selectedRequest.id,
          backupId: selectedRequest.backup_person_id,
          comments: approvalComments,
        });
      } else if (status === "backup_confirmed" || status === "pending_supervisor") {
        if (!selectedRequest.handover_completed) {
          toast.error("La feuille de Remise-Reprise doit être complétée avant validation");
          return;
        }
        await approveBySupervisorMutation.mutateAsync({
          id: selectedRequest.id,
          supervisorId: selectedRequest.supervisor_id,
          comments: approvalComments,
        });
      } else if (status === "pending_hr") {
        await approveByHRMutation.mutateAsync({
          id: selectedRequest.id,
          hrUserId: "current-user-id", // TODO: Récupérer l'ID de l'utilisateur connecté
          comments: approvalComments,
        });
      } else if (status === "pending_dg") {
        await approveByDGMutation.mutateAsync({
          id: selectedRequest.id,
          dgUserId: "current-user-id",
          comments: approvalComments,
        });
      }

      toast.success("Demande approuvée avec succès");
      onApproveClose();
      setSelectedRequest(null);
    } catch (error) {
      toast.error("Erreur lors de l'approbation");
      console.error(error);
    }
  }, [
    selectedRequest,
    approvalComments,
    approveByBackupMutation,
    approveBySupervisorMutation,
    approveByHRMutation,
    approveByDGMutation,
    onApproveClose,
  ]);

  const handleReject = useCallback(
    (request) => {
      setSelectedRequest(request);
      setRejectionReason("");
      onRejectOpen();
    },
    [onRejectOpen]
  );

  const handleConfirmReject = useCallback(async () => {
    if (!selectedRequest || !rejectionReason) {
      toast.error("Veuillez indiquer une raison de rejet");
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: selectedRequest.id,
        rejectionData: {
          approver_id: "current-user-id",
          level: "supervisor", // TODO: Déterminer le niveau selon le rôle
          comments: rejectionReason,
        },
      });

      toast.success("Demande rejetée");
      onRejectClose();
      setSelectedRequest(null);
    } catch (error) {
      toast.error("Erreur lors du rejet");
      console.error(error);
    }
  }, [selectedRequest, rejectionReason, rejectMutation, onRejectClose]);

  const handleCancel = useCallback(
    async (request) => {
      if (!confirm("Voulez-vous vraiment annuler cette demande ?")) return;

      const reason = prompt("Raison de l'annulation:");
      if (!reason) return;

      try {
        await cancelMutation.mutateAsync({ id: request.id, reason });
        toast.success("Demande annulée");
      } catch (error) {
        toast.error("Erreur lors de l'annulation");
        console.error(error);
      }
    },
    [cancelMutation]
  );

  const renderCell = useCallback(
    (request, columnKey) => {
      switch (columnKey) {
        case "request_number":
          return (
            <div className="flex flex-col">
              <p className="text-sm font-semibold">{request.request_number}</p>
              <p className="text-xs text-default-400">
                {formatDateToFrench(request.created_at)}
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
                {formatDateToFrench(request.start_date)} - {formatDateToFrench(request.end_date)}
              </p>
              <p className="text-xs text-default-400">{request.duration} jour(s)</p>
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
              {LEAVE_STATUS_OPTIONS.find((opt) => opt.value === request.status)?.label ||
                request.status}
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
                {request.status.startsWith("pending_") && (
                  <>
                    <DropdownItem
                      key="approve"
                      startContent={<FiCheck />}
                      className="text-success"
                      color="success"
                      onPress={() => handleApprove(request)}
                    >
                      Approuver
                    </DropdownItem>
                    <DropdownItem
                      key="reject"
                      startContent={<FiX />}
                      className="text-danger"
                      color="danger"
                      onPress={() => handleReject(request)}
                    >
                      Rejeter
                    </DropdownItem>
                  </>
                )}
                {(request.status === "draft" || request.status === "pending_backup") && (
                  <DropdownItem
                    key="cancel"
                    startContent={<FiX />}
                    className="text-danger"
                    color="danger"
                    onPress={() => handleCancel(request)}
                  >
                    Annuler
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          );
        default:
          return request[columnKey];
      }
    },
    [handleViewRequest, handleApprove, handleReject, handleCancel]
  );

  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Demandes de Congés</h1>
          <Button color="danger" startContent={<FiPlus />} onPress={handleCreateRequest}>
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

          <Button variant="flat" onPress={handleClearFilters}>
            Réinitialiser
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-sm">Total: {total} demande(s)</span>
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
      searchQuery,
      filters,
      leaveTypesData,
      total,
      rowsPerPage,
      handleSearchChange,
      handleFilterChange,
      handleClearFilters,
      handleCreateRequest,
    ]
  );

  const bottomContent = useMemo(
    () => (
      <div className="flex w-full justify-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="danger"
          page={page}
          total={totalPages}
          onChange={setPage}
        />
      </div>
    ),
    [page, totalPages]
  );

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
      <div className="p-0">
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
                {(columnKey) => <TableCell>{renderCell(request, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Modal Détails */}
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="4xl" scrollBehavior="inside">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Détails de la Demande - {selectedRequestDetail?.request_number}
                </ModalHeader>
                <ModalBody>
                  {selectedRequestDetail && (
                    <div className="space-y-6">
                      {/* Informations de base */}
                      <Card>
                        <CardBody>
                          <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-default-500">Numéro</p>
                              <p className="font-semibold">{selectedRequestDetail.request_number}</p>
                            </div>
                            <div>
                              <p className="text-sm text-default-500">Statut</p>
                              <Chip
                                color={LEAVE_STATUS_COLORS[selectedRequestDetail.status]}
                                variant="flat"
                              >
                                {LEAVE_STATUS_OPTIONS.find(
                                  (opt) => opt.value === selectedRequestDetail.status
                                )?.label}
                              </Chip>
                            </div>
                            <div>
                              <p className="text-sm text-default-500">Employé</p>
                              <p className="font-semibold">
                                {selectedRequestDetail.employee?.first_name}{" "}
                                {selectedRequestDetail.employee?.last_name}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-default-500">Type de congé</p>
                              <p className="font-semibold">{selectedRequestDetail.leave_type?.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-default-500">Date de début</p>
                              <p className="font-semibold">
                                {formatDateToFrench(selectedRequestDetail.start_date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-default-500">Date de fin</p>
                              <p className="font-semibold">
                                {formatDateToFrench(selectedRequestDetail.end_date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-default-500">Durée</p>
                              <p className="font-semibold">{selectedRequestDetail.duration} jour(s)</p>
                            </div>
                            <div>
                              <p className="text-sm text-default-500">Remplaçant</p>
                              <p className="font-semibold">
                                {selectedRequestDetail.backup_person
                                  ? `${selectedRequestDetail.backup_person.first_name} ${selectedRequestDetail.backup_person.last_name}`
                                  : "-"}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm text-default-500">Motif</p>
                              <p className="font-semibold">{selectedRequestDetail.reason || "-"}</p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>

                      <Divider />

                      {/* Timeline du workflow */}
                      <Card>
                        <CardBody>
                          <h3 className="text-lg font-semibold mb-4">Historique d'approbation</h3>
                          <WorkflowTimeline
                            request={selectedRequestDetail}
                            approvals={selectedRequestDetail.approvals || []}
                          />
                        </CardBody>
                      </Card>
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

        {/* Modal Création */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Nouvelle Demande de Congé</ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Select
                      label="Type de congé"
                      placeholder="Sélectionner un type"
                      isRequired
                      selectedKeys={formData.leave_type_id ? [formData.leave_type_id] : []}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, leave_type_id: e.target.value }))
                      }
                    >
                      {(leaveTypesData || []).map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </Select>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="date"
                        label="Date de début"
                        isRequired
                        value={formData.start_date}
                        onChange={(e) => handleDateChange("start_date", e.target.value)}
                        min={getTodayISO()}
                      />
                      <Input
                        type="date"
                        label="Date de fin"
                        isRequired
                        value={formData.end_date}
                        onChange={(e) => handleDateChange("end_date", e.target.value)}
                        min={formData.start_date || getTodayISO()}
                      />
                    </div>

                    {workingDays > 0 && (
                      <Card className="bg-danger-50">
                        <CardBody>
                          <p className="text-sm font-semibold text-danger">
                            Durée: {workingDays} jour(s) ouvrable(s)
                          </p>
                        </CardBody>
                      </Card>
                    )}

                    <Select
                      label="Collaborateur remplaçant"
                      placeholder="Sélectionner un remplaçant"
                      isRequired
                      selectedKeys={formData.backup_person_id ? [formData.backup_person_id] : []}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, backup_person_id: e.target.value }))
                      }
                    >
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} - {emp.employee_number}
                        </SelectItem>
                      ))}
                    </Select>

                    <Textarea
                      label="Motif / Commentaire"
                      placeholder="Raison de la demande..."
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, reason: e.target.value }))
                      }
                    />

                    <Checkbox
                      isSelected={formData.handover_completed}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, handover_completed: value }))
                      }
                    >
                      Feuille de Remise-Reprise complétée
                    </Checkbox>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Document Remise-Reprise (optionnel)
                      </label>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setHandoverFile(e.target.files[0])}
                        startContent={<FiUpload />}
                      />
                      {handoverFile && (
                        <p className="text-xs text-success mt-1">Fichier: {handoverFile.name}</p>
                      )}
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Annuler
                  </Button>
                  <Button
                    color="danger"
                    onPress={handleSubmitCreate}
                    isLoading={createMutation.isPending || uploadDocMutation.isPending}
                  >
                    Soumettre la demande
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal Approbation */}
        <Modal isOpen={isApproveOpen} onClose={onApproveClose}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Approuver la Demande</ModalHeader>
                <ModalBody>
                  <Textarea
                    label="Commentaires (optionnel)"
                    placeholder="Ajouter un commentaire..."
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Annuler
                  </Button>
                  <Button color="success" onPress={handleConfirmApprove}>
                    Confirmer l'approbation
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal Rejet */}
        <Modal isOpen={isRejectOpen} onClose={onRejectClose}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Rejeter la Demande</ModalHeader>
                <ModalBody>
                  <Textarea
                    label="Raison du rejet"
                    placeholder="Indiquer la raison..."
                    isRequired
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="default" variant="light" onPress={onClose}>
                    Annuler
                  </Button>
                  <Button color="danger" onPress={handleConfirmReject}>
                    Confirmer le rejet
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
