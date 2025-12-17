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
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import { FiPlus, FiFileText, FiClock } from "react-icons/fi";
import { useGetMyRequests, useCreateEmployeeRequest, useGetRequestTypes } from "@/src/hooks/useESS";
import { useGetMyProfile } from "@/src/hooks/useESS";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";

const STATUS_COLORS = {
  draft: "default",
  submitted: "danger",
  in_review: "warning",
  approved: "success",
  rejected: "danger",
  cancelled: "default",
};

const STATUS_LABELS = {
  draft: "Brouillon",
  submitted: "Soumise",
  in_review: "En Révision",
  approved: "Approuvée",
  rejected: "Rejetée",
  cancelled: "Annulée",
};

const PRIORITY_COLORS = {
  low: "default",
  medium: "danger",
  high: "warning",
  urgent: "danger",
};

const PRIORITY_LABELS = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
  urgent: "Urgente",
};

export default function MyRequestsPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: requests, isLoading } = useGetMyRequests();
  const { data: requestTypes } = useGetRequestTypes();
  const { data: profile } = useGetMyProfile();
  const createRequest = useCreateEmployeeRequest();

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      request_type_id: "",
      subject: "",
      description: "",
      priority: "medium",
    }
  });

  const onSubmit = async (data) => {
    try {
      const requestNumber = `REQ${Date.now()}`;
      await createRequest.mutateAsync({
        ...data,
        employee_id: profile.id,
        request_number: requestNumber,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      });
      toast.success("Demande créée avec succès");
      reset();
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la création de la demande");
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mes Demandes RH</h1>
          <p className="text-default-500">Créez et suivez vos demandes administratives</p>
        </div>
        <Button color="danger" startContent={<FiPlus />} onPress={onOpen}>
          Nouvelle Demande
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold">{requests?.filter(r => r.status === "submitted").length || 0}</p>
            <p className="text-sm text-default-500">En Attente</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold">{requests?.filter(r => r.status === "in_review").length || 0}</p>
            <p className="text-sm text-default-500">En Révision</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold">{requests?.filter(r => r.status === "approved").length || 0}</p>
            <p className="text-sm text-default-500">Approuvées</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-2xl font-bold">{requests?.filter(r => r.status === "rejected").length || 0}</p>
            <p className="text-sm text-default-500">Rejetées</p>
          </CardBody>
        </Card>
      </div>

      {/* Requests List */}
      <Card>
        <CardBody>
          <Table aria-label="Mes demandes">
            <TableHeader>
              <TableColumn>NUMÉRO</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>SUJET</TableColumn>
              <TableColumn>PRIORITÉ</TableColumn>
              <TableColumn>DATE SOUMISSION</TableColumn>
              <TableColumn>STATUT</TableColumn>
            </TableHeader>
            <TableBody
              items={requests || []}
              isLoading={isLoading}
              loadingContent={<Spinner label="Chargement..." />}
              emptyContent="Aucune demande"
            >
              {(request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FiFileText className="text-default-400" />
                      <span className="font-mono text-sm">{request.request_number}</span>
                    </div>
                  </TableCell>
                  <TableCell>{request.request_type?.name || "-"}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold">{request.subject}</p>
                      <p className="text-xs text-default-400 line-clamp-1">{request.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={PRIORITY_COLORS[request.priority]}
                      variant="flat"
                      size="sm"
                    >
                      {PRIORITY_LABELS[request.priority]}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FiClock className="text-default-400 text-sm" />
                      <span className="text-sm">
                        {request.submitted_at
                          ? new Date(request.submitted_at).toLocaleDateString("fr-FR")
                          : "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={STATUS_COLORS[request.status]}
                      variant="flat"
                      size="sm"
                    >
                      {STATUS_LABELS[request.status]}
                    </Chip>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Create Request Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader>
                <h3 className="text-xl font-bold">Nouvelle Demande RH</h3>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Controller
                    name="request_type_id"
                    control={control}
                    rules={{ required: "Type de demande requis" }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Type de Demande"
                        placeholder="Sélectionnez le type"
                        isRequired
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        errorMessage={errors.request_type_id?.message}
                        isInvalid={!!errors.request_type_id}
                      >
                        {(requestTypes || []).map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />

                  <Controller
                    name="subject"
                    control={control}
                    rules={{ required: "Sujet requis" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Sujet"
                        placeholder="Résumé de la demande"
                        isRequired
                        errorMessage={errors.subject?.message}
                        isInvalid={!!errors.subject}
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
                        label="Description"
                        placeholder="Décrivez votre demande en détail..."
                        minRows={4}
                        isRequired
                        errorMessage={errors.description?.message}
                        isInvalid={!!errors.description}
                      />
                    )}
                  />

                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Priorité"
                        selectedKeys={field.value ? [field.value] : []}
                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                      >
                        {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </Select>
                    )}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Annuler
                </Button>
                <Button
                  color="danger"
                  type="submit"
                  isLoading={createRequest.isPending}
                >
                  Soumettre la Demande
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
