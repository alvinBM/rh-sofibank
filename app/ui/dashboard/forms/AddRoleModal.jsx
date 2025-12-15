"use client";
import { modalDefaulMotionProps } from "@/src/constants/animations";
import { Button, DatePicker, Divider, Input, Listbox, ListboxItem, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Spinner, Switch, Tab, Tabs, Textarea, useDisclosure } from "@nextui-org/react";
import React, { use, useEffect, useState } from "react";
import { useForm, Controller, set, get } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AlertMessage from "../../AlertMessage";
import { cn } from "@/src/lib/cn";
import { Icon } from "@iconify/react";
import api from "@/src/services/axios";
import queryClient from "@/src/lib/react-query-client";

const AddRoleModal = ({ isOpen, onOpenChange, onSubmitResult, roleId }) => {
    const [type, setType] = useState("1");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isOpen: isOpenselectUserPermissionsModal, onOpen: onOpenselectUserPermissionsModal, onOpenChange: onOpenChangeselectUserPermissionsModal } = useDisclosure();
    const [permissions, setPermissions] = useState([]);
    const [features, setFeatures] = useState([]);
    const [loader, setLoader] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [loadingGetRole, setLoadingGetRole] = useState(false);
    const [role, setRole] = useState(null);

    useEffect(() => {
        if (roleId) {
            getRoleInfo();
        }
        getPermissionsAndFeatures();
    }, [roleId]);

    const getPermissionsAndFeatures = async () => {
        try {
            setLoader(true);
            const { data: response } = await api.get("main/permissions");
            console.log("response permissions **** ", response);
            if (response.status === 200) {
                setPermissions(response.permissions);

                const { data: response2 } = await api.get("main/features");
                if (response2.status === 200) {
                    setFeatures(response2.features);
                } else {
                    setError({
                        type: "danger",
                        message: response2.message,
                    });
                }
            } else {
                setError({
                    type: "danger",
                    message: response.message,
                });
            }
        } catch (error) {
            setError({
                type: "danger",
                message: "Une erreur est survenue lors de la récupération des permissions",
            });
        } finally {
            setLoader(false);
        }
    };

    const getRoleInfo = async () => {
        try {
            setLoadingGetRole(true);
            const { data: response } = await api.get(`main/roles/getRole/${roleId}`);
            if (response.status == 200) {
                console.log("response get role **** ", response);
                const role = response.role;
                setSelectedPermissions(response.permissions.map((perm) => ({ permission_id: parseInt(perm.permission_id), permission_name: perm.permission.permission_name, feature: perm.permission.feature })));
                setRole(role);
            } else {
                setError({
                    type: "danger",
                    message: response.message,
                });
            }
        } catch (error) {
            console.log("Error getting role *** ", error);
            setError({
                type: "danger",
                message: "Une erreur est survenue lors de la récupération des informations du rôle",
            });
        } finally {
            setLoadingGetRole(false);
        }
    };

    const handleAddOrRemoveToSelectedPermissions = (permissions, feature) => {
        // Vider toutes les permissions du feature puis ajouter les permissions sélectionnées de nouveau dans un tableau avec deja d'autres permissions existant
        const newPermissions = selectedPermissions.filter((perm) => perm.feature !== feature);
        permissions.forEach((perm) => {
            if (perm.isSelected) {
                newPermissions.push({ permission_id: perm.permission_id, permission_name: perm.permission_name, feature: feature });
            }
        });
        setSelectedPermissions(newPermissions);
        onOpenChangeselectUserPermissionsModal();
    };

    const getNbPermissions = (feature) => {
        return permissions.filter((perm) => perm.feature === feature).length;
    };

    const getNbSelectedPermissions = (feature) => {
        return selectedPermissions.filter((perm) => perm.feature === feature).length;
    };

    const isPemissionSelected = (permission_id) => {
        return selectedPermissions.filter((perm) => perm.permission_id === permission_id).length > 0;
    };

    const schema = yup.object().shape({
        name: yup.string().required("Le nom du rôle est requis"),
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm(
        {
            resolver: yupResolver(schema),
            defaultValues: {
                name: "",
            },
        },
        [role]
    );

    useEffect(() => {
        if (role) {
            reset({
                name: role.role_name || "",
            });
        }
    }, [role, reset]);

    const resetForm = () => {
        reset();
        setSelectedPermissions([]);
    };

    const onSubmit = async (data) => {
        onSubmitResult(null);
        const requestBody = { ...data, permissions: selectedPermissions };
        if (role) {
            requestBody.role_id = role.role_id;
        }
        setLoading(true);

        console.log("requestBody *** ", requestBody);

        try {
            let url = "main/roles";
            api.defaults.headers["Content-Type"] = "application/json";
            const { data: response } = await api.post(url, requestBody);
            if (response.status === 200) {
                onOpenChange(false);
                resetForm();
                onSubmitResult({
                    form: "role",
                    response: response,
                });
                queryClient.invalidateQueries("roles");
            } else {
                setError({ type: "danger", message: response.message });
                console.log("Error creating document *** ", response);
            }
        } catch (error) {
            console.error("Error creating purchases", error);
            setError({ type: "danger", message: error.message || "Une erreur est survenue lors de la création du rôle" });
        } finally {
            setLoading(false);
            api.defaults.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }
    };

    const ModalPemission = () => {
        //Initaliser les permissions avec isSelected à false utilisant les states permissions en filtrant le selectedFeature = permission.feature
        const [formPermissions, setFormPermissions] = useState(
            permissions.filter((permission) => permission.feature === selectedFeature).map((perm) => ({ ...perm, isSelected: selectedPermissions.filter((perm2) => perm2.permission_id === perm.permission_id).length > 0 }))
        );

        return (
            <Modal isDismissable={false} motionProps={modalDefaulMotionProps} size="2xl" isOpen={isOpenselectUserPermissionsModal} onOpenChange={onOpenChangeselectUserPermissionsModal} placement="center" scrollBehavior="outside">
                <ModalContent>
                    {(onClose) => (
                        <div>
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="space-y-1">
                                    <h4 className="text-medium font-medium">{features.filter((feat) => feat.key == selectedFeature)[0]?.name} - Permissions</h4>
                                </div>
                                <Divider className="my-1" />
                            </ModalHeader>
                            <ModalBody>
                                <h4>Choisir les permissions</h4>
                                <div className="flex flex-col gap-2 mt-4">
                                    {formPermissions.map((permission, index) => (
                                        <div key={index} className="flex items-center justify-between border-b-1 py-1">
                                            <div className="flex flex-col">
                                                <span className="text-default-800">{permission.permission_name_fr}</span>
                                                <small className="text-default-400 font-thin text-small">{permission.description}</small>
                                            </div>
                                            <Switch
                                                color="success"
                                                isSelected={permission.isSelected}
                                                onValueChange={(value) => {
                                                    const newPermissions = formPermissions.map((perm, i) => {
                                                        if (i === index) {
                                                            return { ...perm, isSelected: value };
                                                        }
                                                        return perm;
                                                    });
                                                    setFormPermissions(newPermissions);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </ModalBody>
                            <ModalFooter className="mt-10">
                                <Button
                                    color="default"
                                    variant="flat"
                                    onPress={() => {
                                        onClose();
                                    }}
                                >
                                    Fermer
                                </Button>
                                <Button onPress={() => handleAddOrRemoveToSelectedPermissions(formPermissions, selectedFeature)} className="bg-red-600 text-white px-10" type="button">
                                    Ajouter
                                </Button>
                            </ModalFooter>
                        </div>
                    )}
                </ModalContent>
            </Modal>
        );
    };

    return (
        <>
            <Modal isDismissable={true} motionProps={modalDefaulMotionProps} size="2xl" isOpen={isOpen} onOpenChange={onOpenChange} placement="center" scrollBehavior="outside">
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {loadingGetRole ||
                                (loader && (
                                    <ModalBody>
                                        <div className="flex flex-col items-center gap-2 p-10 h-96 justify-center">
                                            <Spinner color="success" size="lg" />
                                            <p className="text-red-600 text-center">Chargement des informations...</p>
                                        </div>
                                    </ModalBody>
                                ))}
                            {error && (
                                <div className="px-5 mt-10">
                                    <AlertMessage type={error.type} message={error.message} onClose={() => setError(null)} />
                                </div>
                            )}
                            {!loadingGetRole && !loader && (
                                <>
                                    <ModalHeader className="flex flex-col gap-1">
                                        <div className="space-y-1">
                                            <h4 className="text-medium font-medium">{role ? "Modifier le rôle : " + role.role_name : "CRÉER UN NOUVEAU RÔLE/GROUPE D'UTILISATEURS"}</h4>
                                            <p className="text-small text-default-400 font-light">{"Les rôles ou groupes d'utilisateurs vous permettent de définir un certain nombre d'accès sur votre compte"}</p>
                                        </div>
                                        <Divider className="my-1" />
                                    </ModalHeader>
                                    <ModalBody>
                                        <div className="flex flex-col gap-5 mt-3">
                                            {/* Nom du rôle */}
                                            <Controller
                                                name="name"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="Nom du rôle ou groupe d'utilisateurs"
                                                        placeholder="Ex. Comptable, Caissier, etc."
                                                        variant={errors.name ? "bordered" : "flat"}
                                                        radius="sm"
                                                        isInvalid={!!errors.name}
                                                        errorMessage={errors.name?.message}
                                                        // defaultValue={role ? role.role_name : ""}
                                                    />
                                                )}
                                            />

                                            <h3 className="pl-2 mb-0 mt-5">{"Droits d'accès"}</h3>
                                            {!loader && (
                                                <Listbox
                                                    aria-label="Modules"
                                                    className="p-0 gap-0 divide-y divide-default-300/50 dark:divide-default-100/80 bg-content1 w-full overflow-visible shadow-small rounded-medium"
                                                    itemClasses={{
                                                        base: "px-3 py-5 border-b-1 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-8 data-[hover=true]:bg-default-100/80",
                                                    }}
                                                    onAction={(key) => {
                                                        setSelectedFeature(key);
                                                        onOpenselectUserPermissionsModal();
                                                    }}
                                                >
                                                    {features.map((feature, index) => (
                                                        <ListboxItem
                                                            key={feature.key}
                                                            endContent={
                                                                <div className="flex gap-3 items-center">
                                                                    <small className={`${getNbSelectedPermissions(feature.key) > 0 ? "text-red-600 font-bold" : "text-default-400"}`}>
                                                                        {getNbSelectedPermissions(feature.key)} perms. /{getNbPermissions(feature.key)}
                                                                    </small>
                                                                    <Icon className="text-default-500 text-lg" icon="iconamoon:arrow-right-2-light" />
                                                                </div>
                                                            }
                                                            // startContent={
                                                            //     <IconWrapper className="bg-success/10 text-success">
                                                            //         <Icon icon="solar:bell-linear" />
                                                            //     </IconWrapper>
                                                            // }
                                                        >
                                                            {feature.name}
                                                        </ListboxItem>
                                                    ))}
                                                </Listbox>
                                            )}
                                            {loader && (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Spinner color="success" size="lg" />
                                                    <p className="text-default-400 text-center">Chargement des fonctionnalités...</p>
                                                </div>
                                            )}
                                        </div>
                                    </ModalBody>
                                    <ModalFooter className="">
                                        <Button
                                            color="default"
                                            variant="flat"
                                            onPress={() => {
                                                onClose();
                                            }}
                                            isDisabled={loading}
                                        >
                                            Fermer
                                        </Button>
                                        <Button isLoading={loading} className="bg-red-600 text-white w-44" type="submit">
                                            Enregistrer
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </form>
                    )}
                </ModalContent>
            </Modal>
            <ModalPemission />
        </>
    );
};

const IconWrapper = ({ children, className }) => <div className={cn(className, "flex items-center rounded-small justify-center w-7 h-7")}>{children}</div>;

export default AddRoleModal;
