"use client";
import { selectUserData, setUserData } from "@/src/redux/slices/userSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import { Icon } from "@iconify/react";
import { Autocomplete, AutocompleteItem, Avatar, Button, Card, CardBody, CardFooter, CardHeader, Form, Input, Select, SelectItem } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import AlertMessage from "@/app/ui/AlertMessage";
import { IoCameraOutline } from "react-icons/io5";
import secteursActivite from "@/app/ui/setupComponents/company-industries";
import countries from "@/src/constants/countries";
import api from "@/src/services/axios";
import qs from "qs";
import Image from "next/image";

const Settings = () => {
    const user = useSelector(selectUserData);
    const dispatch = useDispatch();
    const [editMode, setEditMode] = useState(false);
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingAccountLogo, setLoadingAccountLogo] = useState(false);
    const [accountPhoto, setAccountPhoto] = useState({
        preview: user?.account?.logo ?? "/images/No-Image-Placeholder.png",
        raw: null,
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(accountSchema),
        defaultValues: {
            business_name: "",
            category: "",
            country: "",
            city: "",
            address: "",
            email: "",
            phone: "",
        },
    });

    useEffect(() => {
        if (user.account) {
            reset({
                business_name: user?.account?.business_name ?? "",
                description: user.account.description ?? "",
                category: user.account.category ?? "",
                country: user.account.country ?? "",
                city: user.account.city ?? "",
                address: user.account.address ?? "",
                email: user.account.email ?? "",
                phone: user.account.phone ?? "",
            });
        }
    }, [user.account, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const { data: response } = await api.put("/account", qs.stringify(data));
            if (response.status == 200) {
                dispatch(setUserData(response.userInfo));
                setAlert({
                    type: "success",
                    message: "Informations du compte mises à jour avec succès",
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
                message: "Une erreur est survenue lors de la mise à jour des informations du compte",
            });
        } finally {
            setLoading(false);
        }
    };

    const uploadAccountLogo = async () => {
        try {
            setLoadingAccountLogo(true);
            api.defaults.headers["Content-Type"] = "multipart/form-data";
            const formData = new FormData();
            formData.append("photos", accountPhoto.raw);
            const { data: response } = await api.post("/account/uploadLogo", formData);
            if (response.status == 200) {
                dispatch(setUserData(response.userInfo));
                setAlert({
                    type: "success",
                    message: "Logo de l'entreprise mis à jour avec succès",
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
                message: "Une erreur est survenue lors de la mise à jour du logo de l'entreprise",
            });
        } finally {
            api.defaults.headers["Content-Type"] = "application/x-www-form-urlencoded";
            setLoadingAccountLogo(false);
        }
    };

    const handleChangeAccountPhoto = (e) => {
        if (e.target.files.length) {
            setAccountPhoto({
                preview: URL.createObjectURL(e.target.files[0]),
                raw: e.target.files[0],
            });
        }
    };

    return (
        <div className="flex flex-col">
            <Card className="shadow-none dark:bg-background h-min-screen">
                <CardHeader className="font-bold flex justify-between px-5">
                    <span className="text-xl font-bold">{"Détail de l'entreprise"}</span>
                    <Button onPress={() => setEditMode(!editMode)} variant="light" startContent={<Icon icon={editMode ? "formkit:close" : "iconoir:edit"} width={20} />} size="sm">
                        {editMode ? "Annuler" : "Modifier"}
                    </Button>
                </CardHeader>
                <CardBody className="pb-10">
                    {alert && (
                        <div className="mt-1 px-3">
                            <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-12 sm:gap-6 gap-0 px-2">
                        <div className="col-span-4 mb-5">
                            <Card radius="md" className="border-none w-full shadow-none mb-3 bg-default-100 p-2">
                                <span className="mb-2">{"Logo de l'entreprise"}</span>
                                <Image alt="Logo de l'entreprise" className="w-full rounded-md" layout="responsive" width={1920} height={1080} src={accountPhoto.preview} />
                            </Card>
                            {!loadingAccountLogo && (
                                <>
                                    <Button fullWidth={true} endContent={<IoCameraOutline size={20} />} className="text-tiny text-white bg-black/70" variant="flat" color="default" radius="lg" size="md">
                                        Choisir une image
                                    </Button>
                                    {/* Fichier */}
                                    <Input
                                        onChange={handleChangeAccountPhoto}
                                        accept="image/png, image/gif, image/jpeg"
                                        type="file"
                                        aria-label="Fichier (Image) *"
                                        placeholder=""
                                        radius="lg"
                                        size="md"
                                        className="cursor-pointer mt-[-40px] opacity-0"
                                    />
                                </>
                            )}

                            {accountPhoto.raw && (
                                <Button isLoading={loadingAccountLogo} onPress={uploadAccountLogo} fullWidth={true} className="text-tiny text-white bg-red-600 mt-3" variant="flat" color="default" radius="lg" size="md">
                                    Télécharger la photo
                                </Button>
                            )}
                        </div>
                        <div className="col-span-8">
                            <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
                                <Controller
                                    disabled={!editMode}
                                    name="business_name"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Nom de l'entreprise"
                                            placeholder="Saisir le nom de la branche"
                                            variant={errors.business_name ? "bordered" : "flat"}
                                            radius="sm"
                                            isInvalid={!!errors.business_name}
                                            errorMessage={errors.business_name?.message}
                                            className="w-full disabled:text-red-800"
                                        />
                                    )}
                                />
                                <Controller
                                    disabled={!editMode}
                                    name="category"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            variant={errors.category ? "bordered" : "flat"}
                                            isInvalid={!!errors.category}
                                            errorMessage={errors.category?.message}
                                            selectedKeys={[field?.value?.toString()]}
                                            className="col-span-12"
                                            items={secteursActivite}
                                            label="Secteur d'activité"
                                            placeholder="Choisissez la catégorie de votre entreprise"
                                            defaultSelectedKeys={[field?.value?.toString()]}
                                            onSelectionChange={(selectedItem) => {
                                                field.onChange(selectedItem);
                                            }}
                                        >
                                            {(companyIndustry) => <SelectItem key={companyIndustry.value}>{companyIndustry.title}</SelectItem>}
                                        </Select>
                                    )}
                                />
                                <div className="flex flex-col md:flex-row gap-5">
                                    <Controller
                                        disabled={!editMode}
                                        name="country"
                                        control={control}
                                        render={({ field }) => (
                                            <Autocomplete
                                                {...field}
                                                autoComplete="off"
                                                isReadOnly={!editMode}
                                                onSelectionChange={(selectedItem) => {
                                                    field.onChange(selectedItem);
                                                }}
                                                variant={errors.country ? "bordered" : "flat"}
                                                isInvalid={!!errors.country}
                                                errorMessage={errors.country?.message}
                                                defaultSelectedKey={user?.account?.country}
                                                className="col-span-12"
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
                                    <Controller
                                        disabled={!editMode}
                                        name="city"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                variant={errors.city ? "bordered" : "flat"}
                                                isInvalid={!!errors.city}
                                                errorMessage={errors.city?.message}
                                                defaultValue={field?.value?.toString() || ""}
                                                className="col-span-12"
                                                label="Ville"
                                                placeholder="eg. Kinshasa"
                                                radius="sm"
                                            />
                                        )}
                                    />
                                </div>
                                <Controller
                                    disabled={!editMode}
                                    name="address"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            variant={errors.address ? "bordered" : "flat"}
                                            isInvalid={!!errors.address}
                                            errorMessage={errors.address?.message}
                                            defaultValue={field?.value?.toString() || ""}
                                            className="col-span-12"
                                            label="Adresse"
                                            placeholder="XXX, Avenue/Rue, Commune...."
                                            radius="sm"
                                        />
                                    )}
                                />
                                <div className="flex flex-col md:flex-row gap-5">
                                    <Controller
                                        disabled={!editMode}
                                        name="phone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                variant={errors.phone ? "bordered" : "flat"}
                                                isInvalid={!!errors.phone}
                                                errorMessage={errors.phone?.message}
                                                defaultValue={field?.value?.toString() || ""}
                                                className="col-span-12"
                                                label="Téléphone"
                                                placeholder=""
                                                radius="sm"
                                            />
                                        )}
                                    />
                                    <Controller
                                        disabled={!editMode}
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                variant={errors.email ? "bordered" : "flat"}
                                                isInvalid={!!errors.email}
                                                errorMessage={errors.email?.message}
                                                defaultValue={field?.value?.toString() || ""}
                                                className="col-span-12"
                                                label="Email"
                                                placeholder="eg. example@gmail.com"
                                                radius="sm"
                                            />
                                        )}
                                    />
                                </div>
                                {editMode && (
                                    <Button className="w-full bg-red-600 text-white lg:w-56" type="submit" isLoading={loading}>
                                        Enregistrer les modifications
                                    </Button>
                                )}
                            </form>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export const accountSchema = yup.object().shape({
    business_name: yup.string().required("Veuillez entrer de le nom de l'entreprise'"),
    country: yup.string().required("Veuillez choisir un pays"),
    city: yup.string().required("Veuillez saisir votre ville"),
    address: yup.string(),
    category: yup.string(),
    email: yup.string(),
    phone: yup.string().required("Numéro de téléphone réquis"),
});

export default Settings;
