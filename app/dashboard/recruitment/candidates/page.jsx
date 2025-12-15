"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  User,
  Progress,
} from "@nextui-org/react";
import { FiPlus, FiSearch, FiMoreVertical, FiEye, FiCalendar, FiStar, FiFileText } from "react-icons/fi";
import { useGetCandidates } from "@/src/hooks/useRecruitment";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";

const STATUS_COLORS = {
  new: "primary",
  screening: "warning",
  interview_scheduled: "secondary",
  interviewed: "secondary",
  shortlisted: "success",
  offer_made: "success",
  hired: "success",
  rejected: "danger",
  withdrawn: "default",
};

const STATUS_LABELS = {
  new: "Nouveau",
  screening: "Présélection",
  interview_scheduled: "Entretien Planifié",
  interviewed: "Interviewé",
  shortlisted: "Liste Restreinte",
  offer_made: "Offre Faite",
  hired: "Embauché",
  rejected: "Rejeté",
  withdrawn: "Retiré",
};

export default function CandidatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");

  const [filters, setFilters] = useState({
    job_opening_id: jobId || "",
    status: "",
  });

  const { data: candidates, isLoading } = useGetCandidates(filters);

  const getScoreColor = (score) => {
    if (!score) return "default";
    if (score >= 8) return "success";
    if (score >= 6) return "warning";
    return "danger";
  };

  return (
    <PermissionGuard requiredPermission="recruitment_manage">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Candidatures</h1>
            <p className="text-default-500">Gérez vos candidats et leur processus de sélection</p>
          </div>
          <Button color="primary" startContent={<FiPlus />}>
            Ajouter Candidat
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{candidates?.filter(c => c.status === "new").length || 0}</p>
              <p className="text-xs text-default-500">Nouveaux</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{candidates?.filter(c => c.status === "screening").length || 0}</p>
              <p className="text-xs text-default-500">Présélection</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">
                {candidates?.filter(c => c.status === "interview_scheduled" || c.status === "interviewed").length || 0}
              </p>
              <p className="text-xs text-default-500">Entretiens</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{candidates?.filter(c => c.status === "shortlisted").length || 0}</p>
              <p className="text-xs text-default-500">Liste Restreinte</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold">{candidates?.filter(c => c.status === "hired").length || 0}</p>
              <p className="text-xs text-default-500">Embauchés</p>
            </CardBody>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex gap-4">
              <Input
                placeholder="Rechercher par nom, email..."
                startContent={<FiSearch />}
                className="flex-1"
              />

              <Select
                label="Statut"
                placeholder="Tous les statuts"
                selectedKeys={filters.status ? [filters.status] : []}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-56"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </Select>

              <Button variant="flat" onPress={() => setFilters({ job_opening_id: "", status: "" })}>
                Réinitialiser
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Table */}
        <Card>
          <CardBody>
            <Table aria-label="Candidats">
              <TableHeader>
                <TableColumn>CANDIDAT</TableColumn>
                <TableColumn>POSTE</TableColumn>
                <TableColumn>DATE CANDIDATURE</TableColumn>
                <TableColumn>ENTRETIENS</TableColumn>
                <TableColumn>SCORE</TableColumn>
                <TableColumn>STATUT</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody
                items={candidates || []}
                isLoading={isLoading}
                loadingContent={<Spinner label="Chargement..." />}
                emptyContent="Aucun candidat trouvé"
              >
                {(candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <User
                        name={`${candidate.first_name} ${candidate.last_name}`}
                        description={candidate.email}
                        avatarProps={{
                          name: `${candidate.first_name?.[0]}${candidate.last_name?.[0]}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-sm">{candidate.job_opening?.title}</p>
                        <p className="text-xs text-default-400">{candidate.job_opening?.job_number}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {candidate.application_date
                        ? new Date(candidate.application_date).toLocaleDateString("fr-FR")
                        : "-"}
                    </TableCell>
                    <TableCell>{candidate.interviews?.[0]?.count || 0}</TableCell>
                    <TableCell>
                      {candidate.overall_score ? (
                        <div className="flex items-center gap-2">
                          <Progress
                            value={candidate.overall_score * 10}
                            color={getScoreColor(candidate.overall_score)}
                            size="sm"
                            className="w-20"
                          />
                          <span className="text-sm">{candidate.overall_score}/10</span>
                        </div>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip color={STATUS_COLORS[candidate.status]} variant="flat" size="sm">
                        {STATUS_LABELS[candidate.status]}
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
                            onPress={() => router.push(`/dashboard/recruitment/candidates/${candidate.id}`)}
                          >
                            Voir profil
                          </DropdownItem>
                          <DropdownItem key="interview" startContent={<FiCalendar />}>
                            Planifier entretien
                          </DropdownItem>
                          <DropdownItem key="evaluate" startContent={<FiStar />}>
                            Évaluer
                          </DropdownItem>
                          <DropdownItem key="offer" startContent={<FiFileText />}>
                            Faire une offre
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
