"use client";

import React from "react";
import { Chip } from "@nextui-org/react";
import { FiCheck, FiClock, FiX, FiUser, FiUsers, FiBriefcase, FiFileText } from "react-icons/fi";
import { formatDateTimeToFrench } from "@/src/utils/dateUtils";

const WORKFLOW_STEPS = {
  pending_backup: {
    label: "En attente remplaçant",
    icon: FiUser,
    color: "warning",
  },
  backup_confirmed: {
    label: "Remplaçant confirmé",
    icon: FiCheck,
    color: "success",
  },
  pending_supervisor: {
    label: "En attente superviseur",
    icon: FiBriefcase,
    color: "warning",
  },
  pending_hr: {
    label: "En attente RH",
    icon: FiUsers,
    color: "warning",
  },
  pending_dg: {
    label: "En attente DG",
    icon: FiUsers,
    color: "warning",
  },
  approved: {
    label: "Approuvé",
    icon: FiCheck,
    color: "success",
  },
  rejected: {
    label: "Rejeté",
    icon: FiX,
    color: "danger",
  },
  cancelled: {
    label: "Annulé",
    icon: FiX,
    color: "danger",
  },
};

/**
 * Composant Timeline pour afficher le workflow d'une demande de congé
 */
export default function WorkflowTimeline({ request, approvals = [] }) {
  const currentStatus = request?.workflow_status || request?.status;

  // Déterminer les étapes complétées
  const getStepStatus = (stepKey) => {
    const statusOrder = [
      "pending_backup",
      "backup_confirmed",
      "pending_supervisor",
      "pending_hr",
      "pending_dg",
      "approved",
    ];

    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (currentStatus === "rejected" || currentStatus === "cancelled") {
      return "rejected";
    }

    if (stepIndex < currentIndex) {
      return "completed";
    } else if (stepIndex === currentIndex) {
      return "current";
    } else {
      return "pending";
    }
  };

  // Récupérer l'approbation pour une étape
  const getApprovalForStep = (level) => {
    return approvals.find((approval) => approval.level === level);
  };

  // Définir les étapes du workflow
  const steps = [
    {
      key: "pending_backup",
      level: "backup",
      label: "Remplaçant",
      icon: FiUser,
      timestamp: request?.backup_confirmed_at,
      approver: request?.backup_person,
      comments: getApprovalForStep("backup")?.comments,
    },
    {
      key: "pending_supervisor",
      level: "supervisor",
      label: "Superviseur",
      icon: FiBriefcase,
      timestamp: request?.supervisor_approved_at,
      approver: request?.supervisor,
      comments: request?.supervisor_comments || getApprovalForStep("supervisor")?.comments,
    },
    {
      key: "pending_hr",
      level: currentStatus === "pending_dg" ? "dg" : "hr",
      label: currentStatus === "pending_dg" ? "Direction Générale" : "RH",
      icon: FiUsers,
      timestamp: request?.hr_approved_at,
      comments: request?.hr_comments || getApprovalForStep("hr")?.comments || getApprovalForStep("dg")?.comments,
    },
  ];

  return (
    <div className="w-full py-4">
      <div className="relative">
        {steps.map((step, index) => {
          const status = getStepStatus(step.key);
          const StepIcon = step.icon;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.key} className="relative pb-8">
              {!isLast && (
                <div
                  className={`absolute left-4 top-8 h-full w-0.5 ${
                    status === "completed"
                      ? "bg-success"
                      : status === "current"
                      ? "bg-warning"
                      : "bg-default-200"
                  }`}
                />
              )}

              <div className="flex items-start gap-4">
                {/* Icône de l'étape */}
                <div
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    status === "completed"
                      ? "border-success bg-success text-white"
                      : status === "current"
                      ? "border-warning bg-warning text-white"
                      : status === "rejected"
                      ? "border-danger bg-danger text-white"
                      : "border-default-300 bg-white text-default-400"
                  }`}
                >
                  {status === "completed" ? (
                    <FiCheck className="h-4 w-4" />
                  ) : status === "rejected" ? (
                    <FiX className="h-4 w-4" />
                  ) : status === "current" ? (
                    <FiClock className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>

                {/* Contenu de l'étape */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold">{step.label}</h4>
                    {status === "completed" && (
                      <Chip size="sm" color="success" variant="flat">
                        Approuvé
                      </Chip>
                    )}
                    {status === "current" && (
                      <Chip size="sm" color="warning" variant="flat">
                        En cours
                      </Chip>
                    )}
                    {status === "rejected" && (
                      <Chip size="sm" color="danger" variant="flat">
                        Rejeté
                      </Chip>
                    )}
                  </div>

                  {status === "completed" && step.timestamp && (
                    <p className="text-xs text-default-500 mb-1">
                      {formatDateTimeToFrench(step.timestamp)}
                    </p>
                  )}

                  {status === "completed" && step.approver && (
                    <p className="text-xs text-default-600">
                      Par: {step.approver.first_name} {step.approver.last_name}
                    </p>
                  )}

                  {step.comments && (
                    <div className="mt-2 rounded-lg bg-default-100 p-2">
                      <p className="text-xs text-default-600">
                        <span className="font-semibold">Commentaire:</span> {step.comments}
                      </p>
                    </div>
                  )}

                  {status === "pending" && (
                    <p className="text-xs text-default-400">En attente</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Statut final */}
        {(currentStatus === "approved" || currentStatus === "rejected" || currentStatus === "cancelled") && (
          <div className="flex items-start gap-4">
            <div
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                currentStatus === "approved"
                  ? "border-success bg-success text-white"
                  : "border-danger bg-danger text-white"
              }`}
            >
              {currentStatus === "approved" ? (
                <FiCheck className="h-5 w-5" />
              ) : (
                <FiX className="h-5 w-5" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold">
                  {currentStatus === "approved" ? "Demande approuvée" : "Demande rejetée/annulée"}
                </h4>
                <Chip
                  size="sm"
                  color={currentStatus === "approved" ? "success" : "danger"}
                  variant="flat"
                >
                  {WORKFLOW_STEPS[currentStatus]?.label}
                </Chip>
              </div>

              {request?.rejection_reason && (
                <div className="mt-2 rounded-lg bg-danger-50 p-2">
                  <p className="text-xs text-danger-600">
                    <span className="font-semibold">Raison du rejet:</span> {request.rejection_reason}
                  </p>
                </div>
              )}

              {request?.cancellation_reason && (
                <div className="mt-2 rounded-lg bg-danger-50 p-2">
                  <p className="text-xs text-danger-600">
                    <span className="font-semibold">Raison de l'annulation:</span>{" "}
                    {request.cancellation_reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Document Remise-Reprise */}
      {request?.handover_document_url && (
        <div className="mt-6 rounded-lg border border-default-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiFileText className="h-4 w-4 text-primary" />
            <h5 className="text-sm font-semibold">Feuille de Remise-Reprise</h5>
          </div>
          <a
            href={request.handover_document_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            Voir le document
          </a>
        </div>
      )}
    </div>
  );
}
