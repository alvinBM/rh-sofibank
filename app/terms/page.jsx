import { Divider } from "@nextui-org/react";
import LandingNavbar from "../ui/landing/LandingNavbar";
import LandingFooter from "../ui/landing/LandingFooter";

export default function Terms() {
    return (
        <div className="relative flex h-screen min-h-dvh w-full flex-col overflow-hidden overflow-y-auto bg-background">
            <LandingNavbar />
            <Divider />

            <div className="bg-orange-500 py-10 ">
                <main className="flex flex-col mx-auto w-full max-w-5xl px-6 py-8 text-default-800">
                    <div className="w-full">
                        <h1 className="text-3xl lg:text-5xl font-black text-white">{"Termes et conditions d'utilisation"}</h1>
                        <p className="text-md lg:text-lg mt-2 text-white">{"Veuillez lire attentivement ces conditions de service avant d'utiliser notre service."}</p>
                        <small className="font-light text-white">Dernière mise à jour : 01 Février 2025</small>
                    </div>
                </main>
            </div>

            <main className="flex flex-col mx-auto w-full max-w-5xl px-6 py-8 text-default-800">
                <p>....</p>
            </main>

            <LandingFooter />
        </div>
    );
}
