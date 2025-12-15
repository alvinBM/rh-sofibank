import { Button } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { IoInformationCircleOutline, IoCloseOutline, IoWarningOutline, IoCheckmarkCircleOutline, IoAlertCircleOutline } from "react-icons/io5";

const AlertMessage = ({ type = "info", message, link, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
        }
    }, [message]);

    if (!isVisible) return null;

    const alertTypes = {
        info: {
            bgColor: "bg-blue-100",
            textColor: "text-blue-800",
            borderColor: "border-blue-500",
            darkBgColor: "dark:bg-blue-200",
            darkTextColor: "dark:text-blue-800",
            icon: <IoInformationCircleOutline className="flex-shrink-0 w-6 h-6" />,
        },
        success: {
            bgColor: "bg-red-100",
            textColor: "text-red-800",
            borderColor: "border-red-600",
            darkBgColor: "dark:bg-red-200",
            darkTextColor: "dark:text-red-800",
            icon: <IoCheckmarkCircleOutline className="flex-shrink-0 w-6 h-6" />,
        },
        warning: {
            bgColor: "bg-yellow-100",
            textColor: "text-yellow-800",
            borderColor: "border-yellow-500",
            darkBgColor: "dark:bg-yellow-200",
            darkTextColor: "dark:text-yellow-800",
            icon: <IoWarningOutline className="flex-shrink-0 w-6 h-6" />,
        },
        danger: {
            bgColor: "bg-danger-100",
            textColor: "text-danger-600",
            borderColor: "border-danger-600",
            darkBgColor: "dark:bg-danger-200",
            darkTextColor: "dark:text-danger-800",
            icon: <IoAlertCircleOutline className="flex-shrink-0 w-6 h-6" />,
        },
        dark: {
            bgColor: "bg-gray-100",
            textColor: "text-gray-800",
            borderColor: "border-gray-500",
            darkBgColor: "dark:bg-gray-300",
            darkTextColor: "dark:text-gray-900",
            icon: <IoInformationCircleOutline className="flex-shrink-0 w-6 h-6" />,
        },
    };

    const { bgColor, textColor, borderColor, darkBgColor, darkTextColor, icon } = alertTypes[type];

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) onClose();
    };

    return (
        <div className={`flex items-center p-4 mb-4 ${textColor} ${bgColor} ${darkBgColor} ${darkTextColor} border-l-4 ${borderColor} rounded-lg`} role="alert">
            {icon}
            <span className="sr-only">Info</span>
            <div className="ms-3 text-sm font-medium flex-1">
                {message}
                {link && (
                    <a href={link.url} className="font-semibold underline hover:no-underline ms-1">
                        {link.text}
                    </a>
                )}
            </div>
            <IoCloseOutline className="w-6 h-6 ms-auto inline-flex items-center justify-center cursor-pointer" aria-hidden="true" onClick={handleClose} aria-label="Close" />
        </div>
    );
};

export default AlertMessage;
