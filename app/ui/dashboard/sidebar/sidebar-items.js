import { Icon } from "@iconify/react";
import { SidebarItemType } from "./SidebarBox";

export const sectionItems = [
    {
        key: "main",
        title: "Principal",
        items: [
            {
                key: "dashboard",
                href: "/dashboard",
                icon: "solar:home-2-linear",
                title: "Tableau de bord",
            },
            {
                key: "my-profile",
                href: "/dashboard/profile",
                icon: "solar:user-circle-linear",
                title: "Mon Profil (ESS)",
                requiredPermission: "ess_access",
            },
        ],
    },
    {
        key: "hr-modules",
        title: "Modules RH",
        items: [
            {
                key: "employees",
                href: "/dashboard/employees",
                icon: "solar:users-group-rounded-linear",
                title: "Employés",
                requiredPermission: "employees_view",
            },
            {
                key: "recruitment",
                title: "Recrutement",
                icon: "solar:user-plus-linear",
                type: SidebarItemType.Nest,
                requiredPermission: "recruitment_view",
                items: [
                    {
                        key: "job-openings",
                        icon: "solar:case-minimalistic-linear",
                        href: "/dashboard/recruitment/job-openings",
                        title: "Postes vacants",
                    },
                    {
                        key: "candidates",
                        icon: "solar:user-check-linear",
                        href: "/dashboard/recruitment/candidates",
                        title: "Candidats",
                    },
                    {
                        key: "interviews",
                        icon: "solar:calendar-mark-linear",
                        href: "/dashboard/recruitment/interviews",
                        title: "Entretiens",
                    },
                    {
                        key: "job-offers",
                        icon: "solar:document-text-linear",
                        href: "/dashboard/recruitment/offers",
                        title: "Offres d'emploi",
                    },
                ],
            },
            {
                key: "leave",
                title: "Congés",
                icon: "solar:calendar-date-linear",
                type: SidebarItemType.Nest,
                requiredPermission: "leave_view",
                items: [
                    {
                        key: "leave-requests",
                        icon: "solar:calendar-add-linear",
                        href: "/dashboard/leave/requests",
                        title: "Demandes de congés",
                    },
                    {
                        key: "leave-balance",
                        icon: "solar:chart-square-linear",
                        href: "/dashboard/leave/balance",
                        title: "Soldes de congés",
                    },
                    {
                        key: "leave-planning",
                        icon: "solar:calendar-search-linear",
                        href: "/dashboard/leave/planning",
                        title: "Planification annuelle",
                    },
                ],
            },
            {
                key: "attendance",
                title: "Présence",
                icon: "solar:clock-circle-linear",
                type: SidebarItemType.Nest,
                requiredPermission: "attendance_view",
                items: [
                    {
                        key: "attendance-records",
                        icon: "solar:checklist-linear",
                        href: "/dashboard/attendance/records",
                        title: "Registre de présence",
                    },
                    {
                        key: "authorizations",
                        icon: "solar:document-add-linear",
                        href: "/dashboard/attendance/authorizations",
                        title: "Autorisations",
                    },
                    {
                        key: "attendance-reports",
                        icon: "solar:chart-2-linear",
                        href: "/dashboard/attendance/reports",
                        title: "Rapports",
                    },
                ],
            },
            {
                key: "payroll",
                href: "/dashboard/payroll",
                icon: "solar:wallet-money-linear",
                title: "Paie",
                requiredPermission: "payroll_view",
            },
            {
                key: "performance",
                title: "Performance 360°",
                icon: "solar:medal-star-linear",
                type: SidebarItemType.Nest,
                requiredPermission: "performance_view",
                items: [
                    {
                        key: "evaluations",
                        icon: "solar:clipboard-check-linear",
                        href: "/dashboard/performance/evaluations",
                        title: "Évaluations",
                    },
                    {
                        key: "kpis",
                        icon: "solar:target-linear",
                        href: "/dashboard/performance/kpis",
                        title: "KPIs",
                    },
                    {
                        key: "pip-plans",
                        icon: "solar:graph-up-linear",
                        href: "/dashboard/performance/pip",
                        title: "Plans d'amélioration",
                    },
                ],
            },
            {
                key: "reports-analytics",
                title: "Rapports & Analyses",
                icon: "solar:chart-2-linear",
                type: SidebarItemType.Nest,
                requiredPermission: "dashboard_view",
                items: [
                    {
                        key: "hr-dashboards",
                        icon: "solar:graph-new-linear",
                        href: "/dashboard/reports/hr-dashboard",
                        title: "Dashboards RH",
                    },
                    {
                        key: "custom-reports",
                        icon: "solar:document-linear",
                        href: "/dashboard/reports/custom",
                        title: "Rapports personnalisés",
                    },
                    {
                        key: "alerts",
                        icon: "solar:bell-linear",
                        href: "/dashboard/reports/alerts",
                        title: "Alertes",
                    },
                ],
            },
        ],
    },
    {
        key: "settings",
        title: "Paramétrages",
        items: [
            {
                key: "settings",
                title: "Administration",
                icon: "solar:settings-linear",
                type: SidebarItemType.Nest,
                requiredPermission: "settings_access",
                items: [
                    {
                        key: "users-management",
                        icon: "solar:users-group-rounded-linear",
                        href: "/dashboard/settings/users",
                        title: "Utilisateurs",
                        requiredPermission: "users_manage",
                    },
                    {
                        key: "roles-permissions",
                        icon: "solar:shield-user-linear",
                        href: "/dashboard/settings/roles",
                        title: "Rôles & Permissions",
                        requiredPermission: "roles_manage",
                    },
                    {
                        key: "organization",
                        icon: "solar:building-linear",
                        href: "/dashboard/settings/organization",
                        title: "Structure organisationnelle",
                        requiredPermission: "org_manage",
                    },
                    {
                        key: "grades",
                        icon: "solar:diploma-linear",
                        href: "/dashboard/settings/grades",
                        title: "Grades & Rémunérations",
                        requiredPermission: "payroll_settings_manage",
                    },
                    {
                        key: "job-positions",
                        icon: "solar:case-linear",
                        href: "/dashboard/settings/positions",
                        title: "Postes/Fonctions",
                        requiredPermission: "positions_manage",
                    },
                    {
                        key: "holidays",
                        icon: "solar:calendar-mark-linear",
                        href: "/dashboard/settings/holidays",
                        title: "Jours fériés",
                        requiredPermission: "holidays_manage",
                    },
                    {
                        key: "biometric-devices",
                        icon: "solar:atom-linear",
                        href: "/dashboard/settings/biometric",
                        title: "Terminaux biométriques",
                        requiredPermission: "attendance_settings_manage",
                    },
                    {
                        key: "system-settings",
                        icon: "solar:tuning-2-linear",
                        href: "/dashboard/settings/system",
                        title: "Paramètres système",
                        requiredPermission: "system_settings_manage",
                    },
                ],
            },
        ],
    },
];
