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
  User,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Checkbox,
  CheckboxGroup,
  useDisclosure,
} from "@nextui-org/react";
import {
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiEye,
  FiEdit,
  FiSend,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
} from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetJobOffers,
  useCreateJobOffer,
  useUpdateJobOffer,
  useGetCandidates,
} from "@/src/hooks/useRecruitment";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";

const STATUS_COLORS = {
  draft: "default",
  sent: "danger",
  accepted: "success",
  rejected: "danger",
  expired: "warning",
  withdrawn: "default",
};

const STATUS_LABELS = {
  draft: "Brouillon",
  sent: "Envoyée",
  accepted: "Acceptée",
  rejected: "Rejetée",
  expired: "Expirée",
  withdrawn: "Retirée",
};

const BENEFITS_OPTIONS = [
  { value: "health_insurance", label: "Assurance Santé" },
  { value: "pension", label: "Pension" },
  { value: "transport", label: "Transport" },
  { value: "housing", label: "Logement" },
  { value: "meal_allowance", label: "Prime de Repas" },
  { value: "phone_allowance", label: "Prime de Téléphone" },
  { value: "education", label: "Éducation" },
  { value: "bonus", label: "Prime de Performance" },
];

export default function OffersPage() {
  const [filters, setFilters] = useState({
    status: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: offers, isLoading } = useGetJobOffers(filters);
  const { data: candidates } = useGetCandidates({});

  const createOfferMutation = useCreateJobOffer();
  const updateOfferMutation = useUpdateJobOffer();

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      candidate_id: "",
      salary_offered: "",
      benefits: [],
      start_date: "",
      response_deadline: "",
      offer_letter_url: "",
      notes: "",
    }
  });

  const selectedCandidateId = watch("candidate_id");
  const selectedCandidate = candidates?.find(c => c.id === selectedCandidateId);

  const handleOpenModal = (offer = null) => {
    if (offer) {
      setSelectedOffer(offer);
      reset({
        candidate_id: offer.candidate_id || "",
        salary_offered: offer.salary_offered || "",
        benefits: offer.benefits || [],
        start_date: offer.start_date || "",
        response_deadline: offer.response_deadline || "",
        offer_letter_url: offer.offer_letter_url || "",
        notes: offer.notes || "",
      });
    } else {
      setSelectedOffer(null);
      reset({
        candidate_id: "",
        salary_offered: "",
        benefits: [],
        start_date: "",
        response_deadline: "",
        offer_letter_url: "",
        notes: "",
      });
    }
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedOffer(null);
    reset();
    onClose();
  };

  const onSubmit = async (data) => {
    try {
      const offerData = {
        ...data,
        job_opening_id: selectedCandidate?.job_opening_id,
        status: "draft",
      };

      if (selectedOffer) {
        await updateOfferMutation.mutateAsync({
          id: selectedOffer.id,
          updates: offerData,
        });
        toast.success("Offre mise à jour avec succès");
      } else {
        await createOfferMutation.mutateAsync(offerData);
        toast.success("Offre créée avec succès");
      }
      handleCloseModal();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de l'offre");
      console.error(error);
    }
  };

  const handleSendOffer = async (offerId) => {
    if (window.confirm("Êtes-vous sûr de vouloir envoyer cette offre au candidat ?")) {
      try {
        await updateOfferMutation.mutateAsync({
          id: offerId,
          updates: {
            status: "sent",
            sent_date: new Date().toISOString(),
          },
        });
        toast.success("Offre envoyée avec succès");
      } catch (error) {
        toast.error("Erreur lors de l'envoi");
        console.error(error);
      }
    }
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      await updateOfferMutation.mutateAsync({
        id: offerId,
        updates: {
          status: "accepted",
          response_date: new Date().toISOString(),
        },
      });
      toast.success("Offre marquée comme acceptée");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      await updateOfferMutation.mutateAsync({
        id: offerId,
        updates: {
          status: "rejected",
          response_date: new Date().toISOString(),
        },
      });
      toast.success("Offre marquée comme rejetée");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
      console.error(error);
    }
  };

  const handleGenerateLetter = () => {
    toast.info("Génération de lettre d'offre - Fonctionnalité à implémenter");
  };

  const handleDelete = async (offerId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      try {
        toast.warning("Suppression d'offre - Fonctionnalité à implémenter");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
        console.error(error);
      }
    }
  };

  const filteredOffers = offers?.filter((offer) =>
    searchQuery === "" ||
    offer.candidate?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.candidate?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.candidate?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <PermissionGuard requiredPermission="recruitment_manage">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Offres d'Emploi</h1>
            <p className="text-default-500">Gérez les offres faites aux candidats</p>
          </div>
          <Button color="danger" startContent={<FiPlus />} onPress={() => handleOpenModal()}>
            Nouvelle Offre
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{filteredOffers.filter(o => o.status === "draft").length || 0}</p>
              <p className="text-sm text-default-500">Brouillons</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{filteredOffers.filter(o => o.status === "sent").length || 0}</p>
              <p className="text-sm text-default-500">Envoyées</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{filteredOffers.filter(o => o.status === "accepted").length || 0}</p>
              <p className="text-sm text-default-500">Acceptées</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{filteredOffers.filter(o => o.status === "rejected").length || 0}</p>
              <p className="text-sm text-default-500">Rejetées</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{filteredOffers.filter(o => o.status === "expired").length || 0}</p>
              <p className="text-sm text-default-500">Expirées</p>
            </CardBody>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex gap-4">
              <Input
                placeholder="Rechercher par candidat..."
                startContent={<FiSearch />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />

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

              <Button
                variant="flat"
                onPress={() => {
                  setFilters({ status: "" });
                  setSearchQuery("");
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Table */}
        <Card>
          <CardBody>
            <Table aria-label="Offres d'emploi">
              <TableHeader>
                <TableColumn>CANDIDAT</TableColumn>
                <TableColumn>POSTE</TableColumn>
                <TableColumn>SALAIRE OFFERT</TableColumn>
                <TableColumn>DATE DÉBUT</TableColumn>
                <TableColumn>DATE ENVOI</TableColumn>
                <TableColumn>DEADLINE</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                items={filteredOffers}
                isLoading={isLoading}
                loadingContent={<Spinner label="Chargement..." />}
                emptyContent="Aucune offre trouvée"
              >
                {(offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <User
                        name={`${offer.candidate?.first_name} ${offer.candidate?.last_name}`}
                        description={offer.candidate?.email}
                        avatarProps={{
                          name: `${offer.candidate?.first_name?.[0]}${offer.candidate?.last_name?.[0]}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-semibold">{offer.job_opening?.title || "-"}</p>
                        <p className="text-xs text-default-400">{offer.job_opening?.job_number}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {offer.salary_offered ? `${parseInt(offer.salary_offered).toLocaleString()} FC` : "-"}
                    </TableCell>
                    <TableCell>
                      {offer.start_date ? new Date(offer.start_date).toLocaleDateString("fr-FR") : "-"}
                    </TableCell>
                    <TableCell>
                      {offer.sent_date ? new Date(offer.sent_date).toLocaleDateString("fr-FR") : "-"}
                    </TableCell>
                    <TableCell>
                      {offer.response_deadline ? (
                        <span className={
                          new Date(offer.response_deadline) < new Date() && offer.status === "sent"
                            ? "text-danger"
                            : ""
                        }>
                          {new Date(offer.response_deadline).toLocaleDateString("fr-FR")}
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip color={STATUS_COLORS[offer.status]} variant="flat" size="sm">
                        {STATUS_LABELS[offer.status]}
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
                          >
                            Voir détails
                          </DropdownItem>
                          <DropdownItem
                            key="edit"
                            startContent={<FiEdit />}
                            onPress={() => handleOpenModal(offer)}
                          >
                            Modifier
                          </DropdownItem>
                          {offer.status === "draft" && (
                            <DropdownItem
                              key="send"
                              startContent={<FiSend />}
                              onPress={() => handleSendOffer(offer.id)}
                            >
                              Envoyer l'offre
                            </DropdownItem>
                          )}
                          {offer.status === "sent" && (
                            <>
                              <DropdownItem
                                key="accept"
                                startContent={<FiCheckCircle />}
                                onPress={() => handleAcceptOffer(offer.id)}
                                className="text-success"
                              >
                                Marquer acceptée
                              </DropdownItem>
                              <DropdownItem
                                key="reject"
                                startContent={<FiXCircle />}
                                onPress={() => handleRejectOffer(offer.id)}
                                className="text-danger"
                              >
                                Marquer rejetée
                              </DropdownItem>
                            </>
                          )}
                          <DropdownItem
                            key="generate"
                            startContent={<FiFileText />}
                            onPress={handleGenerateLetter}
                          >
                            Générer lettre
                          </DropdownItem>
                          {offer.status === "draft" && (
                            <DropdownItem
                              key="delete"
                              startContent={<FiTrash2 />}
                              onPress={() => handleDelete(offer.id)}
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
          size="4xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose) => (
              <form onSubmit={handleSubmit(onSubmit)}>
                <ModalHeader>
                  <h3 className="text-xl font-bold">
                    {selectedOffer ? "Modifier l'Offre" : "Créer une Nouvelle Offre"}
                  </h3>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
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
                        >
                          {(candidates || []).map((candidate) => (
                            <SelectItem key={candidate.id} value={candidate.id}>
                              {candidate.first_name} {candidate.last_name} - {candidate.job_opening?.title}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    {selectedCandidate && (
                      <Card className="bg-default-100">
                        <CardBody>
                          <p className="text-sm">
                            <span className="font-semibold">Poste: </span>
                            {selectedCandidate.job_opening?.title}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Email: </span>
                            {selectedCandidate.email}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Téléphone: </span>
                            {selectedCandidate.phone}
                          </p>
                        </CardBody>
                      </Card>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <Controller
                        name="salary_offered"
                        control={control}
                        rules={{ required: "Salaire requis" }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            label="Salaire offert (FC)"
                            placeholder="Ex: 2000000"
                            isRequired
                            errorMessage={errors.salary_offered?.message}
                            isInvalid={!!errors.salary_offered}
                          />
                        )}
                      />

                      <Controller
                        name="start_date"
                        control={control}
                        rules={{ required: "Date de début requise" }}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="date"
                            label="Date de début proposée"
                            isRequired
                            errorMessage={errors.start_date?.message}
                            isInvalid={!!errors.start_date}
                          />
                        )}
                      />

                      <Controller
                        name="response_deadline"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="date"
                            label="Deadline de réponse"
                          />
                        )}
                      />

                      <Controller
                        name="offer_letter_url"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            label="URL Lettre d'offre"
                            placeholder="https://..."
                            startContent={<FiFileText />}
                          />
                        )}
                      />
                    </div>

                    <Controller
                      name="benefits"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Avantages
                          </label>
                          <CheckboxGroup
                            value={field.value}
                            onChange={field.onChange}
                            classNames={{
                              base: "w-full",
                            }}
                          >
                            <div className="grid grid-cols-2 gap-2">
                              {BENEFITS_OPTIONS.map((benefit) => (
                                <Checkbox key={benefit.value} value={benefit.value}>
                                  {benefit.label}
                                </Checkbox>
                              ))}
                            </div>
                          </CheckboxGroup>
                        </div>
                      )}
                    />

                    <Controller
                      name="notes"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          label="Notes internes"
                          placeholder="Notes sur cette offre..."
                          minRows={3}
                        />
                      )}
                    />

                    <div className="bg-danger-50 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <FiFileText className="text-danger mt-1" />
                        <div>
                          <p className="text-sm font-semibold text-danger">Génération de lettre d'offre</p>
                          <p className="text-xs text-default-600 mt-1">
                            Une fois l'offre créée, vous pourrez générer automatiquement une lettre d'offre
                            personnalisée avec toutes les informations saisies.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={handleCloseModal}>
                    Annuler
                  </Button>
                  <Button
                    color="danger"
                    type="submit"
                    isLoading={createOfferMutation.isPending || updateOfferMutation.isPending}
                  >
                    {selectedOffer ? "Mettre à jour" : "Créer"}
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
