"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  Badge,
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
  FiShare2,
  FiUsers,
  FiTrash2,
  FiLock,
  FiCheckCircle
} from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetJobOpenings,
  useCreateJobOpening,
  useUpdateJobOpening,
  useDeleteJobOpening,
  usePublishJobOpening
} from "@/src/hooks/useRecruitment";
import { useGetDirections, useGetServices, useGetGrades, useGetJobPositions } from "@/src/hooks/useMain";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";

const STATUS_COLORS = {
  draft: "default",
  open: "success",
  closed: "warning",
  filled: "primary",
  cancelled: "danger",
};

const STATUS_LABELS = {
  draft: "Brouillon",
  open: "Ouvert",
  closed: "Fermé",
  filled: "Pourvu",
  cancelled: "Annulé",
};

const EMPLOYMENT_TYPES = [
  { value: "permanent", label: "CDI - Permanent" },
  { value: "temporary", label: "CDD - Temporaire" },
  { value: "intern", label: "Stage" },
  { value: "consultant", label: "Consultant" },
  { value: "contract", label: "Contrat" },
];

export default function JobOpeningsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    status: "",
    direction_id: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: jobOpenings, isLoading } = useGetJobOpenings(filters);
  const { data: directionsData } = useGetDirections({ page: 1, rowsPerPage: 100 });
  const { data: servicesData } = useGetServices({ page: 1, rowsPerPage: 100 });
  const { data: gradesData } = useGetGrades({ page: 1, rowsPerPage: 100 });
  const { data: jobPositionsData } = useGetJobPositions({ page: 1, rowsPerPage: 100 });

  const createJobMutation = useCreateJobOpening();
  const updateJobMutation = useUpdateJobOpening();
  const deleteJobMutation = useDeleteJobOpening();
  const publishJobMutation = usePublishJobOpening();

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      title: "",
      job_position_id: "",
      direction_id: "",
      service_id: "",
      grade_id: "",
      description: "",
      requirements: "",
      responsibilities: "",
      number_of_positions: 1,
      employment_type: "",
      location: "",
      closing_date: "",
    }
  });

  const selectedDirection = watch("direction_id");
  const filteredServices = servicesData?.services?.filter(
    (service) => service.direction_id === selectedDirection
  ) || [];

  const handleOpenModal = (job = null) => {
    if (job) {
      setSelectedJob(job);
      reset({
        title: job.title || "",
        job_position_id: job.job_position_id || "",
        direction_id: job.direction_id || "",
        service_id: job.service_id || "",
        grade_id: job.grade_id || "",
        description: job.description || "",
        requirements: job.requirements || "",
        responsibilities: job.responsibilities || "",
        number_of_positions: job.number_of_positions || 1,
        employment_type: job.employment_type || "",
        location: job.location || "",
        closing_date: job.closing_date || "",
      });
    } else {
      setSelectedJob(null);
      reset({
        title: "",
        job_position_id: "",
        direction_id: "",
        service_id: "",
        grade_id: "",
        description: "",
        requirements: "",
        responsibilities: "",
        number_of_positions: 1,
        employment_type: "",
        location: "",
        closing_date: "",
      });
    }
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
    reset();
    onClose();
  };

  const onSubmit = async (data) => {
    try {
      if (selectedJob) {
        await updateJobMutation.mutateAsync({
          id: selectedJob.id,
          updates: data,
        });
        toast.success("Poste mis à jour avec succès");
      } else {
        await createJobMutation.mutateAsync({
          ...data,
          status: "draft",
          is_published: false,
        });
        toast.success("Poste créé avec succès");
      }
      handleCloseModal();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du poste");
      console.error(error);
    }
  };

  const handlePublish = async (jobId) => {
    try {
      await publishJobMutation.mutateAsync(jobId);
      toast.success("Poste publié avec succès");
    } catch (error) {
      toast.error("Erreur lors de la publication");
      console.error(error);
    }
  };

  const handleClose = async (jobId) => {
    try {
      await updateJobMutation.mutateAsync({
        id: jobId,
        updates: { status: "closed" },
      });
      toast.success("Poste fermé avec succès");
    } catch (error) {
      toast.error("Erreur lors de la fermeture");
      console.error(error);
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce poste ?")) {
      try {
        await deleteJobMutation.mutateAsync(jobId);
        toast.success("Poste supprimé avec succès");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
        console.error(error);
      }
    }
  };

  const filteredJobs = jobOpenings?.filter((job) =>
    searchQuery === "" ||
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.job_number?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <PermissionGuard requiredPermission="recruitment_manage">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Postes Vacants</h1>
            <p className="text-default-500">Gérez vos offres d'emploi et candidatures</p>
          </div>
          <Button color="primary" startContent={<FiPlus />} onPress={() => handleOpenModal()}>
            Nouveau Poste
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{filteredJobs.filter(j => j.status === "open").length || 0}</p>
              <p className="text-sm text-default-500">Postes Ouverts</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{filteredJobs.filter(j => j.status === "draft").length || 0}</p>
              <p className="text-sm text-default-500">Brouillons</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">
                {filteredJobs.reduce((acc, j) => acc + (j.candidates?.[0]?.count || 0), 0) || 0}
              </p>
              <p className="text-sm text-default-500">Candidatures Reçues</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{filteredJobs.filter(j => j.status === "filled").length || 0}</p>
              <p className="text-sm text-default-500">Postes Pourvus</p>
            </CardBody>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex gap-4">
              <Input
                placeholder="Rechercher par titre..."
                startContent={<FiSearch />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />

              <Select
                label="Direction"
                placeholder="Toutes les directions"
                selectedKeys={filters.direction_id ? [filters.direction_id] : []}
                onChange={(e) => setFilters({ ...filters, direction_id: e.target.value })}
                className="w-64"
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
            </div>
          </CardBody>
        </Card>

        {/* Table */}
        <Card>
          <CardBody>
            <Table aria-label="Postes vacants">
              <TableHeader>
                <TableColumn>TITRE</TableColumn>
                <TableColumn>DIRECTION</TableColumn>
                <TableColumn>GRADE</TableColumn>
                <TableColumn>POSTES</TableColumn>
                <TableColumn>DATE LIMITE</TableColumn>
                <TableColumn>CANDIDATURES</TableColumn>
                <TableColumn>PUBLIÉ</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                items={filteredJobs}
                isLoading={isLoading}
                loadingContent={<Spinner label="Chargement..." />}
                emptyContent="Aucun poste trouvé"
              >
                {(job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{job.title}</p>
                        <p className="text-xs text-default-400">{job.job_number}</p>
                      </div>
                    </TableCell>
                    <TableCell>{job.direction?.name || "-"}</TableCell>
                    <TableCell>{job.grade?.name || "-"}</TableCell>
                    <TableCell>{job.number_of_positions || 1}</TableCell>
                    <TableCell>
                      {job.closing_date ? new Date(job.closing_date).toLocaleDateString("fr-FR") : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge content={job.candidates?.[0]?.count || 0} color="primary">
                        <FiUsers className="text-default-400" />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {job.is_published ? (
                        <Chip size="sm" color="success" variant="flat">Oui</Chip>
                      ) : (
                        <Chip size="sm" color="default" variant="flat">Non</Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip color={STATUS_COLORS[job.status]} variant="flat" size="sm">
                        {STATUS_LABELS[job.status]}
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
                            onPress={() => router.push(`/dashboard/recruitment/job-openings/${job.id}`)}
                          >
                            Voir détails
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<FiEdit />}
                            onPress={() => handleOpenModal(job)}
                          >
                            Modifier
                          </DropdownItem>
                          {!job.is_published && job.status === "draft" && (
                            <DropdownItem
                              key="publish"
                              startContent={<FiShare2 />}
                              onPress={() => handlePublish(job.id)}
                            >
                              Publier
                            </DropdownItem>
                          )}
                          {job.status === "open" && (
                            <DropdownItem
                              key="close"
                              startContent={<FiLock />}
                              onPress={() => handleClose(job.id)}
                            >
                              Clôturer
                            </DropdownItem>
                          )}
                          <DropdownItem
                            key="candidates"
                            startContent={<FiUsers />}
                            onPress={() => router.push(`/dashboard/recruitment/candidates?job=${job.id}`)}
                          >
                            Voir candidatures
                          </DropdownItem>
                          {job.status === "draft" && (
                            <DropdownItem
                              key="delete"
                              startContent={<FiTrash2 />}
                              onPress={() => handleDelete(job.id)}
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

        {/* Modal CRUD */}
        <Modal
          isOpen={isOpen}
          onClose={handleCloseModal}
          size="5xl"
          scrollBehavior="inside"
          classNames={{
            base: "max-h-[90vh]",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <form onSubmit={handleSubmit(onSubmit)}>
                <ModalHeader>
                  <h3 className="text-xl font-bold">
                    {selectedJob ? "Modifier le Poste" : "Créer un Nouveau Poste"}
                  </h3>
                </ModalHeader>
                <ModalBody>
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="title"
                      control={control}
                      rules={{ required: "Titre requis" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Titre du poste"
                          placeholder="Ex: Analyste Financier Senior"
                          isRequired
                          errorMessage={errors.title?.message}
                          isInvalid={!!errors.title}
                          className="col-span-2"
                        />
                      )}
                    />

                    <Controller
                      name="job_position_id"
                      control={control}
                      rules={{ required: "Position requise" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Position"
                          placeholder="Sélectionnez la position"
                          isRequired
                          errorMessage={errors.job_position_id?.message}
                          isInvalid={!!errors.job_position_id}
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
                      control={control}
                      rules={{ required: "Grade requis" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Grade"
                          placeholder="Sélectionnez le grade"
                          isRequired
                          errorMessage={errors.grade_id?.message}
                          isInvalid={!!errors.grade_id}
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

                    <Controller
                      name="service_id"
                      control={control}
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
                      name="employment_type"
                      control={control}
                      rules={{ required: "Type d'emploi requis" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Type d'emploi"
                          placeholder="Sélectionnez le type"
                          isRequired
                          errorMessage={errors.employment_type?.message}
                          isInvalid={!!errors.employment_type}
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          {EMPLOYMENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="number_of_positions"
                      control={control}
                      rules={{ required: "Nombre de postes requis", min: 1 }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          label="Nombre de postes"
                          placeholder="1"
                          isRequired
                          errorMessage={errors.number_of_positions?.message}
                          isInvalid={!!errors.number_of_positions}
                        />
                      )}
                    />

                    <Controller
                      name="location"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Lieu de travail"
                          placeholder="Ex: Kinshasa, Siège"
                        />
                      )}
                    />

                    <Controller
                      name="closing_date"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="date"
                          label="Date de clôture"
                        />
                      )}
                    />

                    <Controller
                      name="description"
                      control={control}
                      rules={{ required: "Description requise" }}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="Description complète"
                          placeholder="Décrivez le poste en détail..."
                          isRequired
                          errorMessage={errors.description?.message}
                          isInvalid={!!errors.description}
                          minRows={4}
                          className="col-span-2"
                        />
                      )}
                    />

                    <Controller
                      name="requirements"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="Exigences"
                          placeholder="Listez les exigences et qualifications requises..."
                          minRows={4}
                          className="col-span-2"
                        />
                      )}
                    />

                    <Controller
                      name="responsibilities"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="Responsabilités"
                          placeholder="Listez les principales responsabilités du poste..."
                          minRows={4}
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
                    color="primary"
                    type="submit"
                    isLoading={createJobMutation.isPending || updateJobMutation.isPending}
                  >
                    {selectedJob ? "Mettre à jour" : "Créer"}
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
