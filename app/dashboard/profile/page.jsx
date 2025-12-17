"use client";
import countries from "@/src/constants/countries";
import { cn } from "@/src/lib/cn";
import { selectUserData, setCurrentPage, setUserData } from "@/src/redux/slices/userSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { Icon } from "@iconify/react";
import { Autocomplete, AutocompleteItem, Avatar, Badge, Button, Card, CardBody, CardHeader, Divider, extendVariants, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch, Tab, Tabs, useDisclosure } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { Controller, Form, set, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import qs from "qs";
import api from "@/src/services/axios";
import AlertMessage from "@/app/ui/AlertMessage";
import { modalDefaulMotionProps } from "@/src/constants/animations";

const Profile = (props) => {
    const user = useSelector(selectUserData);
    const dispatch = useDispatch();
    dispatch(setCurrentPage("Mon profil"));
    const [editMode, setEditMode] = useState(false);
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userPhoto, setUserPhoto] = useState({
        preview: "/images/profile.png",
        raw: null,
    });

    /**
     * Manage Modals
     */
    const { isOpen: isOpenModalChangePassword, onOpen: onOpenModalChangePassword, onOpenChange: onOpenChangeModalChangePassword } = useDisclosure();
    const { isOpen: isOpenModalChangePhone, onOpen: onOpenModalChangePhone, onOpenChange: onOpenChangeModalChangePhone } = useDisclosure();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(userSchema),
        defaultValues: {
            country: "",
            city: "",
            firstname: "",
            lastname: "",
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                firstname: user.firstname ?? "",
                lastname: user.lastname ?? "",
                country: user.country ?? "",
                city: user.city ?? "",
            });
        }
    }, [user, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const { data: response } = await api.put("/user/profile", qs.stringify(data));
            if (response.status == 200) {
                dispatch(setUserData(response.userInfo));
                setAlert({
                    type: "success",
                    message: "Votre profil a été modifié avec succès",
                });
            } else {
                setAlert({
                    type: "danger",
                    message: response.message,
                });
            }
        } catch (error) {
            console.log(error);
            setAlert({
                type: "danger",
                message: "Une erreur est survenue lors de la mise à jour des informations du profil",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChangeAccountPhoto = (e) => {
        if (e.target.files.length) {
            setUserPhoto({
                preview: URL.createObjectURL(e.target.files[0]),
                raw: e.target.files[0],
            });
        }
    };

    const ProfileTab = (props) => {
        return (
            <Card className="max-w-xl p-2" {...props}>
                <CardHeader className="flex flex-col items-start px-4 pb-0 pt-4">
                    <p className="text-large">Mon profil</p>
                    <div className="flex gap-4 py-4">
                        <Badge
                            showOutline
                            classNames={{
                                badge: "w-10 h-10",
                            }}
                            color="default"
                            className="bg-red-600"
                            content={
                                <Button isIconOnly className="p-0 text-danger-foreground" radius="full" size="sm" variant="light">
                                    <Icon icon="solar:pen-2-linear" />
                                </Button>
                            }
                            placement="bottom-right"
                            shape="circle"
                        >
                            <Avatar className="h-28 w-28" src={userPhoto.preview} />
                        </Badge>
                        <div className="flex flex-col items-start justify-center">
                            <p className="font-bold text-xl">
                                {user.firstname} {user.lastname}
                            </p>
                            <span className="text-small text-default-500">SOFI BANK</span>
                            <span className="text-small text-default-500">Département : --</span>
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid w-full gap-4 ">
                            {/* Fisrtname */}
                            <Controller
                                name="firstname"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Prénom"
                                        placeholder="Saisir votre prénom"
                                        variant={errors.firstname ? "bordered" : "flat"}
                                        radius="lg"
                                        isInvalid={!!errors.firstname}
                                        errorMessage={errors.firstname?.message}
                                        className="w-full"
                                        labelPlacement="inside"
                                    />
                                )}
                            />

                            {/* Lastname */}
                            <Controller
                                name="lastname"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Nom de famille"
                                        placeholder="Saisir votre prénom"
                                        variant={errors.lastname ? "bordered" : "flat"}
                                        radius="lg"
                                        isInvalid={!!errors.lastname}
                                        errorMessage={errors.lastname?.message}
                                        className="w-full"
                                        labelPlacement="inside"
                                    />
                                )}
                            />

                            {/* Country */}
                            <Controller
                                name="country"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        className="w-full"
                                        {...field}
                                        onSelectionChange={(selectedItem) => {
                                            field.onChange(selectedItem);
                                        }}
                                        variant={errors.country ? "bordered" : "flat"}
                                        isInvalid={!!errors.country}
                                        errorMessage={errors.country?.message}
                                        defaultSelectedKey={user.country}
                                        defaultItems={countries}
                                        label={"Pays"}
                                        placeholder="Choisir le pays"
                                    >
                                        {countries.map((country) => (
                                            <AutocompleteItem key={country.code} startContent={<Avatar alt="Argentina" className="w-6 h-6" src={`https://flagcdn.com/${country.code.toLowerCase()}.svg`} />}>
                                                {country.name}
                                            </AutocompleteItem>
                                        ))}
                                    </Autocomplete>
                                )}
                            />
                            {/* City */}
                            <Controller
                                name="city"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        className="w-full"
                                        {...field}
                                        variant={errors.city ? "bordered" : "flat"}
                                        isInvalid={!!errors.city}
                                        errorMessage={errors.city?.message}
                                        defaultValue={field?.value?.toString() || ""}
                                        label="Ville"
                                        placeholder="eg. Kinshasa"
                                        radius="sm"
                                    />
                                )}
                            />
                        </div>

                        <div className="flex w-full justify-start gap-2">
                            <Button isLoading={loading} className="bg-red-600 text-white" color="success" radius="lg" type="submit">
                                Enregistrer les modifications
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        );
    };

    const SecurityTab = (props) => {
        return (
            <Card className="w-full max-w-lg p-2" {...props}>
                <CardHeader className="flex flex-col items-start px-4 pb-0 pt-4 mb-4">
                    <p className="text-large">Gestion de sécurité</p>
                    <p className="text-small text-default-500">Gérer vos préférences de sécurité</p>
                </CardHeader>
                <CardBody className="space-y-2">
                    {/* Phone */}
                    <CellWrapper>
                        <div>
                            <p>Numéro de téléphone</p>
                            <p className="text-small text-default-500">Utilisé comme identifiant de connexion</p>
                        </div>
                        <div className="flex w-full flex-wrap items-center justify-end gap-6 sm:w-auto sm:flex-nowrap">
                            <div className="flex flex-col items-end">
                                <p>{user.phone}</p>
                                <p className="text-small text-success">Verifié</p>
                            </div>
                            <Button onPress={onOpenModalChangePhone} endContent={<Icon icon="solar:pen-2-linear" />} radius="full" variant="bordered">
                                Modifier
                            </Button>
                        </div>
                    </CellWrapper>
                    {/* Email */}
                    <CellWrapper>
                        <div>
                            <p>Email</p>
                            <p className="text-small text-default-500">Utilisé comme identifiant de connexion</p>
                        </div>
                        <div className="flex w-full flex-wrap items-center justify-end gap-6 sm:w-auto sm:flex-nowrap">
                            <div className="flex flex-col items-end">
                                <p>{user.email}</p>
                                <p className="text-small text-success">Verifié</p>
                            </div>
                            <Button endContent={<Icon icon="solar:pen-2-linear" />} radius="full" variant="bordered">
                                Modifier
                            </Button>
                        </div>
                    </CellWrapper>
                    {/* Password */}
                    <CellWrapper>
                        <div>
                            <p>Password</p>
                            <p className="text-small text-default-500">Configurez un mot de passe unique et fort pour la protection de votrre compte</p>
                        </div>
                        <Button onPress={onOpenModalChangePassword} radius="full" variant="bordered">
                            Modifier
                        </Button>
                    </CellWrapper>

                    {/* Deactivate Account */}
                    <CellWrapper>
                        <div>
                            <p>Desactiver mon compte</p>
                            <p className="text-small text-default-500">Désactiver le compte pour un certain temps</p>
                        </div>
                        <Button radius="full" variant="bordered">
                            Désactiver
                        </Button>
                    </CellWrapper>
                    {/* Delete Account */}
                    <CellWrapper>
                        <div>
                            <p>Supprimer mon compte</p>
                            <p className="text-small text-default-500">Supprimer le compte et supprimer toutes les données</p>
                        </div>
                        <Button color="danger" radius="full" variant="flat">
                            Supprimer
                        </Button>
                    </CellWrapper>
                </CardBody>
            </Card>
        );
    };

    /**Modal change password */
    const ChangePasswordModal = ({ isOpen, onOpenChange }) => {
        const [error, setError] = useState(null);
        const [isOldPasswordVisible, setIdOldPasswordVisible] = useState(false);
        const [isNewPasswordVisible, setIdNewPasswordVisible] = useState(false);
        const [loadingChangePassword, setLoadingChangePassword] = useState(false);

        const {
            control,
            handleSubmit,
            formState: { errors, isSubmitting },
            reset,
        } = useForm({
            resolver: yupResolver(passwordSchema),
            defaultValues: {
                password: "",
                new_password: "",
            },
        });

        const onSubmitChangePassword = async (data) => {
            setLoadingChangePassword(true);
            try {
                const { data: response } = await api.put("/user/password", qs.stringify(data));
                if (response.status == 200) {
                    setAlert({
                        type: "success",
                        message: "Mot de passe modifié avec succès",
                    });
                    //Close Modal
                    onOpenChange(false);
                } else {
                    setError({
                        type: "danger",
                        message: response.message,
                    });
                }
            } catch (error) {
                console.log(error);
                setError({
                    type: "danger",
                    message: "Une erreur est survenue lors de la mise à jour des informations du profil",
                });
            } finally {
                setLoadingChangePassword(false);
            }
        };

        return (
            <Modal isDismissable={false} motionProps={modalDefaulMotionProps} size="2xl" isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center" scrollBehavior="normal">
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit(onSubmitChangePassword)}>
                            {error && (
                                <div className="px-5 mt-10">
                                    <AlertMessage type={error.type} message={error.message} onClose={() => setError(null)} />
                                </div>
                            )}
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="space-y-1">
                                    <h4 className="text-medium font-medium">MODIFIER LE MOT DE PASSE</h4>
                                </div>
                                <Divider className="my-1" />
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-5 mt-3">
                                    {/* Ancien mot de passe */}
                                    <Controller
                                        name="password"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                aria-label="Ancien mot de passe"
                                                autocomplete="new-password"
                                                endContent={
                                                    <button type="button" onClick={() => setIdOldPasswordVisible(!isOldPasswordVisible)}>
                                                        {isOldPasswordVisible ? (
                                                            <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-closed-linear" />
                                                        ) : (
                                                            <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-bold" />
                                                        )}
                                                    </button>
                                                }
                                                size="md"
                                                label="Ancien mot de passe"
                                                placeholder=""
                                                type={isOldPasswordVisible ? "text" : "password"}
                                                variant={errors.password ? "bordered" : "flat"}
                                                radius="sm"
                                                isInvalid={!!errors.password}
                                                errorMessage={errors.password?.message}
                                            />
                                        )}
                                    />
                                    {/* Ancien mot de passe */}
                                    <Controller
                                        name="new_password"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                aria-label="Nouveau mot de passe"
                                                autocomplete="new-password"
                                                endContent={
                                                    <button type="button" onClick={() => setIdNewPasswordVisible(!isNewPasswordVisible)}>
                                                        {isNewPasswordVisible ? (
                                                            <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-closed-linear" />
                                                        ) : (
                                                            <Icon className="pointer-events-none text-2xl text-default-400" icon="solar:eye-bold" />
                                                        )}
                                                    </button>
                                                }
                                                size="md"
                                                label="Nouveau mot de passe"
                                                placeholder=""
                                                type={isNewPasswordVisible ? "text" : "password"}
                                                variant={errors.new_password ? "bordered" : "flat"}
                                                radius="sm"
                                                isInvalid={!!errors.new_password}
                                                errorMessage={errors.new_password?.message}
                                            />
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
                                    disabled={loadingChangePassword}
                                >
                                    Fermer
                                </Button>
                                <Button className="bg-red-600 text-white" type="submit" isLoading={loadingChangePassword}>
                                    Modifier
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        );
    };

    /**Modal change phone */
    const ChangePhoneModal = ({ isOpen, onOpenChange }) => {
        const [error, setError] = useState(null);
        const [loadingChangePhone, setLoadingChangePhone] = useState(false);

        const {
            control,
            handleSubmit,
            formState: { errors, isSubmitting },
            reset,
        } = useForm({
            resolver: yupResolver(phoneSchema),
            defaultValues: {
                phone: "",
            },
        });

        useEffect(() => {
            if (user) {
                reset({
                    phone: user.phone ?? "",
                });
            }
        }, [user, reset]);

        const onSubmitChangePhone = async (data) => {
            setLoadingChangePhone(true);
            try {
                const { data: response } = await api.put("/user/phone", qs.stringify(data));
                if (response.status == 200) {
                    setAlert({
                        type: "success",
                        message: "Mot de passe modifié avec succès",
                    });
                    //Close Modal
                    onOpenChange(false);
                } else {
                    setError({
                        type: "danger",
                        message: response.message,
                    });
                }
            } catch (error) {
                console.log(error);
                setError({
                    type: "danger",
                    message: "Une erreur est survenue lors de la mise à jour des informations du profil",
                });
            } finally {
                setLoadingChangePhone(false);
            }
        };

        return (
            <Modal isDismissable={false} motionProps={modalDefaulMotionProps} size="2xl" isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center" scrollBehavior="normal">
                <ModalContent>
                    {(onClose) => (
                        <form onSubmit={handleSubmit(onSubmitChangePhone)}>
                            {error && (
                                <div className="px-5 mt-10">
                                    <AlertMessage type={error.type} message={error.message} onClose={() => setError(null)} />
                                </div>
                            )}
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="space-y-1">
                                    <h4 className="text-medium font-medium">MODIFIER LE NUMERO DE TELEPHONE</h4>
                                </div>
                                <Divider className="my-1" />
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-5 mt-3">
                                    {/* Champ du numéro de téléphone */}
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                aria-label="Nouveau numéro de téléphone"
                                                autocomplete="new-password"
                                                size="md"
                                                label="Numéro de téléphone"
                                                placeholder=""
                                                type="text"
                                                variant={errors.phone ? "bordered" : "flat"}
                                                radius="sm"
                                                isInvalid={!!errors.phone}
                                                errorMessage={errors.phone?.message}
                                            />
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
                                    disabled={loadingChangePhone}
                                >
                                    Fermer
                                </Button>
                                <Button className="bg-red-600 text-white" type="submit" isLoading={loadingChangePhone}>
                                    Modifier
                                </Button>
                            </ModalFooter>
                        </form>
                    )}
                </ModalContent>
            </Modal>
        );
    };

    return (
        <div className="max-w-3xl">
            <Card className="shadow-none">
                {alert && (
                    <div className="mt-5 px-3">
                        <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                    </div>
                )}
                <Tabs
                    classNames={{
                        tabList: "mx-4 mt-6 text-medium",
                        tabContent: "text-small",
                    }}
                    size="lg"
                >
                    <Tab
                        key="account-settings"
                        textValue="Account Settings"
                        title={
                            <div className="flex items-center gap-1.5">
                                <Icon icon="solar:user-id-bold" width={20} />
                                <p>Mon profil</p>
                            </div>
                        }
                    >
                        <ProfileTab className="p-2 shadow-none" />
                    </Tab>
                    <Tab
                        key="security-settings"
                        textValue="Security Settings"
                        title={
                            <div className="flex items-center gap-1.5">
                                <Icon icon="solar:shield-keyhole-bold" width={20} />
                                <p>Sécurité</p>
                            </div>
                        }
                    >
                        <SecurityTab className="p-2  shadow-none" />
                    </Tab>
                </Tabs>
            </Card>
            <ChangePasswordModal isOpen={isOpenModalChangePassword} onOpenChange={onOpenChangeModalChangePassword} />
            <ChangePhoneModal isOpen={isOpenModalChangePhone} onOpenChange={onOpenChangeModalChangePhone} />
        </div>
    );
};

const CellWrapper = React.forwardRef(function CellWrapper({ children, className, ...props }, ref) {
    return (
        <div ref={ref} className={cn("flex items-center justify-between gap-2 rounded-medium bg-content2 p-4", className)} {...props}>
            {children}
        </div>
    );
});

const userSchema = yup.object().shape({
    firstname: yup.string().required("Veuillez entrer votre prénom"),
    lastname: yup.string().required("Veuillez entrer votre nom"),
    country: yup.string().required("Veuillez choisir votre pays"),
    city: yup.string().required("Veuillez saisir votre ville"),
});

const passwordSchema = yup.object().shape({
    password: yup.string().required("Veuillez entrer l'ancien mot de passe"),
    new_password: yup.string().required("Veuillez entrer le nouveau mot de passe"),
});

const phoneSchema = yup.object().shape({
    phone: yup.string().required("Veuillez entrer le nouveau numéro de téléphone"),
});

export default Profile;
