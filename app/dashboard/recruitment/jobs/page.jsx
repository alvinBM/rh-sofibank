"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  Badge,
} from "@nextui-org/react";
import { FiPlus, FiSearch, FiMoreVertical, FiEye, FiEdit, FiShare2, FiUsers } from "react-icons/fi";
import { useGetJobOpenings } from "@/src/hooks/useRecruitment";
import { useGetDirections } from "@/src/hooks/useMain";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";

const STATUS_COLORS = {
  draft: "default",
  open: "success",
  closed: "warning",
  filled: "danger",
  cancelled: "danger",
};

const STATUS_LABELS = {
  draft: "Brouillon",
  open: "Ouvert",
  closed: "Fermé",
  filled: "Pourvu",
  cancelled: "Annulé",
};

export default function JobOpeningsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    status: "",
    direction_id: "",
  });

  const { data: jobOpenings, isLoading } = useGetJobOpenings(filters);
  const { data: directionsData } = useGetDirections({ page: 1, rowsPerPage: 100 });

  return (
    <PermissionGuard requiredPermission="recruitment_manage">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Postes Vacants</h1>
            <p className="text-default-500">Gérez vos offres d'emploi et candidatures</p>
          </div>
          <Button color="danger" startContent={<FiPlus />}>
            Nouveau Poste
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{jobOpenings?.filter(j => j.status === "open").length || 0}</p>
              <p className="text-sm text-default-500">Postes Ouverts</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{jobOpenings?.filter(j => j.status === "draft").length || 0}</p>
              <p className="text-sm text-default-500">Brouillons</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">
                {jobOpenings?.reduce((acc, j) => acc + (j.candidates?.[0]?.count || 0), 0) || 0}
              </p>
              <p className="text-sm text-default-500">Candidatures Reçues</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{jobOpenings?.filter(j => j.status === "filled").length || 0}</p>
              <p className="text-sm text-default-500">Postes Pourvus</p>
            </CardBody>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex gap-4">
              <Input
                placeholder="Rechercher par titre..."
                startContent={<FiSearch />}
                className="flex-1"
              />

              <Select
                label="Direction"
                placeholder="Toutes les directions"
                selectedKeys={filters.direction_id ? [filters.direction_id] : []}
                onChange={(e) => setFilters({ ...filters, direction_id: e.target.value })}
                className="w-64"
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
            </div>
          </CardBody>
        </Card>

        {/* Table */}
        <Card>
          <CardBody>
            <Table aria-label="Postes vacants">
              <TableHeader>
                <TableColumn>TITRE</TableColumn>
                <TableColumn>DIRECTION</TableColumn>
                <TableColumn>GRADE</TableColumn>
                <TableColumn>DATE LIMITE</TableColumn>
                <TableColumn>CANDIDATURES</TableColumn>
                <TableColumn>PUBLIÉ</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                items={jobOpenings || []}
                isLoading={isLoading}
                loadingContent={<Spinner label="Chargement..." />}
                emptyContent="Aucun poste trouvé"
              >
                {(job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{job.title}</p>
                        <p className="text-xs text-default-400">{job.job_number}</p>
                      </div>
                    </TableCell>
                    <TableCell>{job.direction?.name || "-"}</TableCell>
                    <TableCell>{job.grade?.name || "-"}</TableCell>
                    <TableCell>
                      {job.closing_date ? new Date(job.closing_date).toLocaleDateString("fr-FR") : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge content={job.candidates?.[0]?.count || 0} color="danger">
                        <FiUsers className="text-default-400" />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {job.is_published ? (
                        <Chip size="sm" color="success" variant="flat">Oui</Chip>
                      ) : (
                        <Chip size="sm" color="default" variant="flat">Non</Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip color={STATUS_COLORS[job.status]} variant="flat" size="sm">
                        {STATUS_LABELS[job.status]}
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
                          <DropdownItem
                            key="view"
                            startContent={<FiEye />}
                            onPress={() => router.push(`/dashboard/recruitment/jobs/${job.id}`)}
                          >
                            Voir détails
                          </DropdownItem>
                          <DropdownItem key="edit" startContent={<FiEdit />}>
                            Modifier
                          </DropdownItem>
                          {!job.is_published && (
                            <DropdownItem key="publish" startContent={<FiShare2 />}>
                              Publier
                            </DropdownItem>
                          )}
                          <DropdownItem
                            key="candidates"
                            startContent={<FiUsers />}
                            onPress={() => router.push(`/dashboard/recruitment/candidates?job=${job.id}`)}
                          >
                            Voir candidatures
                          </DropdownItem>
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
