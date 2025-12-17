"use client";

import React, { useState } from "react";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";
import {
  Card, CardBody, Button, Input, Select, SelectItem, Tabs, Tab, Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell, Spinner, Chip, Pagination, Modal, ModalContent, ModalHeader,
  ModalBody, ModalFooter, useDisclosure, Textarea, Divider
} from "@nextui-org/react";
import { FiPlus, FiEye, FiEdit, FiCheck, FiSearch, FiUsers } from "react-icons/fi";
import { useGetEvaluations, useCreateEvaluation, useSubmitSelfEvaluation, useApproveEvaluationByDG } from "@/src/hooks/usePerformance";
import { toast } from "react-toastify";

const STATUS_COLORS = {
  draft: "default", self_evaluation: "warning", supervisor_review: "danger", 
  hr_review: "secondary", dg_approval: "warning", completed: "success"
};

const QUARTERS = [
  { value: "T1", label: "Trimestre 1 (T1)" }, { value: "T2", label: "Trimestre 2 (T2)" },
  { value: "T3", label: "Trimestre 3 (T3)" }, { value: "T4", label: "Trimestre 4 (T4)" }
];

export default function EvaluationsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ year: new Date().getFullYear(), quarter: "", status: "" });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState({ employee_id: "", year: filters.year, quarter: "T1" });

  const { data: evalsData, isLoading } = useGetEvaluations({
    page, rowsPerPage: 10, query: "", filters
  });

  const createMutation = useCreateEvaluation();
  const evaluations = evalsData?.evaluations || [];
  const pages = Math.ceil((evalsData?.total || 0) / 10);

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Évaluation créée");
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la création");
    }
  };

  return (
    <PermissionGuard module="performance" action="read">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Évaluations 360°</h1>
            <p className="text-default-500 mt-1">Gestion des évaluations de performance</p>
          </div>
          <Button color="danger" startContent={<FiPlus />} onPress={onOpen}>
            Nouvelle Évaluation
          </Button>
        </div>

        <Card>
          <CardBody>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <Input isClearable placeholder="Rechercher..." startContent={<FiSearch />} />
              <Select label="Année" selectedKeys={[filters.year.toString()]}>
                {[2023, 2024, 2025].map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </Select>
              <Select label="Trimestre" placeholder="Tous">
                <SelectItem key="" value="">Tous</SelectItem>
                {QUARTERS.map(q => <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>)}
              </Select>
              <Select label="Statut" placeholder="Tous">
                <SelectItem key="" value="">Tous</SelectItem>
                <SelectItem key="draft">Brouillon</SelectItem>
                <SelectItem key="completed">Complété</SelectItem>
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
                <TableColumn>PÉRIODE</TableColumn>
                <TableColumn>ANNÉE</TableColumn>
                <TableColumn>SCORE GLOBAL</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody items={evaluations} isLoading={isLoading} loadingContent={<Spinner />} emptyContent="Aucune évaluation">
                {(evaluation) => (
                  <TableRow key={evaluation.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{evaluation.employee?.first_name} {evaluation.employee?.last_name}</p>
                        <p className="text-sm text-default-500">{evaluation.employee?.department?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell><Chip size="sm" variant="flat">{evaluation.quarter}</Chip></TableCell>
                    <TableCell>{evaluation.year}</TableCell>
                    <TableCell>
                      <Chip color={evaluation.final_score >= 80 ? "success" : evaluation.final_score >= 60 ? "warning" : "danger"}>
                        {evaluation.final_score || "N/A"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip color={STATUS_COLORS[evaluation.status]} variant="flat" size="sm">{evaluation.status}</Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button isIconOnly size="sm" variant="light"><FiEye /></Button>
                        <Button isIconOnly size="sm" variant="light"><FiEdit /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            <ModalHeader>Nouvelle Évaluation</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Select label="Employé" placeholder="Sélectionner" isRequired>
                  <SelectItem key="1" value="1">Employé 1</SelectItem>
                </Select>
                <Select label="Année" selectedKeys={[formData.year.toString()]} isRequired>
                  {[2024, 2025].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </Select>
                <Select label="Trimestre" placeholder="Sélectionner" isRequired>
                  {QUARTERS.map(q => <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>)}
                </Select>
                <p className="text-sm text-default-500">
                  Processus: Auto-évaluation → Supérieur N1 → Supérieur N2 → Pairs → RH → DG
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>Annuler</Button>
              <Button color="danger" onPress={handleCreate} isLoading={createMutation.isPending}>
                Créer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
