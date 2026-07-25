"use client";
import React from "react";
import { useSelector } from "react-redux";
import { selectUserData } from "@/src/redux/slices/userSlice";
import { getAccessLevel, ACCESS_LEVELS } from "@/src/helpers/accessControl";
import AdminHrDashboard from "../ui/dashboard/home/AdminHrDashboard";
import EmployeeDashboard from "../ui/dashboard/home/EmployeeDashboard";

const ACCESS_LEVEL_LABELS = {
    [ACCESS_LEVELS.ADMIN]: "Administrateur",
    [ACCESS_LEVELS.RH]: "Ressources Humaines",
    [ACCESS_LEVELS.EMPLOYEE]: "Employé",
};

const Dashboard = () => {
    const user = useSelector(selectUserData);
    const accessLevel = getAccessLevel(user);

    if (accessLevel === ACCESS_LEVELS.EMPLOYEE) {
        return <EmployeeDashboard user={user} />;
    }

    return <AdminHrDashboard accessLevelLabel={ACCESS_LEVEL_LABELS[accessLevel]} isAdmin={accessLevel === ACCESS_LEVELS.ADMIN} />;
};

export default Dashboard;
