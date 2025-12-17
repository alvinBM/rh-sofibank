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
  Tabs,
  Tab,
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
} from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
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
} from "@/src/hooks/useSettings";

export default function JobPostingsPage() {
  const [filters, setFilters] = useState({});
  const [selectedPosting, setSelectedPosting] = useState(null);
  const [viewMode, setViewMode] = useState("edit"); // 'edit' or 'preview'

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

  const { data: postings, isLoading } = useGetJobPostings(filters);
  const { data: plans } = useGetRecruitmentPlans({ status: "approved" });
  const { data: jobPositions } = useGetJobPositions();
  const { data: departments } = useGetDepartments();
  const { data: directions } = useGetDirections();

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
        postingData: data,
      });
      toast.success("Offre mise à jour");
      onDetailClose();
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

  const employmentTypes = [
    { id: "full-time", name: "Temps Plein" },
    { id: "part-time", name: "Temps Partiel" },
    { id: "contract", name: "Contrat" },
    { id: "internship", name: "Stage" },
  ];

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
              <SelectItem key="on_hold" value="on_hold">
                En attente
              </SelectItem>
            </Select>
            <Select
              label="Département"
              placeholder="Tous"
              onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
            >
              {departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Type d'emploi"
              placeholder="Tous"
              onChange={(e) => setFilters({ ...filters, employment_type: e.target.value })}
            >
              {employmentTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
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
                <TableColumn>DÉPARTEMENT</TableColumn>
                <TableColumn>TYPE</TableColumn>
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
                        <p className="font-semibold">{posting.job_title}</p>
                        <p className="text-xs text-gray-500">{posting.reference_number}</p>
                      </div>
                    </TableCell>
                    <TableCell>{posting.department?.name || "N/A"}</TableCell>
                    <TableCell>{posting.employment_type || "N/A"}</TableCell>
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
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="5xl" scrollBehavior="inside">
        <ModalContent>
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
                    name="reference_number"
                    control={createControl}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Numéro de référence"
                        placeholder="AUTO"
                        description="Laissez vide pour génération automatique"
                      />
                    )}
                  />
                </div>

                <Controller
                  name="job_title"
                  control={createControl}
                  rules={{ required: "Le titre est requis" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="Titre du Poste"
                      placeholder="Ex: Développeur Full Stack Senior"
                      isInvalid={!!createErrors.job_title}
                      errorMessage={createErrors.job_title?.message}
                    />
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <Controller
                    name="department_id"
                    control={createControl}
                    rules={{ required: "Le département est requis" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Département"
                        placeholder="Sélectionnez"
                        isInvalid={!!createErrors.department_id}
                        errorMessage={createErrors.department_id?.message}
                      >
                        {departments?.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
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
                        {employmentTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                  <Controller
                    name="location"
                    control={createControl}
                    rules={{ required: "La localisation est requise" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Localisation"
                        placeholder="Ex: Douala, Cameroun"
                        isInvalid={!!createErrors.location}
                        errorMessage={createErrors.location?.message}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="salary_range_min"
                    control={createControl}
                    render={({ field }) => (
                      <Input {...field} type="number" label="Salaire Min (XAF)" placeholder="0" />
                    )}
                  />
                  <Controller
                    name="salary_range_max"
                    control={createControl}
                    render={({ field }) => (
                      <Input {...field} type="number" label="Salaire Max (XAF)" placeholder="0" />
                    )}
                  />
                </div>

                <Controller
                  name="job_description"
                  control={createControl}
                  rules={{ required: "La description est requise" }}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Description du Poste"
                      placeholder="Décrivez le poste, les responsabilités..."
                      rows={6}
                      isInvalid={!!createErrors.job_description}
                      errorMessage={createErrors.job_description?.message}
                    />
                  )}
                />

                <Controller
                  name="requirements"
                  control={createControl}
                  rules={{ required: "Les exigences sont requises" }}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Exigences"
                      placeholder="Formation, expérience, compétences requises..."
                      rows={5}
                      isInvalid={!!createErrors.requirements}
                      errorMessage={createErrors.requirements?.message}
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
                      rows={4}
                    />
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="application_deadline"
                    control={createControl}
                    render={({ field }) => (
                      <Input {...field} type="date" label="Date Limite de Candidature" />
                    )}
                  />
                  <Controller
                    name="number_of_positions"
                    control={createControl}
                    defaultValue={1}
                    render={({ field }) => (
                      <Input {...field} type="number" label="Nombre de Postes" placeholder="1" />
                    )}
                  />
                </div>
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
            <ModalHeader>
              <Tabs
                selectedKey={viewMode}
                onSelectionChange={setViewMode}
                aria-label="View mode"
              >
                <Tab key="preview" title="Aperçu" />
                <Tab key="edit" title="Modifier" />
              </Tabs>
            </ModalHeader>
            <ModalBody>
              {viewMode === "preview" ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedPosting.job_title}</h2>
                      <p className="text-sm text-gray-500">{selectedPosting.reference_number}</p>
                    </div>
                    <Chip color={getStatusColor(selectedPosting.status)} variant="flat">
                      {getStatusLabel(selectedPosting.status)}
                    </Chip>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Département</p>
                      <p className="font-semibold">{selectedPosting.department?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type d'Emploi</p>
                      <p className="font-semibold">{selectedPosting.employment_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Localisation</p>
                      <p className="font-semibold">{selectedPosting.location}</p>
                    </div>
                  </div>

                  {(selectedPosting.salary_range_min || selectedPosting.salary_range_max) && (
                    <div>
                      <p className="text-sm text-gray-500">Fourchette Salariale</p>
                      <p className="font-semibold">
                        {selectedPosting.salary_range_min
                          ? `${parseInt(selectedPosting.salary_range_min).toLocaleString()} XAF`
                          : ""}{" "}
                        {selectedPosting.salary_range_min && selectedPosting.salary_range_max
                          ? "-"
                          : ""}{" "}
                        {selectedPosting.salary_range_max
                          ? `${parseInt(selectedPosting.salary_range_max).toLocaleString()} XAF`
                          : ""}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">Description du Poste</h3>
                    <p className="whitespace-pre-wrap">{selectedPosting.job_description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Exigences</h3>
                    <p className="whitespace-pre-wrap">{selectedPosting.requirements}</p>
                  </div>

                  {selectedPosting.benefits && (
                    <div>
                      <h3 className="font-semibold mb-2">Avantages</h3>
                      <p className="whitespace-pre-wrap">{selectedPosting.benefits}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {selectedPosting.application_deadline && (
                      <div>
                        <p className="text-sm text-gray-500">Date Limite</p>
                        <p className="font-semibold">
                          {new Date(selectedPosting.application_deadline).toLocaleDateString(
                            "fr-FR"
                          )}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Nombre de Postes</p>
                      <p className="font-semibold">{selectedPosting.number_of_positions || 1}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>Mode édition à implémenter</p>
                </div>
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
