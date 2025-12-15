"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import { FiPlus, FiSearch, FiMoreVertical, FiEye, FiEdit, FiCheckCircle } from "react-icons/fi";
import { useGetWorkforcePlannings } from "@/src/hooks/useRecruitment";
import { useGetDirections } from "@/src/hooks/useMain";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";

const STATUS_COLORS = {
  draft: "default",
  submitted: "primary",
  hr_review: "warning",
  dg_approval: "warning",
  approved: "success",
  rejected: "danger",
};

const STATUS_LABELS = {
  draft: "Brouillon",
  submitted: "Soumis",
  hr_review: "Revue RH",
  dg_approval: "Approbation DG",
  approved: "Approuvé",
  rejected: "Rejeté",
};

export default function WorkforcePlanningPage() {
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    direction_id: "",
    status: "",
  });

  const { data: plannings, isLoading } = useGetWorkforcePlannings(filters);
  const { data: directionsData } = useGetDirections({ page: 1, rowsPerPage: 100 });

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i);

  return (
    <PermissionGuard requiredPermission="recruitment_manage">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Planification Annuelle des Besoins</h1>
            <p className="text-default-500">Gérez les besoins en personnel par Direction</p>
          </div>
          <Button color="primary" startContent={<FiPlus />}>
            Nouveau Plan
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex gap-4">
              <Select
                label="Année"
                selectedKeys={[String(filters.year)]}
                onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}
                className="w-32"
              >
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Direction"
                placeholder="Toutes les directions"
                selectedKeys={filters.direction_id ? [filters.direction_id] : []}
                onChange={(e) => setFilters({ ...filters, direction_id: e.target.value })}
                className="flex-1"
              >
                {(directionsData?.directions || []).map((direction) => (
                  <SelectItem key={direction.id} value={direction.id}>
                    {direction.name}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Statut"
                placeholder="Tous les statuts"
                selectedKeys={filters.status ? [filters.status] : []}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-48"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </Select>

              <Button
                variant="flat"
                onPress={() => setFilters({ year: new Date().getFullYear(), direction_id: "", status: "" })}
              >
                Réinitialiser
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Table */}
        <Card>
          <CardBody>
            <Table aria-label="Plans de besoins en personnel">
              <TableHeader>
                <TableColumn>NUMÉRO</TableColumn>
                <TableColumn>ANNÉE</TableColumn>
                <TableColumn>DIRECTION</TableColumn>
                <TableColumn>POSTES DEMANDÉS</TableColumn>
                <TableColumn>BUDGET ESTIMÉ</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                items={plannings || []}
                isLoading={isLoading}
                loadingContent={<Spinner label="Chargement..." />}
                emptyContent="Aucun plan trouvé"
              >
                {(planning) => (
                  <TableRow key={planning.id}>
                    <TableCell>{planning.planning_number}</TableCell>
                    <TableCell>{planning.year}</TableCell>
                    <TableCell>{planning.direction?.name || "-"}</TableCell>
                    <TableCell>{planning.total_positions_requested || 0}</TableCell>
                    <TableCell>{planning.total_budget_estimated?.toLocaleString() || "0"} FC</TableCell>
                    <TableCell>
                      <Chip color={STATUS_COLORS[planning.status]} variant="flat" size="sm">
                        {STATUS_LABELS[planning.status]}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <FiMoreVertical />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem key="view" startContent={<FiEye />}>
                            Voir détails
                          </DropdownItem>
                          <DropdownItem key="edit" startContent={<FiEdit />}>
                            Modifier
                          </DropdownItem>
                          {planning.status === "submitted" && (
                            <DropdownItem key="approve" startContent={<FiCheckCircle />}>
                              Approuver
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </PermissionGuard>
  );
}
