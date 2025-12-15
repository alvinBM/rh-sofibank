"use client";
import { modalDefaulMotionProps } from "@/src/constants/animations";
import { Button, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs, Textarea } from "@nextui-org/react";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AlertMessage from "../../AlertMessage";
import { useCreateClient } from "@/src/hooks/useClients";

const AddClientModal = ({ isOpen, onOpenChange, onSubmitResult }) => {
    const [type, setType] = useState("1");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(clientSchema),
        defaultValues: {
            fullname: "",
            email: "",
            phone: "",
            companyName: "",
            nationalId: "",
            vatNumber: "",
            address: "",
            note: "",
        },
    });

    const createClientMutation = useCreateClient();

    const onSubmit = (data) => {
        onSubmitResult(null);
        setError(null);
        setLoading(true);
        const payload = { ...data, type };
        createClientMutation.mutate(payload, {
            onSuccess: (response) => {
                onSubmitResult(response);
                onOpenChange(false);
                reset();
                setLoading(false);
            },
            onError: (err) => {
                console.err("Erreur: ", err);
                setError({
                    type: "danger",
                    message: "Une erreur est survenue lors de l'enregistrement du client",
                });
                setLoading(false);
            },
        });
    };

    return (
        <Modal isDismissable={false} motionProps={modalDefaulMotionProps} size="2xl" isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center" scrollBehavior="normal">
            <ModalContent>
                {(onClose) => (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <div className="px-5 mt-10">
                                <AlertMessage type={error.type} message={error.message} onClose={() => setError(null)} />
                            </div>
                        )}
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="space-y-1">
                                <h4 className="text-medium font-medium">AJOUTER UN NOUVEAU CLIENT</h4>
                                <p className="text-small text-default-400 font-light">Saisissez les informations générales de votre client</p>
                            </div>
                            <Divider className="my-1" />
                        </ModalHeader>
                        <ModalBody>
                            <Tabs
                                selectedKey={type}
                                onSelectionChange={(key) => {
                                    setType(key);
                                    reset(); // Reset du formulaire lors du changement de type
                                }}
                                radius="sm"
                                variant="solid"
                                aria-label="Type de client"
                            >
                                <Tab key="1" title="Particulier" />
                                <Tab key="2" title="Entreprise" />
                            </Tabs>

                            <div className="flex flex-col gap-5 mt-3">
                                {type === "2" && (
                                    <div className="flex items-center gap-4">
                                        <p className="shrink-0 text-tiny text-default-500">RESPONSABLE (PERSONNE À CONTACTER)</p>
                                        <Divider className="flex-1" />
                                    </div>
                                )}

                                {/* Nom complet */}
                                <Controller
                                    name="fullname"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Nom complet"
                                            placeholder="Entrez le nom complet de votre client"
                                            variant={errors.fullname ? "bordered" : "flat"}
                                            radius="sm"
                                            isInvalid={!!errors.fullname}
                                            errorMessage={errors.fullname?.message}
                                        />
                                    )}
                                />

                                {/* Email et Téléphone */}
                                <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} label="Numéro de téléphone" placeholder="Ex. +243XXXXXXXXX" variant={errors.phone ? "bordered" : "flat"} radius="sm" isInvalid={!!errors.phone} errorMessage={errors.phone?.message} />
                                        )}
                                    />

                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                            <Input {...field} label="Adresse email" placeholder="Ex. exemple@mail.com" variant={errors.email ? "bordered" : "flat"} radius="sm" isInvalid={!!errors.email} errorMessage={errors.email?.message} />
                                        )}
                                    />
                                </div>

                                {type === "2" && (
                                    <>
                                        <div className="flex items-center gap-4">
                                            <p className="shrink-0 text-tiny text-default-500">{"INFORMATIONS DE L'ENTREPRISE"}</p>
                                            <Divider className="flex-1" />
                                        </div>

                                        {/* Nom de la société */}
                                        <Controller
                                            name="companyName"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="Nom de la société"
                                                    placeholder="Entrez le nom de la société"
                                                    variant={errors.companyName ? "bordered" : "flat"}
                                                    radius="sm"
                                                    isInvalid={!!errors.companyName}
                                                    errorMessage={errors.companyName?.message}
                                                />
                                            )}
                                        />

                                        {/* ID Nationale */}
                                        <Controller
                                            name="nationalId"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="ID Nationale"
                                                    placeholder="Entrez l'ID nationale de la société"
                                                    variant={errors.nationalId ? "bordered" : "flat"}
                                                    radius="sm"
                                                    isInvalid={!!errors.nationalId}
                                                    errorMessage={errors.nationalId?.message}
                                                />
                                            )}
                                        />

                                        {/* Numéro TVA */}
                                        <Controller
                                            name="vatNumber"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    label="Numéro TVA"
                                                    placeholder="Entrez le numéro TVA de la société"
                                                    variant={errors.vatNumber ? "bordered" : "flat"}
                                                    radius="sm"
                                                    isInvalid={!!errors.vatNumber}
                                                    errorMessage={errors.vatNumber?.message}
                                                />
                                            )}
                                        />
                                    </>
                                )}

                                {/* Adresse */}
                                <Controller
                                    name="address"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea {...field} label="Adresse" placeholder="Entrez l'adresse complète" radius="sm" variant={errors.address ? "bordered" : "flat"} isInvalid={!!errors.address} errorMessage={errors.address?.message} />
                                    )}
                                />

                                {/* Note */}
                                <Controller
                                    name="note"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea {...field} label="Note" placeholder="Entrez une note pour ce client" radius="sm" variant={errors.note ? "bordered" : "flat"} isInvalid={!!errors.note} errorMessage={errors.note?.message} />
                                    )}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color="default"
                                variant="flat"
                                onPress={() => {
                                    reset();
                                    onClose();
                                }}
                                disabled={loading}
                            >
                                Fermer
                            </Button>
                            <Button className="bg-red-600 text-white" type="submit" isLoading={loading}>
                                Enregistrer
                            </Button>
                        </ModalFooter>
                    </form>
                )}
            </ModalContent>
        </Modal>
    );
};

export const clientSchema = yup.object().shape({
    fullname: yup.string().required("Veuillez entrer le nom complet de votre client"),
    email: yup.string().email("Veuillez entrer une adresse email valide"),
    phone: yup.string().matches(/^\+?\d{10,15}$/, "Veuillez entrer un numéro de téléphone valide"),
    companyName: yup.string(),
    nationalId: yup.string(),
    vatNumber: yup.string(),
    address: yup.string(),
    note: yup.string(),
});

export default AddClientModal;
