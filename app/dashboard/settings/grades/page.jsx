"use client";

import React, { useState, useMemo, useCallback } from "react";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Chip,
  Spinner,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Card,
  CardBody,
} from "@nextui-org/react";
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiMoreVertical, FiDollarSign } from "react-icons/fi";
import { useGetGrades } from "@/src/hooks/useMain";
import {
  useCreateGrade,
  useUpdateGrade,
  useDeleteGrade,
} from "@/src/hooks/useSettings";
import { toast } from "react-toastify";

export default function GradesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    level: 1,
    base_salary: "",
    min_salary: "",
    max_salary: "",
    description: "",
    benefits: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, isLoading, error } = useGetGrades({
    page: 1,
    rowsPerPage: 100,
    query: searchQuery,
  });

  const createGradeMutation = useCreateGrade();
  const updateGradeMutation = useUpdateGrade();
  const deleteGradeMutation = useDeleteGrade();

  const grades = data?.grades || [];

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handleOpenCreate = () => {
    setEditMode(false);
    setSelectedGrade(null);
    setFormData({
      name: "",
      code: "",
      level: 1,
      base_salary: "",
      min_salary: "",
      max_salary: "",
      description: "",
      benefits: "",
    });
    onOpen();
  };

  const handleOpenEdit = (grade) => {
    setEditMode(true);
    setSelectedGrade(grade);
    setFormData({
      name: grade.name || "",
      code: grade.code || "",
      level: grade.level || 1,
      base_salary: grade.base_salary || "",
      min_salary: grade.min_salary || "",
      max_salary: grade.max_salary || "",
      description: grade.description || "",
      benefits: grade.benefits || "",
    });
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        level: Number(formData.level),
        base_salary: formData.base_salary ? Number(formData.base_salary) : null,
        min_salary: formData.min_salary ? Number(formData.min_salary) : null,
        max_salary: formData.max_salary ? Number(formData.max_salary) : null,
      };

      if (editMode && selectedGrade) {
        await updateGradeMutation.mutateAsync({
          gradeId: selectedGrade.id,
          gradeData: payload,
        });
        toast.success("Grade modifié avec succès");
      } else {
        await createGradeMutation.mutateAsync(payload);
        toast.success("Grade créé avec succès");
      }
      onClose();
    } catch (error) {
      toast.error("Erreur: " + error.message);
    }
  };

  const handleDelete = async (gradeId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce grade ?")) {
      try {
        await deleteGradeMutation.mutateAsync(gradeId);
        toast.success("Grade supprimé avec succès");
      } catch (error) {
        toast.error("Erreur: " + error.message);
      }
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount);
  };

  const renderCell = useCallback((grade, columnKey) => {
    switch (columnKey) {
      case "name":
        return (
          <div>
            <p className="font-semibold">{grade.name}</p>
            <p className="text-xs text-default-400">{grade.code}</p>
          </div>
        );
      case "level":
        return (
          <Chip size="sm" variant="flat" color="primary">
            Niveau {grade.level}
          </Chip>
        );
      case "salary_range":
        return (
          <div className="flex flex-col">
            <p className="text-sm font-semibold">{formatCurrency(grade.base_salary)}</p>
            <p className="text-xs text-default-400">
              {formatCurrency(grade.min_salary)} - {formatCurrency(grade.max_salary)}
            </p>
          </div>
        );
      case "description":
        return <span className="text-sm">{grade.description || "-"}</span>;
      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <FiMoreVertical className="text-default-400" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                key="edit"
                startContent={<FiEdit />}
                onPress={() => handleOpenEdit(grade)}
              >
                Modifier
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<FiTrash2 />}
                onPress={() => handleDelete(grade.id)}
              >
                Supprimer
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return grade[columnKey];
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-danger">Erreur lors du chargement des grades</p>
          <p className="text-sm text-default-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermissions={["payroll_settings_manage", "settings_access"]}>
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Grades & Rémunérations</h1>
            <Button
              color="primary"
              startContent={<FiPlus />}
              onPress={handleOpenCreate}
            >
              Nouveau Grade
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardBody className="flex flex-row items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FiDollarSign className="text-primary text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-400">Total Grades</p>
                  <p className="text-2xl font-bold">{grades.length}</p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex flex-row items-center gap-3">
                <div className="p-3 rounded-lg bg-success/10">
                  <FiDollarSign className="text-success text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-400">Salaire Min</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(Math.min(...grades.map(g => g.min_salary || 0)))}
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex flex-row items-center gap-3">
                <div className="p-3 rounded-lg bg-warning/10">
                  <FiDollarSign className="text-warning text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-400">Salaire Max</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(Math.max(...grades.map(g => g.max_salary || 0)))}
                  </p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex flex-row items-center gap-3">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <FiDollarSign className="text-secondary text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-400">Niveaux</p>
                  <p className="text-2xl font-bold">
                    {Math.max(...grades.map(g => g.level || 0))}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="flex gap-3">
            <Input
              isClearable
              placeholder="Rechercher un grade..."
              startContent={<FiSearch />}
              value={searchQuery}
              onValueChange={handleSearchChange}
              className="flex-1"
            />
          </div>

          <Table
            aria-label="Table des grades"
            classNames={{
              wrapper: "min-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn key="name">NOM</TableColumn>
              <TableColumn key="level">NIVEAU</TableColumn>
              <TableColumn key="salary_range">RÉMUNÉRATION</TableColumn>
              <TableColumn key="description">DESCRIPTION</TableColumn>
              <TableColumn key="actions">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              items={grades}
              isLoading={isLoading}
              loadingContent={<Spinner label="Chargement..." />}
              emptyContent="Aucun grade trouvé"
            >
              {(grade) => (
                <TableRow key={grade.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(grade, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal Create/Edit Grade */}
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  {editMode ? "Modifier le grade" : "Nouveau grade"}
                </ModalHeader>
                <ModalBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nom du grade"
                      placeholder="Ex: Cadre Supérieur"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="Code"
                      placeholder="Ex: CS"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      isRequired
                    />
                    <Input
                      label="Niveau"
                      type="number"
                      placeholder="Ex: 5"
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="Salaire de base"
                      type="number"
                      placeholder="Ex: 500000"
                      value={formData.base_salary}
                      onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">XOF</span>
                        </div>
                      }
                    />
                    <Input
                      label="Salaire minimum"
                      type="number"
                      placeholder="Ex: 400000"
                      value={formData.min_salary}
                      onChange={(e) => setFormData({ ...formData, min_salary: e.target.value })}
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">XOF</span>
                        </div>
                      }
                    />
                    <Input
                      label="Salaire maximum"
                      type="number"
                      placeholder="Ex: 600000"
                      value={formData.max_salary}
                      onChange={(e) => setFormData({ ...formData, max_salary: e.target.value })}
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">XOF</span>
                        </div>
                      }
                    />
                    <Input
                      label="Description"
                      placeholder="Description du grade"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="md:col-span-2"
                    />
                    <Input
                      label="Avantages"
                      placeholder="Liste des avantages (séparés par des virgules)"
                      value={formData.benefits}
                      onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                      className="md:col-span-2"
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Annuler
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSubmit}
                    isLoading={createGradeMutation.isLoading || updateGradeMutation.isLoading}
                  >
                    {editMode ? "Modifier" : "Créer"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
