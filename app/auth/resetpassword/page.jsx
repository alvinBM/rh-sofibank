"use client";

import React, { useState } from "react";
import { Button, Input, Checkbox, Link, Divider, Image, InputOtp } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useAuth } from "@/src/redux/AuthContext";
import { useRouter } from "next/navigation";
import AlertMessage from "@/app/ui/AlertMessage";
import api from "@/src/services/axios";
import qs from "qs";
import { CheckOkIcon } from "@/app/ui/Icons/CheckOkIcon";

export default function ResetPassword() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [publicToken, setPublicToken] = useState("");
    const [otp, setOtp] = useState("");
    const [alert, setAlert] = useState(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: password, 4: success

    const toggleVisibility = () => setIsPasswordVisible(!isPasswordVisible);
    const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

    const submitRequestRestaurePassword = async () => {
        try {
            setAlert(null);
            setLoading(true);
            const requestData = { phone };
            const { data: response } = await api.post("/user/requestRestaurePassword", qs.stringify(requestData));
            if (response.status == 200) {
                setPublicToken(response.public_token);
                setStep(2);
            } else {
                setAlert({
                    type: "danger",
                    message: response.message,
                });
            }
        } catch (error) {
            console.error(error);
            setAlert({
                type: "danger",
                message: "Une erreur s'est produite lors de la demande de réinitialisation du mot de passe.",
            });
        } finally {
            setLoading(false);
        }
    };

    const submitRestaurePassword = async () => {
        try {
            if (password != confirmPassword) {
                setAlert({
                    type: "danger",
                    message: "Les mots de passe ne correspondent pas.",
                });
                return;
            }
            setAlert(null);
            setLoading(true);
            const requestData = { public_token: publicToken, otp: otp, password: confirmPassword, phone: phone };
            const { data: response } = await api.post("/user/restaurePassword", qs.stringify(requestData));
            if (response.status == 200) {
                setAlert({
                    type: "success",
                    message: "Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.",
                });
                setStep(4);
            } else {
                setAlert({
                    type: "danger",
                    message: response.message,
                });
            }
        } catch (error) {
            console.error(error);
            setAlert({
                type: "danger",
                message: "Une erreur s'est produite lors de la réinitialisation du mot de passe.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen  w-full flex-col items-center justify-center align-middle px-4">
            <div aria-hidden="true" className="px:5 absolute inset-x-0 top-3 z-0 h-full w-full transform-gpu overflow-hidden blur-3xl md:right-20 md:h-auto md:w-auto md:px-36">
                <div
                    className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#048a6d] to-[#0b5d80] opacity-30"
                    style={{
                        clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                />
            </div>
            <div className="flex flex-col items-center pb-6 px-4">
                <Link href="/">
                    <Image alt="Logo" height={150} width={150} radius="sm" src={"../logo.png"} />
                </Link>
                <p className="text-xl font-medium mt-5 text-default-700">Mot de passe oublié ?</p>
            </div>
            <div className="mt-2 flex w-full max-w-sm flex-col gap-4 rounded-large bg-gray-50 dark:bg-gray-950 px-8 py-6 shadow-small relative z-10">
                {step == 1 && (
                    <div className="flex flex-col gap-3">
                        {alert && <AlertMessage type={"danger"} message={alert.message} />}

                        <p className="text-md text-center text-default-500">Entrez numéro de téléphone et nous vous enverrons un code pour réinitialiser votre mot de passe.</p>

                        <Input size="lg" label="Numéro de téléphone" placeholder="" type="texte" variant="bordered" value={phone} onChange={(e) => setPhone(e.target.value)} />

                        <Button isLoading={loading} color="success" className="bg-red-600 text-white font-medium text-md py-6 mt-5" type="button" onPress={submitRequestRestaurePassword}>
                            Valider
                        </Button>
                    </div>
                )}

                {step == 2 && publicToken != "" && (
                    <div>
                        <p className="text-small text-center text-default-500 mt-2">Saisir le code de confirmation que nous avons envoyé au numéro {phone}</p>
                        <Divider className="my-3" />
                        {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
                        <div className="w-full">
                            <InputOtp size="lg" length={6} value={otp} onValueChange={setOtp} variant="faded" />
                            <Button isLoading={loading} color="success" className="bg-red-600 text-white font-medium text-md py-6 w-full mt-5" type="button" onPress={() => setStep(3)}>
                                Suivant
                            </Button>
                        </div>
                        <div className="flex justify-between w-full mt-5">
                            <p className="">Code non reçu ?</p>
                            <p className="text-red-700 cursor-pointer">Renvoyer le code</p>
                        </div>
                    </div>
                )}

                {step == 3 && publicToken != "" && (
                    <div>
                        <p className="text-small text-center text-default-500 mt-2">Saisir le nouveau mot de passe</p>
                        <Divider className="my-3" />
                        {alert && (
                            <div className="w-full">
                                <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                            </div>
                        )}
                        <div className="w-full flex flex-col gap-4">
                            <Input
                                aria-label="Mot de passe"
                                endContent={
                                    <button type="button" onClick={toggleVisibility}>
                                        {isPasswordVisible ? <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-closed-linear" /> : <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-bold" />}
                                    </button>
                                }
                                size="lg"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                label="Nouveau mot de passe"
                                placeholder=""
                                type={isPasswordVisible ? "text" : "password"}
                                variant="bordered"
                            />
                            <Input
                                aria-label="Mot de passe"
                                endContent={
                                    <button type="button" onClick={toggleConfirmPasswordVisibility}>
                                        {isConfirmPasswordVisible ? (
                                            <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-closed-linear" />
                                        ) : (
                                            <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-bold" />
                                        )}
                                    </button>
                                }
                                size="lg"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                label="Confimer le nouveau mot de passe"
                                placeholder=""
                                type={isConfirmPasswordVisible ? "text" : "password"}
                                variant="bordered"
                            />
                            <Button isLoading={loading} color="success" className="bg-red-600 text-white font-medium text-md py-6 w-full mt-5" type="button" onPress={submitRestaurePassword}>
                                Valider le mot passe
                            </Button>
                        </div>
                    </div>
                )}

                {step == 4 && publicToken != "" && (
                    <div className="flex flex-col gap-5 items-center justify-center">
                        <CheckOkIcon width={100} height={100} className="text-red-600" />
                        <p className="text-md text-center text-default-500 mt-2">Votre mot de passe a été réinitialisé avec succès. Veuillez vous connecter avec votre nouveau mot de passe.</p>
                        <Button as={Link} href={"/auth/login"} color="success" className="bg-red-600 text-white font-medium text-md py-6 w-full mt-5" type="button">
                            Se connecter
                        </Button>
                    </div>
                )}

                {step != 4 && (
                    <Button as={Link} href={"/"} color="default" className="border-1 font-medium text-md py-6 mt-5" type="default">
                        Annuler
                    </Button>
                )}
            </div>
        </div>
    );
}
