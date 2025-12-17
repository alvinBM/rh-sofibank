"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Select,
  SelectItem,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import {
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiEye,
  FiEdit,
  FiCheckCircle,
  FiFileText,
  FiTrash2,
  FiDownload,
  FiSend,
} from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetWorkforcePlannings,
  useGetWorkforcePlanningById,
  useCreateWorkforcePlanning,
  useUpdateWorkforcePlanning,
  useDeleteWorkforcePlanning,
  useCreatePlanningItem,
  useUpdatePlanningItem,
  useDeletePlanningItem,
} from "@/src/hooks/useRecruitment";
import { useGetDirections, useGetServices, useGetGrades, useGetJobPositions } from "@/src/hooks/useMain";
import { useGetEmployees } from "@/src/hooks/useEmployees";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";

const STATUS_COLORS = {
  draft: "default",
  submitted: "danger",
  hr_review: "warning",
  dg_approval: "warning",
  approved: "success",
  rejected: "danger",
};

const STATUS_LABELS = {
  draft: "Brouillon",
  submitted: "Soumis",
  hr_review: "Revue RH",
  dg_approval: "Approbation DG",
  approved: "Approuvé",
  rejected: "Rejeté",
};

const NEED_TYPES = [
  { value: "new_position", label: "Nouveau Poste" },
  { value: "replacement", label: "Remplacement" },
  { value: "expansion", label: "Expansion" },
];

export default function WorkforcePlanningPage() {
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    direction_id: "",
    status: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlanning, setSelectedPlanning] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isItemOpen, onOpen: onItemOpen, onClose: onItemClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

  const { data: plannings, isLoading } = useGetWorkforcePlannings(filters);
  const { data: directionsData } = useGetDirections({ page: 1, rowsPerPage: 100 });
  const { data: servicesData } = useGetServices({ page: 1, rowsPerPage: 100 });
  const { data: gradesData } = useGetGrades({ page: 1, rowsPerPage: 100 });
  const { data: jobPositionsData } = useGetJobPositions({ page: 1, rowsPerPage: 100 });
  const { data: employeesData } = useGetEmployees({ page: 1, rowsPerPage: 1000 });
  const { data: planningDetail, isLoading: isDetailLoading } = useGetWorkforcePlanningById(selectedPlanning?.id);

  const createPlanningMutation = useCreateWorkforcePlanning();
  const updatePlanningMutation = useUpdateWorkforcePlanning();
  const deletePlanningMutation = useDeleteWorkforcePlanning();
  const createItemMutation = useCreatePlanningItem();
  const updateItemMutation = useUpdatePlanningItem();
  const deleteItemMutation = useDeletePlanningItem();

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      year: new Date().getFullYear(),
      direction_id: "",
      description: "",
    }
  });

  const { control: itemControl, handleSubmit: handleItemSubmit, watch: watchItem, reset: resetItem, formState: { errors: itemErrors } } = useForm({
    defaultValues: {
      job_position_id: "",
      grade_id: "",
      service_id: "",
      need_type: "",
      number_of_positions: 1,
      justification: "",
      replacing_employee_id: "",
      priority: "",
    }
  });

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);
  const selectedDirection = watch("direction_id");
  const needType = watchItem("need_type");

  const filteredServices = servicesData?.services?.filter(
    (service) => service.direction_id === selectedDirection
  ) || [];

  const handleOpenModal = (planning = null) => {
    if (planning) {
      setSelectedPlanning(planning);
      reset({
        year: planning.year,
        direction_id: planning.direction_id,
        description: planning.description || "",
      });
    } else {
      setSelectedPlanning(null);
      reset({
        year: new Date().getFullYear(),
        direction_id: "",
        description: "",
      });
    }
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedPlanning(null);
    reset();
    onClose();
  };

  const handleOpenItemModal = (item = null) => {
    if (item) {
      setSelectedItem(item);
      resetItem({
        job_position_id: item.job_position_id || "",
        grade_id: item.grade_id || "",
        service_id: item.service_id || "",
        need_type: item.need_type || "",
        number_of_positions: item.number_of_positions || 1,
        justification: item.justification || "",
        replacing_employee_id: item.replacing_employee_id || "",
        priority: item.priority || "",
      });
    } else {
      setSelectedItem(null);
      resetItem({
        job_position_id: "",
        grade_id: "",
        service_id: "",
        need_type: "",
        number_of_positions: 1,
        justification: "",
        replacing_employee_id: "",
        priority: "",
      });
    }
    onItemOpen();
  };

  const handleCloseItemModal = () => {
    setSelectedItem(null);
    resetItem();
    onItemClose();
  };

  const handleViewDetail = (planning) => {
    setSelectedPlanning(planning);
    onDetailOpen();
  };

  const handleCloseDetail = () => {
    setSelectedPlanning(null);
    onDetailClose();
  };

  const onSubmit = async (data) => {
    try {
      if (selectedPlanning) {
        await updatePlanningMutation.mutateAsync({
          id: selectedPlanning.id,
          updates: data,
        });
        toast.success("Plan mis à jour avec succès");
      } else {
        await createPlanningMutation.mutateAsync({
          ...data,
          status: "draft",
        });
        toast.success("Plan créé avec succès");
      }
      handleCloseModal();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
      console.error(error);
    }
  };

  const onItemSubmit = async (data) => {
    try {
      if (selectedItem) {
        await updateItemMutation.mutateAsync({
          id: selectedItem.id,
          updates: data,
        });
        toast.success("Ligne mise à jour avec succès");
      } else {
        if (!selectedPlanning) {
          toast.error("Veuillez d'abord sélectionner un plan");
          return;
        }
        await createItemMutation.mutateAsync({
          ...data,
          planning_id: selectedPlanning.id,
        });
        toast.success("Ligne ajoutée avec succès");
      }
      handleCloseItemModal();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
      console.error(error);
    }
  };

  const handleSubmitForApproval = async (planningId) => {
    if (window.confirm("Êtes-vous sûr de vouloir soumettre ce plan pour approbation ?")) {
      try {
        await updatePlanningMutation.mutateAsync({
          id: planningId,
          updates: { status: "submitted" },
        });
        toast.success("Plan soumis pour approbation");
      } catch (error) {
        toast.error("Erreur lors de la soumission");
        console.error(error);
      }
    }
  };

  const handleApprove = async (planningId) => {
    if (window.confirm("Êtes-vous sûr de vouloir approuver ce plan ?")) {
      try {
        await updatePlanningMutation.mutateAsync({
          id: planningId,
          updates: {
            status: "approved",
            dg_approved_at: new Date().toISOString(),
          },
        });
        toast.success("Plan approuvé avec succès");
      } catch (error) {
        toast.error("Erreur lors de l'approbation");
        console.error(error);
      }
    }
  };

  const handleDelete = async (planningId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce plan ?")) {
      try {
        await deletePlanningMutation.mutateAsync(planningId);
        toast.success("Plan supprimé avec succès");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
        console.error(error);
      }
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette ligne ?")) {
      try {
        await deleteItemMutation.mutateAsync(itemId);
        toast.success("Ligne supprimée");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
        console.error(error);
      }
    }
  };

  const handleExportPDF = () => {
    toast.info("Export PDF - Fonctionnalité à implémenter");
  };

  const filteredPlannings = plannings?.filter((planning) =>
    searchQuery === "" ||
    planning.planning_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    planning.direction?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <PermissionGuard requiredPermission="recruitment_manage">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Planification Annuelle des Besoins</h1>
            <p className="text-default-500">Gérez les besoins en personnel par Direction</p>
          </div>
          <Button color="danger" startContent={<FiPlus />} onPress={() => handleOpenModal()}>
            Nouveau Plan
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{filteredPlannings.filter(p => p.status === "draft").length || 0}</p>
              <p className="text-sm text-default-500">Brouillons</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{filteredPlannings.filter(p => p.status === "submitted").length || 0}</p>
              <p className="text-sm text-default-500">En Attente</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{filteredPlannings.filter(p => p.status === "approved").length || 0}</p>
              <p className="text-sm text-default-500">Approuvés</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">
                {filteredPlannings.reduce((acc, p) => acc + (p.total_positions_requested || 0), 0)}
              </p>
              <p className="text-sm text-default-500">Postes Total</p>
            </CardBody>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex gap-4">
              <Input
                placeholder="Rechercher..."
                startContent={<FiSearch />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />

              <Select
                label="Année"
                selectedKeys={[String(filters.year)]}
                onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}
                className="w-32"
              >
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Direction"
                placeholder="Toutes les directions"
                selectedKeys={filters.direction_id ? [filters.direction_id] : []}
                onChange={(e) => setFilters({ ...filters, direction_id: e.target.value })}
                className="flex-1"
              >
                {(directionsData?.directions || []).map((direction) => (
                  <SelectItem key={direction.id} value={direction.id}>
                    {direction.name}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Statut"
                placeholder="Tous les statuts"
                selectedKeys={filters.status ? [filters.status] : []}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-48"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </Select>

              <Button
                variant="flat"
                onPress={() => {
                  setFilters({ year: new Date().getFullYear(), direction_id: "", status: "" });
                  setSearchQuery("");
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Table */}
        <Card>
          <CardBody>
            <Table aria-label="Plans de besoins en personnel">
              <TableHeader>
                <TableColumn>NUMÉRO</TableColumn>
                <TableColumn>ANNÉE</TableColumn>
                <TableColumn>DIRECTION</TableColumn>
                <TableColumn>POSTES DEMANDÉS</TableColumn>
                <TableColumn>BUDGET ESTIMÉ</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                items={filteredPlannings}
                isLoading={isLoading}
                loadingContent={<Spinner label="Chargement..." />}
                emptyContent="Aucun plan trouvé"
              >
                {(planning) => (
                  <TableRow key={planning.id}>
                    <TableCell>{planning.planning_number}</TableCell>
                    <TableCell>{planning.year}</TableCell>
                    <TableCell>{planning.direction?.name || "-"}</TableCell>
                    <TableCell>{planning.total_positions_requested || 0}</TableCell>
                    <TableCell>{planning.total_budget_estimated?.toLocaleString() || "0"} FC</TableCell>
                    <TableCell>
                      <Chip color={STATUS_COLORS[planning.status]} variant="flat" size="sm">
                        {STATUS_LABELS[planning.status]}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <FiMoreVertical />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="view"
                            startContent={<FiEye />}
                            onPress={() => handleViewDetail(planning)}
                          >
                            Voir détails
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<FiEdit />}
                            onPress={() => handleOpenModal(planning)}
                          >
                            Modifier
                          </DropdownItem>
                          {planning.status === "draft" && (
                            <DropdownItem
                              key="submit"
                              startContent={<FiSend />}
                              onPress={() => handleSubmitForApproval(planning.id)}
                            >
                              Soumettre pour approbation
                            </DropdownItem>
                          )}
                          {planning.status === "submitted" && (
                            <DropdownItem
                              key="approve"
                              startContent={<FiCheckCircle />}
                              onPress={() => handleApprove(planning.id)}
                              className="text-success"
                            >
                              Approuver
                            </DropdownItem>
                          )}
                          <DropdownItem
                            key="export"
                            startContent={<FiDownload />}
                            onPress={handleExportPDF}
                          >
                            Exporter PDF
                          </DropdownItem>
                          {planning.status === "draft" && (
                            <DropdownItem
                              key="delete"
                              startContent={<FiTrash2 />}
                              onPress={() => handleDelete(planning.id)}
                              className="text-danger"
                              color="danger"
                            >
                              Supprimer
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Modal CRUD Planning */}
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="3xl">
          <ModalContent>
            {(onClose) => (
              <form onSubmit={handleSubmit(onSubmit)}>
                <ModalHeader>
                  <h3 className="text-xl font-bold">
                    {selectedPlanning ? "Modifier le Plan" : "Créer un Nouveau Plan"}
                  </h3>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="year"
                        control={control}
                        rules={{ required: "Année requise" }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            label="Année"
                            placeholder="Sélectionnez l'année"
                            isRequired
                            errorMessage={errors.year?.message}
                            isInvalid={!!errors.year}
                            selectedKeys={field.value ? [String(field.value)] : []}
                            onSelectionChange={(keys) => field.onChange(Number(Array.from(keys)[0]))}
                          >
                            {years.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      />

                      <Controller
                        name="direction_id"
                        control={control}
                        rules={{ required: "Direction requise" }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            label="Direction"
                            placeholder="Sélectionnez la direction"
                            isRequired
                            errorMessage={errors.direction_id?.message}
                            isInvalid={!!errors.direction_id}
                            selectedKeys={field.value ? [field.value] : []}
                            onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                          >
                            {(directionsData?.directions || []).map((direction) => (
                              <SelectItem key={direction.id} value={direction.id}>
                                {direction.name}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      />
                    </div>

                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="Description"
                          placeholder="Description du plan de recrutement..."
                          minRows={4}
                        />
                      )}
                    />

                    <div className="bg-danger-50 p-4 rounded-lg">
                      <p className="text-sm text-default-600">
                        Après la création du plan, vous pourrez ajouter les lignes de besoins détaillés
                        (postes, grades, services, etc.)
                      </p>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={handleCloseModal}>
                    Annuler
                  </Button>
                  <Button
                    color="danger"
                    type="submit"
                    isLoading={createPlanningMutation.isPending || updatePlanningMutation.isPending}
                  >
                    {selectedPlanning ? "Mettre à jour" : "Créer"}
                  </Button>
                </ModalFooter>
              </form>
            )}
          </ModalContent>
        </Modal>

        {/* Modal Detail avec lignes */}
        <Modal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          size="5xl"
          scrollBehavior="inside"
          classNames={{
            base: "max-h-[90vh]",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  <h3 className="text-xl font-bold">Détails du Plan de Recrutement</h3>
                </ModalHeader>
                <ModalBody>
                  {isDetailLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner label="Chargement..." />
                    </div>
                  ) : planningDetail ? (
                    <div className="space-y-4">
                      <Card>
                        <CardBody>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-default-500">Numéro</p>
                              <p className="font-semibold">{planningDetail.planning_number}</p>
                            </div>
                            <div>
                              <p className="text-sm text-default-500">Année</p>
                              <p className="font-semibold">{planningDetail.year}</p>
                            </div>
                            <div>
                              <p className="text-sm text-default-500">Direction</p>
                              <p className="font-semibold">{planningDetail.direction?.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-default-500">Statut</p>
                              <Chip color={STATUS_COLORS[planningDetail.status]} variant="flat">
                                {STATUS_LABELS[planningDetail.status]}
                              </Chip>
                            </div>
                          </div>
                          {planningDetail.description && (
                            <div className="mt-4">
                              <p className="text-sm text-default-500">Description</p>
                              <p className="text-sm">{planningDetail.description}</p>
                            </div>
                          )}
                        </CardBody>
                      </Card>

                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg">Lignes de besoins</h4>
                        {planningDetail.status === "draft" && (
                          <Button
                            size="sm"
                            color="danger"
                            startContent={<FiPlus />}
                            onPress={() => handleOpenItemModal()}
                          >
                            Ajouter une ligne
                          </Button>
                        )}
                      </div>

                      <Table aria-label="Lignes de besoins">
                        <TableHeader>
                          <TableColumn>POSTE</TableColumn>
                          <TableColumn>GRADE</TableColumn>
                          <TableColumn>SERVICE</TableColumn>
                          <TableColumn>TYPE</TableColumn>
                          <TableColumn>QTÉ</TableColumn>
                          <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody
                          items={planningDetail.items || []}
                          emptyContent="Aucune ligne de besoin"
                        >
                          {(item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.job_position?.title || "-"}</TableCell>
                              <TableCell>{item.grade?.name || "-"}</TableCell>
                              <TableCell>{item.service?.name || "-"}</TableCell>
                              <TableCell>
                                <Chip size="sm" variant="flat">
                                  {NEED_TYPES.find(t => t.value === item.need_type)?.label || item.need_type}
                                </Chip>
                              </TableCell>
                              <TableCell>{item.number_of_positions}</TableCell>
                              <TableCell>
                                {planningDetail.status === "draft" && (
                                  <div className="flex gap-2">
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      onPress={() => handleOpenItemModal(item)}
                                    >
                                      <FiEdit />
                                    </Button>
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      color="danger"
                                      onPress={() => handleDeleteItem(item.id)}
                                    >
                                      <FiTrash2 />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  ) : null}
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={handleCloseDetail}>
                    Fermer
                  </Button>
                  {planningDetail?.status === "draft" && (
                    <Button
                      color="danger"
                      startContent={<FiSend />}
                      onPress={() => {
                        handleCloseDetail();
                        handleSubmitForApproval(planningDetail.id);
                      }}
                    >
                      Soumettre pour approbation
                    </Button>
                  )}
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal Item (ligne de besoin) */}
        <Modal isOpen={isItemOpen} onClose={handleCloseItemModal} size="3xl">
          <ModalContent>
            {(onClose) => (
              <form onSubmit={handleItemSubmit(onItemSubmit)}>
                <ModalHeader>
                  <h3 className="text-xl font-bold">
                    {selectedItem ? "Modifier la Ligne" : "Ajouter une Ligne de Besoin"}
                  </h3>
                </ModalHeader>
                <ModalBody>
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="job_position_id"
                      control={itemControl}
                      rules={{ required: "Poste requis" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Poste"
                          placeholder="Sélectionnez le poste"
                          isRequired
                          errorMessage={itemErrors.job_position_id?.message}
                          isInvalid={!!itemErrors.job_position_id}
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          {(jobPositionsData?.job_positions || []).map((position) => (
                            <SelectItem key={position.id} value={position.id}>
                              {position.title}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="grade_id"
                      control={itemControl}
                      rules={{ required: "Grade requis" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Grade"
                          placeholder="Sélectionnez le grade"
                          isRequired
                          errorMessage={itemErrors.grade_id?.message}
                          isInvalid={!!itemErrors.grade_id}
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          {(gradesData?.grades || []).map((grade) => (
                            <SelectItem key={grade.id} value={grade.id}>
                              {grade.name}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="service_id"
                      control={itemControl}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Service"
                          placeholder="Sélectionnez le service"
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          {filteredServices.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="need_type"
                      control={itemControl}
                      rules={{ required: "Type requis" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Type de besoin"
                          placeholder="Sélectionnez le type"
                          isRequired
                          errorMessage={itemErrors.need_type?.message}
                          isInvalid={!!itemErrors.need_type}
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          {NEED_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="number_of_positions"
                      control={itemControl}
                      rules={{ required: "Quantité requise", min: 1 }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          label="Nombre de postes"
                          placeholder="1"
                          isRequired
                          errorMessage={itemErrors.number_of_positions?.message}
                          isInvalid={!!itemErrors.number_of_positions}
                        />
                      )}
                    />

                    <Controller
                      name="priority"
                      control={itemControl}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Priorité"
                          placeholder="Sélectionnez la priorité"
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          <SelectItem key="high" value="high">Haute</SelectItem>
                          <SelectItem key="medium" value="medium">Moyenne</SelectItem>
                          <SelectItem key="low" value="low">Basse</SelectItem>
                        </Select>
                      )}
                    />

                    {needType === "replacement" && (
                      <Controller
                        name="replacing_employee_id"
                        control={itemControl}
                        render={({ field }) => (
                          <Select
                            {...field}
                            label="Employé à remplacer"
                            placeholder="Sélectionnez l'employé"
                            selectedKeys={field.value ? [field.value] : []}
                            onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                            className="col-span-2"
                          >
                            {(employeesData?.employees || []).map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.first_name} {employee.last_name} - {employee.employee_number}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      />
                    )}

                    <Controller
                      name="justification"
                      control={itemControl}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="Justification"
                          placeholder="Justifiez ce besoin..."
                          minRows={3}
                          className="col-span-2"
                        />
                      )}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={handleCloseItemModal}>
                    Annuler
                  </Button>
                  <Button
                    color="danger"
                    type="submit"
                    isLoading={createItemMutation.isPending || updateItemMutation.isPending}
                  >
                    {selectedItem ? "Mettre à jour" : "Ajouter"}
                  </Button>
                </ModalFooter>
              </form>
            )}
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
