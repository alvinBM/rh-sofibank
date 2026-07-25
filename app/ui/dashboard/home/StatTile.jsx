"use client";

import React from "react";
import { Card, CardBody } from "@nextui-org/react";
import { Icon } from "@iconify/react";

const TONE_STYLES = {
    danger: { bg: "bg-danger-100", text: "text-danger-500" },
    success: { bg: "bg-success-100", text: "text-success-500" },
    warning: { bg: "bg-warning-100", text: "text-warning-500" },
    primary: { bg: "bg-primary-100", text: "text-primary-500" },
    secondary: { bg: "bg-secondary-100", text: "text-secondary-500" },
    default: { bg: "bg-default-100", text: "text-default-500" },
};

export default function StatTile({ icon, label, value, hint, tone = "danger" }) {
    const styles = TONE_STYLES[tone] || TONE_STYLES.default;

    return (
        <Card shadow="sm">
            <CardBody className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-lg ${styles.bg}`}>
                    <Icon icon={icon} className={`text-2xl ${styles.text}`} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-default-500 truncate">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    {hint && <p className="text-xs text-default-400 truncate">{hint}</p>}
                </div>
            </CardBody>
        </Card>
    );
}
