"use client";

import React, { useState } from "react";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";
import {
  Card, CardBody, CardHeader, Button, Input, Select, SelectItem, Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell, Spinner, Chip, Pagination, Modal, ModalContent, ModalHeader,
  ModalBody, ModalFooter, useDisclosure, Textarea, Divider, Tabs, Tab
} from "@nextui-org/react";
import { FiAlertTriangle, FiCheck, FiX, FiSettings, FiRefreshCw, FiBell } from "react-icons/fi";
import {
  useGetAlerts, useAcknowledgeAlert, useResolveAlert, useGetAlertThresholds,
  useUpdateAlertThreshold, useCheckAndGenerateAlerts, useGetAlertCounts
} from "@/src/hooks/useReports";
import { toast } from "react-toastify";
import { formatDateToFrench } from "@/src/utils/dateUtils";

const SEVERITY_COLORS = { low: "danger", medium: "warning", high: "danger", critical: "danger" };

const STATUS_COLORS = { active: "warning", acknowledged: "danger", resolved: "success" };

const ALERT_TYPES = [
  { value: "absenteeism_threshold", label: "Absentéisme > seuil" },
  { value: "frequent_lateness", label: "Retards fréquents" },
  { value: "unused_leave", label: "Congés non pris" },
  { value: "pip_overdue", label: "PIP en retard" },
  { value: "evaluation_overdue", label: "Évaluations en retard" },
  { value: "contract_expiring", label: "Contrats arrivant à échéance" },
  { value: "budget_exceeded", label: "Budgets paie dépassés" }
];

export default function AlertsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ type: "", severity: "", status: "active" });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolution, setResolution] = useState("");

  const { data: alertsData, isLoading } = useGetAlerts({ page, rowsPerPage: 15, filters });
  const { data: thresholds } = useGetAlertThresholds();
  const { data: counts } = useGetAlertCounts();

  const acknowledgeMutation = useAcknowledgeAlert();
  const resolveMutation = useResolveAlert();
  const updateThresholdMutation = useUpdateAlertThreshold();
  const checkAlertsMutation = useCheckAndGenerateAlerts();

  const alerts = alertsData?.alerts || [];
  const pages = Math.ceil((alertsData?.total || 0) / 15);

  const handleAcknowledge = async (id) => {
    try {
      await acknowledgeMutation.mutateAsync({ id, userId: "current-user-id" });
      toast.success("Alerte acquittée");
    } catch (error) {
      toast.error("Erreur lors de l'acquittement");
    }
  };

  const handleResolve = async () => {
    try {
      await resolveMutation.mutateAsync({
        id: selectedAlert.id,
        userId: "current-user-id",
        resolution
      });
      toast.success("Alerte résolue");
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la résolution");
    }
  };

  const handleCheckAlerts = async () => {
    try {
      await checkAlertsMutation.mutateAsync();
      toast.success("Vérification des alertes effectuée");
    } catch (error) {
      toast.error("Erreur lors de la vérification");
    }
  };

  const openResolveModal = (alert) => {
    setSelectedAlert(alert);
    setResolution("");
    onOpen();
  };

  return (
    <PermissionGuard module="reports" action="read">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Alertes RH</h1>
            <p className="text-default-500 mt-1">Surveillance et notifications automatiques</p>
          </div>
          <div className="flex gap-2">
            <Button
              color="danger"
              variant="flat"
              startContent={<FiRefreshCw />}
              onPress={handleCheckAlerts}
              isLoading={checkAlertsMutation.isPending}
            >
              Vérifier Alertes
            </Button>
            <Button color="danger" startContent={<FiSettings />} onPress={onSettingsOpen}>
              Configuration
            </Button>
          </div>
        </div>

        {/* Statistiques des alertes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-warning-100 rounded-lg">
                  <FiBell className="text-warning text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Alertes Actives</p>
                  <p className="text-3xl font-bold">{counts?.total_active || 0}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-danger-100 rounded-lg">
                  <FiAlertTriangle className="text-danger text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Critiques</p>
                  <p className="text-3xl font-bold text-danger">
                    {counts?.by_severity?.critical || 0}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-warning-100 rounded-lg">
                  <FiAlertTriangle className="text-warning text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Élevées</p>
                  <p className="text-3xl font-bold text-warning">
                    {counts?.by_severity?.high || 0}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-danger-100 rounded-lg">
                  <FiCheck className="text-danger text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Acquittées</p>
                  <p className="text-3xl font-bold">{counts?.by_status?.acknowledged || 0}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Type"
                placeholder="Tous"
                selectedKeys={filters.type ? [filters.type] : []}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <SelectItem key="" value="">Tous</SelectItem>
                {ALERT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </Select>

              <Select
                label="Sévérité"
                placeholder="Toutes"
                selectedKeys={filters.severity ? [filters.severity] : []}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              >
                <SelectItem key="" value="">Toutes</SelectItem>
                <SelectItem key="low" value="low">Faible</SelectItem>
                <SelectItem key="medium" value="medium">Moyenne</SelectItem>
                <SelectItem key="high" value="high">Élevée</SelectItem>
                <SelectItem key="critical" value="critical">Critique</SelectItem>
              </Select>

              <Select
                label="Statut"
                selectedKeys={filters.status ? [filters.status] : []}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <SelectItem key="" value="">Tous</SelectItem>
                <SelectItem key="active" value="active">Active</SelectItem>
                <SelectItem key="acknowledged" value="acknowledged">Acquittée</SelectItem>
                <SelectItem key="resolved" value="resolved">Résolue</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Table des alertes */}
        <Card>
          <CardBody>
            <Table
              aria-label="Alertes"
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
                <TableColumn>TYPE</TableColumn>
                <TableColumn>MESSAGE</TableColumn>
                <TableColumn>SÉVÉRITÉ</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                items={alerts}
                isLoading={isLoading}
                loadingContent={<Spinner />}
                emptyContent="Aucune alerte"
              >
                {(alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {ALERT_TYPES.find(t => t.value === alert.type)?.label || alert.type}
                      </Chip>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="truncate">{alert.message}</p>
                    </TableCell>
                    <TableCell>
                      <Chip color={SEVERITY_COLORS[alert.severity]} variant="flat" size="sm">
                        {alert.severity}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDateToFrench(alert.created_at)}</span>
                    </TableCell>
                    <TableCell>
                      <Chip color={STATUS_COLORS[alert.status]} variant="flat" size="sm">
                        {alert.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {alert.status === "active" && (
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => handleAcknowledge(alert.id)}
                          >
                            <FiCheck />
                          </Button>
                        )}
                        {(alert.status === "active" || alert.status === "acknowledged") && (
                          <Button
                            isIconOnly
                            size="sm"
                            color="success"
                            variant="flat"
                            onPress={() => openResolveModal(alert)}
                          >
                            <FiX />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Modal Résolution */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader>Résoudre l'Alerte</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <p className="text-sm text-default-500">{selectedAlert?.message}</p>
                <Textarea
                  label="Action corrective / Résolution"
                  placeholder="Décrivez l'action prise pour résoudre cette alerte..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  minRows={4}
                  isRequired
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>Annuler</Button>
              <Button
                color="success"
                onPress={handleResolve}
                isLoading={resolveMutation.isPending}
              >
                Résoudre
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Configuration des Seuils */}
        <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="2xl">
          <ModalContent>
            <ModalHeader>Configuration des Seuils d'Alerte</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {(thresholds || []).map(threshold => (
                  <Card key={threshold.id}>
                    <CardBody>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {ALERT_TYPES.find(t => t.value === threshold.type)?.label}
                          </p>
                          <p className="text-sm text-default-500">
                            Seuil actuel: {threshold.threshold_value}
                            {threshold.unit}
                          </p>
                        </div>
                        <Button isIconOnly size="sm" variant="light">
                          <FiSettings />
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onSettingsClose}>Fermer</Button>
              <Button color="danger">Sauvegarder</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
