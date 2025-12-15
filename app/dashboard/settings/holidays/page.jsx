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
  Switch,
  Card,
  CardBody,
} from "@nextui-org/react";
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiMoreVertical, FiCalendar } from "react-icons/fi";
import {
  useGetHolidays,
  useCreateHoliday,
  useUpdateHoliday,
  useDeleteHoliday,
} from "@/src/hooks/useSettings";
import { toast } from "react-toastify";

export default function HolidaysPage() {
  const currentYear = new Date().getFullYear();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    is_recurring: true,
    description: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, isLoading, error } = useGetHolidays({
    page: 1,
    rowsPerPage: 100,
    query: searchQuery,
    year: selectedYear ? Number(selectedYear) : null,
  });

  const createHolidayMutation = useCreateHoliday();
  const updateHolidayMutation = useUpdateHoliday();
  const deleteHolidayMutation = useDeleteHoliday();

  const holidays = data?.holidays || [];

  // Generate year options (current year ± 5 years)
  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  }, [currentYear]);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handleOpenCreate = () => {
    setEditMode(false);
    setSelectedHoliday(null);
    setFormData({
      name: "",
      date: "",
      is_recurring: true,
      description: "",
    });
    onOpen();
  };

  const handleOpenEdit = (holiday) => {
    setEditMode(true);
    setSelectedHoliday(holiday);
    setFormData({
      name: holiday.name || "",
      date: holiday.date || "",
      is_recurring: holiday.is_recurring ?? true,
      description: holiday.description || "",
    });
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      if (editMode && selectedHoliday) {
        await updateHolidayMutation.mutateAsync({
          holidayId: selectedHoliday.id,
          holidayData: formData,
        });
        toast.success("Jour férié modifié avec succès");
      } else {
        await createHolidayMutation.mutateAsync(formData);
        toast.success("Jour férié créé avec succès");
      }
      onClose();
    } catch (error) {
      toast.error("Erreur: " + error.message);
    }
  };

  const handleDelete = async (holidayId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce jour férié ?")) {
      try {
        await deleteHolidayMutation.mutateAsync(holidayId);
        toast.success("Jour férié supprimé avec succès");
      } catch (error) {
        toast.error("Erreur: " + error.message);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMonthName = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      month: "long",
    });
  };

  // Group holidays by month
  const holidaysByMonth = useMemo(() => {
    const grouped = {};
    holidays.forEach((holiday) => {
      const month = getMonthName(holiday.date);
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(holiday);
    });
    return grouped;
  }, [holidays]);

  const renderCell = useCallback((holiday, columnKey) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex items-center gap-2">
            <FiCalendar className="text-primary" />
            <div>
              <p className="font-semibold">{holiday.name}</p>
            </div>
          </div>
        );
      case "date":
        return (
          <div className="flex flex-col">
            <p className="text-sm font-semibold">
              {new Date(holiday.date).toLocaleDateString("fr-FR")}
            </p>
            <p className="text-xs text-default-400">
              {new Date(holiday.date).toLocaleDateString("fr-FR", { weekday: "long" })}
            </p>
          </div>
        );
      case "recurring":
        return holiday.is_recurring ? (
          <Chip size="sm" variant="flat" color="success">
            Récurrent
          </Chip>
        ) : (
          <Chip size="sm" variant="flat" color="default">
            Ponctuel
          </Chip>
        );
      case "description":
        return <span className="text-sm">{holiday.description || "-"}</span>;
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
                onPress={() => handleOpenEdit(holiday)}
              >
                Modifier
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<FiTrash2 />}
                onPress={() => handleDelete(holiday.id)}
              >
                Supprimer
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return holiday[columnKey];
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-danger">Erreur lors du chargement des jours fériés</p>
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
            <h1 className="text-2xl font-bold">Jours Fériés</h1>
            <Button
              color="primary"
              startContent={<FiPlus />}
              onPress={handleOpenCreate}
            >
              Nouveau Jour Férié
            </Button>
          </div>

          <Card>
            <CardBody className="flex flex-row items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <FiCalendar className="text-primary text-2xl" />
              </div>
              <div>
                <p className="text-sm text-default-400">Jours fériés en {selectedYear}</p>
                <p className="text-2xl font-bold">{holidays.length}</p>
              </div>
            </CardBody>
          </Card>

          <div className="flex gap-3">
            <Input
              isClearable
              placeholder="Rechercher un jour férié..."
              startContent={<FiSearch />}
              value={searchQuery}
              onValueChange={handleSearchChange}
              className="flex-1"
            />
            <Select
              label="Année"
              selectedKeys={[selectedYear]}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-40"
            >
              {yearOptions.map((year) => (
                <SelectItem key={String(year)} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </Select>
          </div>

          <Table
            aria-label="Table des jours fériés"
            classNames={{
              wrapper: "min-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn key="name">NOM</TableColumn>
              <TableColumn key="date">DATE</TableColumn>
              <TableColumn key="recurring">TYPE</TableColumn>
              <TableColumn key="description">DESCRIPTION</TableColumn>
              <TableColumn key="actions">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              items={holidays}
              isLoading={isLoading}
              loadingContent={<Spinner label="Chargement..." />}
              emptyContent="Aucun jour férié trouvé"
            >
              {(holiday) => (
                <TableRow key={holiday.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(holiday, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Calendar View by Month */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Vue par mois</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(holidaysByMonth).map(([month, monthHolidays]) => (
                <Card key={month}>
                  <CardBody>
                    <h3 className="text-lg font-bold mb-3 capitalize">{month}</h3>
                    <div className="space-y-2">
                      {monthHolidays.map((holiday) => (
                        <div
                          key={holiday.id}
                          className="flex justify-between items-center p-2 bg-default-100 rounded-lg"
                        >
                          <div>
                            <p className="font-semibold text-sm">{holiday.name}</p>
                            <p className="text-xs text-default-400">
                              {new Date(holiday.date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                weekday: "short",
                              })}
                            </p>
                          </div>
                          {holiday.is_recurring && (
                            <Chip size="sm" variant="flat" color="success">
                              R
                            </Chip>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Create/Edit Holiday */}
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  {editMode ? "Modifier le jour férié" : "Nouveau jour férié"}
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col gap-4">
                    <Input
                      label="Nom du jour férié"
                      placeholder="Ex: Fête de l'Indépendance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="Date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      isRequired
                    />
                    <Switch
                      isSelected={formData.is_recurring}
                      onValueChange={(value) => setFormData({ ...formData, is_recurring: value })}
                    >
                      Jour férié récurrent (se répète chaque année)
                    </Switch>
                    <Input
                      label="Description"
                      placeholder="Description ou note (optionnelle)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    isLoading={createHolidayMutation.isLoading || updateHolidayMutation.isLoading}
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
