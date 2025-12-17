"use client";

import React, { useState } from "react";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Divider,
  Pagination,
} from "@nextui-org/react";
import { FiPlus, FiCheck, FiSend, FiDollarSign, FiSettings, FiDownload, FiEdit, FiTrash2 } from "react-icons/fi";
import {
  useGetPayrollRuns,
  useGetPayrollRunById,
  useCreatePayrollRun,
  useProcessPayrollRun,
  useApprovePayrollRun,
  useDistributePayslips,
  useGetPayrollDetails,
  useGetPayrollVariables,
  useCreatePayrollVariable,
  useUpdatePayrollVariable,
  useDeletePayrollVariable,
  useGetPayrollSettings,
  useUpdatePayrollSettings,
  useGetTaxRates,
} from "@/src/hooks/usePayroll";
import { toast } from "react-toastify";
import { formatDateToFrench } from "@/src/utils/dateUtils";

/**
 * MODULE 4 - PAIE
 * Page unique complète avec 4 sections:
 * 1. Exécutions de paie
 * 2. Éléments variables
 * 3. Paramètres paie
 * 4. Distribution automatique
 */

const STATUS_COLORS = {
  draft: "default",
  processing: "danger",
  approved: "success",
  paid: "success",
};

const VARIABLE_TYPES = [
  { value: "bonus", label: "Bonus" },
  { value: "overtime", label: "Heures supplémentaires" },
  { value: "commission", label: "Commission" },
  { value: "allowance", label: "Indemnité" },
  { value: "deduction", label: "Déduction" },
];

export default function PayrollPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedTab, setSelectedTab] = useState("runs");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [filters, setFilters] = useState({ status: "", year: currentYear, month: "" });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isProcessOpen, onOpen: onProcessOpen, onClose: onProcessClose } = useDisclosure();
  const { isOpen: isVariableOpen, onOpen: onVariableOpen, onClose: onVariableClose } = useDisclosure();

  const [selectedRun, setSelectedRun] = useState(null);
  const [runFormData, setRunFormData] = useState({
    period: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
    payment_date: "",
    year: currentYear,
    month: currentMonth,
  });

  const [variableFormData, setVariableFormData] = useState({
    employee_id: "",
    type: "",
    amount: 0,
    period: `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
    description: "",
  });

  // Queries
  const { data: runsData, isLoading: runsLoading } = useGetPayrollRuns({
    page,
    rowsPerPage,
    query: "",
    filters,
  });

  const { data: runDetails } = useGetPayrollRunById(selectedRun?.id);
  const { data: payrollDetails } = useGetPayrollDetails(selectedRun?.id);

  const { data: variablesData, isLoading: variablesLoading } = useGetPayrollVariables({
    page,
    rowsPerPage,
    query: "",
    filters: {},
  });

  const { data: settings } = useGetPayrollSettings();
  const { data: taxRates } = useGetTaxRates();

  // Mutations
  const createRunMutation = useCreatePayrollRun();
  const processRunMutation = useProcessPayrollRun();
  const approveRunMutation = useApprovePayrollRun();
  const distributeSlipsMutation = useDistributePayslips();
  const createVariableMutation = useCreatePayrollVariable();
  const updateVariableMutation = useUpdatePayrollVariable();
  const deleteVariableMutation = useDeletePayrollVariable();
  const updateSettingsMutation = useUpdatePayrollSettings();

  const runs = runsData?.runs || [];
  const variables = variablesData?.variables || [];
  const total = runsData?.total || 0;
  const pages = Math.ceil(total / rowsPerPage);

  // Handlers pour Exécutions de paie
  const handleCreateRun = async () => {
    try {
      await createRunMutation.mutateAsync(runFormData);
      toast.success("Exécution de paie créée");
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la création");
    }
  };

  const handleProcessRun = async (runId) => {
    try {
      await processRunMutation.mutateAsync(runId);
      toast.success("Traitement en cours...");
      onProcessClose();
    } catch (error) {
      toast.error("Erreur lors du traitement");
    }
  };

  const handleApproveRun = async (runId) => {
    try {
      await approveRunMutation.mutateAsync({
        runId,
        approvedBy: "current-user-id", // Remplacer par ID utilisateur connecté
      });
      toast.success("Exécution approuvée");
    } catch (error) {
      toast.error("Erreur lors de l'approbation");
    }
  };

  const handleDistribute = async (runId) => {
    try {
      await distributeSlipsMutation.mutateAsync({
        runId,
        distributionMethod: "email",
      });
      toast.success("Distribution des bulletins en cours...");
    } catch (error) {
      toast.error("Erreur lors de la distribution");
    }
  };

  // Handlers pour Éléments variables
  const handleCreateVariable = async () => {
    try {
      await createVariableMutation.mutateAsync(variableFormData);
      toast.success("Élément variable ajouté");
      onVariableClose();
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleDeleteVariable = async (id) => {
    if (confirm("Confirmer la suppression?")) {
      try {
        await deleteVariableMutation.mutateAsync(id);
        toast.success("Élément supprimé");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const formatCurrency = (amount, currency = "CDF") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <PermissionGuard module="payroll" action="read">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestion de la Paie</h1>
            <p className="text-default-500 mt-1">
              Exécutions, éléments variables, paramètres et distribution
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Card>
          <CardBody>
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={setSelectedTab}
              aria-label="Sections de paie"
            >
              {/* SECTION 1: Exécutions de paie */}
              <Tab key="runs" title="Exécutions de Paie">
                <div className="py-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <Select
                        label="Statut"
                        placeholder="Tous"
                        className="w-48"
                        selectedKeys={filters.status ? [filters.status] : []}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      >
                        <SelectItem key="" value="">Tous</SelectItem>
                        <SelectItem key="draft" value="draft">Brouillon</SelectItem>
                        <SelectItem key="processing" value="processing">En traitement</SelectItem>
                        <SelectItem key="approved" value="approved">Approuvé</SelectItem>
                        <SelectItem key="paid" value="paid">Payé</SelectItem>
                      </Select>
                    </div>
                    <Button color="danger" startContent={<FiPlus />} onPress={onOpen}>
                      Créer Exécution
                    </Button>
                  </div>

                  <Table
                    aria-label="Exécutions de paie"
                    bottomContent={
                      pages > 1 && (
                        <div className="flex w-full justify-center">
                          <Pagination
                            isCompact
                            showControls
                            page={page}
                            total={pages}
                            onChange={setPage}
                          />
                        </div>
                      )
                    }
                  >
                    <TableHeader>
                      <TableColumn>PÉRIODE</TableColumn>
                      <TableColumn>DATE PAIEMENT</TableColumn>
                      <TableColumn>NB EMPLOYÉS</TableColumn>
                      <TableColumn>TOTAL BRUT</TableColumn>
                      <TableColumn>TOTAL NET</TableColumn>
                      <TableColumn>STATUT</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={runs}
                      isLoading={runsLoading}
                      loadingContent={<Spinner />}
                      emptyContent="Aucune exécution trouvée"
                    >
                      {(run) => (
                        <TableRow key={run.id}>
                          <TableCell className="font-medium">{run.period}</TableCell>
                          <TableCell>{formatDateToFrench(run.payment_date)}</TableCell>
                          <TableCell>{run.employee_count}</TableCell>
                          <TableCell>{formatCurrency(run.total_gross)}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(run.total_net)}</TableCell>
                          <TableCell>
                            <Chip color={STATUS_COLORS[run.status]} variant="flat" size="sm">
                              {run.status}
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {run.status === "draft" && (
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="flat"
                                  onPress={() => {
                                    setSelectedRun(run);
                                    onProcessOpen();
                                  }}
                                >
                                  Traiter
                                </Button>
                              )}
                              {run.status === "processing" && (
                                <Button
                                  size="sm"
                                  color="success"
                                  variant="flat"
                                  onPress={() => handleApproveRun(run.id)}
                                >
                                  <FiCheck /> Approuver
                                </Button>
                              )}
                              {run.status === "approved" && (
                                <Button
                                  size="sm"
                                  color="danger"
                                  onPress={() => handleDistribute(run.id)}
                                >
                                  <FiSend /> Distribuer
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Tab>

              {/* SECTION 2: Éléments variables */}
              <Tab key="variables" title="Éléments Variables">
                <div className="py-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-default-500">
                      Bons de paiement, bonus, gratifications, déductions
                    </p>
                    <Button color="danger" startContent={<FiPlus />} onPress={onVariableOpen}>
                      Ajouter Élément
                    </Button>
                  </div>

                  <Table aria-label="Éléments variables">
                    <TableHeader>
                      <TableColumn>EMPLOYÉ</TableColumn>
                      <TableColumn>TYPE</TableColumn>
                      <TableColumn>MONTANT</TableColumn>
                      <TableColumn>PÉRIODE</TableColumn>
                      <TableColumn>DESCRIPTION</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={variables}
                      isLoading={variablesLoading}
                      loadingContent={<Spinner />}
                      emptyContent="Aucun élément variable"
                    >
                      {(variable) => (
                        <TableRow key={variable.id}>
                          <TableCell>
                            {variable.employee?.first_name} {variable.employee?.last_name}
                          </TableCell>
                          <TableCell>
                            <Chip
                              color={variable.type.includes("deduction") ? "danger" : "success"}
                              variant="flat"
                              size="sm"
                            >
                              {VARIABLE_TYPES.find((t) => t.value === variable.type)?.label}
                            </Chip>
                          </TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(variable.amount)}
                          </TableCell>
                          <TableCell>{variable.period}</TableCell>
                          <TableCell className="text-sm">{variable.description}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => {
                                  setVariableFormData(variable);
                                  onVariableOpen();
                                }}
                              >
                                <FiEdit />
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="light"
                                onPress={() => handleDeleteVariable(variable.id)}
                              >
                                <FiTrash2 />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Tab>

              {/* SECTION 3: Paramètres paie */}
              <Tab key="settings" title="Paramètres">
                <div className="py-4 space-y-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Configuration Générale</h3>
                    </CardHeader>
                    <CardBody className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Taux IRPP (%)"
                          type="number"
                          value={settings?.irpp_rate || 0}
                          onChange={(e) => {
                            // Update settings
                          }}
                        />
                        <Select
                          label="Périodicité"
                          selectedKeys={settings?.periodicity ? [settings.periodicity] : ["monthly"]}
                        >
                          <SelectItem key="monthly" value="monthly">Mensuelle</SelectItem>
                          <SelectItem key="biweekly" value="biweekly">Bimensuelle</SelectItem>
                        </Select>
                        <Input
                          label="Jour de distribution"
                          type="number"
                          value={settings?.payment_day || 24}
                          description="24 du mois ou dernier jour ouvrable"
                        />
                        <Select
                          label="Devise"
                          selectedKeys={settings?.currency ? [settings.currency] : ["CDF"]}
                        >
                          <SelectItem key="CDF" value="CDF">CDF (Franc Congalais)</SelectItem>
                          <SelectItem key="USD" value="USD">USD</SelectItem>
                          <SelectItem key="EUR" value="EUR">EUR</SelectItem>
                        </Select>
                      </div>
                      <Button color="danger" startContent={<FiCheck />}>
                        Sauvegarder Paramètres
                      </Button>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Taux d'Imposition</h3>
                    </CardHeader>
                    <CardBody>
                      <Table aria-label="Taux d'imposition">
                        <TableHeader>
                          <TableColumn>TRANCHE MIN</TableColumn>
                          <TableColumn>TRANCHE MAX</TableColumn>
                          <TableColumn>TAUX (%)</TableColumn>
                          <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody items={taxRates || []}>
                          {(rate) => (
                            <TableRow key={rate.id}>
                              <TableCell>{formatCurrency(rate.min_salary)}</TableCell>
                              <TableCell>{formatCurrency(rate.max_salary)}</TableCell>
                              <TableCell className="font-bold">{rate.rate}%</TableCell>
                              <TableCell>
                                <Button isIconOnly size="sm" variant="light">
                                  <FiEdit />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardBody>
                  </Card>
                </div>
              </Tab>

              {/* SECTION 4: Distribution */}
              <Tab key="distribution" title="Distribution">
                <div className="py-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Distribution Automatique</h3>
                    </CardHeader>
                    <CardBody>
                      <p className="text-default-500 mb-4">
                        Les bulletins de paie seront envoyés automatiquement par email le{" "}
                        <strong>{settings?.payment_day || 24}</strong> du mois (ou dernier jour ouvrable si weekend/férié).
                      </p>
                      <Button color="danger" startContent={<FiSend />}>
                        Envoyer Maintenant
                      </Button>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Historique des Distributions</h3>
                    </CardHeader>
                    <CardBody>
                      <p className="text-default-500 text-center py-6">
                        Sélectionnez une exécution de paie pour voir l'historique
                      </p>
                    </CardBody>
                  </Card>
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>

        {/* Modal Créer Exécution */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader>Créer Exécution de Paie</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  type="month"
                  label="Période (Mois)"
                  value={runFormData.period}
                  onChange={(e) => setRunFormData({ ...runFormData, period: e.target.value })}
                  isRequired
                />
                <Input
                  type="date"
                  label="Date de paiement"
                  value={runFormData.payment_date}
                  onChange={(e) => setRunFormData({ ...runFormData, payment_date: e.target.value })}
                  isRequired
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>Annuler</Button>
              <Button color="danger" onPress={handleCreateRun} isLoading={createRunMutation.isPending}>
                Créer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Traiter Exécution */}
        <Modal isOpen={isProcessOpen} onClose={onProcessClose} size="4xl">
          <ModalContent>
            <ModalHeader>Traiter Exécution - {selectedRun?.period}</ModalHeader>
            <ModalBody>
              <Table aria-label="Détails de paie">
                <TableHeader>
                  <TableColumn>EMPLOYÉ</TableColumn>
                  <TableColumn>SALAIRE BASE</TableColumn>
                  <TableColumn>BONUS</TableColumn>
                  <TableColumn>DÉDUCTIONS</TableColumn>
                  <TableColumn>NET</TableColumn>
                </TableHeader>
                <TableBody items={payrollDetails || []}>
                  {(detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>{detail.employee?.first_name} {detail.employee?.last_name}</TableCell>
                      <TableCell>{formatCurrency(detail.base_salary)}</TableCell>
                      <TableCell>{formatCurrency(detail.bonuses)}</TableCell>
                      <TableCell>{formatCurrency(detail.deductions)}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(detail.net_salary)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onProcessClose}>Annuler</Button>
              <Button
                color="danger"
                onPress={() => handleProcessRun(selectedRun?.id)}
                isLoading={processRunMutation.isPending}
              >
                Lancer le Traitement
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Élément Variable */}
        <Modal isOpen={isVariableOpen} onClose={onVariableClose}>
          <ModalContent>
            <ModalHeader>Ajouter Élément Variable</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Select label="Type" placeholder="Sélectionner" isRequired>
                  {VARIABLE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  type="number"
                  label="Montant"
                  startContent={<FiDollarSign />}
                  isRequired
                />
                <Input type="month" label="Période" isRequired />
                <Textarea label="Description" minRows={2} />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onVariableClose}>Annuler</Button>
              <Button color="danger" onPress={handleCreateVariable} isLoading={createVariableMutation.isPending}>
                Ajouter
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
