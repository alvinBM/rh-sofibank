"use client";

import React, { useState } from "react";
import { Card, CardBody, Tabs, Tab, Button, Input, Chip, Avatar, Spinner, Divider, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { FiUser, FiEdit, FiSave, FiFileText, FiTrendingUp, FiUsers } from "react-icons/fi";
import { useGetMyProfile, useUpdateMyProfile, useGetMyContracts, useGetEmployeeHistory, useGetEmployeeDependents } from "@/src/hooks/useESS";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";

const MARITAL_STATUS_LABELS = {
    single: "Célibataire",
    married: "Marié(e)",
    divorced: "Divorcé(e)",
    widowed: "Veuf/Veuve",
};

const CONTRACT_TYPE_LABELS = {
    permanent: "CDI",
    fixed_term: "CDD",
    temporary: "Temporaire",
    internship: "Stage",
    consultant: "Consultant",
};

const CHANGE_TYPE_LABELS = {
    promotion: "Promotion",
    transfer: "Transfert",
    salary_increase: "Augmentation",
    position_change: "Changement de Poste",
    grade_change: "Changement de Grade",
    demotion: "Rétrogradation",
};

export default function MyProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const { data: profile, isLoading } = useGetMyProfile();
    const { data: contracts = [] } = useGetMyContracts();
    const { data: history = [] } = useGetEmployeeHistory(profile?.id);
    const { data: dependents = [] } = useGetEmployeeDependents(profile?.id);
    const updateProfile = useUpdateMyProfile();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        values: profile
            ? {
                  personal_email: profile.personal_email || "",
                  phone: profile.phone || "",
                  address_line1: profile.address_line1 || "",
                  address_line2: profile.address_line2 || "",
                  city: profile.city || "",
                  province: profile.province || "",
                  postal_code: profile.postal_code || "",
                  marital_status: profile.marital_status || "",
                  spouse_name: profile.spouse_name || "",
                  number_of_children: profile.number_of_children || 0,
                  emergency_contact_name: profile.emergency_contact_name || "",
                  emergency_contact_phone: profile.emergency_contact_phone || "",
                  emergency_contact_relationship: profile.emergency_contact_relationship || "",
              }
            : {},
    });

    const onSubmit = async (data) => {
        try {
            await updateProfile.mutateAsync(data);
            toast.success("Profil mis à jour avec succès");
            setIsEditing(false);
        } catch (error) {
            toast.error("Erreur lors de la mise à jour du profil");
            console.error(error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner size="lg" label="Chargement..." />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-danger">Profil introuvable</p>
            </div>
        );
    }

    const employee = profile;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Mon Profil</h1>
                {!isEditing ? (
                    <Button color="danger" startContent={<FiEdit />} onPress={() => setIsEditing(true)}>
                        Modifier
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            variant="flat"
                            onPress={() => {
                                reset();
                                setIsEditing(false);
                            }}
                        >
                            Annuler
                        </Button>
                        <Button color="danger" startContent={<FiSave />} onPress={handleSubmit(onSubmit)}>
                            Enregistrer
                        </Button>
                    </div>
                )}
            </div>

            {/* Profile Header */}
            <Card className="mb-6">
                <CardBody>
                    <div className="flex items-start gap-6">
                        <Avatar src={employee.profile_photo_url} name={`${employee.first_name?.[0]}${employee.last_name?.[0]}`} className="w-24 h-24 text-large" />

                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-1">
                                {employee.first_name} {employee.last_name}
                            </h2>
                            <p className="text-default-500 mb-2">
                                {employee.employee_number} • {employee.job_position?.title || "N/A"}
                            </p>
                            <div className="flex gap-4 mt-4">
                                <div>
                                    <p className="text-sm text-default-500">Direction</p>
                                    <p className="font-semibold">{employee.direction?.name || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-default-500">Service</p>
                                    <p className="font-semibold">{employee.service?.name || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-default-500">Grade</p>
                                    <p className="font-semibold">{employee.grade?.name || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-default-500">Statut</p>
                                    <Chip color={employee.employment_status === "active" ? "success" : "default"} size="sm">
                                        {employee.employment_status === "active" ? "Actif" : "Inactif"}
                                    </Chip>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardBody>
                        <Tabs aria-label="Profil tabs">
                            <Tab key="personal" title={<span className="flex items-center gap-2"><FiUser /> Informations</span>}>
                                <div className="py-4">
                                    <h3 className="text-lg font-bold mb-4">Informations Non Modifiables</h3>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <p className="text-sm text-default-500">Prénom</p>
                                            <p className="font-semibold">{employee.first_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-default-500">Nom</p>
                                            <p className="font-semibold">{employee.last_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-default-500">Email Professionnel</p>
                                            <p className="font-semibold">{employee.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-default-500">Date de Naissance</p>
                                            <p className="font-semibold">{employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString("fr-FR") : "-"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-default-500">Nationalité</p>
                                            <p className="font-semibold">{employee.nationality || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-default-500">CNI</p>
                                            <p className="font-semibold">{employee.national_id || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-default-500">Date d'Embauche</p>
                                            <p className="font-semibold">{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString("fr-FR") : "-"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-default-500">Type de Contrat</p>
                                            <p className="font-semibold">{employee.contract_type ? CONTRACT_TYPE_LABELS[employee.contract_type] : "-"}</p>
                                        </div>
                                    </div>

                                    <Divider className="my-6" />

                                    <h3 className="text-lg font-bold mb-4">Informations Modifiables</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Controller name="personal_email" control={control} render={({ field }) => <Input {...field} label="Email Personnel" type="email" isDisabled={!isEditing} />} />

                                        <Controller name="phone" control={control} render={({ field }) => <Input {...field} label="Téléphone" isDisabled={!isEditing} />} />

                                        <Controller
                                            name="marital_status"
                                            control={control}
                                            render={({ field }) => <Input {...field} label="Situation Matrimoniale" value={MARITAL_STATUS_LABELS[field.value] || field.value || ""} isDisabled={!isEditing} />}
                                        />

                                        <Controller name="spouse_name" control={control} render={({ field }) => <Input {...field} label="Nom du Conjoint" isDisabled={!isEditing} />} />

                                        <Controller name="number_of_children" control={control} render={({ field }) => <Input {...field} label="Nombre d'Enfants" type="number" isDisabled={!isEditing} />} />
                                    </div>
                                </div>
                            </Tab>

                            <Tab key="address" title="Adresse">
                                <div className="py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Controller name="address_line1" control={control} render={({ field }) => <Input {...field} label="Adresse Ligne 1" className="col-span-2" isDisabled={!isEditing} />} />

                                        <Controller name="address_line2" control={control} render={({ field }) => <Input {...field} label="Adresse Ligne 2" className="col-span-2" isDisabled={!isEditing} />} />

                                        <Controller name="city" control={control} render={({ field }) => <Input {...field} label="Ville" isDisabled={!isEditing} />} />

                                        <Controller name="province" control={control} render={({ field }) => <Input {...field} label="Province" isDisabled={!isEditing} />} />

                                        <Controller name="postal_code" control={control} render={({ field }) => <Input {...field} label="Code Postal" isDisabled={!isEditing} />} />
                                    </div>
                                </div>
                            </Tab>

                            <Tab key="emergency" title="Contact d'Urgence">
                                <div className="py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Controller name="emergency_contact_name" control={control} render={({ field }) => <Input {...field} label="Nom du Contact" isDisabled={!isEditing} />} />

                                        <Controller name="emergency_contact_phone" control={control} render={({ field }) => <Input {...field} label="Téléphone" isDisabled={!isEditing} />} />

                                        <Controller name="emergency_contact_relationship" control={control} render={({ field }) => <Input {...field} label="Relation" className="col-span-2" isDisabled={!isEditing} />} />
                                    </div>
                                </div>
                            </Tab>

                            <Tab key="contracts" title={<span className="flex items-center gap-2"><FiFileText /> Contrats</span>}>
                                <div className="py-4">
                                    {contracts.length === 0 ? (
                                        <p className="text-center text-default-500">Aucun contrat enregistré</p>
                                    ) : (
                                        <Table aria-label="Contracts table">
                                            <TableHeader>
                                                <TableColumn>TYPE</TableColumn>
                                                <TableColumn>PÉRIODE</TableColumn>
                                                <TableColumn>STATUT</TableColumn>
                                                <TableColumn>POSTE</TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                {contracts.map((contract) => (
                                                    <TableRow key={contract.id}>
                                                        <TableCell>{CONTRACT_TYPE_LABELS[contract.contract_type] || contract.contract_type}</TableCell>
                                                        <TableCell>
                                                            {new Date(contract.start_date).toLocaleDateString("fr-FR")}
                                                            {contract.end_date ? ` - ${new Date(contract.end_date).toLocaleDateString("fr-FR")}` : " - Indéterminé"}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip color={contract.status === "active" ? "success" : "default"} size="sm">
                                                                {contract.status}
                                                            </Chip>
                                                        </TableCell>
                                                        <TableCell>{contract.position || "-"}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            </Tab>

                            <Tab key="history" title={<span className="flex items-center gap-2"><FiTrendingUp /> Carrière</span>}>
                                <div className="py-4">
                                    {history.length === 0 ? (
                                        <p className="text-center text-default-500">Aucun historique de carrière</p>
                                    ) : (
                                        <Table aria-label="Career history table">
                                            <TableHeader>
                                                <TableColumn>DATE</TableColumn>
                                                <TableColumn>TYPE</TableColumn>
                                                <TableColumn>DÉTAILS</TableColumn>
                                                <TableColumn>RAISON</TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                {history.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>{new Date(item.effective_date).toLocaleDateString("fr-FR")}</TableCell>
                                                        <TableCell>
                                                            <Chip color="primary" size="sm">
                                                                {CHANGE_TYPE_LABELS[item.change_type] || item.change_type}
                                                            </Chip>
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.new_job_position && <div>Poste: {item.job_position?.title}</div>}
                                                            {item.new_grade && <div>Grade: {item.grade?.name}</div>}
                                                            {item.new_direction && <div>Direction: {item.direction?.name}</div>}
                                                            {item.new_salary && <div>Salaire: {item.new_salary} FC</div>}
                                                        </TableCell>
                                                        <TableCell>{item.reason || "-"}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            </Tab>

                            <Tab key="dependents" title={<span className="flex items-center gap-2"><FiUsers /> Dépendants</span>}>
                                <div className="py-4">
                                    {dependents.length === 0 ? (
                                        <p className="text-center text-default-500">Aucun dépendant enregistré</p>
                                    ) : (
                                        <Table aria-label="Dependents table">
                                            <TableHeader>
                                                <TableColumn>NOM COMPLET</TableColumn>
                                                <TableColumn>RELATION</TableColumn>
                                                <TableColumn>DATE DE NAISSANCE</TableColumn>
                                                <TableColumn>BÉNÉFICIAIRE</TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                {dependents.map((dependent) => (
                                                    <TableRow key={dependent.id}>
                                                        <TableCell>
                                                            {dependent.first_name} {dependent.last_name}
                                                        </TableCell>
                                                        <TableCell>{dependent.relationship}</TableCell>
                                                        <TableCell>{dependent.date_of_birth ? new Date(dependent.date_of_birth).toLocaleDateString("fr-FR") : "-"}</TableCell>
                                                        <TableCell>
                                                            <Chip color={dependent.is_beneficiary ? "success" : "default"} size="sm">
                                                                {dependent.is_beneficiary ? "Oui" : "Non"}
                                                            </Chip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            </Tab>
                        </Tabs>
                    </CardBody>
                </Card>
            </form>
        </div>
    );
}

