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
  User,
  Pagination,
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
import { FiSearch, FiPlus, FiEdit, FiEye, FiTrash2, FiMoreVertical } from "react-icons/fi";
import { useGetEmployees } from "@/src/hooks/useEmployees";
import { useGetDirections, useGetServices } from "@/src/hooks/useMain";
import { toast } from "react-toastify";

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "active", label: "Actif" },
  { value: "inactive", label: "Inactif" },
  { value: "on_leave", label: "En congé" },
  { value: "suspended", label: "Suspendu" },
  { value: "terminated", label: "Terminé" },
];

const EMPLOYMENT_STATUS_COLORS = {
  active: "success",
  inactive: "default",
  on_leave: "warning",
  suspended: "danger",
  terminated: "danger",
};

export default function EmployeesPage() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    direction_id: "",
    service_id: "",
    employment_status: "",
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: directionsData } = useGetDirections({ page: 1, rowsPerPage: 100 });
  const { data: servicesData } = useGetServices({ page: 1, rowsPerPage: 100 });

  const { data, isLoading, error } = useGetEmployees({
    page,
    rowsPerPage,
    query: searchQuery,
    filters,
  });

  const employees = data?.employees || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / rowsPerPage);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      direction_id: "",
      service_id: "",
      employment_status: "",
    });
    setSearchQuery("");
    setPage(1);
  }, []);

  const handleViewEmployee = useCallback((employee) => {
    setSelectedEmployee(employee);
    onOpen();
  }, [onOpen]);

  const renderCell = useCallback((employee, columnKey) => {
    switch (columnKey) {
      case "employee":
        return (
          <User
            name={`${employee.first_name} ${employee.last_name}`}
            description={employee.employee_number}
            avatarProps={{
              src: employee.photo_url,
              name: `${employee.first_name?.[0]}${employee.last_name?.[0]}`,
            }}
          />
        );
      case "email":
        return (
          <div className="flex flex-col">
            <p className="text-sm">{employee.email}</p>
            <p className="text-xs text-default-400">{employee.phone_number}</p>
          </div>
        );
      case "direction":
        return (
          <div className="flex flex-col">
            <p className="text-sm">{employee.direction?.name || "-"}</p>
            <p className="text-xs text-default-400">{employee.service?.name || "-"}</p>
          </div>
        );
      case "job_position":
        return (
          <div className="flex flex-col">
            <p className="text-sm">{employee.job_position?.title || "-"}</p>
            <p className="text-xs text-default-400">{employee.grade?.name || "-"}</p>
          </div>
        );
      case "employment_status":
        return (
          <Chip
            color={EMPLOYMENT_STATUS_COLORS[employee.employment_status] || "default"}
            variant="flat"
            size="sm"
          >
            {EMPLOYMENT_STATUS_OPTIONS.find(opt => opt.value === employee.employment_status)?.label || employee.employment_status}
          </Chip>
        );
      case "hire_date":
        return new Date(employee.hire_date).toLocaleDateString("fr-FR");
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
                key="view"
                startContent={<FiEye />}
                onPress={() => handleViewEmployee(employee)}
              >
                Voir détails
              </DropdownItem>
              <DropdownItem
                key="edit"
                startContent={<FiEdit />}
              >
                Modifier
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<FiTrash2 />}
              >
                Supprimer
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return employee[columnKey];
    }
  }, [handleViewEmployee]);

  const topContent = useMemo(() => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Employés</h1>
        <Button
          color="primary"
          startContent={<FiPlus />}
        >
          Nouvel Employé
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          isClearable
          placeholder="Rechercher par nom, email, matricule..."
          startContent={<FiSearch />}
          value={searchQuery}
          onValueChange={handleSearchChange}
          className="flex-1"
        />

        <Select
          placeholder="Direction"
          selectedKeys={filters.direction_id ? [filters.direction_id] : []}
          onChange={(e) => handleFilterChange("direction_id", e.target.value)}
          className="w-full sm:w-48"
        >
          {(directionsData?.directions || []).map((direction) => (
            <SelectItem key={direction.id} value={direction.id}>
              {direction.name}
            </SelectItem>
          ))}
        </Select>

        <Select
          placeholder="Service"
          selectedKeys={filters.service_id ? [filters.service_id] : []}
          onChange={(e) => handleFilterChange("service_id", e.target.value)}
          className="w-full sm:w-48"
        >
          {(servicesData?.services || []).map((service) => (
            <SelectItem key={service.id} value={service.id}>
              {service.name}
            </SelectItem>
          ))}
        </Select>

        <Select
          placeholder="Statut"
          selectedKeys={filters.employment_status ? [filters.employment_status] : []}
          onChange={(e) => handleFilterChange("employment_status", e.target.value)}
          className="w-full sm:w-48"
        >
          {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>

        <Button
          variant="flat"
          onPress={handleClearFilters}
        >
          Réinitialiser
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-default-400 text-sm">
          Total: {total} employé(s)
        </span>
        <Select
          label="Lignes par page"
          size="sm"
          selectedKeys={[String(rowsPerPage)]}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(1);
          }}
          className="w-40"
        >
          <SelectItem key="10" value="10">10</SelectItem>
          <SelectItem key="20" value="20">20</SelectItem>
          <SelectItem key="50" value="50">50</SelectItem>
          <SelectItem key="100" value="100">100</SelectItem>
        </Select>
      </div>
    </div>
  ), [
    searchQuery,
    filters,
    directionsData,
    servicesData,
    total,
    rowsPerPage,
    handleSearchChange,
    handleFilterChange,
    handleClearFilters,
  ]);

  const bottomContent = useMemo(() => (
    <div className="flex w-full justify-center">
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={page}
        total={totalPages}
        onChange={setPage}
      />
    </div>
  ), [page, totalPages]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-danger">Erreur lors du chargement des employés</p>
          <p className="text-sm text-default-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="employees_view">
      <div className="p-6">
        <Table
        aria-label="Table des employés"
        topContent={topContent}
        bottomContent={bottomContent}
        classNames={{
          wrapper: "min-h-[400px]",
        }}
      >
        <TableHeader>
          <TableColumn key="employee">EMPLOYÉ</TableColumn>
          <TableColumn key="email">CONTACT</TableColumn>
          <TableColumn key="direction">DIRECTION/SERVICE</TableColumn>
          <TableColumn key="job_position">POSTE/GRADE</TableColumn>
          <TableColumn key="employment_status">STATUT</TableColumn>
          <TableColumn key="hire_date">DATE EMBAUCHE</TableColumn>
          <TableColumn key="actions">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={employees}
          isLoading={isLoading}
          loadingContent={<Spinner label="Chargement..." />}
          emptyContent="Aucun employé trouvé"
        >
          {(employee) => (
            <TableRow key={employee.id}>
              {(columnKey) => (
                <TableCell>{renderCell(employee, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Détails de l&apos;Employé
              </ModalHeader>
              <ModalBody>
                {selectedEmployee && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-default-500">Matricule</p>
                      <p className="font-semibold">{selectedEmployee.employee_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Nom complet</p>
                      <p className="font-semibold">{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Email</p>
                      <p className="font-semibold">{selectedEmployee.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Téléphone</p>
                      <p className="font-semibold">{selectedEmployee.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Direction</p>
                      <p className="font-semibold">{selectedEmployee.direction?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Service</p>
                      <p className="font-semibold">{selectedEmployee.service?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Poste</p>
                      <p className="font-semibold">{selectedEmployee.job_position?.title || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Grade</p>
                      <p className="font-semibold">{selectedEmployee.grade?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Date d&apos;embauche</p>
                      <p className="font-semibold">{new Date(selectedEmployee.hire_date).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Statut</p>
                      <Chip
                        color={EMPLOYMENT_STATUS_COLORS[selectedEmployee.employment_status]}
                        variant="flat"
                      >
                        {EMPLOYMENT_STATUS_OPTIONS.find(opt => opt.value === selectedEmployee.employment_status)?.label}
                      </Chip>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Fermer
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
