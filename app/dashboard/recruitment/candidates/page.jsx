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
  Pagination,
  SelectItem,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
  Avatar,
  Progress,
  Tabs,
  Tab,
  User,
} from "@nextui-org/react";
import {
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiEye,
  FiUserCheck,
  FiStar,
  FiCalendar,
  FiMail,
  FiPhone,
  FiFileText,
  FiDownload,
} from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetJobApplications,
  useGetJobApplicationById,
  useUpdateJobApplication,
  useAssignApplication,
  useRateApplication,
  useScheduleInterview,
  useGetJobPostings,
} from "@/src/hooks/useRecruitment";
import { useGetEmployees } from "@/src/hooks/useEmployees";

export default function CandidatesPage() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activeTab, setActiveTab] = useState("info");

  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
  const { isOpen: isRateOpen, onOpen: onRateOpen, onClose: onRateClose } = useDisclosure();
  const { isOpen: isInterviewOpen, onOpen: onInterviewOpen, onClose: onInterviewClose } = useDisclosure();

  const { data: applicationsData, isLoading } = useGetJobApplications({ page, rowsPerPage, ...filters });
  const { data: dataPostings } = useGetJobPostings({ page: 1, rowsPerPage: 1000, status: "published" });
  const { data: employeesData } = useGetEmployees({ page: 1, rowsPerPage: 1000, query: "", filters: {} });
  
  const applications = applicationsData?.applications || [];
  const totalApplications = applicationsData?.total || 0;
  const jobPostings = dataPostings?.postings || [];
  const employees = employeesData?.employees || [];
  const pages = Math.ceil(totalApplications / rowsPerPage);

  const updateApplicationMutation = useUpdateJobApplication();
  const assignApplicationMutation = useAssignApplication();
  const rateApplicationMutation = useRateApplication();
  const scheduleInterviewMutation = useScheduleInterview();

  const {
    control: assignControl,
    handleSubmit: handleAssignSubmit,
    reset: resetAssign,
  } = useForm();

  const {
    control: rateControl,
    handleSubmit: handleRateSubmit,
    reset: resetRate,
  } = useForm();

  const {
    control: interviewControl,
    handleSubmit: handleInterviewSubmit,
    reset: resetInterview,
  } = useForm();

  const onUpdateStatus = async (applicationId, newStatus) => {
    try {
      await updateApplicationMutation.mutateAsync({
        id: applicationId,
        applicationData: { status: newStatus },
      });
      toast.success("Statut mis à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const onAssignApplication = async (data) => {
    try {
      await assignApplicationMutation.mutateAsync({
        id: selectedApplication.id,
        recruiter_id: data.recruiter_id,
      });
      toast.success("Recruteur assigné");
      resetAssign();
      onAssignClose();
    } catch (error) {
      toast.error("Erreur lors de l'assignation");
    }
  };

  const onRateApplication = async (data) => {
    try {
      await rateApplicationMutation.mutateAsync({
        id: selectedApplication.id,
        rating: parseInt(data.rating),
        notes: data.notes,
      });
      toast.success("Évaluation enregistrée");
      resetRate();
      onRateClose();
    } catch (error) {
      toast.error("Erreur lors de l'évaluation");
    }
  };

  const onScheduleInterview = async (data) => {
    try {
      await scheduleInterviewMutation.mutateAsync({
        application_id: selectedApplication.id,
        interviewData: data,
      });
      toast.success("Entretien programmé");
      resetInterview();
      onInterviewClose();
    } catch (error) {
      toast.error("Erreur lors de la programmation");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "primary",
      screening: "secondary",
      interview: "warning",
      offer: "success",
      hired: "success",
      rejected: "danger",
      withdrawn: "default",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: "Nouveau",
      screening: "Présélection",
      interview: "Entretien",
      offer: "Offre",
      hired: "Embauché",
      rejected: "Rejeté",
      withdrawn: "Retiré",
    };
    return labels[status] || status;
  };

  const downloadCV = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Candidatures</h1>
          <p className="text-sm text-gray-500">
            Gestion des candidats et du processus de recrutement
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Rechercher un candidat..."
              startContent={<FiSearch />}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <Select
              label="Offre d'emploi"
              placeholder="Toutes"
              onChange={(e) => setFilters({ ...filters, job_posting_id: e.target.value })}
            >
              {jobPostings?.map((posting) => (
                <SelectItem key={posting.id} value={posting.id}>
                  {posting.job_title}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Statut"
              placeholder="Tous"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <SelectItem key="new" value="new">Nouveau</SelectItem>
              <SelectItem key="screening" value="screening">Présélection</SelectItem>
              <SelectItem key="interview" value="interview">Entretien</SelectItem>
              <SelectItem key="offer" value="offer">Offre</SelectItem>
              <SelectItem key="hired" value="hired">Embauché</SelectItem>
              <SelectItem key="rejected" value="rejected">Rejeté</SelectItem>
            </Select>
            <Select
              label="Source"
              placeholder="Toutes"
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            >
              <SelectItem key="website" value="website">Site Web</SelectItem>
              <SelectItem key="linkedin" value="linkedin">LinkedIn</SelectItem>
              <SelectItem key="referral" value="referral">Recommandation</SelectItem>
              <SelectItem key="job_board" value="job_board">Site d'emploi</SelectItem>
              <SelectItem key="other" value="other">Autre</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table aria-label="Candidatures">
              <TableHeader>
                <TableColumn>CANDIDAT</TableColumn>
                <TableColumn>POSTE</TableColumn>
                <TableColumn>SOURCE</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>NOTE</TableColumn>
                <TableColumn>RECRUTEUR</TableColumn>
                <TableColumn>DATE DÉPÔT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Aucune candidature trouvée">
                {(applications || []).map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <User
                        name={`${application.first_name} ${application.last_name}`}
                        description={application.email}
                        avatarProps={{
                          src: application.profile_picture,
                          name: application.first_name?.[0],
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{application.job_posting?.job_title}</p>
                        <p className="text-xs text-gray-500">
                          {application.job_posting?.reference_number}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {application.source}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={getStatusColor(application.status)}
                        variant="flat"
                      >
                        {getStatusLabel(application.status)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {application.rating ? (
                        <div className="flex items-center gap-1">
                          <FiStar className="text-warning" />
                          <span className="font-semibold">{application.rating}/5</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {application.recruiter ? (
                        <span className="text-sm">{application.recruiter.username}</span>
                      ) : (
                        <Chip size="sm" variant="flat" color="warning">
                          Non assigné
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(application.applied_date).toLocaleDateString("fr-FR")}
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
                              setSelectedApplication(application);
                              onDetailOpen();
                            }}
                          >
                            Voir le profil
                          </DropdownItem>
                          <DropdownItem
                            key="assign"
                            startContent={<FiUserCheck />}
                            onPress={() => {
                              setSelectedApplication(application);
                              onAssignOpen();
                            }}
                          >
                            Assigner un recruteur
                          </DropdownItem>
                          <DropdownItem
                            key="rate"
                            startContent={<FiStar />}
                            onPress={() => {
                              setSelectedApplication(application);
                              onRateOpen();
                            }}
                          >
                            Évaluer
                          </DropdownItem>
                          <DropdownItem
                            key="interview"
                            startContent={<FiCalendar />}
                            onPress={() => {
                              setSelectedApplication(application);
                              onInterviewOpen();
                            }}
                          >
                            Programmer entretien
                          </DropdownItem>
                          <DropdownItem
                            key="screening"
                            onPress={() => onUpdateStatus(application.id, "screening")}
                          >
                            → Présélection
                          </DropdownItem>
                          <DropdownItem
                            key="reject"
                            className="text-danger"
                            color="danger"
                            onPress={() => onUpdateStatus(application.id, "rejected")}
                          >
                            Rejeter
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination */}
          {!isLoading && totalApplications > 0 && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                Total: {totalApplications} candidature(s)
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
          )}
        </CardBody>
      </Card>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <Modal
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          size="4xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader>
              Profil du Candidat
            </ModalHeader>
            <ModalBody>
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={setActiveTab}
                aria-label="Application details"
              >
                <Tab key="info" title="Informations">
                  <div className="space-y-6 py-4">
                    {/* Personal Info */}
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={selectedApplication.profile_picture}
                        name={selectedApplication.first_name?.[0]}
                        size="lg"
                        className="w-20 h-20"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">
                          {selectedApplication.first_name} {selectedApplication.last_name}
                        </h3>
                        <p className="text-gray-500">{selectedApplication.email}</p>
                        <p className="text-gray-500">{selectedApplication.phone}</p>
                      </div>
                      <Chip
                        color={getStatusColor(selectedApplication.status)}
                        variant="flat"
                      >
                        {getStatusLabel(selectedApplication.status)}
                      </Chip>
                    </div>

                    {/* Application Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Poste</p>
                        <p className="font-semibold">
                          {selectedApplication.job_posting?.job_title}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Source</p>
                        <p className="font-semibold">{selectedApplication.source}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date de dépôt</p>
                        <p className="font-semibold">
                          {new Date(selectedApplication.applied_date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      {selectedApplication.rating && (
                        <div>
                          <p className="text-sm text-gray-500">Évaluation</p>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(selectedApplication.rating / 5) * 100}
                              color="warning"
                              className="max-w-md"
                            />
                            <span className="font-semibold">
                              {selectedApplication.rating}/5
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cover Letter */}
                    {selectedApplication.cover_letter && (
                      <div>
                        <h4 className="font-semibold mb-2">Lettre de motivation</h4>
                        <p className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                          {selectedApplication.cover_letter}
                        </p>
                      </div>
                    )}

                    {/* Documents */}
                    <div>
                      <h4 className="font-semibold mb-2">Documents</h4>
                      <div className="flex gap-2">
                        {selectedApplication.cv_url && (
                          <Button
                            size="sm"
                            variant="flat"
                            startContent={<FiDownload />}
                            onPress={() => downloadCV(selectedApplication.cv_url)}
                          >
                            Télécharger CV
                          </Button>
                        )}
                        {selectedApplication.portfolio_url && (
                          <Button
                            size="sm"
                            variant="flat"
                            startContent={<FiFileText />}
                            onPress={() => window.open(selectedApplication.portfolio_url, "_blank")}
                          >
                            Portfolio
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedApplication.notes && (
                      <div>
                        <h4 className="font-semibold mb-2">Notes</h4>
                        <p className="text-sm whitespace-pre-wrap bg-yellow-50 p-4 rounded-lg">
                          {selectedApplication.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab key="timeline" title="Historique">
                  <div className="py-4">
                    <p className="text-center text-gray-500">
                      Historique des activités à venir
                    </p>
                  </div>
                </Tab>

                <Tab key="interviews" title="Entretiens">
                  <div className="py-4">
                    <p className="text-center text-gray-500">
                      Liste des entretiens programmés
                    </p>
                  </div>
                </Tab>
              </Tabs>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onDetailClose}>
                Fermer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Assign Recruiter Modal */}
      <Modal isOpen={isAssignOpen} onClose={onAssignClose}>
        <ModalContent>
          <form onSubmit={handleAssignSubmit(onAssignApplication)}>
            <ModalHeader>Assigner un Recruteur</ModalHeader>
            <ModalBody>
              <Controller
                name="recruiter_id"
                control={assignControl}
                rules={{ required: "Veuillez sélectionner un recruteur" }}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Recruteur"
                    placeholder="Sélectionnez un recruteur"
                  >
                    {employees?.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onAssignClose}>
                Annuler
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={assignApplicationMutation.isPending}
              >
                Assigner
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Rate Application Modal */}
      <Modal isOpen={isRateOpen} onClose={onRateClose}>
        <ModalContent>
          <form onSubmit={handleRateSubmit(onRateApplication)}>
            <ModalHeader>Évaluer le Candidat</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Controller
                  name="rating"
                  control={rateControl}
                  rules={{ required: "La note est requise" }}
                  render={({ field }) => (
                    <Select {...field} label="Note" placeholder="Sélectionnez">
                      <SelectItem key="1" value="1">1 - Très faible</SelectItem>
                      <SelectItem key="2" value="2">2 - Faible</SelectItem>
                      <SelectItem key="3" value="3">3 - Moyen</SelectItem>
                      <SelectItem key="4" value="4">4 - Bon</SelectItem>
                      <SelectItem key="5" value="5">5 - Excellent</SelectItem>
                    </Select>
                  )}
                />
                <Controller
                  name="notes"
                  control={rateControl}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Notes"
                      placeholder="Commentaires sur le candidat..."
                      rows={4}
                    />
                  )}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onRateClose}>
                Annuler
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={rateApplicationMutation.isPending}
              >
                Enregistrer
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal isOpen={isInterviewOpen} onClose={onInterviewClose} size="2xl">
        <ModalContent>
          <form onSubmit={handleInterviewSubmit(onScheduleInterview)}>
            <ModalHeader>Programmer un Entretien</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="interview_date"
                    control={interviewControl}
                    rules={{ required: "La date est requise" }}
                    render={({ field }) => (
                      <Input {...field} type="datetime-local" label="Date et Heure" />
                    )}
                  />
                  <Controller
                    name="duration_minutes"
                    control={interviewControl}
                    defaultValue={60}
                    render={({ field }) => (
                      <Input {...field} type="number" label="Durée (minutes)" />
                    )}
                  />
                </div>
                <Controller
                  name="interview_type"
                  control={interviewControl}
                  rules={{ required: "Le type est requis" }}
                  render={({ field }) => (
                    <Select {...field} label="Type d'entretien" placeholder="Sélectionnez">
                      <SelectItem key="phone" value="phone">Téléphonique</SelectItem>
                      <SelectItem key="video" value="video">Visioconférence</SelectItem>
                      <SelectItem key="in_person" value="in_person">En personne</SelectItem>
                      <SelectItem key="technical" value="technical">Test technique</SelectItem>
                    </Select>
                  )}
                />
                <Controller
                  name="location"
                  control={interviewControl}
                  render={({ field }) => (
                    <Input {...field} label="Lieu / Lien" placeholder="Adresse ou URL" />
                  )}
                />
                <Controller
                  name="notes"
                  control={interviewControl}
                  render={({ field }) => (
                    <Textarea {...field} label="Notes" placeholder="Instructions..." rows={4} />
                  )}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onInterviewClose}>
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
    </div>
  );
}
