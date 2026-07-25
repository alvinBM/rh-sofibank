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
  Divider,
  Pagination,
} from "@nextui-org/react";
import {
  FiCalendar,
  FiSearch,
  FiMoreVertical,
  FiEye,
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiStar,
  FiVideo,
  FiPhone,
  FiMapPin,
  FiClock,
} from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetAllInterviews,
  useScheduleInterview,
  useUpdateInterview,
  useSubmitInterviewEvaluation,
} from "@/src/hooks/useRecruitment";
import { useGetEmployees } from "@/src/hooks/useEmployees";

export default function InterviewsPage() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const { isOpen: isScheduleOpen, onOpen: onScheduleOpen, onClose: onScheduleClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isEvaluateOpen, onOpen: onEvaluateOpen, onClose: onEvaluateClose } = useDisclosure();

  // Fetching all interviews
  const { data: interviewsData, isLoading } = useGetAllInterviews({
    page,
    rowsPerPage,
    ...filters,
  });
  const { data: employeesData } = useGetEmployees({ page: 1, rowsPerPage: 1000, query: "", filters: {} });
  
  const interviews = interviewsData?.interviews || [];
  const totalInterviews = interviewsData?.total || 0;
  const employees = employeesData?.employees || [];
  const pages = Math.ceil(totalInterviews / rowsPerPage);

  console.log("Interviews Data ***** :", interviewsData);

  const scheduleInterviewMutation = useScheduleInterview();
  const updateInterviewMutation = useUpdateInterview();
  const evaluateInterviewMutation = useSubmitInterviewEvaluation();

  const {
    control: scheduleControl,
    handleSubmit: handleScheduleSubmit,
    reset: resetSchedule,
    formState: { errors: scheduleErrors },
  } = useForm();

  const {
    control: evaluateControl,
    handleSubmit: handleEvaluateSubmit,
    reset: resetEvaluate,
    formState: { errors: evaluateErrors },
  } = useForm();

  const onScheduleInterview = async (data) => {
    try {
      const interviewData = {
        application_id: selectedApplication,
        interview_type: data.interview_type,
        interview_round: data.interview_round || 1,
        scheduled_date: data.interview_date,
        duration_minutes: parseInt(data.duration_minutes) || 60,
        location: data.location,
        meeting_link: data.meeting_link,
        interviewer_ids: data.interviewer_ids,
        notes: data.notes,
      };
      
      await scheduleInterviewMutation.mutateAsync(interviewData);
      toast.success("Entretien programmé avec succès");
      resetSchedule();
      onScheduleClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de la programmation");
    }
  };

  const onUpdateInterviewStatus = async (interviewId, status) => {
    try {
      await updateInterviewMutation.mutateAsync({
        id: interviewId,
        interviewData: { status },
      });
      toast.success("Statut mis à jour");
    } catch (error) {
      console.error("Update interview status error:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const onEvaluateInterview = async (data) => {
    try {
      console.log("Evaluation data to send:", data);
      
      // Soumettre l'évaluation
      await evaluateInterviewMutation.mutateAsync({
        interviewId: selectedInterview.id,
        evaluationData: data,
      });
      
      // Marquer automatiquement l'entretien comme complété si ce n'est pas déjà le cas
      if (selectedInterview.status !== "completed") {
        await updateInterviewMutation.mutateAsync({
          id: selectedInterview.id,
          status: "completed",
        });
      }
      
      toast.success("Évaluation enregistrée et entretien marqué comme complété");
      resetEvaluate();
      onEvaluateClose();
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast.error(error.response?.data?.error || "Erreur lors de l'évaluation");
    }
  };

  const getInterviewTypeIcon = (type) => {
    const icons = {
      phone: <FiPhone />,
      video: <FiVideo />,
      in_person: <FiMapPin />,
      technical: <FiStar />,
    };
    return icons[type] || <FiCalendar />;
  };

  const getInterviewTypeLabel = (type) => {
    const labels = {
      phone: "Téléphonique",
      video: "Visioconférence",
      in_person: "En personne",
      technical: "Test technique",
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "primary",
      confirmed: "secondary",
      completed: "success",
      cancelled: "danger",
      no_show: "warning",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: "Programmé",
      confirmed: "Confirmé",
      completed: "Complété",
      cancelled: "Annulé",
      no_show: "Absent",
    };
    return labels[status] || status;
  };

  const getRecommendationColor = (recommendation) => {
    const colors = {
      highly_recommended: "success",
      recommended: "success",
      maybe: "warning",
      not_recommended: "danger",
      reject: "danger",
    };
    return colors[recommendation] || "default";
  };

  const getRecommendationLabel = (recommendation) => {
    const labels = {
      highly_recommended: "Fortement Recommandé",
      recommended: "Recommandé",
      maybe: "Peut-être",
      not_recommended: "Non Recommandé",
      reject: "Rejeter",
    };
    return labels[recommendation] || recommendation;
  };

  // Group interviews by application
  const groupedInterviews = React.useMemo(() => {
    const grouped = {};
    interviews?.forEach((interview) => {
      if (interview.application) {
        const appId = interview.application.id;
        if (!grouped[appId]) {
          grouped[appId] = {
            application: interview.application,
            interviews: [],
          };
        }
        grouped[appId].interviews.push(interview);
      }
    });
    return Object.values(grouped);
  }, [interviews]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Entretiens</h1>
          <p className="text-sm text-gray-500">
            Gestion et évaluation des entretiens de recrutement
          </p>
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
            <Input
              type="date"
              label="Date"
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
            <Select
              label="Type"
              placeholder="Tous"
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <SelectItem key="phone" value="phone">Téléphonique</SelectItem>
              <SelectItem key="video" value="video">Visioconférence</SelectItem>
              <SelectItem key="in_person" value="in_person">En personne</SelectItem>
              <SelectItem key="technical" value="technical">Test technique</SelectItem>
            </Select>
            <Select
              label="Statut"
              placeholder="Tous"
              onChange={(e) => setFilters({ ...filters, interview_status: e.target.value })}
            >
              <SelectItem key="scheduled" value="scheduled">Programmé</SelectItem>
              <SelectItem key="confirmed" value="confirmed">Confirmé</SelectItem>
              <SelectItem key="completed" value="completed">Complété</SelectItem>
              <SelectItem key="cancelled" value="cancelled">Annulé</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Interviews by Candidate */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardBody>
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            </CardBody>
          </Card>
        ) : groupedInterviews.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-center text-gray-500 py-8">
                Aucun entretien programmé
              </p>
            </CardBody>
          </Card>
        ) : (
          groupedInterviews.map((group) => (
            <Card key={group.application.id}>
              <CardBody>
                <div className="space-y-4">
                  {/* Candidate Header */}
                  <div className="flex justify-between items-start">
                    <User
                      name={`${group.application.first_name} ${group.application.last_name}`}
                      description={group.application.job_posting?.job_title}
                      avatarProps={{
                        src: group.application.profile_picture,
                        name: group.application.first_name?.[0],
                      }}
                    />
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<FiCalendar />}
                      onPress={() => {
                        setSelectedApplication(group.application.id);
                        onScheduleOpen();
                      }}
                    >
                      Nouvel Entretien
                    </Button>
                  </div>

                  <Divider />

                  {/* Interviews List */}
                  <Table
                    aria-label="Entretiens"
                    removeWrapper
                    className="p-0"
                  >
                    <TableHeader>
                      <TableColumn>DATE & HEURE</TableColumn>
                      <TableColumn>TYPE</TableColumn>
                      <TableColumn>INTERVIEWERS</TableColumn>
                      <TableColumn>STATUT</TableColumn>
                      <TableColumn>ÉVALUATION</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {group.interviews.map((interview) => (
                        <TableRow key={interview.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FiClock className="text-gray-400" />
                              <div>
                                <p className="font-semibold">
                                  {new Date(interview.scheduled_date).toLocaleDateString("fr-FR")}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(interview.scheduled_date).toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {interview.duration_minutes && ` (${interview.duration_minutes}min)`}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              variant="flat"
                              startContent={getInterviewTypeIcon(interview.interview_type)}
                            >
                              {getInterviewTypeLabel(interview.interview_type)}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            ---
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="sm"
                              color={getStatusColor(interview.status)}
                              variant="flat"
                            >
                              {getStatusLabel(interview.status)}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const evaluations = interview.evaluations || [];
                              const latestEval = evaluations.length > 0 ? evaluations[evaluations.length - 1] : null;
                              
                              return latestEval ? (
                                <div className="flex items-center gap-2">
                                  <Chip
                                    size="sm"
                                    color={getRecommendationColor(latestEval.recommendation)}
                                    variant="flat"
                                  >
                                    {latestEval.overall_rating || latestEval.overall_score || 'N/A'}/5
                                  </Chip>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">Non évalué</span>
                              );
                            })()}
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
                                    setSelectedInterview(interview);
                                    onDetailOpen();
                                  }}
                                >
                                  Voir les détails
                                </DropdownItem>
                                {interview.status === "scheduled" && (
                                  <DropdownItem
                                    key="confirm"
                                    startContent={<FiCheckCircle />}
                                    onPress={() =>
                                      onUpdateInterviewStatus(interview.id, "confirmed")
                                    }
                                  >
                                    Confirmer
                                  </DropdownItem>
                                )}
                                {(interview.status === "confirmed" ||
                                  interview.status === "scheduled") && (
                                  <DropdownItem
                                    key="complete"
                                    startContent={<FiCheckCircle />}
                                    className="text-success"
                                    color="success"
                                    onPress={() => {
                                      setSelectedInterview(interview);
                                      onEvaluateOpen();
                                    }}
                                  >
                                    Entretien effectué - Évaluer
                                  </DropdownItem>
                                )}
                                {interview.status === "completed" && 
                                  (!interview.evaluations || interview.evaluations.length === 0) && (
                                  <DropdownItem
                                    key="evaluate"
                                    startContent={<FiStar />}
                                    onPress={() => {
                                      setSelectedInterview(interview);
                                      onEvaluateOpen();
                                    }}
                                  >
                                    Évaluer
                                  </DropdownItem>
                                )}
                                {interview.status !== "completed" &&
                                  interview.status !== "cancelled" && (
                                    <DropdownItem
                                      key="cancel"
                                      startContent={<FiXCircle />}
                                      className="text-danger"
                                      color="danger"
                                      onPress={() =>
                                        onUpdateInterviewStatus(interview.id, "cancelled")
                                      }
                                    >
                                      Annuler
                                    </DropdownItem>
                                  )}
                              </DropdownMenu>
                            </Dropdown>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalInterviews > 0 && (
        <Card>
          <CardBody>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Total: {totalInterviews} entretien(s)
              </span>
              <div className="flex gap-2 items-center">
                <Select
                  size="sm"
                  label="Lignes"
                  selectedKeys={[String(rowsPerPage)]}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-24"
                >
                  <SelectItem key="10" value="10">10</SelectItem>
                  <SelectItem key="20" value="20">20</SelectItem>
                  <SelectItem key="50" value="50">50</SelectItem>
                  <SelectItem key="100" value="100">100</SelectItem>
                </Select>
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
            </div>
          </CardBody>
        </Card>
      )}

      {/* Schedule Interview Modal */}
      <Modal isOpen={isScheduleOpen} onClose={onScheduleClose} size="2xl">
        <ModalContent>
          <form onSubmit={handleScheduleSubmit(onScheduleInterview)}>
            <ModalHeader>Programmer un Entretien</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-800">
                    <strong>Information:</strong> Planifiez un entretien avec le candidat en remplissant les informations ci-dessous.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="interview_date"
                    control={scheduleControl}
                    rules={{ required: "La date est requise" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="datetime-local"
                        label="Date et Heure"
                        isRequired
                        isInvalid={!!scheduleErrors.interview_date}
                        errorMessage={scheduleErrors.interview_date?.message}
                      />
                    )}
                  />
                  <Controller
                    name="duration_minutes"
                    control={scheduleControl}
                    defaultValue="60"
                    rules={{ required: "La durée est requise" }}
                    render={({ field }) => (
                      <Input 
                        {...field} 
                        type="number" 
                        label="Durée (minutes)" 
                        isRequired
                        min="15"
                        step="15"
                        isInvalid={!!scheduleErrors.duration_minutes}
                        errorMessage={scheduleErrors.duration_minutes?.message}
                      />
                    )}
                  />
                </div>

                <Controller
                  name="interview_type"
                  control={scheduleControl}
                  rules={{ required: "Le type est requis" }}
                  render={({ field }) => (
                    <Select
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                      label="Type d'entretien"
                      placeholder="Sélectionnez"
                      isRequired
                      isInvalid={!!scheduleErrors.interview_type}
                      errorMessage={scheduleErrors.interview_type?.message}
                    >
                      <SelectItem key="phone" value="phone">
                        📞 Téléphonique
                      </SelectItem>
                      <SelectItem key="video" value="video">
                        🎥 Visioconférence
                      </SelectItem>
                      <SelectItem key="in_person" value="in_person">
                        🏢 En personne
                      </SelectItem>
                      <SelectItem key="technical" value="technical">
                        💻 Test technique
                      </SelectItem>
                    </Select>
                  )}
                />

                <Controller
                  name="location"
                  control={scheduleControl}
                  render={({ field }) => (
                    <Input 
                      {...field} 
                      label="Lieu" 
                      placeholder="Ex: Bureau RH, Salle de réunion 3..." 
                      description="Pour les entretiens en personne"
                    />
                  )}
                />

                <Controller
                  name="meeting_link"
                  control={scheduleControl}
                  render={({ field }) => (
                    <Input 
                      {...field} 
                      label="Lien de réunion" 
                      placeholder="https://zoom.us/j/..." 
                      description="Pour les visioconférences (Zoom, Teams, Google Meet...)"
                      type="url"
                    />
                  )}
                />

                <Controller
                  name="interviewer_ids"
                  control={scheduleControl}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Interviewers"
                      placeholder="Sélectionnez"
                      selectionMode="multiple"
                    >
                      {employees?.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <Controller
                  name="notes"
                  control={scheduleControl}
                  render={({ field }) => (
                    <Textarea {...field} label="Notes" placeholder="Instructions..." rows={4} />
                  )}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onScheduleClose}>
                Annuler
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={scheduleInterviewMutation.isPending}
              >
                Programmer
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Interview Details Modal */}
      {selectedInterview && (
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="3xl">
          <ModalContent>
            <ModalHeader>Détails de l'Entretien</ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date et Heure</p>
                    <p className="font-semibold">
                      {new Date(selectedInterview.scheduled_date).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Durée</p>
                    <p className="font-semibold">
                      {selectedInterview.duration_minutes} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <Chip
                      variant="flat"
                      startContent={getInterviewTypeIcon(selectedInterview.interview_type)}
                    >
                      {getInterviewTypeLabel(selectedInterview.interview_type)}
                    </Chip>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <Chip color={getStatusColor(selectedInterview.status)} variant="flat">
                      {getStatusLabel(selectedInterview.status)}
                    </Chip>
                  </div>
                </div>

                {selectedInterview.location && (
                  <div>
                    <p className="text-sm text-gray-500">Lieu / Lien</p>
                    <p className="font-semibold">{selectedInterview.location}</p>
                  </div>
                )}

                {selectedInterview.notes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Notes</p>
                    <p className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {selectedInterview.notes}
                    </p>
                  </div>
                )}

                {(() => {
                  const evaluations = selectedInterview.evaluations || [];
                  const latestEval = evaluations.length > 0 ? evaluations[evaluations.length - 1] : null;
                  
                  return latestEval && (
                    <div>
                      <h4 className="font-semibold mb-4">Évaluation</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Note Globale</p>
                            <p className="font-semibold text-lg">
                              {latestEval.overall_rating || latestEval.overall_score || 'N/A'}/5
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Recommandation</p>
                            <Chip
                              color={getRecommendationColor(latestEval.recommendation)}
                              variant="flat"
                            >
                              {getRecommendationLabel(latestEval.recommendation)}
                            </Chip>
                          </div>
                        </div>

                        {latestEval.strengths && (
                          <div>
                            <p className="text-sm text-gray-500">Points Forts</p>
                            <p className="text-sm bg-success-50 p-3 rounded-lg">
                              {latestEval.strengths}
                            </p>
                          </div>
                        )}

                        {latestEval.weaknesses && (
                          <div>
                            <p className="text-sm text-gray-500">Points Faibles</p>
                            <p className="text-sm bg-warning-50 p-3 rounded-lg">
                              {latestEval.weaknesses}
                            </p>
                          </div>
                        )}

                        {latestEval.comments && (
                          <div>
                            <p className="text-sm text-gray-500">Commentaires</p>
                            <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                              {latestEval.comments}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onPress={onDetailClose}>Fermer</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Evaluate Interview Modal */}
      {selectedInterview && (
        <Modal isOpen={isEvaluateOpen} onClose={onEvaluateClose} size="3xl" scrollBehavior="normal">
          <ModalContent>
            <form onSubmit={handleEvaluateSubmit(onEvaluateInterview)}>
              <ModalHeader>
                <div>
                  <h3 className="text-xl font-bold">Évaluation de l'Entretien</h3>
                  {selectedInterview.application && (
                    <>
                      <p className="text-sm font-normal text-gray-500 mt-1">
                        Candidat: {selectedInterview.application.first_name} {selectedInterview.application.last_name}
                      </p>
                      <p className="text-xs font-normal text-gray-400">
                        {new Date(selectedInterview.scheduled_date).toLocaleDateString("fr-FR", {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </>
                  )}
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="p-4 bg-blue-50 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Évaluez le candidat sur une échelle de 1 à 5 pour chaque critère. Cette évaluation marquera automatiquement l'entretien comme complété.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="technical_skills"
                      control={evaluateControl}
                      rules={{ required: "Note requise" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          max="5"
                          label="Compétences Techniques"
                          placeholder="1-5"
                          isInvalid={!!evaluateErrors.technical_skills}
                          errorMessage={evaluateErrors.technical_skills?.message}
                        />
                      )}
                    />
                    <Controller
                      name="communication_skills"
                      control={evaluateControl}
                      rules={{ required: "Note requise" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          max="5"
                          label="Communication"
                          placeholder="1-5"
                          isInvalid={!!evaluateErrors.communication_skills}
                          errorMessage={evaluateErrors.communication_skills?.message}
                        />
                      )}
                    />
                    <Controller
                      name="problem_solving"
                      control={evaluateControl}
                      rules={{ required: "Note requise" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          max="5"
                          label="Résolution de Problèmes"
                          placeholder="1-5"
                          isInvalid={!!evaluateErrors.problem_solving}
                          errorMessage={evaluateErrors.problem_solving?.message}
                        />
                      )}
                    />
                    <Controller
                      name="cultural_fit"
                      control={evaluateControl}
                      rules={{ required: "Note requise" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          max="5"
                          label="Adéquation Culturelle"
                          placeholder="1-5"
                          isInvalid={!!evaluateErrors.cultural_fit}
                          errorMessage={evaluateErrors.cultural_fit?.message}
                        />
                      )}
                    />
                  </div>

                  <Controller
                    name="overall_rating"
                    control={evaluateControl}
                    rules={{ required: "La note globale est requise" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        label="Note Globale"
                        placeholder="1-5"
                        isInvalid={!!evaluateErrors.overall_rating}
                        errorMessage={evaluateErrors.overall_rating?.message}
                      />
                    )}
                  />

                  <Controller
                    name="recommendation"
                    control={evaluateControl}
                    rules={{ required: "La recommandation est requise" }}
                    render={({ field }) => (
                      <Select
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        label="Recommandation"
                        placeholder="Sélectionnez"
                        isInvalid={!!evaluateErrors.recommendation}
                        errorMessage={evaluateErrors.recommendation?.message}
                      >
                        <SelectItem key="highly_recommended" value="highly_recommended">
                          Fortement Recommandé
                        </SelectItem>
                        <SelectItem key="recommended" value="recommended">
                          Recommandé
                        </SelectItem>
                        <SelectItem key="maybe" value="maybe">
                          Peut-être
                        </SelectItem>
                        <SelectItem key="not_recommended" value="not_recommended">
                          Non Recommandé
                        </SelectItem>
                        <SelectItem key="reject" value="reject">
                          Rejeter
                        </SelectItem>
                      </Select>
                    )}
                  />

                  <Controller
                    name="strengths"
                    control={evaluateControl}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Points Forts"
                        placeholder="Listez les points forts du candidat..."
                        rows={3}
                      />
                    )}
                  />

                  <Controller
                    name="weaknesses"
                    control={evaluateControl}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Points Faibles"
                        placeholder="Listez les points à améliorer..."
                        rows={3}
                      />
                    )}
                  />

                  <Controller
                    name="comments"
                    control={evaluateControl}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Commentaires Généraux"
                        placeholder="Vos observations générales..."
                        rows={4}
                      />
                    )}
                  />
                </div>
              </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onEvaluateClose}>
                Annuler
              </Button>
              <Button
                color="danger"
                type="submit"
                isLoading={evaluateInterviewMutation.isPending}
                startContent={<FiCheckCircle />}
              >
                Soumettre l'Évaluation et Compléter
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      )}
    </div>
  );
}
