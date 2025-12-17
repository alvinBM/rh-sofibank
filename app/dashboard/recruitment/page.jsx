"use client";

import React from "react";
import { Card, CardBody, CardHeader, Chip, Spinner } from "@nextui-org/react";
import { 
  FiBriefcase, 
  FiUsers, 
  FiCalendar, 
  FiFileText,
  FiCheckCircle,
  FiClock
} from "react-icons/fi";
import { useGetRecruitmentStatistics } from "@/src/hooks/useRecruitment";
import Link from "next/link";

export default function RecruitmentDashboard() {
  const { data: stats, isLoading } = useGetRecruitmentStatistics();

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
      icon: <FiBriefcase className="text-3xl" />,
      color: "primary",
      href: "/dashboard/recruitment/jobs"
    },
    {
      title: "Candidatures Reçues",
      value: stats?.applicationsByStatus?.reduce((acc, curr) => acc + parseInt(curr.count), 0) || 0,
      icon: <FiUsers className="text-3xl" />,
      color: "secondary",
      href: "/dashboard/recruitment/candidates"
    },
    {
      title: "Entretiens à Venir",
      value: stats?.upcomingInterviews || 0,
      icon: <FiCalendar className="text-3xl" />,
      color: "warning",
      href: "/dashboard/recruitment/interviews"
    },
    {
      title: "Offres en Attente",
      value: stats?.pendingOffers || 0,
      icon: <FiFileText className="text-3xl" />,
      color: "success",
      href: "/dashboard/recruitment/offers"
    },
    {
      title: "Onboarding Actifs",
      value: stats?.activeOnboarding || 0,
      icon: <FiCheckCircle className="text-3xl" />,
      color: "default",
      href: "/dashboard/recruitment/onboarding"
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      new: "primary",
      screening: "secondary",
      shortlisted: "warning",
      interview_scheduled: "warning",
      interviewed: "default",
      offer_pending: "success",
      offer_sent: "success",
      offer_accepted: "success",
      rejected: "danger"
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: "Nouveau",
      screening: "En cours d'analyse",
      shortlisted: "Présélectionné",
      interview_scheduled: "Entretien planifié",
      interviewed: "Entretien passé",
      offer_pending: "Offre en attente",
      offer_sent: "Offre envoyée",
      offer_accepted: "Offre acceptée",
      offer_declined: "Offre refusée",
      rejected: "Rejeté",
      withdrawn: "Retiré"
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tableau de Bord Recrutement</h1>
          <p className="text-sm text-gray-500">
            Vue d'ensemble des activités de recrutement
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, index) => (
          <Link key={index} href={card.href}>
            <Card
              isPressable
              isHoverable
              className="border-none hover:scale-105 transition-transform"
            >
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                  <div className={`text-${card.color}`}>{card.icon}</div>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* Application Status Breakdown */}
      {stats?.applicationsByStatus && stats.applicationsByStatus.length > 0 && (
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Répartition des Candidatures</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.applicationsByStatus.map((item) => (
                <div key={item.status} className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {getStatusLabel(item.status)}
                    </span>
                    <Chip
                      size="sm"
                      color={getStatusColor(item.status)}
                      variant="flat"
                    >
                      {item.count}
                    </Chip>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-${getStatusColor(item.status)}-500 h-2 rounded-full`}
                      style={{
                        width: `${
                          (parseInt(item.count) /
                            stats.applicationsByStatus.reduce(
                              (acc, curr) => acc + parseInt(curr.count),
                              0
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/recruitment/planning">
          <Card isPressable isHoverable className="h-full">
            <CardBody className="flex flex-col items-center justify-center p-6 text-center">
              <FiFileText className="text-4xl text-primary mb-2" />
              <h4 className="font-semibold">Plan de Recrutement</h4>
              <p className="text-sm text-gray-500 mt-1">
                Gérer les besoins annuels
              </p>
            </CardBody>
          </Card>
        </Link>

        <Link href="/dashboard/recruitment/jobs">
          <Card isPressable isHoverable className="h-full">
            <CardBody className="flex flex-col items-center justify-center p-6 text-center">
              <FiBriefcase className="text-4xl text-secondary mb-2" />
              <h4 className="font-semibold">Offres d'Emploi</h4>
              <p className="text-sm text-gray-500 mt-1">
                Publier et gérer les offres
              </p>
            </CardBody>
          </Card>
        </Link>

        <Link href="/dashboard/recruitment/candidates">
          <Card isPressable isHoverable className="h-full">
            <CardBody className="flex flex-col items-center justify-center p-6 text-center">
              <FiUsers className="text-4xl text-warning mb-2" />
              <h4 className="font-semibold">Candidatures</h4>
              <p className="text-sm text-gray-500 mt-1">
                Analyser les candidats
              </p>
            </CardBody>
          </Card>
        </Link>

        <Link href="/dashboard/recruitment/interviews">
          <Card isPressable isHoverable className="h-full">
            <CardBody className="flex flex-col items-center justify-center p-6 text-center">
              <FiCalendar className="text-4xl text-success mb-2" />
              <h4 className="font-semibold">Entretiens</h4>
              <p className="text-sm text-gray-500 mt-1">
                Planifier et évaluer
              </p>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
}
