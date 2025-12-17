"use client";

import React, { useState, useRef } from "react";
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
  Tabs,
  Tab,
  Switch,
} from "@nextui-org/react";
import {
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiEye,
  FiEdit,
  FiSend,
  FiXCircle,
  FiCopy,
  FiExternalLink,
  FiDownload,
} from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import {
  useGetJobPostings,
  useGetJobPostingById,
  useCreateJobPosting,
  useUpdateJobPosting,
  usePublishJobPosting,
  useCloseJobPosting,
  useGetRecruitmentPlans,
} from "@/src/hooks/useRecruitment";
import {
  useGetJobPositions,
  useGetDepartments,
  useGetDirections,
  useGetServices,
  useGetGrades,
} from "@/src/hooks/useSettings";

export default function JobPostingsPage() {
  const [filters, setFilters] = useState({});
  const [selectedPosting, setSelectedPosting] = useState(null);
  const [viewMode, setViewMode] = useState("edit"); // 'edit' or 'preview'
  const printRef = useRef();

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

  const { data: dataPostings, isLoading } = useGetJobPostings(filters);
  const { data: dataPlans } = useGetRecruitmentPlans({ status: "approved" });
  const { data: jobPositions } = useGetJobPositions();
  const { data: directions } = useGetDirections();
  const { data: services } = useGetServices();
  const { data: grades } = useGetGrades();

  const plans = dataPlans?.plans || [];
  const postings = dataPostings?.postings || [];
  const totalPostings = dataPostings?.total || 0;

  console.log("Postings ****** :", dataPostings);

  const createPostingMutation = useCreateJobPosting();
  const updatePostingMutation = useUpdateJobPosting();
  const publishPostingMutation = usePublishJobPosting();
  const closePostingMutation = useCloseJobPosting();

  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    watch: watchCreate,
    formState: { errors: createErrors },
  } = useForm();

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: editErrors },
  } = useForm();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Offre_${selectedPosting?.reference_code || 'Job'}`,
  });

  const onCreatePosting = async (data) => {
    try {
      await createPostingMutation.mutateAsync(data);
      toast.success("Offre d'emploi créée avec succès");
      resetCreate();
      onCreateClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de la création");
    }
  };

  const onUpdatePosting = async (data) => {
    try {
      await updatePostingMutation.mutateAsync({
        id: selectedPosting.id,
        updates: data,
      });
      toast.success("Offre mise à jour");
      setViewMode("preview");
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de la mise à jour");
    }
  };

  const onPublishPosting = async (postingId) => {
    try {
      await publishPostingMutation.mutateAsync(postingId);
      toast.success("Offre publiée avec succès");
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de la publication");
    }
  };

  const onClosePosting = async (postingId) => {
    if (window.confirm("Êtes-vous sûr de vouloir fermer cette offre?")) {
      try {
        await closePostingMutation.mutateAsync(postingId);
        toast.success("Offre fermée");
      } catch (error) {
        toast.error("Erreur lors de la fermeture");
      }
    }
  };

  const copyJobLink = (postingId) => {
    const link = `${window.location.origin}/careers/jobs/${postingId}`;
    navigator.clipboard.writeText(link);
    toast.success("Lien copié dans le presse-papiers");
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "default",
      published: "success",
      closed: "danger",
      on_hold: "warning",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: "Brouillon",
      published: "Publié",
      closed: "Fermé",
      on_hold: "En attente",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Offres d'Emploi</h1>
          <p className="text-sm text-gray-500">
            Création et gestion des annonces de recrutement
          </p>
        </div>
        <Button color="primary" startContent={<FiPlus />} onPress={onCreateOpen}>
          Nouvelle Offre
        </Button>
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
              <SelectItem key="draft" value="draft">
                Brouillon
              </SelectItem>
              <SelectItem key="published" value="published">
                Publié
              </SelectItem>
              <SelectItem key="closed" value="closed">
                Fermé
              </SelectItem>
              <SelectItem key="cancelled" value="cancelled">
                Annulé
              </SelectItem>
              <SelectItem key="filled" value="filled">
                Pourvu
              </SelectItem>
            </Select>
            <Select
              label="Direction"
              placeholder="Toutes"
              onChange={(e) => setFilters({ ...filters, direction_id: e.target.value })}
            >
              {directions?.map((dir) => (
                <SelectItem key={dir.id} value={dir.id}>
                  {dir.name}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Type de Contrat"
              placeholder="Tous"
              onChange={(e) => setFilters({ ...filters, contract_type: e.target.value })}
            >
              <SelectItem key="permanent" value="permanent">CDI</SelectItem>
              <SelectItem key="fixed_term" value="fixed_term">CDD</SelectItem>
              <SelectItem key="temporary" value="temporary">Temporaire</SelectItem>
              <SelectItem key="internship" value="internship">Stage</SelectItem>
              <SelectItem key="consultant" value="consultant">Consultant</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Postings Table */}
      <Card>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table aria-label="Offres d'emploi">
              <TableHeader>
                <TableColumn>TITRE</TableColumn>
                <TableColumn>DIRECTION</TableColumn>
                <TableColumn>TYPE CONTRAT</TableColumn>
                <TableColumn>LOCALISATION</TableColumn>
                <TableColumn>CANDIDATURES</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>DATE PUBLICATION</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Aucune offre d'emploi trouvée">
                {(postings || []).map((posting) => (
                  <TableRow key={posting.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{posting.title}</p>
                        <p className="text-xs text-gray-500">{posting.reference_code}</p>
                      </div>
                    </TableCell>
                    <TableCell>{posting.direction?.name || "N/A"}</TableCell>
                    <TableCell>{posting.contract_type?.toUpperCase() || "N/A"}</TableCell>
                    <TableCell>{posting.location || "N/A"}</TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {posting.applications_count || 0}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" color={getStatusColor(posting.status)} variant="flat">
                        {getStatusLabel(posting.status)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {posting.published_date
                        ? new Date(posting.published_date).toLocaleDateString("fr-FR")
                        : "N/A"}
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
                              setSelectedPosting(posting);
                              setViewMode("preview");
                              onDetailOpen();
                            }}
                          >
                            Voir l'annonce
                          </DropdownItem>
                          {posting.status !== "closed" && (
                            <DropdownItem
                              key="edit"
                              startContent={<FiEdit />}
                              onPress={() => {
                                setSelectedPosting(posting);
                                setViewMode("edit");
                                onDetailOpen();
                              }}
                            >
                              Modifier
                            </DropdownItem>
                          )}
                          {posting.status === "draft" && (
                            <DropdownItem
                              key="publish"
                              startContent={<FiSend />}
                              onPress={() => onPublishPosting(posting.id)}
                            >
                              Publier
                            </DropdownItem>
                          )}
                          {posting.status === "published" && (
                            <>
                              <DropdownItem
                                key="copy-link"
                                startContent={<FiCopy />}
                                onPress={() => copyJobLink(posting.id)}
                              >
                                Copier le lien
                              </DropdownItem>
                              <DropdownItem
                                key="view-public"
                                startContent={<FiExternalLink />}
                                onPress={() =>
                                  window.open(`/careers/jobs/${posting.id}`, "_blank")
                                }
                              >
                                Voir la page publique
                              </DropdownItem>
                              <DropdownItem
                                key="close"
                                startContent={<FiXCircle />}
                                className="text-danger"
                                color="danger"
                                onPress={() => onClosePosting(posting.id)}
                              >
                                Fermer l'offre
                              </DropdownItem>
                            </>
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

      {/* Create Posting Modal */}
      <Modal className="bg-white" isOpen={isCreateOpen} onClose={onCreateClose} size="5xl" scrollBehavior="outside">
        <ModalContent className="bg-white">
          <form onSubmit={handleCreateSubmit(onCreatePosting)}>
            <ModalHeader>Nouvelle Offre d'Emploi</ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="recruitment_plan_position_id"
                    control={createControl}
                    render={({ field }) => (
                      <Select {...field} label="Position du Plan (Optionnel)" placeholder="Sélectionnez">
                        {plans?.flatMap((plan) =>
                          (plan.positions || []).map((pos) => (
                            <SelectItem key={pos.id} value={pos.id}>
                              {plan.year} - {pos.job_position?.title} ({pos.quantity_needed})
                            </SelectItem>
                          ))
                        )}
                      </Select>
                    )}
                  />
                  <Controller
                    name="reference_code"
                    control={createControl}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Code de référence"
                        placeholder="AUTO"
                        description="Laissez vide pour génération automatique"
                      />
                    )}
                  />
                </div>

                <Controller
                  name="title"
                  control={createControl}
                  rules={{ required: "Le titre est requis" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Titre du Poste"
                      placeholder="Ex: Développeur Full Stack Senior"
                      isInvalid={!!createErrors.title}
                      errorMessage={createErrors.title?.message}
                    />
                  )}
                />

                <div className="grid grid-cols-4 gap-4">
                  <Controller
                    name="job_position_id"
                    control={createControl}
                    rules={{ required: "Le poste est requis" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Poste"
                        placeholder="Sélectionnez"
                        isInvalid={!!createErrors.job_position_id}
                        errorMessage={createErrors.job_position_id?.message}
                      >
                        {jobPositions?.map((pos) => (
                          <SelectItem key={pos.id} value={pos.id}>
                            {pos.title}
                          </SelectItem>
                        ))}
                      </Select>
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
                        placeholder="Sélectionnez"
                        isInvalid={!!createErrors.direction_id}
                        errorMessage={createErrors.direction_id?.message}
                      >
                        {directions?.map((dir) => (
                          <SelectItem key={dir.id} value={dir.id}>
                            {dir.name}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                  <Controller
                    name="service_id"
                    control={createControl}
                    render={({ field }) => (
                      <Select {...field} label="Service (Optionnel)" placeholder="Sélectionnez">
                        {services?.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                  <Controller
                    name="grade_id"
                    control={createControl}
                    render={({ field }) => (
                      <Select {...field} label="Grade (Optionnel)" placeholder="Sélectionnez">
                        {grades?.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id}>
                            {grade.name}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Controller
                    name="contract_type"
                    control={createControl}
                    rules={{ required: "Le type de contrat est requis" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Type de Contrat"
                        placeholder="Sélectionnez"
                        isInvalid={!!createErrors.contract_type}
                        errorMessage={createErrors.contract_type?.message}
                      >
                        <SelectItem key="permanent" value="permanent">CDI</SelectItem>
                        <SelectItem key="fixed_term" value="fixed_term">CDD</SelectItem>
                        <SelectItem key="temporary" value="temporary">Temporaire</SelectItem>
                        <SelectItem key="internship" value="internship">Stage</SelectItem>
                        <SelectItem key="consultant" value="consultant">Consultant</SelectItem>
                      </Select>
                    )}
                  />
                  <Controller
                    name="employment_type"
                    control={createControl}
                    rules={{ required: "Le type d'emploi est requis" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Type d'Emploi"
                        placeholder="Sélectionnez"
                        isInvalid={!!createErrors.employment_type}
                        errorMessage={createErrors.employment_type?.message}
                      >
                        <SelectItem key="full_time" value="full_time">Temps Plein</SelectItem>
                        <SelectItem key="part_time" value="part_time">Temps Partiel</SelectItem>
                        <SelectItem key="contract" value="contract">Contrat</SelectItem>
                      </Select>
                    )}
                  />
                  <Controller
                    name="location"
                    control={createControl}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Localisation"
                        placeholder="Ex: Kinshasa, RDC"
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="salary_range_min"
                    control={createControl}
                    render={({ field }) => (
                      <Input {...field} type="number" label="Salaire Min (CFD)" placeholder="0" />
                    )}
                  />
                  <Controller
                    name="salary_range_max"
                    control={createControl}
                    render={({ field }) => (
                      <Input {...field} type="number" label="Salaire Max (CFD)" placeholder="0" />
                    )}
                  />
                </div>

                <Controller
                  name="description"
                  control={createControl}
                  rules={{ required: "La description est requise" }}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Description du Poste"
                      placeholder="Décrivez le poste..."
                      rows={4}
                      isInvalid={!!createErrors.description}
                      errorMessage={createErrors.description?.message}
                    />
                  )}
                />

                <Controller
                  name="responsibilities"
                  control={createControl}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Responsabilités"
                      placeholder="Liste des responsabilités..."
                      rows={4}
                    />
                  )}
                />

                <Controller
                  name="requirements"
                  control={createControl}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Exigences"
                      placeholder="Formation, expérience requises..."
                      rows={4}
                    />
                  )}
                />

                <Controller
                  name="qualifications"
                  control={createControl}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Qualifications"
                      placeholder="Diplômes, certifications..."
                      rows={3}
                    />
                  )}
                />

                <Controller
                  name="benefits"
                  control={createControl}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Avantages"
                      placeholder="Assurance santé, bonus, formation..."
                      rows={3}
                    />
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="application_deadline"
                    control={createControl}
                    rules={{ required: "La date limite est requise" }}
                    render={({ field }) => (
                      <Input 
                        {...field} 
                        type="date" 
                        label="Date Limite de Candidature" 
                        isInvalid={!!createErrors.application_deadline}
                        errorMessage={createErrors.application_deadline?.message}
                      />
                    )}
                  />
                  <Controller
                    name="positions_available"
                    control={createControl}
                    defaultValue={1}
                    render={({ field }) => (
                      <Input {...field} type="number" label="Nombre de Postes Disponibles" placeholder="1" />
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="receiving_email"
                    control={createControl}
                    render={({ field }) => (
                      <Input 
                        {...field} 
                        type="email"
                        label="Email de Réception des Candidatures" 
                        placeholder="recrutement@sofibank.com"
                      />
                    )}
                  />
                  <div className="flex items-center gap-4 pt-6">
                    <Controller
                      name="publish_on_website"
                      control={createControl}
                      defaultValue={true}
                      render={({ field }) => (
                        <Switch {...field} isSelected={field.value}>
                          Publier sur le site web
                        </Switch>
                      )}
                    />
                    <Controller
                      name="publish_on_social_media"
                      control={createControl}
                      defaultValue={false}
                      render={({ field }) => (
                        <Switch {...field} isSelected={field.value}>
                          Publier sur les réseaux sociaux
                        </Switch>
                      )}
                    />
                  </div>
                </div>

                <Controller
                  name="auto_process_emails"
                  control={createControl}
                  defaultValue={true}
                  render={({ field }) => (
                    <Switch {...field} isSelected={field.value}>
                      Traiter automatiquement les candidatures par email
                    </Switch>
                  )}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onCreateClose}>
                Annuler
              </Button>
              <Button color="primary" type="submit" isLoading={createPostingMutation.isPending}>
                Créer
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Detail/Edit Modal */}
      {selectedPosting && (
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="5xl" scrollBehavior="inside">
          <ModalContent>
            <ModalHeader className="flex justify-between items-center">
              <Tabs
                selectedKey={viewMode}
                onSelectionChange={setViewMode}
                aria-label="View mode"
              >
                <Tab key="preview" title="Aperçu" />
                <Tab key="edit" title="Modifier" />
              </Tabs>
              {viewMode === "preview" && (
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<FiDownload />}
                  onPress={handlePrint}
                >
                  Télécharger PDF
                </Button>
              )}
            </ModalHeader>
            <ModalBody>
              {viewMode === "preview" ? (
                <div ref={printRef} className="space-y-6 p-8">
                  {/* Header for PDF */}
                  <div className="text-center border-b-2 pb-4 mb-6">
                    <h1 className="text-3xl font-bold text-primary-600 mb-2">SOFIBANK</h1>
                    <p className="text-lg font-semibold">OFFRE D'EMPLOI</p>
                  </div>

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{selectedPosting.title}</h2>
                      <p className="text-sm text-gray-600">Réf: {selectedPosting.reference_code}</p>
                    </div>
                    <Chip color={getStatusColor(selectedPosting.status)} variant="flat" className="print:hidden">
                      {getStatusLabel(selectedPosting.status)}
                    </Chip>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">Direction</p>
                      <p className="font-semibold">{selectedPosting.direction?.name || "N/A"}</p>
                    </div>
                    {selectedPosting.service && (
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Service</p>
                        <p className="font-semibold">{selectedPosting.service?.name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">Poste</p>
                      <p className="font-semibold">{selectedPosting.job_position?.title || "N/A"}</p>
                    </div>
                    {selectedPosting.grade && (
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Grade</p>
                        <p className="font-semibold">{selectedPosting.grade?.name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">Type de Contrat</p>
                      <p className="font-semibold">{selectedPosting.contract_type?.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">Type d'Emploi</p>
                      <p className="font-semibold">{selectedPosting.employment_type?.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    {selectedPosting.location && (
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Localisation</p>
                        <p className="font-semibold">{selectedPosting.location}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">Postes Disponibles</p>
                      <p className="font-semibold">{selectedPosting.positions_available || 1}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">Date Limite</p>
                      <p className="font-semibold">
                        {selectedPosting.application_deadline
                          ? new Date(selectedPosting.application_deadline).toLocaleDateString("fr-FR")
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {(selectedPosting.salary_range_min || selectedPosting.salary_range_max) && (
                    <div className="p-4 bg-primary-50 rounded-lg">
                      <p className="text-sm text-gray-600 font-semibold mb-1">Rémunération</p>
                      <p className="text-lg font-bold text-primary-700">
                        {selectedPosting.salary_range_min
                          ? `${parseInt(selectedPosting.salary_range_min).toLocaleString()} CFD`
                          : ""}{" "}
                        {selectedPosting.salary_range_min && selectedPosting.salary_range_max
                          ? "à"
                          : ""}{" "}
                        {selectedPosting.salary_range_max
                          ? `${parseInt(selectedPosting.salary_range_max).toLocaleString()} CFD`
                          : ""}
                      </p>
                    </div>
                  )}

                  {selectedPosting.description && (
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-primary-600">Description du Poste</h3>
                      <p className="whitespace-pre-wrap text-justify">{selectedPosting.description}</p>
                    </div>
                  )}

                  {selectedPosting.responsibilities && (
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-primary-600">Responsabilités</h3>
                      <p className="whitespace-pre-wrap text-justify">{selectedPosting.responsibilities}</p>
                    </div>
                  )}

                  {selectedPosting.requirements && (
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-primary-600">Exigences</h3>
                      <p className="whitespace-pre-wrap text-justify">{selectedPosting.requirements}</p>
                    </div>
                  )}

                  {selectedPosting.qualifications && (
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-primary-600">Qualifications</h3>
                      <p className="whitespace-pre-wrap text-justify">{selectedPosting.qualifications}</p>
                    </div>
                  )}

                  {selectedPosting.benefits && (
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-primary-600">Avantages</h3>
                      <p className="whitespace-pre-wrap text-justify">{selectedPosting.benefits}</p>
                    </div>
                  )}

                  <div className="mt-8 p-6 border-t-2 border-primary-200">
                    <h3 className="text-lg font-bold mb-3 text-primary-600">Comment Postuler</h3>
                    <p className="mb-2">
                      Les candidats intéressés sont priés de soumettre leur dossier de candidature avant le{" "}
                      <strong>
                        {selectedPosting.application_deadline
                          ? new Date(selectedPosting.application_deadline).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : ""}
                      </strong>
                    </p>
                    {selectedPosting.receiving_email && (
                      <p className="font-semibold text-primary-700">
                        Email: {selectedPosting.receiving_email}
                      </p>
                    )}
                  </div>

                  {/* Footer for PDF */}
                  <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t">
                    <p>Document généré le {new Date().toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEditSubmit(onUpdatePosting)} className="space-y-6">
                  <Input
                    label="Titre du Poste"
                    defaultValue={selectedPosting.title}
                    onValueChange={(value) => setEditValue("title", value)}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Type de Contrat"
                      defaultSelectedKeys={[selectedPosting.contract_type]}
                      onSelectionChange={(keys) => setEditValue("contract_type", Array.from(keys)[0])}
                    >
                      <SelectItem key="permanent" value="permanent">CDI</SelectItem>
                      <SelectItem key="fixed_term" value="fixed_term">CDD</SelectItem>
                      <SelectItem key="temporary" value="temporary">Temporaire</SelectItem>
                      <SelectItem key="internship" value="internship">Stage</SelectItem>
                      <SelectItem key="consultant" value="consultant">Consultant</SelectItem>
                    </Select>

                    <Select
                      label="Type d'Emploi"
                      defaultSelectedKeys={[selectedPosting.employment_type]}
                      onSelectionChange={(keys) => setEditValue("employment_type", Array.from(keys)[0])}
                    >
                      <SelectItem key="full_time" value="full_time">Temps Plein</SelectItem>
                      <SelectItem key="part_time" value="part_time">Temps Partiel</SelectItem>
                      <SelectItem key="contract" value="contract">Contrat</SelectItem>
                    </Select>
                  </div>

                  <Input
                    label="Localisation"
                    defaultValue={selectedPosting.location}
                    onValueChange={(value) => setEditValue("location", value)}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Salaire Min (CFD)"
                      defaultValue={selectedPosting.salary_range_min}
                      onValueChange={(value) => setEditValue("salary_range_min", value)}
                    />
                    <Input
                      type="number"
                      label="Salaire Max (CFD)"
                      defaultValue={selectedPosting.salary_range_max}
                      onValueChange={(value) => setEditValue("salary_range_max", value)}
                    />
                  </div>

                  <Textarea
                    label="Description"
                    defaultValue={selectedPosting.description}
                    onValueChange={(value) => setEditValue("description", value)}
                    rows={4}
                  />

                  <Textarea
                    label="Responsabilités"
                    defaultValue={selectedPosting.responsibilities}
                    onValueChange={(value) => setEditValue("responsibilities", value)}
                    rows={4}
                  />

                  <Textarea
                    label="Exigences"
                    defaultValue={selectedPosting.requirements}
                    onValueChange={(value) => setEditValue("requirements", value)}
                    rows={4}
                  />

                  <Textarea
                    label="Qualifications"
                    defaultValue={selectedPosting.qualifications}
                    onValueChange={(value) => setEditValue("qualifications", value)}
                    rows={3}
                  />

                  <Textarea
                    label="Avantages"
                    defaultValue={selectedPosting.benefits}
                    onValueChange={(value) => setEditValue("benefits", value)}
                    rows={3}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="date"
                      label="Date Limite de Candidature"
                      defaultValue={selectedPosting.application_deadline?.split('T')[0]}
                      onValueChange={(value) => setEditValue("application_deadline", value)}
                    />
                    <Input
                      type="number"
                      label="Postes Disponibles"
                      defaultValue={selectedPosting.positions_available}
                      onValueChange={(value) => setEditValue("positions_available", value)}
                    />
                  </div>

                  <Input
                    type="email"
                    label="Email de Réception"
                    defaultValue={selectedPosting.receiving_email}
                    onValueChange={(value) => setEditValue("receiving_email", value)}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="light" onPress={() => setViewMode("preview")}>
                      Annuler
                    </Button>
                    <Button color="primary" type="submit" isLoading={updatePostingMutation.isPending}>
                      Enregistrer les Modifications
                    </Button>
                  </div>
                </form>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onPress={onDetailClose}>Fermer</Button>
              {viewMode === "preview" && selectedPosting.status === "draft" && (
                <Button
                  color="primary"
                  startContent={<FiSend />}
                  onPress={() => {
                    onPublishPosting(selectedPosting.id);
                    onDetailClose();
                  }}
                >
                  Publier
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
