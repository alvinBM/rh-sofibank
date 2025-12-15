// app/components/ThemeSwitcher.jsx
"use client";

import { Icon } from "@iconify/react";
import { Button } from "@nextui-org/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher({ textColor = "text-default-500" }) {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            {theme === "dark" ? (
                <Button onPress={() => setTheme("light")} isIconOnly radius="full" variant="light">
                    <Icon className={textColor} icon="carbon:moon" width={24} />
                </Button>
            ) : (
                <Button onPress={() => setTheme("dark")} isIconOnly radius="full" variant="light">
                    <Icon className={textColor} icon="solar:sun-linear" width={24} />
                </Button>
            )}
        </>
    );
}
