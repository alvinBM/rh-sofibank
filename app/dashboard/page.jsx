"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import { Button, Card, CardBody, CardHeader, Chip, Link, ScrollShadow, Skeleton, Tooltip } from "@nextui-org/react";
import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";
import { cn } from "@/src/lib/cn";
import { selectUserPermissionstures, selectUserPermissions, selectUserData, selectUserFeatures } from "@/src/redux/slices/userSlice";
import GraphSynthese from "../ui/dashboard/stats/GraphSynthese";
import api from "@/src/services/axios";

const Dashboard = () => {
    const user = useSelector(selectUserData);
    return (
        <div className="w-full flex flex-col gap-5 pb-10">
            <h1>TABLEAU DE BORD AVEC recharts</h1>
        </div>
    );
};

export default Dashboard;
