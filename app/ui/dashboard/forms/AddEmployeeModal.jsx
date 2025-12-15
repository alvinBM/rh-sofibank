"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
} from "@nextui-org/react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { useGetDirections, useGetServices, useGetGrades, useGetJobPositions } from "@/src/hooks/useMain";
import { useGetEmployees } from "@/src/hooks/useEmployees";

const CONTRACT_TYPES = [
  { value: "permanent", label: "CDI - Permanent" },
  { value: "temporary", label: "CDD - Temporaire" },
  { value: "intern", label: "Stage" },
  { value: "consultant", label: "Consultant" },
];

const MARITAL_STATUS = [
  { value: "single", label: "Célibataire" },
  { value: "married", label: "Marié(e)" },
  { value: "divorced", label: "Divorcé(e)" },
  { value: "widowed", label: "Veuf/Veuve" },
];

const GENDER_OPTIONS = [
  { value: "M", label: "Masculin" },
  { value: "F", label: "Féminin" },
  { value: "Other", label: "Autre" },
];

export default function AddEmployeeModal({ isOpen, onClose, onSuccess }) {
  const [selectedTab, setSelectedTab] = useState("personal");
  const { control, handleSubmit, watch, formState: { errors }, reset } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      gender: "",
      date_of_birth: "",
      place_of_birth: "",
      nationality: "Congolaise",
      national_id: "",
      marital_status: "",
      address_line1: "",
      city: "",
      country: "RDC",
      direction_id: "",
      service_id: "",
      job_position_id: "",
      grade_id: "",
      hire_date: "",
      contract_type: "",
      direct_supervisor_id: "",
      personal_email: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
    }
  });

  const { data: directionsData } = useGetDirections({ page: 1, rowsPerPage: 100 });
  const { data: servicesData } = useGetServices({ page: 1, rowsPerPage: 100 });
  const { data: gradesData } = useGetGrades({ page: 1, rowsPerPage: 100 });
  const { data: jobPositionsData } = useGetJobPositions({ page: 1, rowsPerPage: 100 });
  const { data: employeesData } = useGetEmployees({ page: 1, rowsPerPage: 1000 });

  const selectedDirection = watch("direction_id");
  const filteredServices = servicesData?.services?.filter(
    (service) => service.direction_id === selectedDirection
  ) || [];

  const onSubmit = async (data) => {
    try {
      // Appeler votre service pour créer l'employé
      // await createEmployee(data);
      toast.success("Employé créé avec succès");
      onSuccess?.();
      reset();
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la création de l'employé");
      console.error(error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
              <h3 className="text-xl font-bold">Ajouter un Employé</h3>
            </ModalHeader>
            <ModalBody>
              <Tabs
                selectedKey={selectedTab}
                onSelectionChange={setSelectedTab}
                variant="underlined"
                classNames={{
                  tabList: "w-full",
                  tab: "px-6",
                }}
              >
                <Tab key="personal" title="Informations Personnelles">
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Controller
                      name="first_name"
                      control={control}
                      rules={{ required: "Prénom requis" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Prénom"
                          placeholder="Entrez le prénom"
                          isRequired
                          errorMessage={errors.first_name?.message}
                          isInvalid={!!errors.first_name}
                        />
                      )}
                    />

                    <Controller
                      name="last_name"
                      control={control}
                      rules={{ required: "Nom requis" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Nom"
                          placeholder="Entrez le nom"
                          isRequired
                          errorMessage={errors.last_name?.message}
                          isInvalid={!!errors.last_name}
                        />
                      )}
                    />

                    <Controller
                      name="email"
                      control={control}
                      rules={{
                        required: "Email requis",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Email invalide"
                        }
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="email"
                          label="Email Professionnel"
                          placeholder="email@sofibanque.cd"
                          isRequired
                          errorMessage={errors.email?.message}
                          isInvalid={!!errors.email}
                        />
                      )}
                    />

                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Téléphone"
                          placeholder="+243 XXX XXX XXX"
                        />
                      )}
                    />

                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Genre"
                          placeholder="Sélectionnez le genre"
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          {GENDER_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="date_of_birth"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="date"
                          label="Date de Naissance"
                        />
                      )}
                    />

                    <Controller
                      name="place_of_birth"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Lieu de Naissance"
                          placeholder="Ville de naissance"
                        />
                      )}
                    />

                    <Controller
                      name="nationality"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Nationalité"
                          placeholder="Nationalité"
                        />
                      )}
                    />

                    <Controller
                      name="national_id"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Numéro CNI"
                          placeholder="Numéro d'identification nationale"
                        />
                      )}
                    />

                    <Controller
                      name="marital_status"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Situation Matrimoniale"
                          placeholder="Sélectionnez"
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          {MARITAL_STATUS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="personal_email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="email"
                          label="Email Personnel"
                          placeholder="email@example.com"
                        />
                      )}
                    />
                  </div>
                </Tab>

                <Tab key="address" title="Adresse & Contact d'Urgence">
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Controller
                      name="address_line1"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Adresse Ligne 1"
                          placeholder="Numéro et rue"
                          className="col-span-2"
                        />
                      )}
                    />

                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Ville"
                          placeholder="Ville"
                        />
                      )}
                    />

                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Pays"
                          placeholder="Pays"
                        />
                      )}
                    />

                    <div className="col-span-2 border-t pt-4 mt-4">
                      <h4 className="font-semibold mb-4">Contact d'Urgence</h4>
                    </div>

                    <Controller
                      name="emergency_contact_name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Nom du Contact"
                          placeholder="Nom complet"
                        />
                      )}
                    />

                    <Controller
                      name="emergency_contact_phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Téléphone du Contact"
                          placeholder="+243 XXX XXX XXX"
                        />
                      )}
                    />

                    <Controller
                      name="emergency_contact_relationship"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Relation"
                          placeholder="Ex: Époux/Épouse, Parent, Ami"
                          className="col-span-2"
                        />
                      )}
                    />
                  </div>
                </Tab>

                <Tab key="professional" title="Informations Professionnelles">
                  <div className="grid grid-cols-2 gap-4 py-4">
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
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                          errorMessage={errors.direction_id?.message}
                          isInvalid={!!errors.direction_id}
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
                          isDisabled={!selectedDirection}
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
                      name="job_position_id"
                      control={control}
                      rules={{ required: "Poste requis" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Poste"
                          placeholder="Sélectionnez le poste"
                          isRequired
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                          errorMessage={errors.job_position_id?.message}
                          isInvalid={!!errors.job_position_id}
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
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Grade"
                          placeholder="Sélectionnez le grade"
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                        >
                          {(gradesData?.grades || []).map((grade) => (
                            <SelectItem key={grade.id} value={grade.id}>
                              {grade.name} - {grade.code}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="hire_date"
                      control={control}
                      rules={{ required: "Date d'embauche requise" }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="date"
                          label="Date d'Embauche"
                          isRequired
                          errorMessage={errors.hire_date?.message}
                          isInvalid={!!errors.hire_date}
                        />
                      )}
                    />

                    <Controller
                      name="contract_type"
                      control={control}
                      rules={{ required: "Type de contrat requis" }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Type de Contrat"
                          placeholder="Sélectionnez le type"
                          isRequired
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                          errorMessage={errors.contract_type?.message}
                          isInvalid={!!errors.contract_type}
                        >
                          {CONTRACT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    <Controller
                      name="direct_supervisor_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Superviseur Direct"
                          placeholder="Sélectionnez le superviseur"
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                          className="col-span-2"
                        >
                          {(employeesData?.employees || []).map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.first_name} {employee.last_name} - {employee.employee_number}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />
                  </div>
                </Tab>
              </Tabs>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Annuler
              </Button>
              <Button
                color="primary"
                type="submit"
                isDisabled={Object.keys(errors).length > 0}
              >
                Créer l'Employé
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}
