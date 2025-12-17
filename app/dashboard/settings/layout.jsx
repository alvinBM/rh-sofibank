"use client";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";
import { formatDateFullText } from "@/src/helpers/helpers";
import { selectUserData, setCurrentPage } from "@/src/redux/slices/userSlice";
import { Icon } from "@iconify/react";
import { Button, Card, CardBody, CardHeader, Divider, Image, Listbox, ListboxItem, useSelect } from "@nextui-org/react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoDocumentAttachOutline, IoEllipsisVerticalOutline, IoPeopleOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";

//Parametres de provinves, Villes
const settingOptions = [
    { key: "accounts", name: "Informations", icon: <Icon icon={"mingcute:building-1-fill"} width={24} />, link: "/dashboard/settings" },
    { key: "users", name: "Gestion des utilisateurs", icon: <Icon icon={"solar:users-group-rounded-linear"} width={24} />, link: "/dashboard/settings/users" },
    { key: "roles", name: "Rôles et Permissions", icon: <Icon icon={"solar:shield-user-linear"} width={24} />, link: "/dashboard/settings/roles" },
    { key: "organization", name: "Structure organisationnelle", icon: <Icon icon="hugeicons:structure-check" width="24" height="24" />, link: "/dashboard/settings/organization" },
    { key: "grades", name: "Grades", icon: <Icon icon={"solar:diploma-linear"} width={24} />, link: "/dashboard/settings/grades" },
    { key: "job-positions", name: "Postes de travail", icon: <Icon icon={"solar:case-linear"} width={24} />, link: "/dashboard/settings/positions" },
    { key: "holidays", name: "Jours fériés", icon: <Icon icon="solar:calendar-broken" width="24" height="24" />, link: "/dashboard/settings/holidays" },
    { key: "biometric-devices", name: "Appareils biométriques", icon: <Icon icon="fluent:window-fingerprint-16-regular" width="24" height="24" />, link: "/dashboard/settings/biometric-devices" },
    { key: "system-settings", name: "Paramètres système", icon: <Icon icon={"solar:tuning-2-linear"} width={24} />, link: "/dashboard/settings/system" },
];

const LayoutSettings = ({ children }) => {
    const dispatch = useDispatch();
    dispatch(setCurrentPage("Paramètres"));
    const user = useSelector(selectUserData);
    const [selectedOption, setSelectOption] = useState("accounts");
    const [showSidebar, setShowSidebar] = useState(false);
    const toggleShowSidebar = () => setShowSidebar(!showSidebar);
    const pathname = usePathname();

    useEffect(() => {
        setShowSidebar(false);
        setSelectOption(pathname);
        console.log("pathname", pathname);
    }, [pathname]);

    return (
        <PermissionGuard requiredPermission="admin_access">
            <div className="flex flex-col">
                <div className="flex flex-grow md:flex-row flex-col gap-6 h-screen-pos w-full">
                    <div className={`md:w-4/12 md:hidden`}>
                        <Card className="w-full shadow-none">
                            <CardHeader className="flex gap-3 items-start justify-between">
                                <div className="flex gap-3">
                                    <Image className="mt-1" alt="nextui logo" height={40} radius="sm" src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4" width={40} />
                                    <div className="flex flex-col">
                                        <b className="text-md">SOFIBANQUE</b>
                                        <p className="text-small text-default-500">Plan : --</p>
                                        <p className="text-small text-default-500">Expire : --</p>
                                    </div>
                                </div>
                                <Button isIconOnly variant="light" onPress={toggleShowSidebar}>
                                    {showSidebar ? <Icon icon="line-md:close" width={24} /> : <Icon icon="line-md:menu" width={24} />}
                                </Button>
                            </CardHeader>
                        </Card>
                    </div>

                    <motion.div className={`md:w-3/12 2xl:w-1/5 md:min-w-[260px] ${showSidebar ? "block" : "hidden"} md:block`} initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.3 }}>
                        <Card className="hidden md:flex w-full shadow-none dark:bg-background">
                            <CardHeader className="flex gap-3 items-start">
                                <Image className="mt-1" alt="nextui logo" height={40} radius="sm" src="https://avatars.githubusercontent.com/u/86160567?s=200&v=4" width={40} />
                                <div className="flex flex-col">
                                    <b className="text-md">SOFIBANQUE</b>
                                    <p className="text-small text-default-500">Plan : --</p>
                                    <p className="text-small text-default-500">Expire : --</p>
                                </div>
                            </CardHeader>
                        </Card>
                        <Card className="shadow-none mt-5 dark:bg-background">
                            <CardHeader className="pb-0">
                                <span className="text-medium text-foreground-700 pl-1">Paramètres</span>
                            </CardHeader>
                            <CardBody>
                                <div className="flex flex-col gap-1">
                                    {settingOptions.map((option) => (
                                        <Link key={option.link} href={option.link}>
                                            <div className={`flex items-center border-2 border-transparent hover:border-red-700 justify-between rounded-lg gap-1 px-1 py-0 pr-0 ${selectedOption == option.link && "bg-red-600 text-gray-100"}`}>
                                                <div className="flex gap-2 items-center">
                                                    <span className={`${selectedOption == option.link ? " text-red-50" : "text-red-700"}`}>{option.icon}</span>
                                                    <span className={`text-small font-normal  ${selectedOption == option.link ? " text-red-50" : "text-red-700"}`}>{option.name}</span>
                                                </div>
                                                <Icon icon="tabler:minus-vertical" className={`text-white opacity-0 ${selectedOption == option.link && "opacity-100"}`} width={40} />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                    <motion.div className={`w-full md:w-10/12 ${showSidebar ? "hidden" : ""}`} initial={{ opacity: 1 }} animate={{ opacity: showSidebar ? 0.5 : 1 }} transition={{ duration: 0.3 }}>
                        <div className="col-span-12 md:col-span-9 w-full ">{children}</div>
                    </motion.div>
                </div>
            </div>
        </PermissionGuard>
    );
};

export default LayoutSettings;
