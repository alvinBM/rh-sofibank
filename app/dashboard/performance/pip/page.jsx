"use client";

import React, { useState } from "react";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";
import {
  Card, CardBody, CardHeader, Button, Input, Select, SelectItem, Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell, Spinner, Chip, Pagination, Modal, ModalContent, ModalHeader,
  ModalBody, ModalFooter, useDisclosure, Textarea, Divider
} from "@nextui-org/react";
import { FiPlus, FiEye, FiEdit, FiCheckCircle, FiAlertTriangle, FiSearch } from "react-icons/fi";
import { useGetPIPs, useCreatePIP, useAddPIPFollowUp, useClosePIP } from "@/src/hooks/usePerformance";
import { toast } from "react-toastify";
import { formatDateToFrench } from "@/src/utils/dateUtils";

const STATUS_COLORS = { active: "warning", completed: "success", failed: "danger" };

export default function PIPsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: "active" });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isFollowUpOpen, onOpen: onFollowUpOpen, onClose: onFollowUpClose } = useDisclosure();
  const [selectedPIP, setSelectedPIP] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: "", evaluation_id: "", objectives: "", actions: "", support: "", start_date: "", end_date: ""
  });
  const [followUpData, setFollowUpData] = useState({ comments: "", progress: "" });

  const { data: pipsData, isLoading } = useGetPIPs({ page, rowsPerPage: 10, query: "", filters });
  const createMutation = useCreatePIP();
  const followUpMutation = useAddPIPFollowUp();
  const closeMutation = useClosePIP();

  const pips = pipsData?.pips || [];
  const pages = Math.ceil((pipsData?.total || 0) / 10);

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success("PIP créé");
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la création");
    }
  };

  const handleAddFollowUp = async () => {
    try {
      await followUpMutation.mutateAsync({ pipId: selectedPIP.id, payload: followUpData });
      toast.success("Suivi ajouté");
      onFollowUpClose();
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleClose = async (id, outcome) => {
    if (confirm(`Clôturer ce PIP avec l'issue: ${outcome}?`)) {
      try {
        await closeMutation.mutateAsync({ id, outcome, finalComments: "Clôturé" });
        toast.success("PIP clôturé");
      } catch (error) {
        toast.error("Erreur lors de la clôture");
      }
    }
  };

  return (
    <PermissionGuard module="performance" action="read">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Plans d'Amélioration (PIP)</h1>
            <p className="text-default-500 mt-1">Suivi des plans d'amélioration de performance</p>
          </div>
          <Button color="danger" startContent={<FiPlus />} onPress={onOpen}>
            Nouveau PIP
          </Button>
        </div>

        <Card>
          <CardBody>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Input isClearable placeholder="Rechercher employé..." startContent={<FiSearch />} />
              <Select
                label="Statut"
                selectedKeys={filters.status ? [filters.status] : []}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <SelectItem key="" value="">Tous</SelectItem>
                <SelectItem key="active" value="active">Actif</SelectItem>
                <SelectItem key="completed" value="completed">Complété</SelectItem>
                <SelectItem key="failed" value="failed">Échoué</SelectItem>
              </Select>
            </div>

            <Table
              bottomContent={pages > 1 && (
                <div className="flex w-full justify-center">
                  <Pagination isCompact showControls page={page} total={pages} onChange={setPage} />
                </div>
              )}
            >
              <TableHeader>
                <TableColumn>EMPLOYÉ</TableColumn>
                <TableColumn>ÉVALUATION LIÉE</TableColumn>
                <TableColumn>PÉRIODE</TableColumn>
                <TableColumn>OBJECTIFS</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody items={pips} isLoading={isLoading} loadingContent={<Spinner />} emptyContent="Aucun PIP">
                {(pip) => (
                  <TableRow key={pip.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{pip.employee?.first_name} {pip.employee?.last_name}</p>
                        <p className="text-sm text-default-500">{pip.employee?.department?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {pip.evaluation ? (
                        <Chip size="sm" variant="flat">
                          {pip.evaluation.year} - {pip.evaluation.quarter}
                        </Chip>
                      ) : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDateToFrench(pip.start_date)}</p>
                        <p className="text-default-500">{formatDateToFrench(pip.end_date)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{pip.objectives}</TableCell>
                    <TableCell>
                      <Chip color={STATUS_COLORS[pip.status]} variant="flat" size="sm">
                        {pip.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button isIconOnly size="sm" variant="light" onPress={() => { setSelectedPIP(pip); onFollowUpOpen(); }}>
                          <FiEdit />
                        </Button>
                        {pip.status === "active" && (
                          <>
                            <Button isIconOnly size="sm" color="success" variant="flat" onPress={() => handleClose(pip.id, "improved")}>
                              <FiCheckCircle />
                            </Button>
                            <Button isIconOnly size="sm" color="danger" variant="flat" onPress={() => handleClose(pip.id, "failed")}>
                              <FiAlertTriangle />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        <Modal isOpen={isOpen} onClose={onClose} size="3xl">
          <ModalContent>
            <ModalHeader>Nouveau Plan d'Amélioration (PIP)</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Select label="Employé" placeholder="Sélectionner" isRequired>
                  <SelectItem key="1" value="1">Employé 1</SelectItem>
                </Select>
                <Select label="Évaluation liée" placeholder="Sélectionner (optionnel)">
                  <SelectItem key="1" value="1">2024 - T1</SelectItem>
                </Select>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="date" label="Date début" isRequired />
                  <Input type="date" label="Date fin" isRequired />
                </div>
                <Textarea
                  label="Objectifs d'amélioration"
                  placeholder="Décrivez les objectifs à atteindre..."
                  minRows={3}
                  isRequired
                />
                <Textarea
                  label="Actions à entreprendre"
                  placeholder="Plan d'action détaillé..."
                  minRows={3}
                  isRequired
                />
                <Textarea
                  label="Support nécessaire"
                  placeholder="Formations, mentorat, ressources..."
                  minRows={2}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>Annuler</Button>
              <Button color="danger" onPress={handleCreate} isLoading={createMutation.isPending}>
                Créer PIP
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isFollowUpOpen} onClose={onFollowUpClose}>
          <ModalContent>
            <ModalHeader>Ajouter un Suivi Mensuel</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Textarea
                  label="Progrès observé"
                  placeholder="Décrivez les progrès réalisés..."
                  value={followUpData.progress}
                  onChange={(e) => setFollowUpData({ ...followUpData, progress: e.target.value })}
                  minRows={3}
                />
                <Textarea
                  label="Commentaires"
                  placeholder="Observations et recommandations..."
                  value={followUpData.comments}
                  onChange={(e) => setFollowUpData({ ...followUpData, comments: e.target.value })}
                  minRows={3}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onFollowUpClose}>Annuler</Button>
              <Button color="danger" onPress={handleAddFollowUp} isLoading={followUpMutation.isPending}>
                Ajouter Suivi
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
