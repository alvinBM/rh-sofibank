/**
 * Données fictives pour les tableaux de bord (Admin/RH et Employé) en attendant
 * que les endpoints réels du backend soient exploitables. Toutes les valeurs
 * de ce fichier sont des exemples de démonstration.
 */

export const MONTH_LABELS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

// ==================== JOURS FÉRIÉS LÉGAUX EN RD CONGO ====================
// Liste indicative des jours fériés légaux récurrents en RDC. À terme, cette
// liste doit être gérée depuis Paramétrages > Jours fériés (déjà disponible
// pour les admins) ; elle sert ici de valeur par défaut pour la démonstration.
const RDC_RECURRING_HOLIDAYS = [
    { month: 1, day: 1, name: "Nouvel An" },
    { month: 1, day: 4, name: "Journée des Martyrs de l'Indépendance" },
    { month: 1, day: 16, name: "Anniversaire de la mort de Laurent-Désiré Kabila" },
    { month: 1, day: 17, name: "Anniversaire de la mort de Patrice Émery Lumumba" },
    { month: 5, day: 1, name: "Fête du Travail" },
    { month: 5, day: 17, name: "Fête de la Libération" },
    { month: 6, day: 30, name: "Fête de l'Indépendance" },
    { month: 8, day: 1, name: "Fête des Parents" },
    { month: 12, day: 25, name: "Noël" },
];

const pad2 = (n) => String(n).padStart(2, "0");

export const getRdcPublicHolidays = (year) =>
    RDC_RECURRING_HOLIDAYS.map((h) => ({
        date: `${year}-${pad2(h.month)}-${pad2(h.day)}`,
        name: h.name,
        isRecurring: true,
    })).sort((a, b) => a.date.localeCompare(b.date));

export const getUpcomingHolidays = (fromDate = new Date(), count = 3) => {
    const currentYear = fromDate.getFullYear();
    const all = [...getRdcPublicHolidays(currentYear), ...getRdcPublicHolidays(currentYear + 1)];
    const fromStr = `${fromDate.getFullYear()}-${pad2(fromDate.getMonth() + 1)}-${pad2(fromDate.getDate())}`;

    return all.filter((h) => h.date >= fromStr).slice(0, count);
};

// ==================== DASHBOARD ADMIN / RH ====================

export const getAdminHrDashboardMock = () => {
    const now = new Date();
    const currentMonthIndex = now.getMonth(); // 0-11

    const leaveRequestsByMonth = MONTH_LABELS_FR.map((month, index) => ({
        month,
        demandes: index <= currentMonthIndex ? [8, 6, 11, 9, 14, 10, 13, 0, 0, 0, 0, 0][index] : 0,
        approuvees: index <= currentMonthIndex ? [6, 5, 9, 7, 12, 8, 10, 0, 0, 0, 0, 0][index] : 0,
    }));

    const attendanceRateByMonth = MONTH_LABELS_FR.map((month, index) => ({
        month,
        taux: index <= currentMonthIndex ? [93.2, 94.1, 92.8, 95.0, 94.4, 93.7, 94.8][index] : null,
    })).filter((entry) => entry.taux !== null);

    const headcountTrend = MONTH_LABELS_FR.map((month, index) => ({
        month,
        effectif: index <= currentMonthIndex ? [398, 402, 405, 409, 412, 418, 428][index] : null,
    })).filter((entry) => entry.effectif !== null);

    return {
        kpis: {
            totalEmployees: 428,
            activeEmployees: 402,
            onLeaveToday: 14,
            newHiresThisMonth: 7,
            exitsThisMonth: 2,
            turnoverRate: 4.2,
            pendingLeaveRequests: 11,
            approvedLeaveRequestsThisMonth: 26,
            attendanceRateToday: 94.8,
            absentToday: 9,
            lateToday: 5,
            contractsEndingSoon: 6,
            averageEvaluationScore: 78,
        },
        employeesByDirection: [
            { name: "Direction Exploitation", value: 132 },
            { name: "Direction Financière", value: 84 },
            { name: "Direction Commerciale", value: 76 },
            { name: "Direction des Risques", value: 58 },
            { name: "Direction IT", value: 45 },
            { name: "Direction Générale", value: 33 },
        ],
        employeesByStatus: [
            { name: "Actif", value: 402 },
            { name: "En congé", value: 14 },
            { name: "Suspendu", value: 4 },
            { name: "Inactif", value: 8 },
        ],
        genderDistribution: [
            { name: "Hommes", value: 251 },
            { name: "Femmes", value: 177 },
        ],
        contractTypeDistribution: [
            { name: "CDI", value: 356 },
            { name: "CDD", value: 48 },
            { name: "Stage", value: 16 },
            { name: "Consultant", value: 8 },
        ],
        leaveRequestsByMonth,
        attendanceRateByMonth,
        headcountTrend,
        recentActivity: [
            { id: 1, icon: "solar:user-plus-linear", label: "Nouvel employé intégré", meta: "Grace Mwamba — Direction Commerciale", date: "25 juil. 2026" },
            { id: 2, icon: "solar:calendar-add-linear", label: "Demande de congé soumise", meta: "Jean Kalonji — 5 jours (Congé annuel)", date: "24 juil. 2026" },
            { id: 3, icon: "solar:document-text-linear", label: "Contrat arrivant à échéance", meta: "Chantal Bope — CDD se terminant le 15/08/2026", date: "23 juil. 2026" },
            { id: 4, icon: "solar:wallet-money-linear", label: "Bulletins de paie distribués", meta: "Cycle de juillet 2026 — 428 employés", date: "22 juil. 2026" },
            { id: 5, icon: "solar:clipboard-check-linear", label: "Évaluation de performance complétée", meta: "Didier Mukendi — Score 82/100", date: "21 juil. 2026" },
            { id: 6, icon: "solar:user-check-linear", label: "Candidature retenue", meta: "Poste Analyste Crédit — 2 entretiens planifiés", date: "20 juil. 2026" },
        ],
        alerts: {
            contractsEndingSoon: [
                { employee: "Chantal Bope", position: "Chargée de clientèle", endDate: "2026-08-15" },
                { employee: "Serge Ilunga", position: "Caissier principal", endDate: "2026-08-22" },
                { employee: "Aline Tshimanga", position: "Assistante RH", endDate: "2026-09-01" },
            ],
            probationEnding: [
                { employee: "Grace Mwamba", position: "Chargée Commerciale", endDate: "2026-08-10" },
                { employee: "Patrick Kabeya", position: "Développeur", endDate: "2026-08-18" },
            ],
            missingDocuments: 5,
        },
        topDepartmentsByAbsenteeism: [
            { name: "Direction Exploitation", rate: 6.2 },
            { name: "Direction Commerciale", rate: 5.1 },
            { name: "Direction des Risques", rate: 4.4 },
            { name: "Direction Financière", rate: 3.6 },
            { name: "Direction IT", rate: 2.9 },
        ],
    };
};

// ==================== DASHBOARD EMPLOYÉ (ESS) ====================

export const getEmployeeDashboardMock = (user) => {
    const now = new Date();
    const currentMonthIndex = now.getMonth();

    const firstName = user?.employee?.first_name || user?.firstname || "Cher(ère)";
    const lastName = user?.employee?.last_name || user?.lastname || "Collaborateur(rice)";

    const monthlyPattern = [
        { present: 20, absent: 1, late: 1, conge: 0 },
        { present: 18, absent: 0, late: 2, conge: 0 },
        { present: 15, absent: 0, late: 1, conge: 5 },
        { present: 21, absent: 1, late: 0, conge: 0 },
        { present: 19, absent: 0, late: 1, conge: 1 },
        { present: 20, absent: 0, late: 2, conge: 0 },
        { present: 17, absent: 1, late: 1, conge: 3 },
    ];

    const attendanceByMonth = MONTH_LABELS_FR.map((month, index) => {
        if (index > currentMonthIndex) return { month, present: 0, absent: 0, late: 0, conge: 0 };
        const data = monthlyPattern[index] || { present: 0, absent: 0, late: 0, conge: 0 };
        return { month, ...data };
    });

    const currentMonthData = attendanceByMonth[currentMonthIndex];
    const workingDaysThisMonth = currentMonthData.present + currentMonthData.absent + currentMonthData.late;
    const attendanceRateThisMonth = workingDaysThisMonth > 0 ? Math.round(((currentMonthData.present + currentMonthData.late) / workingDaysThisMonth) * 100) : 0;

    return {
        employee: {
            firstName,
            lastName,
            employeeNumber: user?.employee?.employee_number || "EMP-2026-0143",
            position: user?.employee?.job_position?.title || "Chargé(e) de Clientèle",
            department: user?.employee?.direction?.name || "Direction Commerciale",
            contractType: "CDI",
            photo: user?.profile ?? "/images/profile.png",
        },
        leaveBalances: [
            { type: "Congé annuel", allocated: 24, used: 9, remaining: 15 },
            { type: "Congé maladie", allocated: 10, used: 2, remaining: 8 },
            { type: "Congé exceptionnel", allocated: 5, used: 1, remaining: 4 },
        ],
        totalLeaveRemaining: 27,
        attendanceThisMonth: {
            workingDays: workingDaysThisMonth,
            present: currentMonthData.present,
            absent: currentMonthData.absent,
            late: currentMonthData.late,
            rate: attendanceRateThisMonth,
        },
        attendanceByMonth,
        attendanceRateByYear: [
            { year: 2023, rate: 91.4 },
            { year: 2024, rate: 93.8 },
            { year: 2025, rate: 95.1 },
            { year: 2026, rate: attendanceRateThisMonth },
        ],
        personalLeaveDays: [
            { date: "2026-03-10", type: "Congé annuel" },
            { date: "2026-03-11", type: "Congé annuel" },
            { date: "2026-03-12", type: "Congé annuel" },
            { date: "2026-03-13", type: "Congé annuel" },
            { date: "2026-03-14", type: "Congé annuel" },
            { date: "2026-05-06", type: "Congé maladie" },
            { date: "2026-07-13", type: "Congé annuel" },
            { date: "2026-07-14", type: "Congé annuel" },
            { date: "2026-07-15", type: "Congé annuel" },
            { date: "2026-08-17", type: "Congé annuel" },
            { date: "2026-08-18", type: "Congé annuel" },
        ],
        recentLeaveRequests: [
            { id: 1, type: "Congé annuel", start: "2026-08-17", end: "2026-08-18", days: 2, status: "submitted" },
            { id: 2, type: "Congé annuel", start: "2026-07-13", end: "2026-07-15", days: 3, status: "approved" },
            { id: 3, type: "Congé maladie", start: "2026-05-06", end: "2026-05-06", days: 1, status: "approved" },
            { id: 4, type: "Congé exceptionnel", start: "2026-02-20", end: "2026-02-20", days: 1, status: "rejected" },
        ],
        pendingActions: [
            { id: 1, label: "Complétez votre profil", description: "Contact d'urgence manquant", severity: "warning", icon: "solar:user-id-linear", href: "/dashboard/ess/profile" },
            { id: 2, label: "Demande de congé en attente", description: "Votre demande du 17-18 août attend une validation", severity: "primary", icon: "solar:calendar-mark-linear", href: "/dashboard/ess/profile" },
            { id: 3, label: "Nouveau bulletin disponible", description: "Bulletin de paie de juillet 2026 prêt à consulter", severity: "success", icon: "solar:file-check-linear", href: "/dashboard/ess/documents" },
            { id: 4, label: "3 nouvelles annonces", description: "Consultez les dernières communications internes", severity: "default", icon: "solar:bell-linear", href: "/dashboard/ess/announcements" },
        ],
        lastPayslip: {
            period: "Juillet 2026",
            netAmount: 1450000,
            grossAmount: 1820000,
            currency: "CDF",
            issuedOn: "2026-07-30",
        },
    };
};
