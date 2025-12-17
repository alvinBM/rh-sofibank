"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  Tabs,
  Tab,
  Button,
  Chip,
  Avatar,
  Spinner,
  Divider,
} from "@nextui-org/react";
import { FiArrowLeft, FiEdit, FiFileText, FiClock, FiAward, FiBriefcase } from "react-icons/fi";
import { useGetEmployees } from "@/src/hooks/useEmployees";
import { useGetEmployeeDocuments, useGetEmployeeContracts, useGetEmployeeHistory } from "@/src/hooks/useESS";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";

const EMPLOYMENT_STATUS_COLORS = {
  active: "success",
  inactive: "default",
  on_leave: "warning",
  suspended: "danger",
  terminated: "danger",
};

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id;

  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: employeesData, isLoading } = useGetEmployees({
    page: 1,
    rowsPerPage: 1000,
  });

  const employee = employeesData?.employees?.find(emp => emp.id === employeeId);

  const { data: documents } = useGetEmployeeDocuments(employeeId);
  const { data: contracts } = useGetEmployeeContracts(employeeId);
  const { data: history } = useGetEmployeeHistory(employeeId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label="Chargement..." />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-bold text-danger mb-4">Employé introuvable</h2>
        <Button color="danger" startContent={<FiArrowLeft />} onPress={() => router.back()}>
          Retour
        </Button>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="employees_view">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.back()}
          >
            <FiArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold flex-1">Fiche Employé</h1>
          <Button color="danger" startContent={<FiEdit />}>
            Modifier
          </Button>
        </div>

        {/* Employee Card */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-start gap-6">
              <Avatar
                src={employee.profile_photo_url}
                name={`${employee.first_name?.[0]}${employee.last_name?.[0]}`}
                className="w-24 h-24 text-large"
              />

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {employee.first_name} {employee.last_name}
                    </h2>
                    <p className="text-default-500">
                      {employee.employee_number} • {employee.job_position?.title || "N/A"}
                    </p>
                  </div>
                  <Chip
                    color={EMPLOYMENT_STATUS_COLORS[employee.employment_status] || "default"}
                    variant="flat"
                  >
                    {employee.employment_status === "active" ? "Actif" : employee.employment_status}
                  </Chip>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-default-500">Direction</p>
                    <p className="font-semibold">{employee.direction?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Service</p>
                    <p className="font-semibold">{employee.service?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Grade</p>
                    <p className="font-semibold">{employee.grade?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Date d'embauche</p>
                    <p className="font-semibold">
                      {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString("fr-FR") : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tabs */}
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={setSelectedTab}
          variant="underlined"
          classNames={{
            tabList: "w-full",
            tab: "px-6",
          }}
        >
          <Tab
            key="overview"
            title={
              <div className="flex items-center gap-2">
                <FiBriefcase />
                <span>Vue d'ensemble</span>
              </div>
            }
          >
            <Card className="mt-4">
              <CardBody>
                <h3 className="text-lg font-bold mb-4">Informations Personnelles</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-default-500">Email</p>
                    <p className="font-semibold">{employee.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Téléphone</p>
                    <p className="font-semibold">{employee.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Genre</p>
                    <p className="font-semibold">
                      {employee.gender === "M" ? "Masculin" : employee.gender === "F" ? "Féminin" : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Date de naissance</p>
                    <p className="font-semibold">
                      {employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString("fr-FR") : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Lieu de naissance</p>
                    <p className="font-semibold">{employee.place_of_birth || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Nationalité</p>
                    <p className="font-semibold">{employee.nationality || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">CNI</p>
                    <p className="font-semibold">{employee.national_id || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Situation matrimoniale</p>
                    <p className="font-semibold">{employee.marital_status || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Nombre d'enfants</p>
                    <p className="font-semibold">{employee.number_of_children || "0"}</p>
                  </div>
                </div>

                <Divider className="my-6" />

                <h3 className="text-lg font-bold mb-4">Adresse</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <p className="text-sm text-default-500">Adresse</p>
                    <p className="font-semibold">{employee.address_line1 || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Ville</p>
                    <p className="font-semibold">{employee.city || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Province</p>
                    <p className="font-semibold">{employee.province || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Pays</p>
                    <p className="font-semibold">{employee.country || "-"}</p>
                  </div>
                </div>

                <Divider className="my-6" />

                <h3 className="text-lg font-bold mb-4">Contact d'Urgence</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-default-500">Nom</p>
                    <p className="font-semibold">{employee.emergency_contact_name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Téléphone</p>
                    <p className="font-semibold">{employee.emergency_contact_phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Relation</p>
                    <p className="font-semibold">{employee.emergency_contact_relationship || "-"}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab
            key="contracts"
            title={
              <div className="flex items-center gap-2">
                <FiFileText />
                <span>Contrats</span>
              </div>
            }
          >
            <Card className="mt-4">
              <CardBody>
                <h3 className="text-lg font-bold mb-4">Historique des Contrats</h3>
                {contracts && contracts.length > 0 ? (
                  <div className="space-y-4">
                    {contracts.map((contract) => (
                      <Card key={contract.id} shadow="sm">
                        <CardBody>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{contract.contract_number}</p>
                              <p className="text-sm text-default-500">
                                {contract.contract_type} • {contract.position}
                              </p>
                              <p className="text-sm text-default-500 mt-2">
                                Du {new Date(contract.start_date).toLocaleDateString("fr-FR")}
                                {contract.end_date && ` au ${new Date(contract.end_date).toLocaleDateString("fr-FR")}`}
                              </p>
                            </div>
                            {contract.is_current && (
                              <Chip color="success" size="sm">En cours</Chip>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-default-400 py-8">Aucun contrat enregistré</p>
                )}
              </CardBody>
            </Card>
          </Tab>

          <Tab
            key="documents"
            title={
              <div className="flex items-center gap-2">
                <FiFileText />
                <span>Documents</span>
              </div>
            }
          >
            <Card className="mt-4">
              <CardBody>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Documents de l'Employé</h3>
                  <Button color="danger" size="sm">
                    Ajouter un Document
                  </Button>
                </div>
                {documents && documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <Card key={doc.id} shadow="sm">
                        <CardBody>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">{doc.title}</p>
                              <p className="text-sm text-default-500">{doc.document_type?.name}</p>
                              <p className="text-xs text-default-400">
                                Ajouté le {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                            <Button size="sm" variant="flat">
                              Télécharger
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-default-400 py-8">Aucun document</p>
                )}
              </CardBody>
            </Card>
          </Tab>

          <Tab
            key="history"
            title={
              <div className="flex items-center gap-2">
                <FiClock />
                <span>Historique</span>
              </div>
            }
          >
            <Card className="mt-4">
              <CardBody>
                <h3 className="text-lg font-bold mb-4">Historique Professionnel</h3>
                {history && history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((event) => (
                      <Card key={event.id} shadow="sm">
                        <CardBody>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <p className="font-semibold capitalize">{event.event_type}</p>
                              <p className="text-sm text-default-500 mt-1">{event.description}</p>
                              <p className="text-xs text-default-400 mt-2">
                                {new Date(event.event_date).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-default-400 py-8">Aucun événement historique</p>
                )}
              </CardBody>
            </Card>
          </Tab>

          <Tab
            key="evaluations"
            title={
              <div className="flex items-center gap-2">
                <FiAward />
                <span>Évaluations</span>
              </div>
            }
          >
            <Card className="mt-4">
              <CardBody>
                <h3 className="text-lg font-bold mb-4">Évaluations de Performance</h3>
                <p className="text-center text-default-400 py-8">
                  Les évaluations de performance seront affichées ici
                </p>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </PermissionGuard>
  );
}
