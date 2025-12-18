import React from "react";
import { Card, CardBody, Button, Chip } from "@nextui-org/react";
import { FiPlus, FiCalendar } from "react-icons/fi";
import { useRouter } from "next/navigation";

const LEAVE_STATUS_COLORS = {
    draft: "default",
    pending_backup: "warning",
    pending_supervisor: "warning",
    pending_hr: "warning",
    pending_dg: "warning",
    approved: "success",
    rejected: "danger",
    cancelled: "default",
};

const LEAVE_STATUS_LABELS = {
    draft: "Brouillon",
    pending_backup: "En attente suppléant",
    pending_supervisor: "En attente superviseur",
    pending_hr: "En attente RH",
    pending_dg: "En attente DG",
    approved: "Approuvé",
    rejected: "Rejeté",
    cancelled: "Annulé",
};

export default function LeaveRequestsSection({ employeeId, leaveRequests }) {
    const router = useRouter();

    const handleCreateRequest = () => {
        router.push(`/dashboard/leave/new?employee_id=${employeeId}`);
    };

    return (
        <Card className="mt-4">
            <CardBody>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Demandes de Congé</h3>
                    <Button color="danger" size="sm" startContent={<FiPlus />} onPress={handleCreateRequest}>
                        Nouvelle Demande
                    </Button>
                </div>

                {leaveRequests && leaveRequests.length > 0 ? (
                    <div className="space-y-3">
                        {leaveRequests.map((request) => (
                            <Card key={request.id} shadow="sm" isPressable onPress={() => router.push(`/dashboard/leave/${request.id}`)}>
                                <CardBody>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <p className="font-semibold">{request.leave_type?.name}</p>
                                                <Chip size="sm" color={LEAVE_STATUS_COLORS[request.status]} variant="flat">
                                                    {LEAVE_STATUS_LABELS[request.status]}
                                                </Chip>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-default-500">
                                                <div className="flex items-center gap-1">
                                                    <FiCalendar size={14} />
                                                    <span>
                                                        Du {new Date(request.start_date).toLocaleDateString("fr-FR")} au {new Date(request.end_date).toLocaleDateString("fr-FR")}
                                                    </span>
                                                </div>
                                                <span>•</span>
                                                <span className="font-semibold">{request.total_days} jour(s)</span>
                                            </div>
                                            {request.reason && <p className="text-sm text-default-500 mt-2 line-clamp-2">{request.reason}</p>}
                                            <p className="text-xs text-default-400 mt-2">Demande #{request.request_number}</p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-default-400 py-8">Aucune demande de congé</p>
                )}
            </CardBody>
        </Card>
    );
}
