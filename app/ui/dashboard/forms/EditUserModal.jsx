"use client";
import { modalDefaulMotionProps } from "@/src/constants/animations";
import { Button, Chip, DatePicker, Divider, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Spinner, Tab, Tabs, Textarea } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AlertMessage from "../../AlertMessage";
import { useGetBranches } from "@/src/hooks/useBranches";
import { Icon } from "@iconify/react";
import { useGetRolesByAccount } from "@/src/hooks/useMain";
import queryClient from "@/src/lib/react-query-client";
import api from "@/src/services/axios";
import qs from "qs";

const EditUserModal = ({ isOpen, onOpenChange, onSubmitResult, userId }) => {
    const [loading, setLoading] = useState(false);
    const [loadingGetUser, setLoadingGetUser] = useState(null);
    const [visiblePassword, setIsVisiblePassword] = useState(false);
    const toggleVisibility = () => setIsVisiblePassword(!visiblePassword);
    const [error, setError] = useState(null);
    const { data, isError, error: errorGetBranches, isLoading: isLoadingGetBranches } = useGetBranches({ page: 1, rowsPerPage: 1000 });
    const branches = data?.branches || [];
    const { data: dataRoles, isError: isErrorRoles, error: errorRoles, isLoading: isLoadingRoles } = useGetRolesByAccount({ page: 1, rowsPerPage: 1000, filterValue: null });
    const roles = dataRoles?.roles || [];
    const [user, setUser] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(accountSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            phone: "",
            email: "",
            store_id: "",
            roles: "",
            user_id: "",
        },
    });

    useEffect(() => {
        if (userId) {
            getUserInfo();
        }
    }, [userId]);

    useEffect(() => {
        if (user) {
            reset({
                firstname: user.firstname ?? "",
                lastname: user.lastname ?? "",
                phone: user.phone ?? "",
                email: user.email ?? "",
                store_id: user.root_store ?? "",
                roles: selectedRoles.join(","),
                user_id: user.id,
            });
        }
    }, [user]);

    const getUserInfo = async () => {
        try {
            setLoadingGetUser(true);
            const { data: response } = await api.get(`user/getUser/${userId}`);
            if (response.status == 200) {
                console.log("response get user **** ", response);
                const user = response.user;
                setUser(user);
                const selectedRoles = user.main_roles.map((role) => role.role_id.toString());
                setSelectedRoles(selectedRoles);
            } else {
                setError({
                    type: "danger",
                    message: response.message,
                });
            }
        } catch (error) {
            console.log("Error getting user *** ", error);
            setError({
                type: "danger",
                message: "Une erreur est survenue lors de la récupération des informations due l'utilisateur",
            });
        } finally {
            setLoadingGetUser(false);
        }
    };

    const onSubmit = async (data) => {
        onSubmitResult(null);
        const requestBody = { ...data };
        setLoading(true);
        try {
            const { data: response } = await api.put("user/update", qs.stringify(requestBody));
            if (response.status === 200) {
                onOpenChange(false);
                reset();
                onSubmitResult({
                    form: "user",
                    response: response,
                });
                queryClient.invalidateQueries("users");
            } else {
                setError({ type: "danger", message: response.message });
            }
        } catch (error) {
            console.error("Error creating", error);
            setError({ type: "danger", message: error.message || "Une erreur est survenue lors de la modification de l'utilisateur" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isDismissable={false} motionProps={modalDefaulMotionProps} size="2xl" isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center" scrollBehavior="normal">
            <ModalContent>
                {(onClose) => (
                    <>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {error && (
                                <div className="px-5 mt-10">
                                    <AlertMessage type={error.type} message={error.message} onClose={() => setError(null)} />
                                </div>
                            )}
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="space-y-1">
                                    <h4 className="text-medium font-medium">{"MODIFIER L'UTILISATEUR"}</h4>
                                    <p className="text-small text-default-400 font-light">{"Saisissez les informations de l'utilisateur"}</p>
                                </div>
                                <Divider className="my-1" />
                            </ModalHeader>
                            <ModalBody>
                                {(loadingGetUser || isLoadingGetBranches || isLoadingRoles) && (
                                    <div className="flex items-center justify-center p-20">
                                        <Spinner size="lg" className="text-red-600" color="success" />
                                    </div>
                                )}
                                {!loadingGetUser && !isLoadingGetBranches && !isLoadingRoles && user && (
                                    <div className="flex flex-col gap-5 mt-3">
                                        {/* Firstname & Lastname */}
                                        <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
                                            <Controller
                                                name="firstname"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} label="Prénom" placeholder="" variant={errors.firstname ? "bordered" : "flat"} radius="sm" isInvalid={!!errors.firstname} errorMessage={errors.firstname?.message} />
                                                )}
                                            />

                                            <Controller
                                                name="lastname"
                                                control={control}
                                                render={({ field }) => <Input {...field} label="Nom" placeholder="" variant={errors.lastname ? "bordered" : "flat"} radius="sm" isInvalid={!!errors.lastname} errorMessage={errors.lastname?.message} />}
                                            />
                                        </div>

                                        {/* Email et Téléphone */}
                                        <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
                                            <Controller
                                                name="phone"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="Numéro de téléphone"
                                                        placeholder="Ex. +243XXXXXXXXX"
                                                        variant={errors.phone ? "bordered" : "flat"}
                                                        radius="sm"
                                                        isInvalid={!!errors.phone}
                                                        errorMessage={errors.phone?.message}
                                                    />
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

                                        <Divider />

                                        <Controller
                                            name="store_id"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    size="lg"
                                                    isLoading={isLoadingGetBranches}
                                                    {...field}
                                                    isInvalid={!!errors.store_id}
                                                    labelPlacement="outside"
                                                    label="Définir le magasin par défaut de l'utilisateur*"
                                                    placeholder="Choisir une branche"
                                                    radius="sm"
                                                    selectedKeys={[field?.value.toString()]}
                                                    errorMessage={errors.store_id?.message}
                                                    className="font-thin"
                                                >
                                                    {branches.map((item) => (
                                                        <SelectItem key={item.id}>{item.name}</SelectItem>
                                                    ))}
                                                </Select>
                                            )}
                                        />

                                        <Divider />

                                        <Controller
                                            name="roles"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    color="success"
                                                    size="lg"
                                                    isLoading={isLoadingRoles}
                                                    className="w-full"
                                                    labelPlacement="outside"
                                                    label="Définir les rôles de l'utilisateur*"
                                                    placeholder="Choisir un ou plusieurs rôles"
                                                    selectionMode="multiple"
                                                    isMultiline={true}
                                                    items={roles}
                                                    variant={errors.roles ? "bordered" : "flat"}
                                                    radius="sm"
                                                    isInvalid={!!errors.roles}
                                                    errorMessage={errors.roles?.message}
                                                    defaultSelectedKeys={selectedRoles}
                                                    renderValue={(items) => {
                                                        return (
                                                            <div className="flex flex-wrap gap-2">
                                                                {items.map((item) => (
                                                                    <Chip color="success" className="bg-red-600 text-white" key={item.key}>
                                                                        {item.data.role_name}
                                                                    </Chip>
                                                                ))}
                                                            </div>
                                                        );
                                                    }}
                                                >
                                                    {(role) => <SelectItem key={role.role_id}>{role.role_name}</SelectItem>}
                                                </Select>
                                            )}
                                        />
                                    </div>
                                )}
                            </ModalBody>
                            {!loadingGetUser && user && (
                                <ModalFooter>
                                    <Button
                                        color="default"
                                        variant="flat"
                                        onPress={() => {
                                            reset();
                                            onClose();
                                        }}
                                        disabled={loading}
                                        className={" bg-white border  font-semibold text-center"}
                                    >
                                        Annuler
                                    </Button>
                                    <Button className="bg-red-600 text-white px-10" type="submit" isLoading={loading}>
                                        Enregistrer
                                    </Button>
                                </ModalFooter>
                            )}
                        </form>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export const accountSchema = yup.object().shape({
    firstname: yup.string().required("Veuillez entrer le prénom de l'utilisateur"),
    lastname: yup.string().required("Veuillez entrer le nom de l'utilisateur"),
    phone: yup.string().required("Veuillez entrer le numéro de téléphone de l'utilisateur"),
    email: yup.string().optional(),
    store_id: yup.number("Veuillez choir la branche").required("Veuillez choisir une branche/magasin"),
    roles: yup.string().required("Veuillez choisir un ou plusieurs rôles"),
});

export default EditUserModal;
