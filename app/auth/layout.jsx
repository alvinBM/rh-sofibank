"use client"
import React from "react";
import PublicRoute from "@/src/redux/PublicRoute";

const Layout = ({ children }) => {
    return (
        <PublicRoute>
            <div className="flex h-screen w-full">
                {children}
            </div>
        </PublicRoute>
    );
};

export default Layout;
