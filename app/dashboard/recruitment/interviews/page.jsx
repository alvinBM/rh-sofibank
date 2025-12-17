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
  User,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Tabs,
  Tab,
  useDisclosure,
} from "@nextui-org/react";
import {
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiVideo,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiStar,
  FiList,
} from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetAllInterviews,
  useCreateInterview,
  useUpdateInterview,
  useGetCandidates,
} from "@/src/hooks/useRecruitment";
import { useGetEmployees } from "@/src/hooks/useEmployees";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";

const STATUS_COLORS = {
  scheduled: "danger",
  completed: "success",
  cancelled: "danger",
  rescheduled: "warning",
  no_show: "default",
};

const STATUS_LABELS = {
  scheduled: "Planifié",
  completed: "Complété",
  cancelled: "Annulé",
  rescheduled: "Reprogrammé",
  no_show: "Absent",
};

const INTERVIEW_TYPES = [
  { value: "hr_screening", label: "Présélection RH" },
  { value: "technical", label: "Technique" },
  { value: "behavioral", label: "Comportemental" },
  { value: "panel", label: "Panel" },
  { value: "final", label: "Final" },
];

const DURATIONS = [
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 heure" },
  { value: "90", label: "1h30" },
  { value: "120", label: "2 heures" },
];

const RECOMMENDATIONS = [
  { value: "strongly_recommend", label: "Fortement Recommandé" },
  { value: "recommend", label: "Recommandé" },
  { value: "maybe", label: "Peut-être" },
  { value: "reject", label: "Rejeter" },
];

export default function InterviewsPage() {
  const [filters, setFilters] = useState({
    status: "",
    interview_type: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isFeedbackOpen, onOpen: onFeedbackOpen, onClose: onFeedbackClose } = useDisclosure();

  const { data: interviews, isLoading } = useGetAllInterviews(filters);
  const { data: candidates } = useGetCandidates({});
  const { data: employeesData } = useGetEmployees({ page: 1, rowsPerPage: 1000 });

  const createInterviewMutation = useCreateInterview();
  const updateInterviewMutation = useUpdateInterview();

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      candidate_id: "",
      interview_type: "",
      scheduled_date: "",
      scheduled_time: "",
      duration: "60",
      location: "",
      meeting_link: "",
      notes: "",
      interviewers: "",
    }
  });

  const { control: feedbackControl, handleSubmit: handleFeedbackSubmit, reset: resetFeedback, formState: { errors: feedbackErrors } } = useForm({
    defaultValues: {
      feedback: "",
      rating: "",
      recommendation: "",
      next_steps: "",
    }
  });

  const handleOpenModal = (interview = null) => {
    if (interview) {
      setSelectedInterview(interview);
      const scheduledDateTime = new Date(interview.scheduled_date);
      reset({
        candidate_id: interview.candidate_id || "",
        interview_type: interview.interview_type || "",
        scheduled_date: scheduledDateTime.toISOString().split('T')[0],
        scheduled_time: scheduledDateTime.toTimeString().slice(0, 5),
        duration: String(interview.duration || "60"),
        location: interview.location || "",
        meeting_link: interview.meeting_link || "",
        notes: interview.notes || "",
        interviewers: interview.interviewers || "",
      });
    } else {
      setSelectedInterview(null);
      reset({
        candidate_id: "",
        interview_type: "",
        scheduled_date: "",
        scheduled_time: "",
        duration: "60",
        location: "",
        meeting_link: "",
        notes: "",
        interviewers: "",
      });
    }
    onOpen();
  };

  const handleOpenFeedback = (interview) => {
    setSelectedInterview(interview);
    resetFeedback({
      feedback: interview.feedback || "",
      rating: interview.rating ? String(interview.rating) : "",
      recommendation: interview.recommendation || "",
      next_steps: interview.next_steps || "",
    });
    onFeedbackOpen();
  };

  const handleCloseModal = () => {
    setSelectedInterview(null);
    reset();
    onClose();
  };

  const handleCloseFeedback = () => {
    setSelectedInterview(null);
    resetFeedback();
    onFeedbackClose();
  };

  const onSubmit = async (data) => {
    try {
      const scheduledDateTime = new Date(`${data.scheduled_date}T${data.scheduled_time}`);

      const interviewData = {
        candidate_id: data.candidate_id,
        interview_type: data.interview_type,
        scheduled_date: scheduledDateTime.toISOString(),
        duration: parseInt(data.duration),
        location: data.location,
        meeting_link: data.meeting_link,
        notes: data.notes,
        interviewers: data.interviewers,
        status: "scheduled",
      };

      if (selectedInterview) {
        await updateInterviewMutation.mutateAsync({
          id: selectedInterview.id,
          updates: interviewData,
        });
        toast.success("Entretien mis à jour avec succès");
      } else {
        await createInterviewMutation.mutateAsync(interviewData);
        toast.success("Entretien planifié avec succès");
      }
      handleCloseModal();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de l'entretien");
      console.error(error);
    }
  };

  const onFeedbackSubmit = async (data) => {
    try {
      await updateInterviewMutation.mutateAsync({
        id: selectedInterview.id,
        updates: {
          feedback: data.feedback,
          rating: parseInt(data.rating),
          recommendation: data.recommendation,
          next_steps: data.next_steps,
          status: "completed",
        },
      });
      toast.success("Feedback enregistré avec succès");
      handleCloseFeedback();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du feedback");
      console.error(error);
    }
  };

  const handleCancel = async (interviewId) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cet entretien ?")) {
      try {
        await updateInterviewMutation.mutateAsync({
          id: interviewId,
          updates: { status: "cancelled" },
        });
        toast.success("Entretien annulé");
      } catch (error) {
        toast.error("Erreur lors de l'annulation");
        console.error(error);
      }
    }
  };

  const handleDelete = async (interviewId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet entretien ?")) {
      try {
        // Note: Vous pourriez vouloir créer une fonction deleteInterview dans le service
        toast.warning("Fonctionnalité à implémenter");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
        console.error(error);
      }
    }
  };

  const filteredInterviews = interviews?.filter((interview) =>
    searchQuery === "" ||
    interview.candidate?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interview.candidate?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const groupedByDate = filteredInterviews.reduce((acc, interview) => {
    const date = new Date(interview.scheduled_date).toLocaleDateString("fr-FR");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(interview);
    return acc;
  }, {});

  return (
    <PermissionGuard requiredPermission="recruitment_manage">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Entretiens</h1>
            <p className="text-default-500">Gérez les entretiens avec les candidats</p>
          </div>
          <Button color="danger" startContent={<FiPlus />} onPress={() => handleOpenModal()}>
            Planifier Entretien
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">
                {filteredInterviews.filter(i => i.status === "scheduled").length || 0}
              </p>
              <p className="text-sm text-default-500">Planifiés</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">
                {filteredInterviews.filter(i => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const interviewDate = new Date(i.scheduled_date);
                  interviewDate.setHours(0, 0, 0, 0);
                  return interviewDate.getTime() === today.getTime() && i.status === "scheduled";
                }).length || 0}
              </p>
              <p className="text-sm text-default-500">Aujourd'hui</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">
                {filteredInterviews.filter(i => i.status === "completed").length || 0}
              </p>
              <p className="text-sm text-default-500">Complétés</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">
                {filteredInterviews.filter(i => i.status === "cancelled").length || 0}
              </p>
              <p className="text-sm text-default-500">Annulés</p>
            </CardBody>
          </Card>
        </div>

        {/* Filters and View Toggle */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex gap-4 items-end">
              <Input
                placeholder="Rechercher un candidat..."
                startContent={<FiSearch />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />

              <Select
                label="Type d'entretien"
                placeholder="Tous les types"
                selectedKeys={filters.interview_type ? [filters.interview_type] : []}
                onChange={(e) => setFilters({ ...filters, interview_type: e.target.value })}
                className="w-56"
              >
                {INTERVIEW_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
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

              <div className="flex gap-2">
                <Button
                  isIconOnly
                  variant={viewMode === "list" ? "solid" : "light"}
                  onPress={() => setViewMode("list")}
                >
                  <FiList />
                </Button>
                <Button
                  isIconOnly
                  variant={viewMode === "calendar" ? "solid" : "light"}
                  onPress={() => setViewMode("calendar")}
                >
                  <FiCalendar />
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* View: List or Calendar */}
        {viewMode === "list" ? (
          <Card>
            <CardBody>
              <Table aria-label="Entretiens">
                <TableHeader>
                  <TableColumn>CANDIDAT</TableColumn>
                  <TableColumn>POSTE</TableColumn>
                  <TableColumn>TYPE</TableColumn>
                  <TableColumn>DATE & HEURE</TableColumn>
                  <TableColumn>DURÉE</TableColumn>
                  <TableColumn>LIEU</TableColumn>
                  <TableColumn>STATUT</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody
                  items={filteredInterviews}
                  isLoading={isLoading}
                  loadingContent={<Spinner label="Chargement..." />}
                  emptyContent="Aucun entretien trouvé"
                >
                  {(interview) => (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <User
                          name={`${interview.candidate?.first_name} ${interview.candidate?.last_name}`}
                          description={interview.candidate?.email}
                          avatarProps={{
                            name: `${interview.candidate?.first_name?.[0]}${interview.candidate?.last_name?.[0]}`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-semibold">
                            {interview.candidate?.job_opening?.title || "-"}
                          </p>
                          <p className="text-xs text-default-400">
                            {interview.candidate?.job_opening?.job_number}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {INTERVIEW_TYPES.find(t => t.value === interview.interview_type)?.label || interview.interview_type}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <p className="text-sm flex items-center gap-1">
                            <FiCalendar className="text-default-400" />
                            {new Date(interview.scheduled_date).toLocaleDateString("fr-FR")}
                          </p>
                          <p className="text-xs text-default-400 flex items-center gap-1">
                            <FiClock className="text-default-400" />
                            {new Date(interview.scheduled_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{interview.duration} min</TableCell>
                      <TableCell>
                        {interview.meeting_link ? (
                          <div className="flex items-center gap-1 text-danger">
                            <FiVideo />
                            <span className="text-xs">Visio</span>
                          </div>
                        ) : interview.location ? (
                          <div className="flex items-center gap-1">
                            <FiMapPin className="text-default-400" />
                            <span className="text-xs">{interview.location}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip color={STATUS_COLORS[interview.status]} variant="flat" size="sm">
                          {STATUS_LABELS[interview.status]}
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
                              key="edit"
                              startContent={<FiEdit />}
                              onPress={() => handleOpenModal(interview)}
                            >
                              Modifier
                            </DropdownItem>
                            {interview.status === "scheduled" && (
                              <DropdownItem
                                key="complete"
                                startContent={<FiCheckCircle />}
                                onPress={() => handleOpenFeedback(interview)}
                              >
                                Compléter & Feedback
                              </DropdownItem>
                            )}
                            {interview.status === "scheduled" && (
                              <DropdownItem
                                key="cancel"
                                startContent={<FiXCircle />}
                                onPress={() => handleCancel(interview.id)}
                              >
                                Annuler
                              </DropdownItem>
                            )}
                            {interview.status === "completed" && interview.feedback && (
                              <DropdownItem
                                key="view-feedback"
                                startContent={<FiStar />}
                                onPress={() => handleOpenFeedback(interview)}
                              >
                                Voir Feedback
                              </DropdownItem>
                            )}
                            <DropdownItem
                              key="delete"
                              startContent={<FiTrash2 />}
                              onPress={() => handleDelete(interview.id)}
                              className="text-danger"
                              color="danger"
                            >
                              Supprimer
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByDate).map(([date, dayInterviews]) => (
              <Card key={date}>
                <CardHeader>
                  <h3 className="text-lg font-semibold">{date}</h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dayInterviews.map((interview) => (
                      <Card key={interview.id} shadow="sm">
                        <CardBody className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-sm">
                                {interview.candidate?.first_name} {interview.candidate?.last_name}
                              </p>
                              <p className="text-xs text-default-400">
                                {interview.candidate?.job_opening?.title}
                              </p>
                            </div>
                            <Chip color={STATUS_COLORS[interview.status]} variant="flat" size="sm">
                              {STATUS_LABELS[interview.status]}
                            </Chip>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs flex items-center gap-1">
                              <FiClock className="text-default-400" />
                              {new Date(interview.scheduled_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                              {" "}({interview.duration} min)
                            </p>
                            <p className="text-xs flex items-center gap-1">
                              {interview.meeting_link ? (
                                <>
                                  <FiVideo className="text-danger" />
                                  <span className="text-danger">Visioconférence</span>
                                </>
                              ) : (
                                <>
                                  <FiMapPin className="text-default-400" />
                                  {interview.location || "Lieu non défini"}
                                </>
                              )}
                            </p>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <Chip size="sm" variant="flat">
                              {INTERVIEW_TYPES.find(t => t.value === interview.interview_type)?.label}
                            </Chip>
                            <Dropdown>
                              <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                  <FiMoreVertical />
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu>
                                <DropdownItem
                                  key="edit"
                                  startContent={<FiEdit />}
                                  onPress={() => handleOpenModal(interview)}
                                >
                                  Modifier
                                </DropdownItem>
                                {interview.status === "scheduled" && (
                                  <DropdownItem
                                    key="complete"
                                    startContent={<FiCheckCircle />}
                                    onPress={() => handleOpenFeedback(interview)}
                                  >
                                    Compléter
                                  </DropdownItem>
                                )}
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </CardBody>
              </Card>
            ))}
            {Object.keys(groupedByDate).length === 0 && (
              <Card>
                <CardBody className="text-center py-8">
                  <p className="text-default-400">Aucun entretien trouvé</p>
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* Modal CRUD Interview */}
        <Modal
          isOpen={isOpen}
          onClose={handleCloseModal}
          size="4xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose) => (
              <form onSubmit={handleSubmit(onSubmit)}>
                <ModalHeader>
                  <h3 className="text-xl font-bold">
                    {selectedInterview ? "Modifier l'Entretien" : "Planifier un Entretien"}
                  </h3>
                </ModalHeader>
                <ModalBody>
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="candidate_id"
                      control={control}
                      rules={{ required: "Candidat requis" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Candidat"
                          placeholder="Sélectionnez le candidat"
                          isRequired
                          errorMessage={errors.candidate_id?.message}
                          isInvalid={!!errors.candidate_id}
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                          className="col-span-2"
                        >
                          {(candidates || []).map((candidate) => (
                            <SelectItem key={candidate.id} value={candidate.id}>
                              {candidate.first_name} {candidate.last_name} - {candidate.job_opening?.title}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="interview_type"
                      control={control}
                      rules={{ required: "Type d'entretien requis" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Type d'entretien"
                          placeholder="Sélectionnez le type"
                          isRequired
                          errorMessage={errors.interview_type?.message}
                          isInvalid={!!errors.interview_type}
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          {INTERVIEW_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="duration"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Durée"
                          placeholder="Sélectionnez la durée"
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          {DURATIONS.map((duration) => (
                            <SelectItem key={duration.value} value={duration.value}>
                              {duration.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="scheduled_date"
                      control={control}
                      rules={{ required: "Date requise" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="date"
                          label="Date"
                          isRequired
                          errorMessage={errors.scheduled_date?.message}
                          isInvalid={!!errors.scheduled_date}
                        />
                      )}
                    />

                    <Controller
                      name="scheduled_time"
                      control={control}
                      rules={{ required: "Heure requise" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="time"
                          label="Heure"
                          isRequired
                          errorMessage={errors.scheduled_time?.message}
                          isInvalid={!!errors.scheduled_time}
                        />
                      )}
                    />

                    <Controller
                      name="location"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Lieu physique"
                          placeholder="Ex: Bureau 302, Siège"
                          startContent={<FiMapPin />}
                        />
                      )}
                    />

                    <Controller
                      name="meeting_link"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Lien de visioconférence"
                          placeholder="https://meet.google.com/..."
                          startContent={<FiVideo />}
                        />
                      )}
                    />

                    <Controller
                      name="interviewers"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Interviewers"
                          placeholder="Noms des interviewers"
                          className="col-span-2"
                        />
                      )}
                    />

                    <Controller
                      name="notes"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="Notes"
                          placeholder="Notes sur l'entretien..."
                          minRows={3}
                          className="col-span-2"
                        />
                      )}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={handleCloseModal}>
                    Annuler
                  </Button>
                  <Button
                    color="danger"
                    type="submit"
                    isLoading={createInterviewMutation.isPending || updateInterviewMutation.isPending}
                  >
                    {selectedInterview ? "Mettre à jour" : "Planifier"}
                  </Button>
                </ModalFooter>
              </form>
            )}
          </ModalContent>
        </Modal>

        {/* Modal Feedback */}
        <Modal
          isOpen={isFeedbackOpen}
          onClose={handleCloseFeedback}
          size="3xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose) => (
              <form onSubmit={handleFeedbackSubmit(onFeedbackSubmit)}>
                <ModalHeader>
                  <h3 className="text-xl font-bold">Feedback d'Entretien</h3>
                </ModalHeader>
                <ModalBody>
                  {selectedInterview && (
                    <Card className="mb-4 bg-default-100">
                      <CardBody>
                        <p className="text-sm">
                          <span className="font-semibold">Candidat: </span>
                          {selectedInterview.candidate?.first_name} {selectedInterview.candidate?.last_name}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Poste: </span>
                          {selectedInterview.candidate?.job_opening?.title}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Type: </span>
                          {INTERVIEW_TYPES.find(t => t.value === selectedInterview.interview_type)?.label}
                        </p>
                      </CardBody>
                    </Card>
                  )}

                  <div className="space-y-4">
                    <Controller
                      name="feedback"
                      control={feedbackControl}
                      rules={{ required: "Feedback requis" }}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="Feedback détaillé"
                          placeholder="Décrivez votre impression sur le candidat..."
                          isRequired
                          errorMessage={feedbackErrors.feedback?.message}
                          isInvalid={!!feedbackErrors.feedback}
                          minRows={4}
                        />
                      )}
                    />

                    <Controller
                      name="rating"
                      control={feedbackControl}
                      rules={{ required: "Note requise", min: 1, max: 5 }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Note (1-5)"
                          placeholder="Sélectionnez une note"
                          isRequired
                          errorMessage={feedbackErrors.rating?.message}
                          isInvalid={!!feedbackErrors.rating}
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <SelectItem key={String(rating)} value={String(rating)}>
                              {rating} - {"★".repeat(rating)}{"☆".repeat(5 - rating)}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="recommendation"
                      control={feedbackControl}
                      rules={{ required: "Recommandation requise" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Recommandation"
                          placeholder="Sélectionnez votre recommandation"
                          isRequired
                          errorMessage={feedbackErrors.recommendation?.message}
                          isInvalid={!!feedbackErrors.recommendation}
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          {RECOMMENDATIONS.map((rec) => (
                            <SelectItem key={rec.value} value={rec.value}>
                              {rec.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="next_steps"
                      control={feedbackControl}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="Prochaines étapes suggérées"
                          placeholder="Que recommandez-vous comme prochaines étapes..."
                          minRows={3}
                        />
                      )}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={handleCloseFeedback}>
                    Annuler
                  </Button>
                  <Button
                    color="danger"
                    type="submit"
                    isLoading={updateInterviewMutation.isPending}
                  >
                    Enregistrer Feedback
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
