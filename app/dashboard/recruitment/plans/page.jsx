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
  FiX,
  FiSend,
  FiTrash2,
} from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetRecruitmentPlans,
  useCreateRecruitmentPlan,
  useUpdateRecruitmentPlan,
  useSubmitRecruitmentPlan,
  useApproveRecruitmentPlan,
  useAddPositionToPlan,
  useDeletePlanPosition,
} from "@/src/hooks/useRecruitment";
import { useGetDirections, useGetServices, useGetJobPositions, useGetGrades } from "@/src/hooks/useSettings";

export default function RecruitmentPlanningPage() {
  const [filters, setFilters] = useState({});
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isAddPositionOpen, onOpen: onAddPositionOpen, onClose: onAddPositionClose } = useDisclosure();
  const { isOpen: isApproveOpen, onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure();

  const { data: plans, isLoading } = useGetRecruitmentPlans(filters);
  const { data: directions } = useGetDirections();
  const { data: services } = useGetServices();
  const { data: jobPositions } = useGetJobPositions();
  const { data: grades } = useGetGrades();

  const createPlanMutation = useCreateRecruitmentPlan();
  const updatePlanMutation = useUpdateRecruitmentPlan();
  const submitPlanMutation = useSubmitRecruitmentPlan();
  const approvePlanMutation = useApproveRecruitmentPlan();
  const addPositionMutation = useAddPositionToPlan();
  const deletePositionMutation = useDeletePlanPosition();

  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm();

  const {
    control: positionControl,
    handleSubmit: handlePositionSubmit,
    reset: resetPosition,
    formState: { errors: positionErrors },
  } = useForm();

  const {
    control: approveControl,
    handleSubmit: handleApproveSubmit,
    reset: resetApprove,
    watch: watchApprove,
  } = useForm();

  const onCreatePlan = async (data) => {
    try {
      await createPlanMutation.mutateAsync(data);
      toast.success("Plan de recrutement créé avec succès");
      resetCreate();
      onCreateClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de la création");
    }
  };

  const onAddPosition = async (data) => {
    try {
      await addPositionMutation.mutateAsync({
        planId: selectedPlan,
        positionData: data,
      });
      toast.success("Position ajoutée avec succès");
      resetPosition();
      onAddPositionClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de l'ajout");
    }
  };

  const onSubmitPlan = async (planId) => {
    try {
      await submitPlanMutation.mutateAsync(planId);
      toast.success("Plan soumis pour approbation");
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de la soumission");
    }
  };

  const onApprovePlan = async (data) => {
    try {
      await approvePlanMutation.mutateAsync({
        id: selectedPlan,
        approvalData: {
          approve: data.approve,
          rejection_reason: data.rejection_reason,
        },
      });
      toast.success(data.approve ? "Plan approuvé" : "Plan rejeté");
      resetApprove();
      onApproveClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de l'approbation");
    }
  };

  const onDeletePosition = async (positionId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette position?")) {
      try {
        await deletePositionMutation.mutateAsync(positionId);
        toast.success("Position supprimée");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "default",
      submitted: "warning",
      approved: "success",
      rejected: "danger",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: "Brouillon",
      submitted: "Soumis",
      approved: "Approuvé",
      rejected: "Rejeté",
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "default",
      medium: "primary",
      high: "warning",
      urgent: "danger",
    };
    return colors[priority] || "default";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Plans de Recrutement</h1>
          <p className="text-sm text-gray-500">
            Gestion des besoins annuels de recrutement par direction
          </p>
        </div>
        <Button
          color="primary"
          startContent={<FiPlus />}
          onPress={onCreateOpen}
        >
          Nouveau Plan
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Rechercher..."
              startContent={<FiSearch />}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
            <Input
              type="number"
              label="Année"
              placeholder="2025"
              value={filters.year || ""}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            />
            <Select
              label="Direction"
              placeholder="Toutes"
              onChange={(e) =>
                setFilters({ ...filters, direction_id: e.target.value })
              }
            >
              {directions?.map((direction) => (
                <SelectItem key={direction.id} value={direction.id}>
                  {direction.name}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Statut"
              placeholder="Tous"
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <SelectItem key="draft" value="draft">
                Brouillon
              </SelectItem>
              <SelectItem key="submitted" value="submitted">
                Soumis
              </SelectItem>
              <SelectItem key="approved" value="approved">
                Approuvé
              </SelectItem>
              <SelectItem key="rejected" value="rejected">
                Rejeté
              </SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Plans Table */}
      <Card>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table aria-label="Plans de recrutement">
              <TableHeader>
                <TableColumn>ANNÉE</TableColumn>
                <TableColumn>DIRECTION</TableColumn>
                <TableColumn>POSITIONS</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>DATE CRÉATION</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Aucun plan de recrutement trouvé">
                {(plans || []).map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-semibold">{plan.year}</TableCell>
                    <TableCell>{plan.direction?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {plan.positions?.length || 0} position(s)
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={getStatusColor(plan.status)}
                        variant="flat"
                      >
                        {getStatusLabel(plan.status)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {new Date(plan.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <FiMoreVertical />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Actions">
                          <DropdownItem
                            key="view"
                            startContent={<FiEye />}
                            onPress={() => {
                              setSelectedPlanDetails(plan);
                              onDetailOpen();
                            }}
                          >
                            Voir les détails
                          </DropdownItem>
                          {plan.status === "draft" && (
                            <>
                              <DropdownItem
                                key="add-position"
                                startContent={<FiPlus />}
                                onPress={() => {
                                  setSelectedPlan(plan.id);
                                  onAddPositionOpen();
                                }}
                              >
                                Ajouter une position
                              </DropdownItem>
                              <DropdownItem
                                key="submit"
                                startContent={<FiSend />}
                                onPress={() => onSubmitPlan(plan.id)}
                              >
                                Soumettre pour approbation
                              </DropdownItem>
                            </>
                          )}
                          {plan.status === "submitted" && (
                            <DropdownItem
                              key="approve"
                              startContent={<FiCheckCircle />}
                              onPress={() => {
                                setSelectedPlan(plan.id);
                                onApproveOpen();
                              }}
                            >
                              Approuver/Rejeter
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create Plan Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <form onSubmit={handleCreateSubmit(onCreatePlan)}>
            <ModalHeader>Nouveau Plan de Recrutement</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="year"
                    control={createControl}
                    rules={{ required: "L'année est requise" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="Année"
                        placeholder="2025"
                        isRequired
                        isInvalid={!!createErrors.year}
                        errorMessage={createErrors.year?.message}
                      />
                    )}
                  />
                  <Controller
                    name="direction_id"
                    control={createControl}
                    rules={{ required: "La direction est requise" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Direction"
                        placeholder="Sélectionnez une direction"
                        isRequired
                        isInvalid={!!createErrors.direction_id}
                        errorMessage={createErrors.direction_id?.message}
                      >
                        {directions?.map((direction) => (
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
                  control={createControl}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Description / Objectifs"
                      placeholder="Décrivez les objectifs et besoins de recrutement pour cette année..."
                      minRows={3}
                    />
                  )}
                />

                <Controller
                  name="total_budget"
                  control={createControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      label="Budget Total Estimé (XAF)"
                      placeholder="0"
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">XAF</span>
                        </div>
                      }
                    />
                  )}
                />

                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-700">
                    💡 <strong>Note:</strong> Après la création, vous pourrez ajouter des positions spécifiques avec leurs détails (poste, grade, quantité, priorité, budget).
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onCreateClose}>
                Annuler
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={createPlanMutation.isPending}
              >
                Créer
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Add Position Modal */}
      <Modal
        isOpen={isAddPositionOpen}
        onClose={onAddPositionClose}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <form onSubmit={handlePositionSubmit(onAddPosition)}>
            <ModalHeader>Ajouter une Position</ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="job_position_id"
                  control={positionControl}
                  rules={{ required: "Le poste est requis" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Poste"
                      placeholder="Sélectionnez un poste"
                      isInvalid={!!positionErrors.job_position_id}
                      errorMessage={positionErrors.job_position_id?.message}
                    >
                      {jobPositions?.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.title}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />
                <Controller
                  name="grade_id"
                  control={positionControl}
                  rules={{ required: "Le grade est requis" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Grade"
                      placeholder="Sélectionnez un grade"
                      isInvalid={!!positionErrors.grade_id}
                      errorMessage={positionErrors.grade_id?.message}
                    >
                      {grades?.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />
                <Controller
                  name="service_id"
                  control={positionControl}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Service"
                      placeholder="Sélectionnez un service"
                    >
                      {services?.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />
                <Controller
                  name="quantity_needed"
                  control={positionControl}
                  rules={{ required: "La quantité est requise" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      label="Quantité"
                      placeholder="1"
                      isInvalid={!!positionErrors.quantity_needed}
                      errorMessage={positionErrors.quantity_needed?.message}
                    />
                  )}
                />
                <Controller
                  name="priority"
                  control={positionControl}
                  rules={{ required: "La priorité est requise" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Priorité"
                      placeholder="Sélectionnez"
                      isInvalid={!!positionErrors.priority}
                      errorMessage={positionErrors.priority?.message}
                    >
                      <SelectItem key="low" value="low">
                        Faible
                      </SelectItem>
                      <SelectItem key="medium" value="medium">
                        Moyenne
                      </SelectItem>
                      <SelectItem key="high" value="high">
                        Haute
                      </SelectItem>
                      <SelectItem key="urgent" value="urgent">
                        Urgente
                      </SelectItem>
                    </Select>
                  )}
                />
                <Controller
                  name="expected_start_date"
                  control={positionControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="date"
                      label="Date de début souhaitée"
                    />
                  )}
                />
                <Controller
                  name="budget_allocated"
                  control={positionControl}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      label="Budget Alloué (XAF)"
                      placeholder="0"
                    />
                  )}
                />
                <div className="col-span-2">
                  <Controller
                    name="justification"
                    control={positionControl}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Justification"
                        placeholder="Décrivez la justification de ce besoin..."
                        rows={4}
                      />
                    )}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onAddPositionClose}>
                Annuler
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={addPositionMutation.isPending}
              >
                Ajouter
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Approve/Reject Modal */}
      <Modal isOpen={isApproveOpen} onClose={onApproveClose}>
        <ModalContent>
          <form onSubmit={handleApproveSubmit(onApprovePlan)}>
            <ModalHeader>Approuver / Rejeter le Plan</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Controller
                  name="approve"
                  control={approveControl}
                  defaultValue={true}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Décision"
                      placeholder="Sélectionnez"
                    >
                      <SelectItem key={true} value={true}>
                        Approuver
                      </SelectItem>
                      <SelectItem key={false} value={false}>
                        Rejeter
                      </SelectItem>
                    </Select>
                  )}
                />
                {watchApprove("approve") === false && (
                  <Controller
                    name="rejection_reason"
                    control={approveControl}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Raison du rejet"
                        placeholder="Expliquez pourquoi vous rejetez ce plan..."
                        rows={4}
                      />
                    )}
                  />
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onApproveClose}>
                Annuler
              </Button>
              <Button
                color={watchApprove("approve") === false ? "danger" : "success"}
                type="submit"
                isLoading={approvePlanMutation.isPending}
              >
                Confirmer
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Plan Details Modal */}
      {selectedPlanDetails && (
        <Modal
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          size="5xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader>
              Détails du Plan - {selectedPlanDetails.year}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Année</p>
                    <p className="font-semibold text-lg">{selectedPlanDetails.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Direction</p>
                    <p className="font-semibold">
                      {selectedPlanDetails.direction?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <Chip
                      color={getStatusColor(selectedPlanDetails.status)}
                      variant="flat"
                    >
                      {getStatusLabel(selectedPlanDetails.status)}
                    </Chip>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Positions</p>
                    <p className="font-semibold">
                      {selectedPlanDetails.positions?.length || 0}
                    </p>
                  </div>
                  {selectedPlanDetails.submitted_date && (
                    <div>
                      <p className="text-sm text-gray-500">Date de soumission</p>
                      <p className="font-semibold">
                        {new Date(
                          selectedPlanDetails.submitted_date
                        ).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  )}
                  {selectedPlanDetails.approver && (
                    <div>
                      <p className="text-sm text-gray-500">Approuvé par</p>
                      <p className="font-semibold">
                        {selectedPlanDetails.approver.username}
                      </p>
                    </div>
                  )}
                  {selectedPlanDetails.approved_date && (
                    <div>
                      <p className="text-sm text-gray-500">Date d'approbation</p>
                      <p className="font-semibold">
                        {new Date(
                          selectedPlanDetails.approved_date
                        ).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Date de création</p>
                    <p className="font-semibold">
                      {new Date(selectedPlanDetails.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>

                {selectedPlanDetails.notes && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Description / Objectifs:
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedPlanDetails.notes}
                    </p>
                  </div>
                )}

                {selectedPlanDetails.rejection_reason && (
                  <div className="p-4 bg-danger-50 rounded-lg">
                    <p className="text-sm text-danger-600 font-semibold">
                      Raison du rejet:
                    </p>
                    <p className="text-sm mt-2">
                      {selectedPlanDetails.rejection_reason}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-4">
                    Positions ({selectedPlanDetails.positions?.length || 0})
                  </h4>
                  <Table aria-label="Positions">
                    <TableHeader>
                      <TableColumn>POSTE</TableColumn>
                      <TableColumn>GRADE</TableColumn>
                      <TableColumn>SERVICE</TableColumn>
                      <TableColumn>QUANTITÉ</TableColumn>
                      <TableColumn>PRIORITÉ</TableColumn>
                      <TableColumn>BUDGET</TableColumn>
                      {selectedPlanDetails.status === "draft" && (
                        <TableColumn>ACTIONS</TableColumn>
                      )}
                    </TableHeader>
                    <TableBody>
                      {(selectedPlanDetails.positions || []).map((pos) => (
                        <TableRow key={pos.id}>
                          <TableCell>{pos.job_position?.title}</TableCell>
                          <TableCell>{pos.grade?.name}</TableCell>
                          <TableCell>{pos.service?.name || "N/A"}</TableCell>
                          <TableCell>{pos.quantity_needed}</TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              color={getPriorityColor(pos.priority)}
                              variant="flat"
                            >
                              {pos.priority}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            {pos.budget_allocated
                              ? `${parseInt(
                                  pos.budget_allocated
                                ).toLocaleString()} XAF`
                              : "N/A"}
                          </TableCell>
                          {selectedPlanDetails.status === "draft" && (
                            <TableCell>
                              <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="light"
                                onPress={() => onDeletePosition(pos.id)}
                              >
                                <FiTrash2 />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onPress={onDetailClose}>Fermer</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
