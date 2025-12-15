"use client";

import React from "react";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem, NavbarMenuToggle, Link, Button, Divider, cn, Image } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";

const menuItems = [
    {
        name: "Accueil",
        href: "/",
    },
    {
        name: "Fonctionnalité",
        href: "/#features",
    },
    {
        name: "Prix",
        href: "/#pricing",
    },
    {
        name: "Nous contacter",
        href: "/#contact",
    },
];

const LandingNavbar = React.forwardRef(({ classNames = {}, ...props }, ref) => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const currentPath = usePathname();

    return (
        <>
            
            <Navbar
                ref={ref}
                {...props}
                classNames={{
                    base: cn("border-default-100 py-4", {
                        "bg-white dark:bg-default-100/50": isMenuOpen,
                    }),
                    wrapper: "w-full justify-center",
                    item: "hidden md:flex",
                    ...classNames,
                }}
                height="60px"
                isMenuOpen={isMenuOpen}
                onMenuOpenChange={setIsMenuOpen}
            >
                {/* Left Content */}
                <NavbarBrand>
                    <Link href="/">
                        <Image alt="LOGO" height={70} width={200} radius="sm" src={"/logo_sofibank.png"} />
                    </Link>
                </NavbarBrand>

                {/* Right Content */}
                <NavbarContent className="hidden md:flex" justify="end">
                    <NavbarItem isActive className="data-[active='true']:font-medium[date-active='true']">
                        <Link className={`${currentPath == "/" ? "text-red-600" : "text-default-500"}`} href="/" size="sm">
                            Accueil
                        </Link>
                    </NavbarItem>
                    <NavbarItem>
                        <Link className={`${currentPath == "/#contact" ? "text-red-600" : "text-default-500"}`} href="/#contact" size="sm">
                            Support
                        </Link>
                    </NavbarItem>
                    <NavbarItem className="ml-2 !flex gap-2">
                        <Button as={Link} href="/auth/login" className="bg-red-600 font-medium text-background" color="secondary" radius="full" variant="flat">
                            Se connecter
                        </Button>
                    </NavbarItem>
                </NavbarContent>

                <NavbarMenuToggle className="text-default-400 md:hidden" />

                <NavbarMenu
                    className="top-[calc(var(--navbar-height)_-_1px)] max-h-screen bg-default-200/50 pb-6 pt-12 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
                    motionProps={{
                        initial: { opacity: 0, y: -20 },
                        animate: { opacity: 1, y: 0 },
                        exit: { opacity: 0, y: -20 },
                        transition: {
                            ease: "easeInOut",
                            duration: 0.2,
                        },
                    }}
                >
                    <NavbarMenuItem>
                        <Button variant="bordered" as={Link} href="/auth/login" fullWidth>
                            Se connecter
                        </Button>
                    </NavbarMenuItem>
                    {menuItems.map((item, index) => (
                        <NavbarMenuItem key={`${item.name}-${index}`}>
                            <Link className="mb-2 w-full text-default-500" href={item.href} size="md">
                                {item.name}
                            </Link>
                            {index < menuItems.length - 1 && <Divider className="opacity-50" />}
                        </NavbarMenuItem>
                    ))}
                </NavbarMenu>
            </Navbar>
        </>
    );
});

LandingNavbar.displayName = "LandingNavbar";

export default LandingNavbar;
