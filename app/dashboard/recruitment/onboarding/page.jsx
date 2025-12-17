"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
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
  User,
  Progress,
  Checkbox,
  Divider,
} from "@nextui-org/react";
import {
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiList,
} from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetOnboardingChecklists,
  useGetOnboardingChecklistById,
  useCreateOnboardingChecklist,
  useUpdateOnboardingChecklist,
  useAddOnboardingTask,
  useUpdateOnboardingTask,
  useGetTaskTemplates,
  useCreateTaskTemplate,
} from "@/src/hooks/useRecruitment";
import { useGetEmployees } from "@/src/hooks/useEmployees";

export default function OnboardingPage() {
  const [filters, setFilters] = useState({});
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isTaskOpen, onOpen: onTaskOpen, onClose: onTaskClose } = useDisclosure();
  const { isOpen: isTemplateOpen, onOpen: onTemplateOpen, onClose: onTemplateClose } = useDisclosure();

  const { data: checklists, isLoading } = useGetOnboardingChecklists(filters);
  const { data: employees } = useGetEmployees();
  const { data: taskTemplates } = useGetTaskTemplates();

  const createChecklistMutation = useCreateOnboardingChecklist();
  const updateChecklistMutation = useUpdateOnboardingChecklist();
  const addTaskMutation = useAddOnboardingTask();
  const updateTaskMutation = useUpdateOnboardingTask();
  const createTemplateMutation = useCreateTaskTemplate();

  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm();

  const {
    control: taskControl,
    handleSubmit: handleTaskSubmit,
    reset: resetTask,
    formState: { errors: taskErrors },
  } = useForm();

  const {
    control: templateControl,
    handleSubmit: handleTemplateSubmit,
    reset: resetTemplate,
  } = useForm();

  const onCreateChecklist = async (data) => {
    try {
      await createChecklistMutation.mutateAsync(data);
      toast.success("Checklist d'intégration créée");
      resetCreate();
      onCreateClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de la création");
    }
  };

  const onAddTask = async (data) => {
    try {
      await addTaskMutation.mutateAsync({
        checklistId: selectedChecklist,
        taskData: data,
      });
      toast.success("Tâche ajoutée");
      resetTask();
      onTaskClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de l'ajout");
    }
  };

  const onUpdateTask = async (taskId, updates) => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId,
        taskData: updates,
      });
      toast.success("Tâche mise à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const onCreateTemplate = async (data) => {
    try {
      await createTemplateMutation.mutateAsync(data);
      toast.success("Modèle de tâche créé");
      resetTemplate();
      onTemplateClose();
    } catch (error) {
      toast.error("Erreur lors de la création du modèle");
    }
  };

  const calculateProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return (completed / tasks.length) * 100;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "warning",
      in_progress: "primary",
      completed: "success",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "En attente",
      in_progress: "En cours",
      completed: "Complété",
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
          <h1 className="text-2xl font-bold">Intégration (Onboarding)</h1>
          <p className="text-sm text-gray-500">
            Gestion des checklists et tâches d'intégration des nouveaux employés
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="flat" startContent={<FiList />} onPress={onTemplateOpen}>
            Modèles de Tâches
          </Button>
          <Button color="primary" startContent={<FiPlus />} onPress={onCreateOpen}>
            Nouvelle Checklist
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Rechercher..."
              startContent={<FiSearch />}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <Select
              label="Statut"
              placeholder="Tous"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <SelectItem key="pending" value="pending">En attente</SelectItem>
              <SelectItem key="in_progress" value="in_progress">En cours</SelectItem>
              <SelectItem key="completed" value="completed">Complété</SelectItem>
            </Select>
            <Select
              label="Responsable"
              placeholder="Tous"
              onChange={(e) => setFilters({ ...filters, assigned_to_id: e.target.value })}
            >
              {employees?.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </SelectItem>
              ))}
            </Select>
            <Input
              type="date"
              label="Date de début"
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            />
          </div>
        </CardBody>
      </Card>

      {/* Checklists */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardBody>
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            </CardBody>
          </Card>
        ) : checklists?.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-gray-500 py-8">
                Aucune checklist d'intégration trouvée
              </p>
            </CardBody>
          </Card>
        ) : (
          checklists?.map((checklist) => (
            <Card key={checklist.id}>
              <CardBody>
                <div className="space-y-4">
                  {/* Checklist Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <User
                          name={`${checklist.employee?.first_name} ${checklist.employee?.last_name}`}
                          description={checklist.employee?.email}
                          avatarProps={{
                            src: checklist.employee?.profile_picture,
                            name: checklist.employee?.first_name?.[0],
                          }}
                        />
                        <Chip size="sm" color={getStatusColor(checklist.status)} variant="flat">
                          {getStatusLabel(checklist.status)}
                        </Chip>
                      </div>
                      <div className="mt-3 flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <FiClock className="text-gray-400" />
                          <span>
                            Début:{" "}
                            {new Date(checklist.start_date).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        {checklist.assigned_to && (
                          <div className="flex items-center gap-2">
                            <FiUser className="text-gray-400" />
                            <span>Responsable: {checklist.assigned_to.username}</span>
                          </div>
                        )}
                      </div>
                    </div>
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
                            setSelectedChecklist(checklist);
                            onDetailOpen();
                          }}
                        >
                          Voir les détails
                        </DropdownItem>
                        <DropdownItem
                          key="add-task"
                          startContent={<FiPlus />}
                          onPress={() => {
                            setSelectedChecklist(checklist.id);
                            onTaskOpen();
                          }}
                        >
                          Ajouter une tâche
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">Progression</span>
                      <span className="text-sm text-gray-500">
                        {checklist.tasks?.filter((t) => t.status === "completed").length || 0} /{" "}
                        {checklist.tasks?.length || 0} tâches
                      </span>
                    </div>
                    <Progress
                      value={calculateProgress(checklist.tasks)}
                      color="success"
                      className="max-w-full"
                    />
                  </div>

                  {/* Tasks Preview */}
                  {checklist.tasks && checklist.tasks.length > 0 && (
                    <>
                      <Divider />
                      <div className="space-y-2">
                        {checklist.tasks.slice(0, 5).map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                          >
                            <Checkbox
                              isSelected={task.status === "completed"}
                              onValueChange={(checked) =>
                                onUpdateTask(task.id, {
                                  status: checked ? "completed" : "pending",
                                })
                              }
                            />
                            <div className="flex-1">
                              <p
                                className={`text-sm ${
                                  task.status === "completed"
                                    ? "line-through text-gray-400"
                                    : ""
                                }`}
                              >
                                {task.task_title}
                              </p>
                              {task.due_date && (
                                <p className="text-xs text-gray-500">
                                  Échéance: {new Date(task.due_date).toLocaleDateString("fr-FR")}
                                </p>
                              )}
                            </div>
                            <Chip
                              size="sm"
                              color={getPriorityColor(task.priority)}
                              variant="flat"
                            >
                              {task.priority}
                            </Chip>
                          </div>
                        ))}
                        {checklist.tasks.length > 5 && (
                          <Button
                            size="sm"
                            variant="light"
                            onPress={() => {
                              setSelectedChecklist(checklist);
                              onDetailOpen();
                            }}
                          >
                            Voir les {checklist.tasks.length - 5} autres tâches
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Create Checklist Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="2xl">
        <ModalContent>
          <form onSubmit={handleCreateSubmit(onCreateChecklist)}>
            <ModalHeader>Nouvelle Checklist d'Intégration</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Controller
                  name="employee_id"
                  control={createControl}
                  rules={{ required: "L'employé est requis" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Nouvel Employé"
                      placeholder="Sélectionnez"
                      isInvalid={!!createErrors.employee_id}
                      errorMessage={createErrors.employee_id?.message}
                    >
                      {employees?.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} - {emp.email}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <Controller
                  name="assigned_to_id"
                  control={createControl}
                  render={({ field }) => (
                    <Select {...field} label="Responsable" placeholder="Sélectionnez">
                      {employees?.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="start_date"
                    control={createControl}
                    rules={{ required: "La date de début est requise" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="date"
                        label="Date de Début"
                        isInvalid={!!createErrors.start_date}
                        errorMessage={createErrors.start_date?.message}
                      />
                    )}
                  />
                  <Controller
                    name="expected_completion_date"
                    control={createControl}
                    render={({ field }) => (
                      <Input {...field} type="date" label="Date de Fin Prévue" />
                    )}
                  />
                </div>

                <Controller
                  name="notes"
                  control={createControl}
                  render={({ field }) => (
                    <Textarea {...field} label="Notes" placeholder="Instructions..." rows={4} />
                  )}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onCreateClose}>
                Annuler
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={createChecklistMutation.isPending}
              >
                Créer
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Add Task Modal */}
      <Modal isOpen={isTaskOpen} onClose={onTaskClose} size="2xl">
        <ModalContent>
          <form onSubmit={handleTaskSubmit(onAddTask)}>
            <ModalHeader>Ajouter une Tâche</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Controller
                  name="task_title"
                  control={taskControl}
                  rules={{ required: "Le titre est requis" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Titre de la Tâche"
                      placeholder="Ex: Compléter les documents RH"
                      isInvalid={!!taskErrors.task_title}
                      errorMessage={taskErrors.task_title?.message}
                    />
                  )}
                />

                <Controller
                  name="description"
                  control={taskControl}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Description"
                      placeholder="Détails de la tâche..."
                      rows={4}
                    />
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="priority"
                    control={taskControl}
                    defaultValue="medium"
                    render={({ field }) => (
                      <Select {...field} label="Priorité" placeholder="Sélectionnez">
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
                    name="due_date"
                    control={taskControl}
                    render={({ field }) => (
                      <Input {...field} type="date" label="Date d'Échéance" />
                    )}
                  />
                </div>

                <Controller
                  name="assigned_to_id"
                  control={taskControl}
                  render={({ field }) => (
                    <Select {...field} label="Assigné à" placeholder="Sélectionnez">
                      {employees?.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onTaskClose}>
                Annuler
              </Button>
              <Button color="primary" type="submit" isLoading={addTaskMutation.isPending}>
                Ajouter
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Create Template Modal */}
      <Modal isOpen={isTemplateOpen} onClose={onTemplateClose} size="3xl">
        <ModalContent>
          <ModalHeader>Modèles de Tâches</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {taskTemplates?.map((template) => (
                <Card key={template.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{template.task_title}</h4>
                      <p className="text-sm text-gray-500">{template.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Chip size="sm" variant="flat">
                          {template.category}
                        </Chip>
                        <Chip size="sm" color={getPriorityColor(template.default_priority)} variant="flat">
                          {template.default_priority}
                        </Chip>
                      </div>
                    </div>
                    <Button size="sm" onPress={() => {
                      // Use template to add task
                      onTaskOpen();
                    }}>
                      Utiliser
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onPress={onTemplateClose}>Fermer</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Checklist Details Modal */}
      {selectedChecklist && (
        <Modal
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          size="4xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader>Détails de l'Intégration</ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Employee Info */}
                <User
                  name={`${selectedChecklist.employee?.first_name} ${selectedChecklist.employee?.last_name}`}
                  description={selectedChecklist.employee?.email}
                  avatarProps={{
                    src: selectedChecklist.employee?.profile_picture,
                    name: selectedChecklist.employee?.first_name?.[0],
                    size: "lg",
                  }}
                />

                {/* Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Progression Globale</span>
                    <span className="text-sm text-gray-500">
                      {Math.round(calculateProgress(selectedChecklist.tasks))}%
                    </span>
                  </div>
                  <Progress
                    value={calculateProgress(selectedChecklist.tasks)}
                    color="success"
                    size="lg"
                  />
                </div>

                <Divider />

                {/* All Tasks */}
                <div>
                  <h4 className="font-semibold mb-4">Toutes les Tâches</h4>
                  <div className="space-y-3">
                    {selectedChecklist.tasks?.map((task) => (
                      <Card key={task.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            isSelected={task.status === "completed"}
                            onValueChange={(checked) =>
                              onUpdateTask(task.id, {
                                status: checked ? "completed" : "pending",
                              })
                            }
                          />
                          <div className="flex-1">
                            <p
                              className={`font-semibold ${
                                task.status === "completed" ? "line-through text-gray-400" : ""
                              }`}
                            >
                              {task.task_title}
                            </p>
                            {task.description && (
                              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                            )}
                            <div className="flex gap-3 mt-2 text-sm">
                              {task.due_date && (
                                <span className="text-gray-500">
                                  Échéance: {new Date(task.due_date).toLocaleDateString("fr-FR")}
                                </span>
                              )}
                              {task.assigned_to && (
                                <span className="text-gray-500">
                                  Assigné à: {task.assigned_to.username}
                                </span>
                              )}
                            </div>
                          </div>
                          <Chip size="sm" color={getPriorityColor(task.priority)} variant="flat">
                            {task.priority}
                          </Chip>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onPress={onDetailClose}>Fermer</Button>
              <Button
                color="primary"
                startContent={<FiPlus />}
                onPress={() => {
                  setSelectedChecklist(selectedChecklist.id);
                  onDetailClose();
                  onTaskOpen();
                }}
              >
                Ajouter une Tâche
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
