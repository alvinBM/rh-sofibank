"use client";

import React, { useState } from "react";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";
import {
  Card, CardBody, Button, Input, Select, SelectItem, Table, TableHeader, TableColumn,
  TableBody, TableRow, TableCell, Spinner, Chip, Pagination, Modal, ModalContent, ModalHeader,
  ModalBody, ModalFooter, useDisclosure, Textarea
} from "@nextui-org/react";
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiTarget } from "react-icons/fi";
import { useGetKPIs, useCreateKPI, useUpdateKPI, useDeleteKPI } from "@/src/hooks/usePerformance";
import { toast } from "react-toastify";

const CATEGORIES = [
  { value: "financial", label: "Financier" }, { value: "customer", label: "Client" },
  { value: "process", label: "Processus" }, { value: "learning", label: "Apprentissage" }
];

export default function KPIsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ category: "", position: "", is_active: true });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [formData, setFormData] = useState({
    name: "", description: "", category: "", position: "", weight: 0, scale: "", target_value: ""
  });

  const { data: kpisData, isLoading } = useGetKPIs({
    page, rowsPerPage: 10, query: "", filters
  });

  const createMutation = useCreateKPI();
  const updateMutation = useUpdateKPI();
  const deleteMutation = useDeleteKPI();

  const kpis = kpisData?.kpis || [];
  const pages = Math.ceil((kpisData?.total || 0) / 10);

  const handleCreate = () => {
    setFormData({ name: "", description: "", category: "", position: "", weight: 0, scale: "", target_value: "" });
    setSelectedKPI(null);
    onOpen();
  };

  const handleEdit = (kpi) => {
    setFormData(kpi);
    setSelectedKPI(kpi);
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      if (selectedKPI) {
        await updateMutation.mutateAsync({ id: selectedKPI.id, payload: formData });
        toast.success("KPI modifié");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("KPI créé");
      }
      onClose();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Supprimer ce KPI?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("KPI supprimé");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  return (
    <PermissionGuard module="performance" action="read">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">KPIs (Indicateurs de Performance)</h1>
            <p className="text-default-500 mt-1">Configuration des KPIs par fonction/poste</p>
          </div>
          <Button color="primary" startContent={<FiPlus />} onPress={handleCreate}>
            Nouveau KPI
          </Button>
        </div>

        <Card>
          <CardBody>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Input isClearable placeholder="Rechercher..." startContent={<FiSearch />} />
              <Select label="Catégorie" placeholder="Toutes">
                <SelectItem key="" value="">Toutes</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </Select>
              <Select label="Fonction/Poste" placeholder="Tous">
                <SelectItem key="" value="">Tous</SelectItem>
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
                <TableColumn>NOM KPI</TableColumn>
                <TableColumn>CATÉGORIE</TableColumn>
                <TableColumn>FONCTION/POSTE</TableColumn>
                <TableColumn>PONDÉRATION</TableColumn>
                <TableColumn>ÉCHELLE</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody items={kpis} isLoading={isLoading} loadingContent={<Spinner />} emptyContent="Aucun KPI">
                {(kpi) => (
                  <TableRow key={kpi.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{kpi.name}</p>
                        <p className="text-sm text-default-500">{kpi.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">
                        {CATEGORIES.find(c => c.value === kpi.category)?.label || kpi.category}
                      </Chip>
                    </TableCell>
                    <TableCell>{kpi.position || "Tous"}</TableCell>
                    <TableCell>
                      <Chip color="primary" variant="flat">{kpi.weight}%</Chip>
                    </TableCell>
                    <TableCell>{kpi.scale}</TableCell>
                    <TableCell>
                      <Chip color={kpi.is_active ? "success" : "default"} variant="flat" size="sm">
                        {kpi.is_active ? "Actif" : "Inactif"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button isIconOnly size="sm" variant="light" onPress={() => handleEdit(kpi)}>
                          <FiEdit />
                        </Button>
                        <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => handleDelete(kpi.id)}>
                          <FiTrash2 />
                        </Button>
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
            <ModalHeader>{selectedKPI ? "Modifier" : "Nouveau"} KPI</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Nom du KPI"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  isRequired
                />
                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  minRows={2}
                />
                <Select
                  label="Catégorie"
                  selectedKeys={formData.category ? [formData.category] : []}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  isRequired
                >
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </Select>
                <Input
                  label="Fonction/Poste"
                  placeholder="Ex: Directeur Commercial, Manager..."
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
                <Input
                  label="Pondération (%)"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  description="Le total des pondérations doit être 100%"
                  isRequired
                />
                <Input
                  label="Échelle de mesure"
                  placeholder="Ex: 1-5, 0-100%, Nombre..."
                  value={formData.scale}
                  onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                />
                <Input
                  label="Valeur cible"
                  placeholder="Ex: 90%, 5/5, 1000 unités..."
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>Annuler</Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                {selectedKPI ? "Modifier" : "Créer"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
