"use client";

import React, { useEffect, useState } from "react";
import {
    Alert,
    Avatar,
    Badge,
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Image,
    Input,
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    Popover,
    PopoverContent,
    PopoverTrigger,
    ScrollShadow,
    Select,
    SelectItem,
    SelectSection,
    Spacer,
    Spinner,
    Tooltip,
    useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";

import SidebarBox from "../ui/dashboard/sidebar/SidebarBox";
import { sectionItems } from "../ui/dashboard/sidebar/sidebar-items";
import SidebarDrawer from "../ui/dashboard/sidebar/sidebar-drawer";
import { logout } from "@/src/lib/actions/authActions";
import { useSelector } from "react-redux";
import ProtectedRoute from "@/src/redux/ProtectedRoute";
import { useAuth } from "@/src/redux/AuthContext";
import NotificationsCard from "../ui/dashboard/notifications/NotificationsCard";
import { ThemeSwitcher } from "../ui/ThemeSwither";
import Link from "next/link";
import { PosIcon } from "../ui/Icons/PosIcon";
import { IoPrintOutline } from "react-icons/io5";
import { selectCurrentPage, selectIsAuthenticated, selectUserPermissions, selectUserData } from "@/src/redux/slices/userSlice";
import { useRouter } from "next/navigation";
import { useGetBranches } from "@/src/hooks/useBranches";
import { formatDateFullText, hasPermission } from "@/src/helpers/helpers";
import PermissionCheck from "../ui/dashboard/PermissionCheck";
import { useTheme } from "next-themes";
import AccountExpiredBanner from "../ui/dashboard/AccountExpiredBanner";
import subscriptionPlans from "@/src/helpers/subscriptionPlans";

const authorizeFreeSections = ["dashboard", "products", "clients"];

const Layout = ({ children }) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const user = useSelector(selectUserData);
    const permissions = useSelector(selectUserPermissions);
    const userIsAuthenticated = useSelector(selectIsAuthenticated);
    const { logout } = useAuth();
    const router = useRouter();
    const currentPage = useSelector(selectCurrentPage) ?? router.pathname;
    const [selectedBranchData, setSelectedBranchData] = useState(null);
    const isAdmin = user?.main_roles?.some((role) => role.role_name === "Admin");
    // TODO: Activer quand l'endpoint /api/main/branches sera créé
    // const { data: dataBranches, isError: isErrorBranch, error: errorBranch, isLoading: isLoadingGetBranches } = useGetBranches({ page: 1, rowsPerPage: 1000 });
    // const branches = dataBranches && dataBranches?.branches.length > 0 ? dataBranches?.branches : [user?.main_store];
    const branches = user?.main_store ? [user?.main_store] : [];
    const { theme, setTheme } = useTheme();
    const [isAccountExpired, setIsAccountExpired] = useState(false);

    // Fonction pour récupérer les fonctionnalités et limites en fonction du `billing_plan`
    const getPlanDetails = (billing_plan) => {
        return subscriptionPlans[billing_plan] || subscriptionPlans["Basic"]; // Par défaut, Basic
    };

    // Fonction pour filtrer les items et les sections
    const filterSidebarByPermissions = (sections, permissions, isAdmin) => {
        return sections
            .map((section) => {
                // Filtrer les items de la section
                const filteredItems = section.items
                    .map((item) => {
                        // Si l'utilisateur est admin, tout est accessible
                        if (isAdmin) return item;

                        // Vérification des sous-items
                        if (item.items) {
                            const filteredSubItems = item.items.filter((subItem) => {
                                // Vérifier si une permission est requise et si elle est incluse
                                return subItem.requiredPermission ? permissions.includes(subItem.requiredPermission) : true;
                            });

                            // Si aucun sous-item valide, exclure l'item parent
                            if (filteredSubItems.length === 0) return null;

                            // Sinon, retourner l'item avec les sous-items filtrés
                            return {
                                ...item,
                                items: filteredSubItems,
                            };
                        }

                        // Vérifier si l'item principal nécessite une permission
                        return item.requiredPermission ? (permissions.includes(item.requiredPermission) ? item : null) : item;
                    })
                    .filter(Boolean); // Supprimer les items null

                // Si aucun item dans la section n'est visible, exclure la section
                if (filteredItems.length === 0) return null;

                return {
                    ...section,
                    items: filteredItems,
                };
            })
            .filter(Boolean); // Supprimer les sections nulles
    };

    // Fonction pour filtrer les items et les sections par fonctionnalités
    const filterSidebarByFeatures = (sections, isExpired) => {
        const { features } = getPlanDetails(user?.account?.billing_plan);

        return sections
            .map((section) => {
                const filteredItems = section.items
                    .map((item) => {
                        // Bloquer tout accès si le compte est expiré sauf au menu "Dashboard", "Gestion de produit", "Gestion de clients"
                        if (isExpired && !authorizeFreeSections.includes(item.key)) {
                            return null;
                        }

                        if (item.items) {
                            const filteredSubItems = item.items.filter((subItem) => {
                                return !subItem.requiredFeature || features[subItem.requiredFeature]; // Laisser passer si `requiredFeature` est null ou vide
                            });

                            return filteredSubItems.length > 0 ? { ...item, items: filteredSubItems } : null;
                        }

                        return !item.requiredFeature || features[item.requiredFeature] ? item : null; // Laisser passer si `requiredFeature` est null ou vide
                    })
                    .filter(Boolean);

                return filteredItems.length > 0 ? { ...section, items: filteredItems } : null;
            })
            .filter(Boolean);
    };

    // Utilisation des deux filtres
    const filteredByPermissions = filterSidebarByPermissions(sectionItems, permissions, isAdmin);
    const filteredSectionItems = filterSidebarByFeatures(filteredByPermissions, isAccountExpired);

    const sidebarContent = (
        <>
            {userIsAuthenticated && (
                <div className="relative flex h-screen min-w-72 flex-1 flex-col p-0 max-w-72 bg-background dark:bg-zinc-950">
                    <div className="flex flex-col gap-y-2 border-b-gray-50 dark:border-b-gray-900 border-b-1 py-7 px-3">
                        <div className="w-full justify-center flex items-center mb-5">
                            <Image alt="LOGO" height={90} width={240} radius="sm" src={"/logo_sofibank.png"} />
                        </div>
                    </div>

                    <ScrollShadow size={3} className="h-full max-h-full px-3 scrollbar dark:scrollbar-dark">
                        <SidebarBox
                            iconClassName="text-default-700 group-data-[selected=true]:text-foreground"
                            itemClasses={{
                                base: "data-[selected=true]:bg-gray-300 mb-1",
                                title: "text-default-700 group-data-[selected=true]:text-foreground",
                            }}
                            defaultSelectedKey=""
                            items={filteredSectionItems}
                        />
                    </ScrollShadow>

                    <Spacer y={1} />

                    <div className="mt-auto flex flex-col px-3 py-2">
                        {isAdmin && (
                            <Button
                                onPress={() => router.push("/dashboard/settings")}
                                fullWidth
                                className="justify-start text-foreground/60 data-[hover=true]:bg-gray-200"
                                startContent={<Icon className="text-foreground/60" icon="solar:settings-linear" width={24} />}
                                variant="light"
                            >
                                Configurations
                            </Button>
                        )}
                        <a target="_blanc" href="https://interieur.gouv.cd/">
                            <Button fullWidth className="justify-start text-foreground/60 data-[hover=true]:bg-gray-200" startContent={<Icon className="text-foreground/60" icon="solar:info-circle-line-duotone" width={24} />} variant="light">
                                Aide & Support
                            </Button>
                        </a>
                        <Button onPress={logout} className="justify-start text-red-600 data-[hover=true]:bg-red-200" startContent={<Icon className="text-red-600" icon="solar:logout-3-line-duotone" width={24} />} variant="light">
                            Se déconnecter
                        </Button>
                    </div>
                </div>
            )}
        </>
    );

    return (
        <ProtectedRoute>
            {userIsAuthenticated ? (
                <div className="flex h-screen w-full">
                    <SidebarDrawer className="!border-r-small border-divider" isOpen={isOpen} onOpenChange={onOpenChange}>
                        <div className="min-w-72 fixed overflow-y-hidden">{sidebarContent}</div>
                    </SidebarDrawer>
                    <div className="w-full flex-1 flex-col p-0 h-screen md:ml-72 overflow-hidden bg-gray-100 dark:bg-zinc-900">
                        <header className="w-full p-2 md:p-6">
                            <Navbar maxWidth={"full"} className="h-16 rounded-medium shadow-slate-600 border-divider bg-background dark:bg-zinc-950">
                                <NavbarBrand>
                                    <Button isIconOnly className="flex md:hidden mr-3" size="sm" variant="light" onPress={onOpen}>
                                        <Icon className="text-default-500" height={24} icon="solar:hamburger-menu-outline" width={24} />
                                    </Button>
                                    <div className="flex items-center gap-2 py-5 pr-4">
                                        <Breadcrumbs className="hidden lg:flex" radius="full">
                                            <BreadcrumbItem onPress={() => router.push("/dashboard/settings")}>
                                                <b className="text-2xl font-bold text-red-700 text-center w-full dark:text-red-400">{user?.account?.business_name}</b>
                                            </BreadcrumbItem>
                                            <BreadcrumbItem>{currentPage}</BreadcrumbItem>
                                        </Breadcrumbs>
                                    </div>
                                </NavbarBrand>

                                {/* Right Menu */}
                                <NavbarContent className="ml-auto h-12 max-w-fit items-center gap-0" justify="end">
                                    <NavbarItem className="flex">
                                        <ThemeSwitcher />
                                    </NavbarItem>

                                    {/* Settings */}
                                    <PermissionCheck requiredPermission="admin">
                                        <NavbarItem className="flex">
                                            <Button onPress={() => router.push("/dashboard/settings")} isIconOnly radius="full" variant="light">
                                                <Icon className="text-default-500" icon="solar:settings-linear" width={24} />
                                            </Button>
                                        </NavbarItem>
                                    </PermissionCheck>

                                    {/* Notifications */}
                                    {/* <NavbarItem className="flex">
                                        <Popover offset={12} placement="bottom-end">
                                            <PopoverTrigger>
                                                <Button disableRipple isIconOnly className="overflow-visible" radius="full" variant="light">
                                                    <Badge color="danger" content="5" showOutline={false} size="md">
                                                        <Icon className="text-default-500" icon="solar:bell-linear" width={22} />
                                                    </Badge>
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="max-w-[90vw] p-0 sm:max-w-[380px]">
                                                <NotificationsCard className="w-full shadow-none" />
                                            </PopoverContent>
                                        </Popover>
                                    </NavbarItem> */}
                                    {/* User Menu */}
                                    <NavbarItem className="px-2">
                                        <Dropdown placement="bottom-end">
                                            <DropdownTrigger>
                                                <button className="mt-1 h-8 w-8 outline-none transition-transform">
                                                    <Badge color="success" content="" placement="bottom-right" shape="circle">
                                                        <Avatar size="sm" src={user?.profile ?? "/images/profile.png"} />
                                                    </Badge>
                                                </button>
                                            </DropdownTrigger>
                                            <DropdownMenu aria-label="Profile Actions" variant="flat">
                                                <DropdownItem onPress={() => router.push("/dashboard/profile")} key="profile" className="h-14 gap-2">
                                                    <small className="font-light">Connecté en tant que</small>
                                                    <p className="font-semibold">
                                                        {user?.firstname} {user?.lastname}
                                                    </p>
                                                </DropdownItem>
                                                {isAdmin && (
                                                    <DropdownItem onPress={() => router.push("/dashboard/settings")} key="settings">
                                                        Configurations
                                                    </DropdownItem>
                                                )}
                                                <DropdownItem onPress={() => router.push("/dashboard/profile")} key="settings">
                                                    Mon profil
                                                </DropdownItem>
                                                <DropdownItem key="help_and_feedback">Aide & Support</DropdownItem>
                                                <DropdownItem onPress={logout} key="logout" color="danger">
                                                    Se déconnecter
                                                </DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </NavbarItem>
                                </NavbarContent>
                            </Navbar>
                        </header>
                        <main className="mt-0 h-[95%] w-full overflow-visible">
                            <div className="flex h-[90%] w-full flex-col gap-4 pt-3 px-2 md:px-6 md:pt-0 pb-2">
                                <ScrollShadow size={4} className="h-full max-h-full py-0">
                                    {/** Baniere abonnement expiré */}
                                    {isAccountExpired && <AccountExpiredBanner />}
                                    {children}
                                </ScrollShadow>
                            </div>
                        </main>
                    </div>
                </div>
            ) : (
                <div className="h-screen w-full flex justify-center align-middle flex-col">
                    <Spinner size="lg" />
                </div>
            )}
        </ProtectedRoute>
    );
};

export default Layout;
