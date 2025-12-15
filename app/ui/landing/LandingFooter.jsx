"use client";

import React from "react";
import { Image, Link, Spacer } from "@nextui-org/react";
import { Icon } from "@iconify/react";

const navLinks = [
    {
        name: "Accueil",
        href: "#",
    },
    {
        name: "Fonctionnalité",
        href: "#",
    },
    // {
    //     name: "Prix",
    //     href: "#pricing",
    // },
    // {
    //     name: "Politique de confidentialité",
    //     href: "#",
    // },
    {
        name: "Conditions d’utilisation",
        href: "/terms",
    },
    // {
    //     name: "Blog",
    //     href: "#",
    // },
    {
        name: "Support",
        href: "#",
    },
];

const socialItems = [
    {
        name: "Facebook",
        href: "#",
        icon: (props) => <Icon {...props} icon="fontisto:facebook" />,
    },
    {
        name: "Instagram",
        href: "#",
        icon: (props) => <Icon {...props} icon="fontisto:instagram" />,
    },
    {
        name: "Twitter",
        href: "#",
        icon: (props) => <Icon {...props} icon="fontisto:twitter" />,
    },
    {
        name: "GitHub",
        href: "#",
        icon: (props) => <Icon {...props} icon="fontisto:github" />,
    },
    {
        name: "YouTube",
        href: "#",
        icon: (props) => <Icon {...props} icon="fontisto:youtube-play" />,
    },
];

export default function LandingFooter() {
    return (
        <footer className="flex w-full flex-col border-t-1 bg-gray-900">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-6 py-12 lg:px-8">
                <div className="flex items-center justify-center">
                    <Image alt="LOGO" height={20} width={100} radius="sm" src={"/logo_sofibank.png"} />
                </div>
                <Spacer y={4} />
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                    {navLinks.map((item) => (
                        <Link key={item.name} className="text-default-100" href={item.href} size="sm">
                            {item.name}
                        </Link>
                    ))}
                </div>
                <Spacer y={6} />
                <div className="flex justify-center gap-x-4">
                    {socialItems.map((item) => (
                        <Link key={item.name} isExternal className="text-default-300" href={item.href}>
                            <span className="sr-only">{item.name}</span>
                            <item.icon aria-hidden="true" className="w-5" />
                        </Link>
                    ))}
                </div>
                <Spacer y={4} />
                <p className="mt-1 text-center text-small text-default-300">&copy; {new Date().getFullYear()} VIVA Group. Tous droits réservés.</p>
            </div>
        </footer>
    );
}
