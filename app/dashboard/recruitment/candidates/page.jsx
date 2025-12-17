"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Tabs,
  Tab,
  useDisclosure,
  Divider,
} from "@nextui-org/react";
import {
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiEye,
  FiCalendar,
  FiStar,
  FiFileText,
  FiDownload,
  FiEdit,
  FiTrash2,
  FiPhone,
  FiMail,
  FiUser,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetCandidates,
  useGetCandidateById,
  useUpdateCandidate,
  useDeleteCandidate,
  useCreateInterview,
  useCreateJobOffer,
} from "@/src/hooks/useRecruitment";
import { useGetJobOpenings } from "@/src/hooks/useRecruitment";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";

const STATUS_COLORS = {
  new: "danger",
  screening: "warning",
  interview_scheduled: "secondary",
  interviewed: "secondary",
  shortlisted: "success",
  offer_made: "success",
  hired: "success",
  rejected: "danger",
  withdrawn: "default",
};

const STATUS_LABELS = {
  new: "Nouveau",
  screening: "Présélection",
  interview_scheduled: "Entretien Planifié",
  interviewed: "Interviewé",
  shortlisted: "Liste Restreinte",
  offer_made: "Offre Faite",
  hired: "Embauché",
  rejected: "Rejeté",
  withdrawn: "Retiré",
};

const SOURCE_OPTIONS = [
  { value: "website", label: "Site Web" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "referral", label: "Référence" },
  { value: "job_board", label: "Job Board" },
  { value: "direct", label: "Direct" },
  { value: "other", label: "Autre" },
];

export default function CandidatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");

  const [filters, setFilters] = useState({
    job_opening_id: jobId || "",
    status: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isInterviewOpen, onOpen: onInterviewOpen, onClose: onInterviewClose } = useDisclosure();

  const { data: candidates, isLoading } = useGetCandidates(filters);
  const { data: jobOpenings } = useGetJobOpenings({});
  const { data: candidateDetail, isLoading: isDetailLoading } = useGetCandidateById(selectedCandidate?.id);

  const updateCandidateMutation = useUpdateCandidate();
  const deleteCandidateMutation = useDeleteCandidate();
  const createInterviewMutation = useCreateInterview();
  const createOfferMutation = useCreateJobOffer();

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      status: "",
      internal_notes: "",
      overall_score: "",
    }
  });

  const { control: interviewControl, handleSubmit: handleInterviewSubmit, reset: resetInterview } = useForm({
    defaultValues: {
      interview_type: "",
      scheduled_date: "",
      scheduled_time: "",
      notes: "",
    }
  });

  const handleOpenDetail = (candidate) => {
    setSelectedCandidate(candidate);
    onOpen();
  };

  const handleCloseDetail = () => {
    setSelectedCandidate(null);
    onClose();
  };

  const handleOpenEdit = (candidate) => {
    setSelectedCandidate(candidate);
    reset({
      status: candidate.status || "",
      internal_notes: candidate.internal_notes || "",
      overall_score: candidate.overall_score || "",
    });
    onEditOpen();
  };

  const handleOpenInterview = (candidate) => {
    setSelectedCandidate(candidate);
    resetInterview({
      interview_type: "",
      scheduled_date: "",
      scheduled_time: "",
      notes: "",
    });
    onInterviewOpen();
  };

  const onSubmit = async (data) => {
    try {
      await updateCandidateMutation.mutateAsync({
        id: selectedCandidate.id,
        updates: data,
      });
      toast.success("Candidat mis à jour avec succès");
      onEditClose();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    }
  };

  const onInterviewSubmit = async (data) => {
    try {
      const scheduledDateTime = new Date(`${data.scheduled_date}T${data.scheduled_time}`);
      await createInterviewMutation.mutateAsync({
        candidate_id: selectedCandidate.id,
        interview_type: data.interview_type,
        scheduled_date: scheduledDateTime.toISOString(),
        duration: 60,
        notes: data.notes,
        status: "scheduled",
      });
      toast.success("Entretien planifié avec succès");
      onInterviewClose();
    } catch (error) {
      toast.error("Erreur lors de la planification");
      console.error(error);
    }
  };

  const handleMakeOffer = async (candidate) => {
    try {
      router.push(`/dashboard/recruitment/offers?candidate=${candidate.id}`);
    } catch (error) {
      toast.error("Erreur lors de la création de l'offre");
      console.error(error);
    }
  };

  const handleDelete = async (candidateId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce candidat ?")) {
      try {
        await deleteCandidateMutation.mutateAsync(candidateId);
        toast.success("Candidat supprimé avec succès");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
        console.error(error);
      }
    }
  };

  const getScoreColor = (score) => {
    if (!score) return "default";
    if (score >= 8) return "success";
    if (score >= 6) return "warning";
    return "danger";
  };

  const filteredCandidates = candidates?.filter((candidate) =>
    searchQuery === "" ||
    candidate.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <PermissionGuard requiredPermission="recruitment_manage">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Candidatures</h1>
            <p className="text-default-500">Gérez vos candidats et leur processus de sélection</p>
          </div>
          <Button color="danger" startContent={<FiPlus />}>
            Ajouter Candidat
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{filteredCandidates.filter(c => c.status === "new").length || 0}</p>
              <p className="text-xs text-default-500">Nouveaux</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{filteredCandidates.filter(c => c.status === "screening").length || 0}</p>
              <p className="text-xs text-default-500">Présélection</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">
                {filteredCandidates.filter(c => c.status === "interview_scheduled" || c.status === "interviewed").length || 0}
              </p>
              <p className="text-xs text-default-500">Entretiens</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{filteredCandidates.filter(c => c.status === "shortlisted").length || 0}</p>
              <p className="text-xs text-default-500">Liste Restreinte</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{filteredCandidates.filter(c => c.status === "hired").length || 0}</p>
              <p className="text-xs text-default-500">Embauchés</p>
            </CardBody>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex gap-4">
              <Input
                placeholder="Rechercher par nom, email..."
                startContent={<FiSearch />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />

              <Select
                label="Poste"
                placeholder="Tous les postes"
                selectedKeys={filters.job_opening_id ? [filters.job_opening_id] : []}
                onChange={(e) => setFilters({ ...filters, job_opening_id: e.target.value })}
                className="w-64"
              >
                {(jobOpenings || []).map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Statut"
                placeholder="Tous les statuts"
                selectedKeys={filters.status ? [filters.status] : []}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-56"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </Select>

              <Button variant="flat" onPress={() => {
                setFilters({ job_opening_id: "", status: "" });
                setSearchQuery("");
              }}>
                Réinitialiser
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Table */}
        <Card>
          <CardBody>
            <Table aria-label="Candidats">
              <TableHeader>
                <TableColumn>CANDIDAT</TableColumn>
                <TableColumn>POSTE</TableColumn>
                <TableColumn>SOURCE</TableColumn>
                <TableColumn>DATE CANDIDATURE</TableColumn>
                <TableColumn>ENTRETIENS</TableColumn>
                <TableColumn>SCORE</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                items={filteredCandidates}
                isLoading={isLoading}
                loadingContent={<Spinner label="Chargement..." />}
                emptyContent="Aucun candidat trouvé"
              >
                {(candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <User
                        name={`${candidate.first_name} ${candidate.last_name}`}
                        description={candidate.email}
                        avatarProps={{
                          name: `${candidate.first_name?.[0]}${candidate.last_name?.[0]}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-semibold">{candidate.job_opening?.title}</p>
                        <p className="text-xs text-default-400">{candidate.job_opening?.job_number}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {SOURCE_OPTIONS.find(s => s.value === candidate.source)?.label || candidate.source || "-"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {candidate.application_date
                        ? new Date(candidate.application_date).toLocaleDateString("fr-FR")
                        : "-"}
                    </TableCell>
                    <TableCell>{candidate.interviews?.[0]?.count || 0}</TableCell>
                    <TableCell>
                      {candidate.overall_score ? (
                        <div className="flex items-center gap-2">
                          <Progress
                            value={candidate.overall_score * 10}
                            color={getScoreColor(candidate.overall_score)}
                            size="sm"
                            className="w-20"
                          />
                          <span className="text-sm">{candidate.overall_score}/10</span>
                        </div>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip color={STATUS_COLORS[candidate.status]} variant="flat" size="sm">
                        {STATUS_LABELS[candidate.status]}
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
                            onPress={() => handleOpenDetail(candidate)}
                          >
                            Voir profil complet
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<FiEdit />}
                            onPress={() => handleOpenEdit(candidate)}
                          >
                            Modifier statut/notes
                          </DropdownItem>
                          <DropdownItem
                            key="interview"
                            startContent={<FiCalendar />}
                            onPress={() => handleOpenInterview(candidate)}
                          >
                            Planifier entretien
                          </DropdownItem>
                          <DropdownItem
                            key="offer"
                            startContent={<FiFileText />}
                            onPress={() => handleMakeOffer(candidate)}
                          >
                            Faire une offre
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            startContent={<FiTrash2 />}
                            onPress={() => handleDelete(candidate.id)}
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

        {/* Modal Detail Candidat */}
        <Modal
          isOpen={isOpen}
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
                  <h3 className="text-xl font-bold">Profil du Candidat</h3>
                </ModalHeader>
                <ModalBody>
                  {isDetailLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner label="Chargement des détails..." />
                    </div>
                  ) : candidateDetail ? (
                    <Tabs variant="underlined">
                      <Tab key="info" title="Informations">
                        <div className="space-y-4 py-4">
                          <Card>
                            <CardBody>
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                  <div className="w-20 h-20 rounded-full bg-danger-100 flex items-center justify-center text-2xl font-bold text-danger">
                                    {candidateDetail.first_name?.[0]}{candidateDetail.last_name?.[0]}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold">
                                    {candidateDetail.first_name} {candidateDetail.last_name}
                                  </h3>
                                  <p className="text-default-500">{candidateDetail.email}</p>
                                  <div className="flex gap-4 mt-2">
                                    <Chip color={STATUS_COLORS[candidateDetail.status]} variant="flat">
                                      {STATUS_LABELS[candidateDetail.status]}
                                    </Chip>
                                    {candidateDetail.overall_score && (
                                      <Chip color={getScoreColor(candidateDetail.overall_score)} variant="flat">
                                        Score: {candidateDetail.overall_score}/10
                                      </Chip>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </Card>

                          <div className="grid grid-cols-2 gap-4">
                            <Card>
                              <CardBody>
                                <div className="flex items-center gap-2 mb-2">
                                  <FiPhone className="text-default-400" />
                                  <span className="font-semibold">Téléphone</span>
                                </div>
                                <p>{candidateDetail.phone || "-"}</p>
                              </CardBody>
                            </Card>

                            <Card>
                              <CardBody>
                                <div className="flex items-center gap-2 mb-2">
                                  <FiMail className="text-default-400" />
                                  <span className="font-semibold">Email</span>
                                </div>
                                <p>{candidateDetail.email}</p>
                              </CardBody>
                            </Card>

                            <Card>
                              <CardBody>
                                <div className="flex items-center gap-2 mb-2">
                                  <FiFileText className="text-default-400" />
                                  <span className="font-semibold">Poste</span>
                                </div>
                                <p>{candidateDetail.job_opening?.title}</p>
                                <p className="text-xs text-default-400">{candidateDetail.job_opening?.job_number}</p>
                              </CardBody>
                            </Card>

                            <Card>
                              <CardBody>
                                <div className="flex items-center gap-2 mb-2">
                                  <FiClock className="text-default-400" />
                                  <span className="font-semibold">Date de candidature</span>
                                </div>
                                <p>
                                  {candidateDetail.application_date
                                    ? new Date(candidateDetail.application_date).toLocaleDateString("fr-FR")
                                    : "-"}
                                </p>
                              </CardBody>
                            </Card>
                          </div>

                          {candidateDetail.cv_url && (
                            <Card>
                              <CardBody>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <FiFileText className="text-danger" />
                                    <span className="font-semibold">CV</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    color="danger"
                                    variant="flat"
                                    startContent={<FiDownload />}
                                    as="a"
                                    href={candidateDetail.cv_url}
                                    target="_blank"
                                  >
                                    Télécharger
                                  </Button>
                                </div>
                              </CardBody>
                            </Card>
                          )}

                          {candidateDetail.cover_letter && (
                            <Card>
                              <CardHeader>
                                <h4 className="font-semibold">Lettre de motivation</h4>
                              </CardHeader>
                              <CardBody>
                                <p className="text-sm whitespace-pre-wrap">{candidateDetail.cover_letter}</p>
                              </CardBody>
                            </Card>
                          )}

                          {candidateDetail.internal_notes && (
                            <Card>
                              <CardHeader>
                                <h4 className="font-semibold">Notes internes</h4>
                              </CardHeader>
                              <CardBody>
                                <p className="text-sm whitespace-pre-wrap">{candidateDetail.internal_notes}</p>
                              </CardBody>
                            </Card>
                          )}
                        </div>
                      </Tab>

                      <Tab key="interviews" title={`Entretiens (${candidateDetail.interviews?.length || 0})`}>
                        <div className="space-y-4 py-4">
                          {candidateDetail.interviews?.length > 0 ? (
                            candidateDetail.interviews.map((interview) => (
                              <Card key={interview.id}>
                                <CardBody>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-semibold">{interview.interview_type}</p>
                                      <p className="text-sm text-default-500">
                                        {new Date(interview.scheduled_date).toLocaleString("fr-FR")}
                                      </p>
                                      {interview.notes && (
                                        <p className="text-sm mt-2">{interview.notes}</p>
                                      )}
                                      {interview.feedback && (
                                        <div className="mt-2 p-2 bg-default-100 rounded">
                                          <p className="text-sm font-semibold">Feedback:</p>
                                          <p className="text-sm">{interview.feedback}</p>
                                          {interview.rating && (
                                            <p className="text-sm mt-1">
                                              Note: {"★".repeat(interview.rating)}{"☆".repeat(5 - interview.rating)}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <Chip size="sm" variant="flat">
                                      {interview.status}
                                    </Chip>
                                  </div>
                                </CardBody>
                              </Card>
                            ))
                          ) : (
                            <p className="text-center text-default-400 py-8">Aucun entretien planifié</p>
                          )}
                        </div>
                      </Tab>

                      <Tab key="evaluations" title={`Évaluations (${candidateDetail.evaluations?.length || 0})`}>
                        <div className="space-y-4 py-4">
                          {candidateDetail.evaluations?.length > 0 ? (
                            candidateDetail.evaluations.map((evaluation) => (
                              <Card key={evaluation.id}>
                                <CardBody>
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <p className="font-semibold">
                                        {evaluation.evaluator?.firstname} {evaluation.evaluator?.lastname}
                                      </p>
                                      <p className="text-xs text-default-400">
                                        {new Date(evaluation.created_at).toLocaleDateString("fr-FR")}
                                      </p>
                                    </div>
                                    {evaluation.rating && (
                                      <div className="flex items-center gap-1">
                                        <FiStar className="text-warning" />
                                        <span>{evaluation.rating}/10</span>
                                      </div>
                                    )}
                                  </div>
                                  {evaluation.comments && (
                                    <p className="text-sm mt-2">{evaluation.comments}</p>
                                  )}
                                </CardBody>
                              </Card>
                            ))
                          ) : (
                            <p className="text-center text-default-400 py-8">Aucune évaluation</p>
                          )}
                        </div>
                      </Tab>

                      <Tab key="offers" title={`Offres (${candidateDetail.job_offers?.length || 0})`}>
                        <div className="space-y-4 py-4">
                          {candidateDetail.job_offers?.length > 0 ? (
                            candidateDetail.job_offers.map((offer) => (
                              <Card key={offer.id}>
                                <CardBody>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-semibold">
                                        Salaire: {parseInt(offer.salary_offered || 0).toLocaleString()} FC
                                      </p>
                                      <p className="text-sm text-default-500">
                                        Date de début: {offer.start_date ? new Date(offer.start_date).toLocaleDateString("fr-FR") : "-"}
                                      </p>
                                      {offer.benefits && offer.benefits.length > 0 && (
                                        <div className="flex gap-1 mt-2 flex-wrap">
                                          {offer.benefits.map((benefit, idx) => (
                                            <Chip key={idx} size="sm" variant="flat">{benefit}</Chip>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <Chip color={STATUS_COLORS[offer.status] || "default"} variant="flat">
                                      {offer.status}
                                    </Chip>
                                  </div>
                                </CardBody>
                              </Card>
                            ))
                          ) : (
                            <p className="text-center text-default-400 py-8">Aucune offre faite</p>
                          )}
                        </div>
                      </Tab>
                    </Tabs>
                  ) : null}
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={handleCloseDetail}>
                    Fermer
                  </Button>
                  <Button
                    color="danger"
                    startContent={<FiEdit />}
                    onPress={() => {
                      handleCloseDetail();
                      handleOpenEdit(selectedCandidate);
                    }}
                  >
                    Modifier
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal Edit */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="2xl">
          <ModalContent>
            {(onClose) => (
              <form onSubmit={handleSubmit(onSubmit)}>
                <ModalHeader>
                  <h3 className="text-xl font-bold">Modifier le Candidat</h3>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Controller
                      name="status"
                      control={control}
                      rules={{ required: "Statut requis" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Statut"
                          placeholder="Sélectionnez le statut"
                          isRequired
                          errorMessage={errors.status?.message}
                          isInvalid={!!errors.status}
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="overall_score"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Score global (1-10)"
                          placeholder="Attribuer une note"
                          selectedKeys={field.value ? [String(field.value)] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                            <SelectItem key={String(score)} value={String(score)}>
                              {score} - {"★".repeat(Math.ceil(score / 2))}{"☆".repeat(5 - Math.ceil(score / 2))}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="internal_notes"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="Notes internes"
                          placeholder="Ajoutez des notes sur ce candidat..."
                          minRows={4}
                        />
                      )}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onEditClose}>
                    Annuler
                  </Button>
                  <Button
                    color="danger"
                    type="submit"
                    isLoading={updateCandidateMutation.isPending}
                  >
                    Mettre à jour
                  </Button>
                </ModalFooter>
              </form>
            )}
          </ModalContent>
        </Modal>

        {/* Modal Interview Rapide */}
        <Modal isOpen={isInterviewOpen} onClose={onInterviewClose} size="2xl">
          <ModalContent>
            {(onClose) => (
              <form onSubmit={handleInterviewSubmit(onInterviewSubmit)}>
                <ModalHeader>
                  <h3 className="text-xl font-bold">Planifier un Entretien</h3>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <Controller
                      name="interview_type"
                      control={interviewControl}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Type d'entretien"
                          placeholder="Sélectionnez le type"
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          <SelectItem key="hr_screening" value="hr_screening">Présélection RH</SelectItem>
                          <SelectItem key="technical" value="technical">Technique</SelectItem>
                          <SelectItem key="behavioral" value="behavioral">Comportemental</SelectItem>
                          <SelectItem key="panel" value="panel">Panel</SelectItem>
                          <SelectItem key="final" value="final">Final</SelectItem>
                        </Select>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="scheduled_date"
                        control={interviewControl}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="date"
                            label="Date"
                          />
                        )}
                      />

                      <Controller
                        name="scheduled_time"
                        control={interviewControl}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="time"
                            label="Heure"
                          />
                        )}
                      />
                    </div>

                    <Controller
                      name="notes"
                      control={interviewControl}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="Notes"
                          placeholder="Notes sur l'entretien..."
                          minRows={3}
                        />
                      )}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onInterviewClose}>
                    Annuler
                  </Button>
                  <Button
                    color="danger"
                    type="submit"
                    isLoading={createInterviewMutation.isPending}
                  >
                    Planifier
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
