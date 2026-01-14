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
import { useGetEmployees } from "@/src/hooks/useEmployees";
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
  // const { data: runsData, isLoading: runsLoading } = useGetPayrollRuns({
  //   page,
  //   rowsPerPage,
  //   query: "",
  //   filters,
  // });

  // const { data: runDetails } = useGetPayrollRunById(selectedRun?.id);
  // const { data: payrollDetails } = useGetPayrollDetails(selectedRun?.id);

  // const { data: variablesData, isLoading: variablesLoading } = useGetPayrollVariables({
  //   page,
  //   rowsPerPage,
  //   query: "",
  //   filters: {},
  // });

  // const { data: employeesData } = useGetEmployees({
  //   page: 1,
  //   rowsPerPage: 1000,
  //   query: "",
  // });

  // const { data: settings } = useGetPayrollSettings();
  // const { data: taxRates } = useGetTaxRates();

  // Mutations
  const createRunMutation = useCreatePayrollRun();
  const processRunMutation = useProcessPayrollRun();
  const approveRunMutation = useApprovePayrollRun();
  const distributeSlipsMutation = useDistributePayslips();
  const createVariableMutation = useCreatePayrollVariable();
  const updateVariableMutation = useUpdatePayrollVariable();
  const deleteVariableMutation = useDeletePayrollVariable();
  const updateSettingsMutation = useUpdatePayrollSettings();

  // TEST DATA - Employés
  const mockEmployees = [
    { id: 1, first_name: "Jean", last_name: "Dupont", employee_number: "EMP001" },
    { id: 2, first_name: "Marie", last_name: "Kabila", employee_number: "EMP002" },
    { id: 3, first_name: "Pierre", last_name: "Tshisekedi", employee_number: "EMP003" },
    { id: 4, first_name: "Sophie", last_name: "Mukendi", employee_number: "EMP004" },
    { id: 5, first_name: "Jacques", last_name: "Lumbu", employee_number: "EMP005" },
    { id: 6, first_name: "Christine", last_name: "Mbuyi", employee_number: "EMP006" },
    { id: 7, first_name: "David", last_name: "Kalala", employee_number: "EMP007" },
    { id: 8, first_name: "Antoinette", last_name: "Ngoy", employee_number: "EMP008" },
  ];

  // TEST DATA - Paramètres de paie
  const mockSettings = {
    irpp_rate: 3,
    periodicity: "monthly",
    payment_day: 24,
    currency: "CDF",
  };

  // TEST DATA - Taux d'imposition
  const mockTaxRates = [
    { id: 1, min_salary: 0, max_salary: 100000, rate: 0 },
    { id: 2, min_salary: 100001, max_salary: 500000, rate: 3 },
    { id: 3, min_salary: 500001, max_salary: 1000000, rate: 10 },
    { id: 4, min_salary: 1000001, max_salary: 5000000, rate: 15 },
    { id: 5, min_salary: 5000001, max_salary: 999999999, rate: 30 },
  ];

  // TEST DATA - Exécutions de paie (avec états locaux)
  const [mockRuns, setMockRuns] = useState([
    {
      id: 1,
      period: "2026-01",
      payment_date: "2026-01-24",
      employee_count: 145,
      total_gross: 285000000,
      total_net: 245000000,
      status: "paid",
      year: 2026,
      month: 1,
    },
    {
      id: 2,
      period: "2025-12",
      payment_date: "2025-12-24",
      employee_count: 142,
      total_gross: 278000000,
      total_net: 238000000,
      status: "paid",
      year: 2025,
      month: 12,
    },
    {
      id: 3,
      period: "2025-11",
      payment_date: "2025-11-24",
      employee_count: 140,
      total_gross: 275000000,
      total_net: 235000000,
      status: "approved",
      year: 2025,
      month: 11,
    },
    {
      id: 4,
      period: "2025-10",
      payment_date: "2025-10-24",
      employee_count: 138,
      total_gross: 270000000,
      total_net: 232000000,
      status: "processing",
      year: 2025,
      month: 10,
    },
    {
      id: 5,
      period: "2026-02",
      payment_date: "2026-02-24",
      employee_count: 0,
      total_gross: 0,
      total_net: 0,
      status: "draft",
      year: 2026,
      month: 2,
    },
  ]);

  // TEST DATA - Détails de paie pour le modal de traitement
  const mockPayrollDetails = [
    { id: 1, employee: { first_name: "Jean", last_name: "Dupont" }, base_salary: 2500000, bonuses: 500000, deductions: 300000, net_salary: 2700000 },
    { id: 2, employee: { first_name: "Marie", last_name: "Kabila" }, base_salary: 1800000, bonuses: 200000, deductions: 180000, net_salary: 1820000 },
    { id: 3, employee: { first_name: "Pierre", last_name: "Tshisekedi" }, base_salary: 3200000, bonuses: 800000, deductions: 480000, net_salary: 3520000 },
    { id: 4, employee: { first_name: "Sophie", last_name: "Mukendi" }, base_salary: 1500000, bonuses: 150000, deductions: 150000, net_salary: 1500000 },
    { id: 5, employee: { first_name: "Jacques", last_name: "Lumbu" }, base_salary: 2000000, bonuses: 300000, deductions: 230000, net_salary: 2070000 },
  ];

  // TEST DATA - Éléments variables (avec états locaux)
  const [mockVariables, setMockVariables] = useState([
    {
      id: 1,
      employee_id: 1,
      employee: { first_name: "Jean", last_name: "Dupont" },
      type: "bonus",
      amount: 500000,
      period: "2026-01",
      description: "Prime de performance trimestrielle",
    },
    {
      id: 2,
      employee_id: 2,
      employee: { first_name: "Marie", last_name: "Kabila" },
      type: "overtime",
      amount: 200000,
      period: "2026-01",
      description: "Heures supplémentaires (15h)",
    },
    {
      id: 3,
      employee_id: 3,
      employee: { first_name: "Pierre", last_name: "Tshisekedi" },
      type: "commission",
      amount: 800000,
      period: "2026-01",
      description: "Commission sur ventes Q4",
    },
    {
      id: 4,
      employee_id: 4,
      employee: { first_name: "Sophie", last_name: "Mukendi" },
      type: "allowance",
      amount: 150000,
      period: "2026-01",
      description: "Indemnité de transport",
    },
    {
      id: 5,
      employee_id: 5,
      employee: { first_name: "Jacques", last_name: "Lumbu" },
      type: "deduction",
      amount: 50000,
      period: "2026-01",
      description: "Avance sur salaire",
    },
    {
      id: 6,
      employee_id: 6,
      employee: { first_name: "Christine", last_name: "Mbuyi" },
      type: "bonus",
      amount: 300000,
      period: "2026-01",
      description: "Prime d'ancienneté",
    },
  ]);

  const runsLoading = false;
  const variablesLoading = false;
  const runs = mockRuns;
  const variables = mockVariables;
  const employees = mockEmployees;
  const total = mockRuns.length;
  const pages = Math.ceil(total / rowsPerPage);
  const settings = mockSettings;
  const taxRates = mockTaxRates;
  const payrollDetails = selectedRun?.id ? mockPayrollDetails : [];

  // Handlers pour Exécutions de paie
  const handleCreateRun = async () => {
    try {
      // Simulation de création
      const newRun = {
        id: mockRuns.length + 1,
        period: runFormData.period,
        payment_date: runFormData.payment_date,
        employee_count: 0,
        total_gross: 0,
        total_net: 0,
        status: "draft",
        year: parseInt(runFormData.period.split("-")[0]),
        month: parseInt(runFormData.period.split("-")[1]),
      };
      setMockRuns([newRun, ...mockRuns]);
      toast.success("Exécution de paie créée");
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la création");
    }
  };

  const handleProcessRun = async (runId) => {
    try {
      // Simulation de traitement
      setMockRuns(mockRuns.map(run => 
        run.id === runId ? {
          ...run,
          status: "processing",
          employee_count: 145,
          total_gross: 285000000,
          total_net: 245000000,
        } : run
      ));
      toast.success("Traitement en cours...");
      setTimeout(() => {
        toast.success("Traitement terminé avec succès");
      }, 2000);
      onProcessClose();
    } catch (error) {
      toast.error("Erreur lors du traitement");
    }
  };

  const handleApproveRun = async (runId) => {
    try {
      // Simulation d'approbation
      setMockRuns(mockRuns.map(run => 
        run.id === runId ? { ...run, status: "approved" } : run
      ));
      toast.success("Exécution approuvée");
    } catch (error) {
      toast.error("Erreur lors de l'approbation");
    }
  };

  const handleDistribute = async (runId) => {
    try {
      // Simulation de distribution
      setMockRuns(mockRuns.map(run => 
        run.id === runId ? { ...run, status: "paid" } : run
      ));
      toast.success("Distribution des bulletins en cours...");
      setTimeout(() => {
        const employeeCount = mockRuns.find(r => r.id === runId)?.employee_count || 0;
        toast.success(`${employeeCount} bulletins envoyés avec succès par email`);
      }, 2000);
    } catch (error) {
      toast.error("Erreur lors de la distribution");
    }
  };

  // Handlers pour Éléments variables
  const handleCreateVariable = async () => {
    try {
      // Simulation d'ajout
      const selectedEmployee = mockEmployees.find(e => e.id === parseInt(variableFormData.employee_id));
      const newVariable = {
        id: mockVariables.length + 1,
        employee_id: parseInt(variableFormData.employee_id),
        employee: selectedEmployee,
        type: variableFormData.variable_type,
        amount: parseFloat(variableFormData.amount),
        period: variableFormData.period,
        description: variableFormData.description,
      };
      setMockVariables([newVariable, ...mockVariables]);
      toast.success("Élément variable ajouté");
      const newPeriod = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
      setVariableFormData({
        employee_id: "",
        type: "",
        amount: 0,
        period: newPeriod,
        description: "",
      });
      onVariableClose();
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleDeleteVariable = async (id) => {
    if (confirm("Confirmer la suppression?")) {
      try {
        // Simulation de suppression
        setMockVariables(mockVariables.filter(v => v.id !== id));
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
              <Button color="danger" onPress={handleCreateRun}>
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
                <Select 
                  label="Employé" 
                  placeholder="Sélectionner un employé" 
                  isRequired
                  selectedKeys={variableFormData.employee_id ? [variableFormData.employee_id] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    setVariableFormData({ ...variableFormData, employee_id: selectedKey });
                  }}
                >
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_number})
                    </SelectItem>
                  ))}
                </Select>
                <Select 
                  label="Type" 
                  placeholder="Sélectionner un type" 
                  isRequired
                  selectedKeys={variableFormData.variable_type ? [variableFormData.variable_type] : []}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    setVariableFormData({ ...variableFormData, variable_type: selectedKey });
                  }}
                >
                  {VARIABLE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  type="number"
                  label="Montant (USD)"
                  startContent={<FiDollarSign />}
                  isRequired
                  value={variableFormData.amount}
                  onChange={(e) => setVariableFormData({ ...variableFormData, amount: e.target.value })}
                />
                <Input 
                  type="month" 
                  label="Période" 
                  isRequired 
                  value={variableFormData.period}
                  onChange={(e) => setVariableFormData({ ...variableFormData, period: e.target.value })}
                />
                <Textarea 
                  label="Description" 
                  minRows={2} 
                  value={variableFormData.description}
                  onChange={(e) => setVariableFormData({ ...variableFormData, description: e.target.value })}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onVariableClose}>Annuler</Button>
              <Button color="danger" onPress={handleCreateVariable}>
                Ajouter
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
