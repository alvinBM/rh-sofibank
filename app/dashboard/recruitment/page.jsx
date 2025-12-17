"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Button,
  Progress,
  Avatar,
  Divider,
} from "@nextui-org/react";
import {
  FiBriefcase,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiCheckCircle,
  FiTrendingUp,
  FiClock,
  FiArrowRight,
  FiActivity,
} from "react-icons/fi";
import { useGetRecruitmentStatistics, useGetJobApplications } from "@/src/hooks/useRecruitment";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function RecruitmentDashboard() {
  const { data: stats, isLoading } = useGetRecruitmentStatistics();
  const { data: recentApplications } = useGetJobApplications({ 
    limit: 10, 
    sort: "created_at",
    order: "desc" 
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Offres Actives",
      value: stats?.activePostings || 0,
      icon: <FiBriefcase className="text-2xl" />,
      color: "primary",
      href: "/dashboard/recruitment/jobs",
      trend: "+12%",
    },
    {
      title: "Candidatures",
      value: stats?.applicationsByStatus?.reduce((acc, curr) => acc + parseInt(curr.count), 0) || 0,
      icon: <FiUsers className="text-2xl" />,
      color: "secondary",
      href: "/dashboard/recruitment/candidates",
      trend: "+8%",
    },
    {
      title: "Entretiens",
      value: stats?.upcomingInterviews || 0,
      icon: <FiCalendar className="text-2xl" />,
      color: "warning",
      href: "/dashboard/recruitment/interviews",
      trend: "+5%",
    },
    {
      title: "Offres Envoyées",
      value: stats?.pendingOffers || 0,
      icon: <FiFileText className="text-2xl" />,
      color: "success",
      href: "/dashboard/recruitment/offers",
      trend: "+15%",
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      new: "primary",
      screening: "secondary",
      interview: "warning",
      offer: "success",
      hired: "success",
      rejected: "danger",
      withdrawn: "default",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: "Nouveau",
      screening: "Présélection",
      interview: "Entretien",
      offer: "Offre",
      hired: "Embauché",
      rejected: "Rejeté",
      withdrawn: "Retiré",
    };
    return labels[status] || status;
  };

  // Prepare chart data
  const applicationStatusData = stats?.applicationsByStatus?.map((item) => ({
    name: getStatusLabel(item.status),
    value: parseInt(item.count),
    color: getStatusColor(item.status),
  })) || [];

  const COLORS = {
    primary: "#0070F3",
    secondary: "#7928CA",
    warning: "#F5A524",
    success: "#17C964",
    danger: "#F31260",
    default: "#A1A1AA",
  };

  // Mock data for timeline (you can replace with real data)
  const timelineData = [
    { month: "Jan", candidatures: 45, entretiens: 20, embauches: 8 },
    { month: "Fév", candidatures: 52, entretiens: 25, embauches: 10 },
    { month: "Mar", candidatures: 48, entretiens: 22, embauches: 9 },
    { month: "Avr", candidatures: 61, entretiens: 30, embauches: 12 },
    { month: "Mai", candidatures: 55, entretiens: 28, embauches: 11 },
    { month: "Juin", candidatures: 70, entretiens: 35, embauches: 15 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord - Recrutement</h1>
        <p className="text-gray-500 mt-1">
          Vue d'ensemble de vos activités de recrutement
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Stats & Charts (8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((card, index) => (
              <Link key={index} href={card.href}>
                <Card
                  isPressable
                  isHoverable
                  className="border-none hover:scale-105 transition-transform w-full shadow-none"
                >
                  <CardBody>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                        <p className="text-3xl font-bold">{card.value}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <FiTrendingUp className="text-success text-sm" />
                          <span className="text-success text-xs font-semibold">
                            {card.trend}
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-xl bg-${card.color}/10 text-${card.color}`}>
                        {card.icon}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Applications Status Pie Chart */}
            <Card className="shadow-none">
              <CardHeader>
                <h3 className="text-lg font-semibold">Répartition des Candidatures</h3>
              </CardHeader>
              <CardBody>
                {applicationStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={applicationStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {applicationStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[entry.color] || COLORS.default}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Aucune donnée disponible</p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Timeline Bar Chart */}
            <Card className="shadow-none">
              <CardHeader>
                <h3 className="text-lg font-semibold">Évolution Mensuelle</h3>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="candidatures" fill={COLORS.primary} name="Candidatures" />
                    <Bar dataKey="entretiens" fill={COLORS.warning} name="Entretiens" />
                    <Bar dataKey="embauches" fill={COLORS.success} name="Embauches" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card className="shadow-none">
            <CardHeader>
              <h3 className="text-lg font-semibold">Entonnoir de Conversion</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {[
                  { label: "Candidatures reçues", value: 156, percentage: 100, color: "primary" },
                  { label: "Présélection", value: 89, percentage: 57, color: "secondary" },
                  { label: "Entretiens", value: 45, percentage: 29, color: "warning" },
                  { label: "Offres envoyées", value: 18, percentage: 12, color: "success" },
                  { label: "Embauches", value: 12, percentage: 8, color: "success" },
                ].map((stage, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{stage.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{stage.value}</span>
                        <Chip size="sm" variant="flat" color={stage.color}>
                          {stage.percentage}%
                        </Chip>
                      </div>
                    </div>
                    <Progress
                      value={stage.percentage}
                      color={stage.color}
                      className="max-w-full"
                    />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Activity Feed & Quick Actions (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Actions Rapides</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              <Link href="/dashboard/recruitment/plans">
                <Button
                  fullWidth
                  variant="solid"
                  color="default"
                  startContent={<FiBriefcase />}
                  className="justify-start"
                >
                  Créer un plan de recrutement
                </Button>
              </Link>
              <Link href="/dashboard/recruitment/jobs">
                <Button
                  fullWidth
                  variant="solid"
                  color="default"
                  startContent={<FiFileText />}
                  className="justify-start"
                >
                  Publier une offre d'emploi
                </Button>
              </Link>
              <Link href="/dashboard/recruitment/interviews">
                <Button
                  fullWidth
                  variant="solid"
                  color="default"
                  startContent={<FiCalendar />}
                  className="justify-start"
                >
                  Programmer un entretien
                </Button>
              </Link>
              <Link href="/dashboard/recruitment/candidates">
                <Button
                  fullWidth
                  variant="solid"
                  color="default"
                  startContent={<FiUsers />}
                  className="justify-start"
                >
                  Voir les candidatures
                </Button>
              </Link>
            </CardBody>
          </Card>

          {/* Activity Feed */}
          <Card className="max-h-[600px] overflow-hidden">
            <CardHeader className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FiActivity />
                Activités Récentes
              </h3>
            </CardHeader>
            <Divider />
            <CardBody className="overflow-y-auto space-y-4">
              {recentApplications && recentApplications.length > 0 ? (
                recentApplications.map((application, index) => (
                  <div key={index}>
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={application.profile_picture}
                        name={application.first_name?.[0]}
                        size="sm"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                              {application.first_name} {application.last_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {application.job_posting?.job_title}
                            </p>
                          </div>
                          <Chip
                            size="sm"
                            color={getStatusColor(application.status)}
                            variant="flat"
                          >
                            {getStatusLabel(application.status)}
                          </Chip>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <FiClock className="text-xs text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {new Date(application.applied_date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {index < recentApplications.length - 1 && <Divider className="mt-4" />}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiActivity className="mx-auto text-4xl text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Aucune activité récente</p>
                </div>
              )}

              {recentApplications && recentApplications.length > 0 && (
                <Link href="/dashboard/recruitment/candidates">
                  <Button
                    fullWidth
                    variant="light"
                    color="primary"
                    endContent={<FiArrowRight />}
                    className="mt-4"
                  >
                    Voir toutes les candidatures
                  </Button>
                </Link>
              )}
            </CardBody>
          </Card>

          {/* Onboarding Progress */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Intégrations en Cours</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Employés actifs</span>
                  <Chip size="sm" color="success" variant="flat">
                    {stats?.activeOnboarding || 0}
                  </Chip>
                </div>
                <Link href="/dashboard/recruitment/onboarding">
                  <Button
                    fullWidth
                    variant="flat"
                    color="success"
                    startContent={<FiCheckCircle />}
                    endContent={<FiArrowRight />}
                  >
                    Gérer les intégrations
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
