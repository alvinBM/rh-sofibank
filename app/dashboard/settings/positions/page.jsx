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
} from "@nextui-org/react";
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiMoreVertical, FiBriefcase } from "react-icons/fi";
import { useGetJobPositions, useGetGrades, useGetDirections, useGetServices } from "@/src/hooks/useMain";
import {
  useCreateJobPosition,
  useUpdateJobPosition,
  useDeleteJobPosition,
} from "@/src/hooks/useSettings";
import { toast } from "react-toastify";

export default function PositionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    grade_id: "",
    department_id: "",
    requirements: "",
    responsibilities: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, isLoading, error } = useGetJobPositions({
    page: 1,
    rowsPerPage: 100,
    query: searchQuery,
  });

  const { data: gradesData } = useGetGrades({ page: 1, rowsPerPage: 100 });
  const { data: directionsData } = useGetDirections({ page: 1, rowsPerPage: 100 });
  const { data: servicesData } = useGetServices({ page: 1, rowsPerPage: 100 });

  const createPositionMutation = useCreateJobPosition();
  const updatePositionMutation = useUpdateJobPosition();
  const deletePositionMutation = useDeleteJobPosition();

  const positions = data?.job_positions || [];
  const grades = gradesData?.grades || [];
  const directions = directionsData?.directions || [];
  const services = servicesData?.services || [];

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handleOpenCreate = () => {
    setEditMode(false);
    setSelectedPosition(null);
    setFormData({
      title: "",
      code: "",
      description: "",
      grade_id: "",
      department_id: "",
      requirements: "",
      responsibilities: "",
    });
    onOpen();
  };

  const handleOpenEdit = (position) => {
    setEditMode(true);
    setSelectedPosition(position);
    setFormData({
      title: position.title || "",
      code: position.code || "",
      description: position.description || "",
      grade_id: position.grade_id || "",
      department_id: position.department_id || "",
      requirements: position.requirements || "",
      responsibilities: position.responsibilities || "",
    });
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        grade_id: formData.grade_id || null,
        department_id: formData.department_id || null,
      };

      if (editMode && selectedPosition) {
        await updatePositionMutation.mutateAsync({
          positionId: selectedPosition.id,
          positionData: payload,
        });
        toast.success("Poste modifié avec succès");
      } else {
        await createPositionMutation.mutateAsync(payload);
        toast.success("Poste créé avec succès");
      }
      onClose();
    } catch (error) {
      toast.error("Erreur: " + error.message);
    }
  };

  const handleDelete = async (positionId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce poste ?")) {
      try {
        await deletePositionMutation.mutateAsync(positionId);
        toast.success("Poste supprimé avec succès");
      } catch (error) {
        toast.error("Erreur: " + error.message);
      }
    }
  };

  const renderCell = useCallback((position, columnKey) => {
    switch (columnKey) {
      case "title":
        return (
          <div className="flex items-center gap-2">
            <FiBriefcase className="text-primary" />
            <div>
              <p className="font-semibold">{position.title}</p>
              <p className="text-xs text-default-400">{position.code}</p>
            </div>
          </div>
        );
      case "grade":
        return position.grade ? (
          <Chip size="sm" variant="flat" color="primary">
            {position.grade.name}
          </Chip>
        ) : (
          <span className="text-default-400">-</span>
        );
      case "department":
        return <span className="text-sm">{position.department?.name || "-"}</span>;
      case "description":
        return (
          <span className="text-sm line-clamp-2">
            {position.description || "-"}
          </span>
        );
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
                onPress={() => handleOpenEdit(position)}
              >
                Modifier
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<FiTrash2 />}
                onPress={() => handleDelete(position.id)}
              >
                Supprimer
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return position[columnKey];
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-danger">Erreur lors du chargement des postes</p>
          <p className="text-sm text-default-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="settings_manage">
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Postes & Fonctions</h1>
            <Button
              color="primary"
              startContent={<FiPlus />}
              onPress={handleOpenCreate}
            >
              Nouveau Poste
            </Button>
          </div>

          <div className="flex gap-3">
            <Input
              isClearable
              placeholder="Rechercher un poste..."
              startContent={<FiSearch />}
              value={searchQuery}
              onValueChange={handleSearchChange}
              className="flex-1"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-default-400 text-sm">
              Total: {positions.length} poste(s)
            </span>
          </div>

          <Table
            aria-label="Table des postes"
            classNames={{
              wrapper: "min-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn key="title">TITRE</TableColumn>
              <TableColumn key="grade">GRADE</TableColumn>
              <TableColumn key="department">DÉPARTEMENT</TableColumn>
              <TableColumn key="description">DESCRIPTION</TableColumn>
              <TableColumn key="actions">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              items={positions}
              isLoading={isLoading}
              loadingContent={<Spinner label="Chargement..." />}
              emptyContent="Aucun poste trouvé"
            >
              {(position) => (
                <TableRow key={position.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(position, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal Create/Edit Position */}
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  {editMode ? "Modifier le poste" : "Nouveau poste"}
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Titre du poste"
                        placeholder="Ex: Directeur Financier"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        isRequired
                      />
                      <Input
                        label="Code"
                        placeholder="Ex: DIR_FIN"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        isRequired
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Grade"
                        placeholder="Sélectionnez un grade"
                        selectedKeys={formData.grade_id ? [formData.grade_id] : []}
                        onChange={(e) => setFormData({ ...formData, grade_id: e.target.value })}
                      >
                        {grades.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id}>
                            {grade.name}
                          </SelectItem>
                        ))}
                      </Select>

                      <Select
                        label="Département"
                        placeholder="Sélectionnez un département"
                        selectedKeys={formData.department_id ? [formData.department_id] : []}
                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      >
                        {[...directions, ...services].map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <Input
                      label="Description"
                      placeholder="Brève description du poste"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Responsabilités</label>
                      <textarea
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        rows="4"
                        placeholder="Liste des responsabilités principales..."
                        value={formData.responsibilities}
                        onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Exigences & Qualifications</label>
                      <textarea
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        rows="4"
                        placeholder="Formation, expérience, compétences requises..."
                        value={formData.requirements}
                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      />
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Annuler
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSubmit}
                    isLoading={createPositionMutation.isLoading || updatePositionMutation.isLoading}
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
