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
} from "@nextui-org/react";
import {
  FiPlus,
  FiSearch,
  FiMoreVertical,
  FiEye,
  FiCheckCircle,
  FiSend,
  FiXCircle,
  FiFileText,
  FiDownload,
} from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import {
  useGetEmploymentOffers,
  useGetEmploymentOfferById,
  useCreateEmploymentOffer,
  useUpdateEmploymentOffer,
  useApproveEmploymentOffer,
  useSendEmploymentOffer,
  useRespondToOffer,
  useGetJobApplications,
} from "@/src/hooks/useRecruitment";
import { useGetEmployees } from "@/src/hooks/useEmployees";

export default function EmploymentOffersPage() {
  const [filters, setFilters] = useState({});
  const [selectedOffer, setSelectedOffer] = useState(null);

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isApproveOpen, onOpen: onApproveOpen, onClose: onApproveClose } = useDisclosure();

  const { data: offers, isLoading } = useGetEmploymentOffers(filters);
  const { data: applications } = useGetJobApplications({ status: "interview" });
  const { data: employees } = useGetEmployees();

  const createOfferMutation = useCreateEmploymentOffer();
  const updateOfferMutation = useUpdateEmploymentOffer();
  const approveOfferMutation = useApproveEmploymentOffer();
  const sendOfferMutation = useSendEmploymentOffer();
  const respondOfferMutation = useRespondToOffer();

  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    watch: watchCreate,
    formState: { errors: createErrors },
  } = useForm();

  const {
    control: approveControl,
    handleSubmit: handleApproveSubmit,
    reset: resetApprove,
    watch: watchApprove,
  } = useForm();

  const onCreateOffer = async (data) => {
    try {
      await createOfferMutation.mutateAsync(data);
      toast.success("Offre d'emploi créée avec succès");
      resetCreate();
      onCreateClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de la création");
    }
  };

  const onApproveOffer = async (data) => {
    try {
      await approveOfferMutation.mutateAsync({
        id: selectedOffer,
        approvalData: {
          approve: data.approve,
          rejection_reason: data.rejection_reason,
        },
      });
      toast.success(data.approve ? "Offre approuvée" : "Offre rejetée");
      resetApprove();
      onApproveClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erreur lors de l'approbation");
    }
  };

  const onSendOffer = async (offerId) => {
    if (window.confirm("Êtes-vous sûr de vouloir envoyer cette offre au candidat?")) {
      try {
        await sendOfferMutation.mutateAsync(offerId);
        toast.success("Offre envoyée au candidat");
      } catch (error) {
        toast.error("Erreur lors de l'envoi");
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "default",
      pending_approval: "warning",
      approved: "primary",
      sent: "secondary",
      accepted: "success",
      rejected: "danger",
      expired: "danger",
      withdrawn: "default",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: "Brouillon",
      pending_approval: "En attente d'approbation",
      approved: "Approuvé",
      sent: "Envoyé",
      accepted: "Accepté",
      rejected: "Rejeté",
      expired: "Expiré",
      withdrawn: "Retiré",
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
            Gestion des offres d'emploi et contrats de travail
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
              <SelectItem key="draft" value="draft">Brouillon</SelectItem>
              <SelectItem key="pending_approval" value="pending_approval">
                En attente
              </SelectItem>
              <SelectItem key="approved" value="approved">Approuvé</SelectItem>
              <SelectItem key="sent" value="sent">Envoyé</SelectItem>
              <SelectItem key="accepted" value="accepted">Accepté</SelectItem>
              <SelectItem key="rejected" value="rejected">Rejeté</SelectItem>
            </Select>
            <Input
              type="date"
              label="Date de début"
              onChange={(e) => setFilters({ ...filters, start_date_from: e.target.value })}
            />
            <Input
              type="date"
              label="Date d'expiration"
              onChange={(e) => setFilters({ ...filters, offer_expiry_date: e.target.value })}
            />
          </div>
        </CardBody>
      </Card>

      {/* Offers Table */}
      <Card>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table aria-label="Offres d'emploi">
              <TableHeader>
                <TableColumn>CANDIDAT</TableColumn>
                <TableColumn>POSTE</TableColumn>
                <TableColumn>SALAIRE</TableColumn>
                <TableColumn>DATE DÉBUT</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>DATE EXPIRATION</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Aucune offre d'emploi trouvée">
                {(offers || []).map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <User
                        name={`${offer.application?.first_name} ${offer.application?.last_name}`}
                        description={offer.application?.email}
                        avatarProps={{
                          src: offer.application?.profile_picture,
                          name: offer.application?.first_name?.[0],
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{offer.job_title}</p>
                        <p className="text-xs text-gray-500">{offer.department?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">
                        {parseInt(offer.offered_salary).toLocaleString()} XAF
                      </p>
                    </TableCell>
                    <TableCell>
                      {new Date(offer.start_date).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" color={getStatusColor(offer.status)} variant="flat">
                        {getStatusLabel(offer.status)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {offer.offer_expiry_date ? (
                        <span
                          className={
                            new Date(offer.offer_expiry_date) < new Date()
                              ? "text-danger"
                              : ""
                          }
                        >
                          {new Date(offer.offer_expiry_date).toLocaleDateString("fr-FR")}
                        </span>
                      ) : (
                        "N/A"
                      )}
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
                              setSelectedOffer(offer);
                              onDetailOpen();
                            }}
                          >
                            Voir les détails
                          </DropdownItem>
                          {offer.status === "pending_approval" && (
                            <DropdownItem
                              key="approve"
                              startContent={<FiCheckCircle />}
                              onPress={() => {
                                setSelectedOffer(offer.id);
                                onApproveOpen();
                              }}
                            >
                              Approuver/Rejeter
                            </DropdownItem>
                          )}
                          {offer.status === "approved" && (
                            <DropdownItem
                              key="send"
                              startContent={<FiSend />}
                              onPress={() => onSendOffer(offer.id)}
                            >
                              Envoyer au candidat
                            </DropdownItem>
                          )}
                          {offer.offer_letter_url && (
                            <DropdownItem
                              key="download"
                              startContent={<FiDownload />}
                              onPress={() => window.open(offer.offer_letter_url, "_blank")}
                            >
                              Télécharger la lettre
                            </DropdownItem>
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

      {/* Create Offer Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="5xl" scrollBehavior="inside">
        <ModalContent>
          <form onSubmit={handleCreateSubmit(onCreateOffer)}>
            <ModalHeader>Nouvelle Offre d'Emploi</ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Candidate Selection */}
                <Controller
                  name="application_id"
                  control={createControl}
                  rules={{ required: "Le candidat est requis" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Candidat"
                      placeholder="Sélectionnez un candidat"
                      isInvalid={!!createErrors.application_id}
                      errorMessage={createErrors.application_id?.message}
                    >
                      {applications?.map((app) => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.first_name} {app.last_name} - {app.job_posting?.job_title}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <Divider />

                {/* Job Details */}
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="job_title"
                    control={createControl}
                    rules={{ required: "Le titre du poste est requis" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Titre du Poste"
                        placeholder="Ex: Développeur Senior"
                        isInvalid={!!createErrors.job_title}
                        errorMessage={createErrors.job_title?.message}
                      />
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
                        <SelectItem key="full-time" value="full-time">
                          Temps Plein
                        </SelectItem>
                        <SelectItem key="part-time" value="part-time">
                          Temps Partiel
                        </SelectItem>
                        <SelectItem key="contract" value="contract">
                          Contrat
                        </SelectItem>
                        <SelectItem key="internship" value="internship">
                          Stage
                        </SelectItem>
                      </Select>
                    )}
                  />
                </div>

                {/* Compensation */}
                <div className="grid grid-cols-3 gap-4">
                  <Controller
                    name="offered_salary"
                    control={createControl}
                    rules={{ required: "Le salaire est requis" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="Salaire Offert (XAF)"
                        placeholder="0"
                        isInvalid={!!createErrors.offered_salary}
                        errorMessage={createErrors.offered_salary?.message}
                      />
                    )}
                  />
                  <Controller
                    name="bonus"
                    control={createControl}
                    render={({ field }) => (
                      <Input {...field} type="number" label="Bonus (XAF)" placeholder="0" />
                    )}
                  />
                  <Controller
                    name="benefits"
                    control={createControl}
                    render={({ field }) => (
                      <Input {...field} label="Avantages" placeholder="Ex: Assurance santé" />
                    )}
                  />
                </div>

                {/* Dates */}
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
                    name="offer_expiry_date"
                    control={createControl}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="date"
                        label="Date d'Expiration de l'Offre"
                        description="Date limite de réponse du candidat"
                      />
                    )}
                  />
                </div>

                {/* Work Schedule */}
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="work_schedule"
                    control={createControl}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Horaires de Travail"
                        placeholder="Ex: 8h-17h, Lun-Ven"
                      />
                    )}
                  />
                  <Controller
                    name="probation_period_months"
                    control={createControl}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="Période d'Essai (mois)"
                        placeholder="3"
                      />
                    )}
                  />
                </div>

                {/* Additional Terms */}
                <Controller
                  name="terms_and_conditions"
                  control={createControl}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Conditions Générales"
                      placeholder="Détaillez les termes et conditions du contrat..."
                      rows={6}
                    />
                  )}
                />

                <Controller
                  name="additional_notes"
                  control={createControl}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      label="Notes Additionnelles"
                      placeholder="Informations complémentaires..."
                      rows={4}
                    />
                  )}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onCreateClose}>
                Annuler
              </Button>
              <Button color="primary" type="submit" isLoading={createOfferMutation.isPending}>
                Créer l'Offre
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Approve/Reject Offer Modal */}
      <Modal isOpen={isApproveOpen} onClose={onApproveClose}>
        <ModalContent>
          <form onSubmit={handleApproveSubmit(onApproveOffer)}>
            <ModalHeader>Approuver / Rejeter l'Offre</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Controller
                  name="approve"
                  control={approveControl}
                  defaultValue={true}
                  render={({ field }) => (
                    <Select {...field} label="Décision" placeholder="Sélectionnez">
                      <SelectItem key={true} value={true}>
                        Approuver
                      </SelectItem>
                      <SelectItem key={false} value={false}>
                        Rejeter
                      </SelectItem>
                    </Select>
                  )}
                />
                {watchApprove("approve") === false && (
                  <Controller
                    name="rejection_reason"
                    control={approveControl}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        label="Raison du Rejet"
                        placeholder="Expliquez pourquoi vous rejetez cette offre..."
                        rows={4}
                      />
                    )}
                  />
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onApproveClose}>
                Annuler
              </Button>
              <Button
                color={watchApprove("approve") === false ? "danger" : "success"}
                type="submit"
                isLoading={approveOfferMutation.isPending}
              >
                Confirmer
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Offer Details Modal */}
      {selectedOffer && (
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="4xl" scrollBehavior="inside">
          <ModalContent>
            <ModalHeader>Détails de l'Offre d'Emploi</ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Candidate Info */}
                <div>
                  <h4 className="font-semibold mb-3">Candidat</h4>
                  <User
                    name={`${selectedOffer.application?.first_name} ${selectedOffer.application?.last_name}`}
                    description={selectedOffer.application?.email}
                    avatarProps={{
                      src: selectedOffer.application?.profile_picture,
                      name: selectedOffer.application?.first_name?.[0],
                      size: "lg",
                    }}
                  />
                </div>

                <Divider />

                {/* Job Details */}
                <div>
                  <h4 className="font-semibold mb-3">Détails du Poste</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Titre</p>
                      <p className="font-semibold">{selectedOffer.job_title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type d'Emploi</p>
                      <p className="font-semibold">{selectedOffer.employment_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Département</p>
                      <p className="font-semibold">{selectedOffer.department?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Statut</p>
                      <Chip color={getStatusColor(selectedOffer.status)} variant="flat">
                        {getStatusLabel(selectedOffer.status)}
                      </Chip>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Compensation */}
                <div>
                  <h4 className="font-semibold mb-3">Rémunération</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Salaire</p>
                      <p className="font-semibold text-lg">
                        {parseInt(selectedOffer.offered_salary).toLocaleString()} XAF
                      </p>
                    </div>
                    {selectedOffer.bonus && (
                      <div>
                        <p className="text-sm text-gray-500">Bonus</p>
                        <p className="font-semibold">
                          {parseInt(selectedOffer.bonus).toLocaleString()} XAF
                        </p>
                      </div>
                    )}
                    {selectedOffer.benefits && (
                      <div>
                        <p className="text-sm text-gray-500">Avantages</p>
                        <p className="font-semibold">{selectedOffer.benefits}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Divider />

                {/* Dates & Schedule */}
                <div>
                  <h4 className="font-semibold mb-3">Dates & Horaires</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date de Début</p>
                      <p className="font-semibold">
                        {new Date(selectedOffer.start_date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    {selectedOffer.offer_expiry_date && (
                      <div>
                        <p className="text-sm text-gray-500">Date d'Expiration</p>
                        <p className="font-semibold">
                          {new Date(selectedOffer.offer_expiry_date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    )}
                    {selectedOffer.work_schedule && (
                      <div>
                        <p className="text-sm text-gray-500">Horaires</p>
                        <p className="font-semibold">{selectedOffer.work_schedule}</p>
                      </div>
                    )}
                    {selectedOffer.probation_period_months && (
                      <div>
                        <p className="text-sm text-gray-500">Période d'Essai</p>
                        <p className="font-semibold">
                          {selectedOffer.probation_period_months} mois
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms & Conditions */}
                {selectedOffer.terms_and_conditions && (
                  <>
                    <Divider />
                    <div>
                      <h4 className="font-semibold mb-3">Conditions Générales</h4>
                      <p className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                        {selectedOffer.terms_and_conditions}
                      </p>
                    </div>
                  </>
                )}

                {/* Additional Notes */}
                {selectedOffer.additional_notes && (
                  <>
                    <Divider />
                    <div>
                      <h4 className="font-semibold mb-3">Notes Additionnelles</h4>
                      <p className="text-sm whitespace-pre-wrap bg-blue-50 p-4 rounded-lg">
                        {selectedOffer.additional_notes}
                      </p>
                    </div>
                  </>
                )}

                {/* Approval Info */}
                {selectedOffer.approved_by && (
                  <>
                    <Divider />
                    <div>
                      <h4 className="font-semibold mb-3">Informations d'Approbation</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Approuvé par</p>
                          <p className="font-semibold">{selectedOffer.approved_by.username}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date d'Approbation</p>
                          <p className="font-semibold">
                            {new Date(selectedOffer.approved_date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Rejection Reason */}
                {selectedOffer.rejection_reason && (
                  <>
                    <Divider />
                    <div className="p-4 bg-danger-50 rounded-lg">
                      <p className="text-sm text-danger-600 font-semibold mb-2">
                        Raison du Rejet:
                      </p>
                      <p className="text-sm">{selectedOffer.rejection_reason}</p>
                    </div>
                  </>
                )}

                {/* Candidate Response */}
                {selectedOffer.candidate_response_date && (
                  <>
                    <Divider />
                    <div>
                      <h4 className="font-semibold mb-3">Réponse du Candidat</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Date de Réponse</p>
                          <p className="font-semibold">
                            {new Date(selectedOffer.candidate_response_date).toLocaleDateString(
                              "fr-FR"
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Statut</p>
                          <Chip color={getStatusColor(selectedOffer.status)} variant="flat">
                            {getStatusLabel(selectedOffer.status)}
                          </Chip>
                        </div>
                      </div>
                      {selectedOffer.candidate_response_notes && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-500">Notes du Candidat</p>
                          <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">
                            {selectedOffer.candidate_response_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onPress={onDetailClose}>Fermer</Button>
              {selectedOffer.status === "approved" && (
                <Button
                  color="primary"
                  startContent={<FiSend />}
                  onPress={() => {
                    onSendOffer(selectedOffer.id);
                    onDetailClose();
                  }}
                >
                  Envoyer au Candidat
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
