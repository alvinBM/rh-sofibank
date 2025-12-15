"use client";

import React, { useState } from "react";
import { Button, Input, Checkbox, Link, Divider, Image } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { authenticate } from "@/src/lib/actions/authActions";
import { useAuth } from "@/src/redux/AuthContext";
import { useRouter } from "next/navigation";
import AlertMessage from "@/app/ui/AlertMessage";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const toggleVisibility = () => setIsPasswordVisible(!isPasswordVisible);

    const handleSubmit = async () => {
        // e.preventDefault();
        try {
            setError(null);
            setLoading(true);
            const response = await login(username, password);
            console.log("Reponse LOGIN", response);
            if (response.status == 200) {
                router.push("/dashboard");
            } else {
                setError({
                    type: "danger",
                    message: response.message,
                });
            }
        } catch (error) {
            setError({
                type: "danger",
                message: error?.message || "Erreur du servuer",
            });
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen  w-full flex-col items-center justify-center align-middle px-4">
            <div aria-hidden="true" className="px:5 absolute inset-x-0 top-3 z-0 h-full w-full transform-gpu overflow-hidden blur-3xl md:right-20 md:h-auto md:w-auto md:px-36">
                <div
                    className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#d81313] to-[#111d45] opacity-30"
                    style={{
                        clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                />
            </div>
            <div className="flex flex-col items-center pb-6 px-4">
                <Link href="/">
                    <Image alt="Logo" height={80} width={250} radius="sm" src={"../logo_sofibank.png"} />
                </Link>
                {/* <p className="text-xl font-medium">Welcome Back</p> */}
                <p className="text-lg text-center text-default-500 mt-5">Connectez-vous sur votre compte pour continuer</p>
            </div>
            <div className="mt-2 flex w-full max-w-sm flex-col gap-4 rounded-large bg-gray-50 dark:bg-gray-950 px-8 py-6 shadow-small relative z-10">
                <form className="flex flex-col gap-3">
                    {error && <AlertMessage type={"danger"} message={error.message} />}

                    <Input size="lg" label="Téléphone ou Email" placeholder="" type="texte" variant="bordered" value={username} onChange={(e) => setUsername(e.target.value)} />

                    <Input
                        aria-label="Mot de passe"
                        autocomplete="new-password"
                        endContent={
                            <button type="button" onClick={toggleVisibility}>
                                {isPasswordVisible ? <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-closed-linear" /> : <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-bold" />}
                            </button>
                        }
                        size="lg"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Mot de passe"
                        placeholder=""
                        type={isPasswordVisible ? "text" : "password"}
                        variant="bordered"
                    />

                    <div className="flex items-center justify-between px-1 py-2">
                        <Checkbox name="remember" size="sm">
                            Se souvenir de moi
                        </Checkbox>
                        <Link className="text-default-500" href="/auth/resetpassword" size="sm">
                            Mot de passe oublié?
                        </Link>
                    </div>
                    <Button isLoading={loading} color="success" className="bg-red-600 text-white font-medium text-md py-6" type="button" onPress={handleSubmit}>
                        Se connecter
                    </Button>
                </form>
                <div className="flex items-center gap-4">
                    <Divider className="flex-1" />
                    <p className="shrink-0 text-tiny text-default-500">OR</p>
                    <Divider className="flex-1" />
                </div>
                <Button onPress={() => router.push("/auth/signup")} color="success" className="bg-red-50 text-red-700 border-1 font-medium text-md py-6" type="default">
                    Créer un compte
                </Button>
            </div>
        </div>
    );
}
