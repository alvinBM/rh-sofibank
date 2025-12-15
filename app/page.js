// "use client";
import { Accordion, AccordionItem, Button, Image } from "@nextui-org/react";
import Link from "next/link";
import FadeInImage from "./ui/landing/FadeInImage";
import LandingNavbar from "./ui/landing/LandingNavbar";
import { Icon } from "@iconify/react";
import LandingFooter from "./ui/landing/LandingFooter";

export default function Home() {
    return (
        <div className="relative flex h-screen min-h-dvh w-full flex-col overflow-hidden overflow-y-auto">
            <LandingNavbar />
            <main className="flex flex-col items-center rounded-2xl md:rounded-3xl md:px-0 min-h-[calc(100dvh-300px)]">
                <section className="z-20 my-14 flex flex-col items-center justify-center gap-[18px] sm:gap-6">
                    <h1 className="px-5 text-center text-[clamp(2.125rem,1.142rem+3.659vw,3rem)] font-bold leading-none text-black mt-5 md:mt-20">
                        Système d’information <br /> de gestion RH
                    </h1>
                    <p className=" text-center text-base text-default-600 sm:w-[466px]">
                        Gérez efficacement les ressources humaines de votre organisation avec notre solution complète et conviviale.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
                        <Button as={Link} href="/auth/login" className="h-10 bg-red-600 px-10 py-[10px] text-small font-medium leading-5 text-background" radius="full">
                            Se connecter
                        </Button>
                    </div>
                </section>
            </main>
            <div className="pointer-events-none inset-0 top-[-25%] z-10 scale-150 select-none sm:absolute sm:scale-125">
                {/* <FadeInImage fill priority alt="Gradient background" src="/bg-landing.png" /> */}
            </div>
            <LandingFooter />
        </div>
    );
}
