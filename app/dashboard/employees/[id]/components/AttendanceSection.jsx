import React, { useState } from "react";
import { Card, CardBody, Button, Tabs, Tab, Chip } from "@nextui-org/react";
import { FiCalendar, FiList, FiClock } from "react-icons/fi";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from "@fullcalendar/core/locales/fr";

const STATUS_COLORS = {
    present: "success",
    absent: "danger",
    late: "warning",
    on_leave: "primary",
    half_day: "secondary",
    holiday: "default",
};

const STATUS_LABELS = {
    present: "Présent",
    absent: "Absent",
    late: "Retard",
    on_leave: "En congé",
    half_day: "Demi-journée",
    holiday: "Jour férié",
};

const MOVEMENT_TYPES = {
    entry: { label: "Entrée", color: "success", icon: "→" },
    exit: { label: "Sortie", color: "primary", icon: "←" },
};

export default function AttendanceSection({ employeeId, calendarData, movements, summary }) {
    const [viewMode, setViewMode] = useState("calendar");
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Transform calendar data for FullCalendar
    const calendarEvents = (calendarData || []).map((record) => ({
        id: record.id,
        title: STATUS_LABELS[record.status] || record.status,
        date: record.date,
        backgroundColor: getStatusColor(record.status),
        borderColor: getStatusColor(record.status),
        extendedProps: {
            check_in: record.check_in,
            check_out: record.check_out,
            total_hours: record.total_hours,
            is_late: record.is_late,
            late_minutes: record.late_minutes,
        },
    }));

    function getStatusColor(status) {
        const colors = {
            present: "#10b981",
            absent: "#ef4444",
            late: "#f59e0b",
            on_leave: "#3b82f6",
            half_day: "#8b5cf6",
            holiday: "#6b7280",
        };
        return colors[status] || colors.present;
    }

    const formatTime = (time) => {
        if (!time) return "-";
        return time.substring(0, 5); // HH:MM
    };

    return (
        <Card className="mt-4">
            <CardBody>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Présence et Mouvements</h3>
                    <Tabs selectedKey={viewMode} onSelectionChange={setViewMode} size="sm">
                        <Tab
                            key="calendar"
                            title={
                                <div className="flex items-center gap-2">
                                    <FiCalendar />
                                    <span>Calendrier</span>
                                </div>
                            }
                        />
                        <Tab
                            key="list"
                            title={
                                <div className="flex items-center gap-2">
                                    <FiList />
                                    <span>Liste</span>
                                </div>
                            }
                        />
                    </Tabs>
                </div>

                {/* Summary Stats */}
                {summary && (
                    <div className="grid grid-cols-6 gap-3 mb-6">
                        <Card shadow="sm">
                            <CardBody className="text-center py-3">
                                <p className="text-xs text-default-500">Jours travaillés</p>
                                <p className="text-xl font-bold text-success">{summary.working_days || 0}</p>
                            </CardBody>
                        </Card>
                        <Card shadow="sm">
                            <CardBody className="text-center py-3">
                                <p className="text-xs text-default-500">Présences</p>
                                <p className="text-xl font-bold">{summary.present_days || 0}</p>
                            </CardBody>
                        </Card>
                        <Card shadow="sm">
                            <CardBody className="text-center py-3">
                                <p className="text-xs text-default-500">Absences</p>
                                <p className="text-xl font-bold text-danger">{summary.absent_days || 0}</p>
                            </CardBody>
                        </Card>
                        <Card shadow="sm">
                            <CardBody className="text-center py-3">
                                <p className="text-xs text-default-500">Retards</p>
                                <p className="text-xl font-bold text-warning">{summary.late_days || 0}</p>
                            </CardBody>
                        </Card>
                        <Card shadow="sm">
                            <CardBody className="text-center py-3">
                                <p className="text-xs text-default-500">Congés</p>
                                <p className="text-xl font-bold text-primary">{summary.leave_days || 0}</p>
                            </CardBody>
                        </Card>
                        <Card shadow="sm">
                            <CardBody className="text-center py-3">
                                <p className="text-xs text-default-500">Total heures</p>
                                <p className="text-xl font-bold">{Math.round(summary.total_hours || 0)}h</p>
                            </CardBody>
                        </Card>
                    </div>
                )}

                {viewMode === "calendar" ? (
                    <div className="calendar-container">
                        <FullCalendar
                            plugins={[dayGridPlugin]}
                            initialView="dayGridMonth"
                            locale={frLocale}
                            events={calendarEvents}
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "",
                            }}
                            height="auto"
                            eventContent={(eventInfo) => (
                                <div className="p-1 text-xs">
                                    <div className="font-semibold">{eventInfo.event.title}</div>
                                    {eventInfo.event.extendedProps.check_in && (
                                        <div className="text-xs">
                                            {formatTime(eventInfo.event.extendedProps.check_in)} - {formatTime(eventInfo.event.extendedProps.check_out)}
                                        </div>
                                    )}
                                    {eventInfo.event.extendedProps.is_late && <div className="text-xs text-warning">⚠ Retard: {eventInfo.event.extendedProps.late_minutes}min</div>}
                                </div>
                            )}
                        />
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        <h4 className="font-semibold text-sm text-default-500 mb-2">Mouvements récents</h4>
                        {movements && movements.length > 0 ? (
                            movements.map((movement) => (
                                <Card key={movement.id} shadow="sm">
                                    <CardBody>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl">{MOVEMENT_TYPES[movement.type]?.icon}</div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold">{MOVEMENT_TYPES[movement.type]?.label}</p>
                                                        <Chip size="sm" color={MOVEMENT_TYPES[movement.type]?.color} variant="flat">
                                                            {formatTime(movement.time)}
                                                        </Chip>
                                                    </div>
                                                    <p className="text-sm text-default-500">{new Date(movement.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                                                    {movement.type === "entry" && movement.status === "late" && <p className="text-xs text-warning">⚠ Retard de {movement.late_minutes} minutes</p>}
                                                    {movement.type === "exit" && movement.total_hours && <p className="text-xs text-success">✓ Total: {movement.total_hours}h</p>}
                                                </div>
                                            </div>
                                            {movement.type === "entry" && <Chip size="sm" color={movement.status === "late" ? "warning" : "success"} variant="flat">{movement.status === "late" ? "En retard" : "À l'heure"}</Chip>}
                                        </div>
                                    </CardBody>
                                </Card>
                            ))
                        ) : (
                            <p className="text-center text-default-400 py-8">Aucun mouvement enregistré</p>
                        )}
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
