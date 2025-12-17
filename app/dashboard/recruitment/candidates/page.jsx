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
import { FiPlus, FiSearch, FiMoreVertical, FiEye, FiUserCheck, FiStar, FiCalendar, FiMail, FiPhone, FiFileText, FiDownload } from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { useGetJobApplications, useGetJobApplicationById, useUpdateJobApplication, useAssignApplication, useRateApplication, useScheduleInterview, useGetJobPostings } from "@/src/hooks/useRecruitment";
import { useGetEmployees } from "@/src/hooks/useEmployees";

export default function CandidatesPage() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState({});
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [activeTab, setActiveTab] = useState("info");
    const [statusToChange, setStatusToChange] = useState("");

    const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
    const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure();
    const { isOpen: isRateOpen, onOpen: onRateOpen, onClose: onRateClose } = useDisclosure();
    const { isOpen: isInterviewOpen, onOpen: onInterviewOpen, onClose: onInterviewClose } = useDisclosure();
    const { isOpen: isStatusOpen, onOpen: onStatusOpen, onClose: onStatusClose } = useDisclosure();

    const { data: applicationsData, isLoading } = useGetJobApplications({ page, rowsPerPage, ...filters });
    const { data: dataPostings } = useGetJobPostings({ page: 1, rowsPerPage: 1000, status: "published" });
    const { data: employeesData } = useGetEmployees({ page: 1, rowsPerPage: 1000, query: "", filters: {} });

    const applications = applicationsData?.applications || [];
    const totalApplications = applicationsData?.total || 0;
    const jobPostings = dataPostings?.postings || [];
    const employees = employeesData?.employees || [];
    const pages = Math.ceil(totalApplications / rowsPerPage);

    console.log("Applications Data ***** :", applicationsData);

    const updateApplicationMutation = useUpdateJobApplication();
    const assignApplicationMutation = useAssignApplication();
    const rateApplicationMutation = useRateApplication();
    const scheduleInterviewMutation = useScheduleInterview();

    const { control: assignControl, handleSubmit: handleAssignSubmit, reset: resetAssign } = useForm();

    const { control: rateControl, handleSubmit: handleRateSubmit, reset: resetRate } = useForm();

    const { control: interviewControl, handleSubmit: handleInterviewSubmit, reset: resetInterview } = useForm();

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
            // Combine date and time for scheduled_date
            const interviewData = {
                application_id: selectedApplication.id,
                interview_type: data.interview_type,
                interview_round: data.interview_round || 1,
                date: data.date,
                time: data.time,
                duration_minutes: parseInt(data.duration_minutes) || 60,
                location: data.location,
                meeting_link: data.meeting_link,
                interviewers: data.interviewers,
                notes: data.notes,
            };

            await scheduleInterviewMutation.mutateAsync(interviewData);
            toast.success("Entretien programmé");
            resetInterview();
            onInterviewClose();
        } catch (error) {
            console.error("Schedule interview error:", error);
            toast.error(error.response?.data?.error || "Erreur lors de la programmation");
        }
    };

    const onChangeStatus = async () => {
        if (!statusToChange) {
            toast.error("Veuillez sélectionner un statut");
            return;
        }

        try {
            await updateApplicationMutation.mutateAsync({
                id: selectedApplication.id,
                applicationData: { status: statusToChange },
            });
            toast.success("Statut mis à jour avec succès");
            onStatusClose();
            setStatusToChange("");
        } catch (error) {
            toast.error("Erreur lors de la mise à jour du statut");
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
                    <p className="text-sm text-gray-500">Gestion des candidats et du processus de recrutement</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input placeholder="Rechercher un candidat..." startContent={<FiSearch />} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                        <Select label="Offre d'emploi" placeholder="Toutes" onChange={(e) => setFilters({ ...filters, job_posting_id: e.target.value })}>
                            {jobPostings?.map((posting) => (
                                <SelectItem key={posting.id} value={posting.id}>
                                    {posting.job_title}
                                </SelectItem>
                            ))}
                        </Select>
                        <Select label="Statut" placeholder="Tous" onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                            <SelectItem key="new" value="new">
                                Nouveau
                            </SelectItem>
                            <SelectItem key="screening" value="screening">
                                Présélection
                            </SelectItem>
                            <SelectItem key="interview" value="interview">
                                Entretien
                            </SelectItem>
                            <SelectItem key="offer" value="offer">
                                Offre
                            </SelectItem>
                            <SelectItem key="hired" value="hired">
                                Embauché
                            </SelectItem>
                            <SelectItem key="rejected" value="rejected">
                                Rejeté
                            </SelectItem>
                        </Select>
                        <Select label="Source" placeholder="Toutes" onChange={(e) => setFilters({ ...filters, source: e.target.value })}>
                            <SelectItem key="website" value="website">
                                Site Web
                            </SelectItem>
                            <SelectItem key="linkedin" value="linkedin">
                                LinkedIn
                            </SelectItem>
                            <SelectItem key="referral" value="referral">
                                Recommandation
                            </SelectItem>
                            <SelectItem key="job_board" value="job_board">
                                Site d'emploi
                            </SelectItem>
                            <SelectItem key="other" value="other">
                                Autre
                            </SelectItem>
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
                                                <p className="text-xs text-gray-500">{application.job_posting?.title}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" variant="flat">
                                                {application.application_source}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="sm" color={getStatusColor(application.status)} variant="flat">
                                                {getStatusLabel(application.status)}
                                            </Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {application.rating ? (
                                                    <div className="flex items-center gap-1">
                                                        <FiStar className="text-warning" />
                                                        <span className="font-semibold text-sm">{application.rating}/5</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">N/A</span>
                                                )}
                                                {application.interviews && application.interviews.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {application.interviews
                                                            .filter((interview) => interview.evaluations && interview.evaluations.length > 0)
                                                            .slice(0, 2) // Afficher max 2 évaluations
                                                            .map((interview, idx) =>
                                                                interview.evaluations.map((evaluation, evalIdx) => (
                                                                    <Chip
                                                                        key={`${idx}-${evalIdx}`}
                                                                        size="sm"
                                                                        variant="flat"
                                                                        color={
                                                                            evaluation.recommendation === "highly_recommended" || evaluation.recommendation === "recommended" ? "success" : evaluation.recommendation === "maybe" ? "warning" : "danger"
                                                                        }
                                                                        className="text-xs"
                                                                    >
                                                                        {evaluation.overall_score}/10
                                                                    </Chip>
                                                                ))
                                                            )}
                                                    </div>
                                                )}
                                            </div>
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
                                        <TableCell>{new Date(application.applied_date).toLocaleDateString("fr-FR")}</TableCell>
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
                                                            setActiveTab("info");
                                                            onDetailOpen();
                                                        }}
                                                    >
                                                        Voir le profil complet
                                                    </DropdownItem>
                                                    <DropdownItem
                                                        key="status"
                                                        startContent={<FiFileText />}
                                                        onPress={() => {
                                                            setSelectedApplication(application);
                                                            setStatusToChange(application.status);
                                                            onStatusOpen();
                                                        }}
                                                    >
                                                        Changer le statut
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
                                                        Programmer un entretien
                                                    </DropdownItem>
                                                    <DropdownItem key="screening" onPress={() => onUpdateStatus(application.id, "screening")}>
                                                        → Présélection
                                                    </DropdownItem>
                                                    <DropdownItem key="reject" className="text-danger" color="danger" onPress={() => onUpdateStatus(application.id, "rejected")}>
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
                            <span className="text-sm text-gray-500">Total: {totalApplications} candidature(s)</span>
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
                                <Pagination isCompact showControls showShadow color="danger" page={page} total={pages} onChange={setPage} />
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Application Detail Modal */}
            {selectedApplication && (
                <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="4xl" scrollBehavior="inside">
                    <ModalContent>
                        <ModalHeader>Profil du Candidat</ModalHeader>
                        <ModalBody>
                            <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab} aria-label="Application details">
                                <Tab key="info" title="Informations">
                                    <div className="space-y-6 py-4">
                                        {/* Personal Info */}
                                        <div className="flex items-start gap-4">
                                            <Avatar src={selectedApplication.profile_picture} name={selectedApplication.first_name?.[0]} size="lg" className="w-20 h-20" />
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold">
                                                    {selectedApplication.first_name} {selectedApplication.last_name}
                                                </h3>
                                                <p className="text-gray-500">{selectedApplication.email}</p>
                                                <p className="text-gray-500">{selectedApplication.phone}</p>
                                            </div>
                                            <Chip color={getStatusColor(selectedApplication.status)} variant="flat">
                                                {getStatusLabel(selectedApplication.status)}
                                            </Chip>
                                        </div>

                                        {/* Application Details */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Poste</p>
                                                <p className="font-semibold">{selectedApplication.job_posting?.job_title}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Source</p>
                                                <p className="font-semibold">{selectedApplication.source}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Date de dépôt</p>
                                                <p className="font-semibold">{new Date(selectedApplication.applied_date).toLocaleDateString("fr-FR")}</p>
                                            </div>
                                            {selectedApplication.rating && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Évaluation</p>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={(selectedApplication.rating / 5) * 100} color="warning" className="max-w-md" />
                                                        <span className="font-semibold">{selectedApplication.rating}/5</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Cover Letter */}
                                        {selectedApplication.cover_letter && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Lettre de motivation</h4>
                                                <p className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{selectedApplication.cover_letter}</p>
                                            </div>
                                        )}

                                        {/* Documents */}
                                        <div>
                                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                                <FiFileText /> Documents
                                            </h4>
                                            <div className="space-y-2">
                                                {selectedApplication.cv_file_path && (
                                                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <FiFileText className="text-danger" />
                                                            <div>
                                                                <p className="font-medium text-sm">CV</p>
                                                                <p className="text-xs text-gray-500">{selectedApplication.cv_file_path.split("/").pop()}</p>
                                                            </div>
                                                        </div>
                                                        <Button size="sm" variant="flat" color="danger" startContent={<FiDownload />} onPress={() => window.open(`/${selectedApplication.cv_file_path}`, "_blank")}>
                                                            Télécharger
                                                        </Button>
                                                    </div>
                                                )}
                                                {selectedApplication.cover_letter_file_path && (
                                                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <FiFileText className="text-primary" />
                                                            <div>
                                                                <p className="font-medium text-sm">Lettre de motivation</p>
                                                                <p className="text-xs text-gray-500">{selectedApplication.cover_letter_file_path.split("/").pop()}</p>
                                                            </div>
                                                        </div>
                                                        <Button size="sm" variant="flat" color="primary" startContent={<FiDownload />} onPress={() => window.open(`/${selectedApplication.cover_letter_file_path}`, "_blank")}>
                                                            Télécharger
                                                        </Button>
                                                    </div>
                                                )}
                                                {selectedApplication.additional_documents &&
                                                    JSON.parse(selectedApplication.additional_documents).length > 0 &&
                                                    JSON.parse(selectedApplication.additional_documents).map((doc, index) => (
                                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                <FiFileText className="text-secondary" />
                                                                <div>
                                                                    <p className="font-medium text-sm">Document supplémentaire {index + 1}</p>
                                                                    <p className="text-xs text-gray-500">{doc.split("/").pop()}</p>
                                                                </div>
                                                            </div>
                                                            <Button size="sm" variant="flat" color="secondary" startContent={<FiDownload />} onPress={() => window.open(`/${doc}`, "_blank")}>
                                                                Télécharger
                                                            </Button>
                                                        </div>
                                                    ))}
                                                {selectedApplication.linkedin_url && (
                                                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <FiFileText className="text-blue-600" />
                                                            <div>
                                                                <p className="font-medium text-sm">LinkedIn</p>
                                                                <p className="text-xs text-gray-500">{selectedApplication.linkedin_url}</p>
                                                            </div>
                                                        </div>
                                                        <Button size="sm" variant="flat" color="primary" onPress={() => window.open(selectedApplication.linkedin_url, "_blank")}>
                                                            Ouvrir
                                                        </Button>
                                                    </div>
                                                )}
                                                {selectedApplication.portfolio_url && (
                                                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <FiFileText className="text-purple-600" />
                                                            <div>
                                                                <p className="font-medium text-sm">Portfolio</p>
                                                                <p className="text-xs text-gray-500">{selectedApplication.portfolio_url}</p>
                                                            </div>
                                                        </div>
                                                        <Button size="sm" variant="flat" color="secondary" onPress={() => window.open(selectedApplication.portfolio_url, "_blank")}>
                                                            Ouvrir
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {selectedApplication.notes && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Notes</h4>
                                                <p className="text-sm whitespace-pre-wrap bg-yellow-50 p-4 rounded-lg">{selectedApplication.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </Tab>

                                <Tab key="timeline" title="Historique">
                                    <div className="py-4">
                                        <p className="text-center text-gray-500">Historique des activités à venir</p>
                                    </div>
                                </Tab>

                                <Tab key="interviews" title="Entretiens">
                                    <div className="py-4 space-y-4">
                                        {selectedApplication.interviews && selectedApplication.interviews.length > 0 ? (
                                            selectedApplication.interviews.map((interview) => (
                                                <div key={interview.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h5 className="font-semibold">Entretien {interview.interview_type}</h5>
                                                            <p className="text-sm text-gray-500">
                                                                Round {interview.interview_round} - {new Date(interview.scheduled_date).toLocaleString("fr-FR")}
                                                            </p>
                                                        </div>
                                                        <Chip size="sm" color={interview.status === "completed" ? "success" : interview.status === "cancelled" ? "danger" : "warning"}>
                                                            {interview.status}
                                                        </Chip>
                                                    </div>
                                                    {interview.location && (
                                                        <p className="text-sm">
                                                            <strong>Lieu:</strong> {interview.location}
                                                        </p>
                                                    )}
                                                    {interview.meeting_link && (
                                                        <Button size="sm" variant="flat" onPress={() => window.open(interview.meeting_link, "_blank")}>
                                                            Rejoindre la réunion
                                                        </Button>
                                                    )}
                                                    {interview.evaluations && interview.evaluations.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t">
                                                            <p className="text-sm font-semibold mb-2">Évaluations:</p>
                                                            {interview.evaluations.map((evaluation) => (
                                                                <div key={evaluation.id} className="flex gap-2 flex-wrap">
                                                                    <Chip size="sm" variant="flat" color="primary">
                                                                        Technique: {evaluation.technical_skills_score}/10
                                                                    </Chip>
                                                                    <Chip size="sm" variant="flat" color="secondary">
                                                                        Communication: {evaluation.communication_score}/10
                                                                    </Chip>
                                                                    <Chip size="sm" variant="flat" color="success">
                                                                        Global: {evaluation.overall_score}/10
                                                                    </Chip>
                                                                    <Chip size="sm" color={evaluation.recommendation === "highly_recommended" ? "success" : evaluation.recommendation === "recommended" ? "primary" : "warning"}>
                                                                        {evaluation.recommendation}
                                                                    </Chip>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-gray-500">Aucun entretien programmé</p>
                                        )}
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
                                    <Select {...field} label="Recruteur" placeholder="Sélectionnez un recruteur">
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
                            <Button color="primary" type="submit" isLoading={assignApplicationMutation.isPending}>
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
                                            <SelectItem key="1" value="1">
                                                1 - Très faible
                                            </SelectItem>
                                            <SelectItem key="2" value="2">
                                                2 - Faible
                                            </SelectItem>
                                            <SelectItem key="3" value="3">
                                                3 - Moyen
                                            </SelectItem>
                                            <SelectItem key="4" value="4">
                                                4 - Bon
                                            </SelectItem>
                                            <SelectItem key="5" value="5">
                                                5 - Excellent
                                            </SelectItem>
                                        </Select>
                                    )}
                                />
                                <Controller name="notes" control={rateControl} render={({ field }) => <Textarea {...field} label="Notes" placeholder="Commentaires sur le candidat..." rows={4} />} />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onRateClose}>
                                Annuler
                            </Button>
                            <Button color="primary" type="submit" isLoading={rateApplicationMutation.isPending}>
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
                                    <Controller name="date" control={interviewControl} rules={{ required: "La date est requise" }} render={({ field }) => <Input {...field} type="date" label="Date" />} />
                                    <Controller name="time" control={interviewControl} rules={{ required: "L'heure est requise" }} render={({ field }) => <Input {...field} type="time" label="Heure" />} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Controller
                                        name="interview_type"
                                        control={interviewControl}
                                        rules={{ required: "Le type est requis" }}
                                        render={({ field }) => (
                                            <Select {...field} label="Type d'entretien" placeholder="Sélectionnez">
                                                <SelectItem key="phone" value="phone">
                                                    Téléphonique
                                                </SelectItem>
                                                <SelectItem key="video" value="video">
                                                    Visioconférence
                                                </SelectItem>
                                                <SelectItem key="in_person" value="in_person">
                                                    En personne
                                                </SelectItem>
                                                <SelectItem key="technical" value="technical">
                                                    Test technique
                                                </SelectItem>
                                            </Select>
                                        )}
                                    />
                                    <Controller name="duration_minutes" control={interviewControl} defaultValue={60} render={({ field }) => <Input {...field} type="number" label="Durée (minutes)" />} />
                                </div>
                                <Controller name="location" control={interviewControl} render={({ field }) => <Input {...field} label="Lieu" placeholder="Adresse physique" />} />
                                <Controller name="meeting_link" control={interviewControl} render={({ field }) => <Input {...field} label="Lien de réunion" placeholder="URL (Teams, Zoom, etc.)" />} />
                                <Controller name="interviewers" control={interviewControl} render={({ field }) => <Textarea {...field} label="Interviewers" placeholder="Liste des interviewers..." rows={2} />} />
                                <Controller name="notes" control={interviewControl} render={({ field }) => <Textarea {...field} label="Notes" placeholder="Instructions..." rows={3} />} />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onInterviewClose}>
                                Annuler
                            </Button>
                            <Button color="primary" type="submit" isLoading={scheduleInterviewMutation.isPending}>
                                Programmer
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>

            {/* Change Status Modal */}
            <Modal isOpen={isStatusOpen} onClose={onStatusClose} size="md">
                <ModalContent>
                    <ModalHeader>Changer le Statut de la Candidature</ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Candidat:{" "}
                                <strong>
                                    {selectedApplication?.first_name} {selectedApplication?.last_name}
                                </strong>
                            </p>
                            <p className="text-sm text-gray-600">
                                Statut actuel:{" "}
                                <Chip color={getStatusColor(selectedApplication?.status)} size="sm">
                                    {getStatusLabel(selectedApplication?.status)}
                                </Chip>
                            </p>
                            <Select label="Nouveau statut" placeholder="Sélectionnez un statut" selectedKeys={statusToChange ? [statusToChange] : []} onChange={(e) => setStatusToChange(e.target.value)}>
                                <SelectItem key="new" value="new">
                                    Nouveau
                                </SelectItem>
                                <SelectItem key="screening" value="screening">
                                    Présélection
                                </SelectItem>
                                <SelectItem key="shortlisted" value="shortlisted">
                                    Pr\u00e9s\u00e9lectionn\u00e9
                                </SelectItem>
                                <SelectItem key="interview_scheduled" value="interview_scheduled">
                                    Entretien programmé
                                </SelectItem>
                                <SelectItem key="interviewed" value="interviewed">
                                    Entretien effectué
                                </SelectItem>
                                <SelectItem key="assessment" value="assessment">
                                    Évaluation
                                </SelectItem>
                                <SelectItem key="offer_pending" value="offer_pending">
                                    Offre en attente
                                </SelectItem>
                                <SelectItem key="offer_sent" value="offer_sent">
                                    Offre envoyée
                                </SelectItem>
                                <SelectItem key="offer_accepted" value="offer_accepted">
                                    Offre acceptée
                                </SelectItem>
                                <SelectItem key="offer_declined" value="offer_declined">
                                    Offre refusée
                                </SelectItem>
                                <SelectItem key="rejected" value="rejected">
                                    Rejeté
                                </SelectItem>
                                <SelectItem key="withdrawn" value="withdrawn">
                                    Retiré
                                </SelectItem>
                            </Select>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onStatusClose}>
                            Annuler
                        </Button>
                        <Button color="primary" onPress={onChangeStatus} isLoading={updateApplicationMutation.isPending}>
                            Mettre à jour
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
