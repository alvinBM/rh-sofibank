"use client";

import React, { useState } from "react";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";
import {
  Card, CardBody, CardHeader, Button, Input, Select, SelectItem, Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell, Spinner, Chip, Modal, ModalContent, ModalHeader, ModalBody,
  ModalFooter, useDisclosure, Checkbox, CheckboxGroup, Divider
} from "@nextui-org/react";
import { FiPlus, FiDownload, FiSave, FiPlay, FiEdit, FiTrash2, FiCalendar } from "react-icons/fi";
import {
  useGetReportTemplates, useCreateReportTemplate, useGenerateCustomReport, useCreateScheduledReport
} from "@/src/hooks/useReports";
import { toast } from "react-toastify";

const DATA_SOURCES = [
  { value: "employees", label: "Employés" },
  { value: "leave", label: "Congés" },
  { value: "attendance", label: "Présence" },
  { value: "payroll", label: "Paie" },
  { value: "performance", label: "Performance" }
];

const COLUMNS_BY_SOURCE = {
  employees: ["first_name", "last_name", "employee_number", "email", "department", "position", "hire_date", "salary"],
  leave: ["employee", "leave_type", "start_date", "end_date", "duration", "status"],
  attendance: ["employee", "date", "check_in", "check_out", "status", "duration"],
  payroll: ["employee", "period", "gross_salary", "net_salary", "deductions", "bonuses"],
  performance: ["employee", "year", "quarter", "score", "status"]
};

export default function CustomReportsPage() {
  const [selectedTab, setSelectedTab] = useState("builder");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isScheduleOpen, onOpen: onScheduleOpen, onClose: onScheduleClose } = useDisclosure();

  const [reportConfig, setReportConfig] = useState({
    name: "", source: "", columns: [], filters: {}, groupBy: "", sortBy: ""
  });

  const { data: templates, isLoading } = useGetReportTemplates("current-user-id");
  const createTemplateMutation = useCreateReportTemplate();
  const generateMutation = useGenerateCustomReport();
  const scheduleMutation = useCreateScheduledReport();

  const handleGenerateReport = async () => {
    try {
      const data = await generateMutation.mutateAsync(reportConfig);
      toast.success("Rapport généré avec succès");
      // Afficher ou télécharger les données
    } catch (error) {
      toast.error("Erreur lors de la génération");
    }
  };

  const handleSaveTemplate = async () => {
    try {
      await createTemplateMutation.mutateAsync({
        name: reportConfig.name,
        config: reportConfig,
        created_by: "current-user-id",
        is_public: false
      });
      toast.success("Template sauvegardé");
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleSchedule = async () => {
    try {
      await scheduleMutation.mutateAsync({
        template_id: "selected-template-id",
        frequency: "weekly",
        is_active: true
      });
      toast.success("Rapport planifié");
      onScheduleClose();
    } catch (error) {
      toast.error("Erreur lors de la planification");
    }
  };

  return (
    <PermissionGuard module="reports" action="read">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Rapports Personnalisés</h1>
            <p className="text-default-500 mt-1">Créez et planifiez des rapports sur mesure</p>
          </div>
          <div className="flex gap-2">
            <Button color="primary" variant="flat" startContent={<FiCalendar />} onPress={onScheduleOpen}>
              Planifier
            </Button>
            <Button color="primary" startContent={<FiSave />} onPress={onOpen}>
              Sauvegarder Template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Builder de rapports */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-lg font-semibold">Générateur de Rapports</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Nom du rapport"
                placeholder="Ex: Rapport mensuel présence"
                value={reportConfig.name}
                onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
              />

              <Select
                label="Source de données"
                placeholder="Sélectionner"
                selectedKeys={reportConfig.source ? [reportConfig.source] : []}
                onChange={(e) => setReportConfig({ ...reportConfig, source: e.target.value, columns: [] })}
              >
                {DATA_SOURCES.map(source => (
                  <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
                ))}
              </Select>

              {reportConfig.source && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">Colonnes à inclure:</p>
                    <CheckboxGroup
                      value={reportConfig.columns}
                      onValueChange={(selected) => setReportConfig({ ...reportConfig, columns: selected })}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {(COLUMNS_BY_SOURCE[reportConfig.source] || []).map(col => (
                          <Checkbox key={col} value={col}>
                            {col.replace("_", " ").toUpperCase()}
                          </Checkbox>
                        ))}
                      </div>
                    </CheckboxGroup>
                  </div>

                  <Divider />

                  <div className="grid grid-cols-2 gap-4">
                    <Input type="date" label="Date début (filtre)" />
                    <Input type="date" label="Date fin (filtre)" />
                  </div>

                  <Select label="Grouper par" placeholder="Aucun">
                    <SelectItem key="" value="">Aucun groupement</SelectItem>
                    {reportConfig.columns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </Select>

                  <Select label="Trier par" placeholder="Aucun">
                    <SelectItem key="" value="">Aucun tri</SelectItem>
                    {reportConfig.columns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      startContent={<FiPlay />}
                      onPress={handleGenerateReport}
                      isLoading={generateMutation.isPending}
                    >
                      Générer Rapport
                    </Button>
                    <Button color="success" variant="flat" startContent={<FiDownload />}>
                      Exporter Excel
                    </Button>
                    <Button color="danger" variant="flat" startContent={<FiDownload />}>
                      Exporter PDF
                    </Button>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* Templates sauvegardés */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Templates Sauvegardés</h3>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="flex justify-center py-10"><Spinner /></div>
              ) : (
                <div className="space-y-2">
                  {(templates || []).map(template => (
                    <Card key={template.id} isPressable>
                      <CardBody className="py-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-xs text-default-500">{template.config?.source}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button isIconOnly size="sm" variant="light">
                              <FiEdit />
                            </Button>
                            <Button isIconOnly size="sm" color="danger" variant="light">
                              <FiTrash2 />
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                  {(!templates || templates.length === 0) && (
                    <p className="text-center text-default-500 py-6">Aucun template</p>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Aperçu des données générées */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Aperçu du Rapport</h3>
          </CardHeader>
          <CardBody>
            <p className="text-center text-default-500 py-10">
              Générez un rapport pour voir l'aperçu
            </p>
          </CardBody>
        </Card>

        {/* Modal Sauvegarder Template */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader>Sauvegarder Template</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Nom du template"
                  value={reportConfig.name}
                  onChange={(e) => setReportConfig({ ...reportConfig, name: e.target.value })}
                  isRequired
                />
                <Checkbox>Rendre public (visible par tous)</Checkbox>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>Annuler</Button>
              <Button
                color="primary"
                onPress={handleSaveTemplate}
                isLoading={createTemplateMutation.isPending}
              >
                Sauvegarder
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Planification */}
        <Modal isOpen={isScheduleOpen} onClose={onScheduleClose}>
          <ModalContent>
            <ModalHeader>Planifier un Rapport Automatique</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Select label="Template" placeholder="Sélectionner">
                  {(templates || []).map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </Select>
                <Select label="Fréquence" placeholder="Sélectionner">
                  <SelectItem key="daily" value="daily">Quotidien</SelectItem>
                  <SelectItem key="weekly" value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem key="monthly" value="monthly">Mensuel</SelectItem>
                </Select>
                <Input label="Destinataires (emails)" placeholder="email1@example.com, email2@..." />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onScheduleClose}>Annuler</Button>
              <Button
                color="primary"
                onPress={handleSchedule}
                isLoading={scheduleMutation.isPending}
              >
                Planifier
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
