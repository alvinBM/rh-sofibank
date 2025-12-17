"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, useDisclosure, Spinner } from "@nextui-org/react";
import { FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiCalendar, FiSend } from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { useGetPublicJobPostingById } from "@/src/hooks/useRecruitment";
import apiClient from "@/src/services/api-client";

export default function PublicJobPostingPage() {
    const params = useParams();
    const { id } = params;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { isOpen: isApplyOpen, onOpen: onApplyOpen, onClose: onApplyClose } = useDisclosure();

    const { data, isLoading } = useGetPublicJobPostingById(id);

    const posting = data;

    console.log("posting **** ", data);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmitApplication = async (data) => {
        try {
            setIsSubmitting(true);

            const formData = new FormData();
            formData.append("job_posting_id", id);
            formData.append("first_name", data.first_name);
            formData.append("last_name", data.last_name);
            formData.append("email", data.email);
            formData.append("phone", data.phone);
            formData.append("address", data.address || "");
            formData.append("cover_letter", data.cover_letter || "");
            formData.append("linkedin_url", data.linkedin_url || "");
            formData.append("portfolio_url", data.portfolio_url || "");
            formData.append("years_of_experience", data.years_of_experience || 0);
            formData.append("expected_salary", data.expected_salary || 0);
            formData.append("availability_date", data.availability_date || "");

            // Upload CV
            if (data.cv_file && data.cv_file.length > 0) {
                formData.append("cv_file", data.cv_file[0]);
                console.log("CV file added:", data.cv_file[0].name);
            }

            // Upload Cover Letter File
            if (data.cover_letter_file && data.cover_letter_file.length > 0) {
                formData.append("cover_letter_file", data.cover_letter_file[0]);
                console.log("Cover letter file added:", data.cover_letter_file[0].name);
            }

            // Upload Additional Documents
            if (data.additional_documents && data.additional_documents.length > 0) {
                for (let i = 0; i < data.additional_documents.length; i++) {
                    formData.append("additional_documents", data.additional_documents[i]);
                    console.log(`Additional document ${i + 1} added:`, data.additional_documents[i].name);
                }
            }

            // Log FormData contents for debugging
            console.log("FormData contents:");
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}:`, value.name, `(${value.size} bytes)`);
                } else {
                    console.log(`${key}:`, value);
                }
            }

            // Use fetch directly for file upload (apiClient doesn't support FormData properly)
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3600/api';
            const response = await fetch(`${API_BASE_URL}/recruitment/applications/public`, {
                method: 'POST',
                body: formData,
                // Don't set Content-Type header - browser will set it with boundary automatically
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Erreur lors de la soumission');
            }

            toast.success("Candidature soumise avec succès!");
            reset();
            onApplyClose();
        } catch (error) {
            console.error("Error submitting application:", error);
            toast.error(error.response?.data?.error || "Erreur lors de la soumission");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!posting) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardBody className="text-center py-8">
                        <h2 className="text-xl font-bold mb-2">Offre non trouvée</h2>
                        <p className="text-gray-500">Cette offre d'emploi n'existe pas ou a été retirée.</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    // Check if posting is published
    if (posting.status !== "published") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardBody className="text-center py-8">
                        <h2 className="text-xl font-bold mb-2">Offre non disponible</h2>
                        <p className="text-gray-500">Cette offre d'emploi n'est pas encore publiée.</p>
                    </CardBody>
                </Card>
            </div>
        );
    }

    const getContractTypeLabel = (type) => {
        const labels = {
            permanent: "CDI",
            fixed_term: "CDD",
            temporary: "Temporaire",
            internship: "Stage",
            consultant: "Consultant",
        };
        return labels[type] || type;
    };

    const getEmploymentTypeLabel = (type) => {
        const labels = {
            full_time: "Temps Plein",
            part_time: "Temps Partiel",
            contract: "Contrat",
        };
        return labels[type] || type;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <div className="bg-red-500 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-2">SOFIBANQUE</h1>
                    <p className="text-xl">Carrières & Opportunités</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="mb-6">
                        <CardBody className="p-8">
                            {/* Job Title & Quick Info */}
                            <div className="mb-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-3xl font-bold mb-2">{posting.title}</h2>
                                        <p className="text-gray-500">Réf: {posting.reference_code}</p>
                                    </div>
                                    <Button color="danger" size="lg" startContent={<FiSend />} onPress={onApplyOpen}>
                                        Postuler Maintenant
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-3 mb-4">
                                    <Chip startContent={<FiBriefcase />} variant="flat" color="danger">
                                        {posting.job_position?.title}
                                    </Chip>
                                    <Chip startContent={<FiMapPin />} variant="flat">
                                        {posting.location || "Non spécifié"}
                                    </Chip>
                                    <Chip variant="flat" color="success">
                                        {getContractTypeLabel(posting.contract_type)}
                                    </Chip>
                                    <Chip variant="flat">{getEmploymentTypeLabel(posting.employment_type)}</Chip>
                                </div>
                            </div>

                            {/* Key Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Direction</p>
                                    <p className="font-semibold">{posting.direction?.name}</p>
                                </div>
                                {posting.service && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Service</p>
                                        <p className="font-semibold">{posting.service?.name}</p>
                                    </div>
                                )}
                                {posting.grade && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Grade</p>
                                        <p className="font-semibold">{posting.grade?.name}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Postes Disponibles</p>
                                    <p className="font-semibold">{posting.positions_available || 1}</p>
                                </div>
                                {posting.application_deadline && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            <FiCalendar className="inline mr-1" />
                                            Date Limite
                                        </p>
                                        <p className="font-semibold text-danger-600">
                                            {new Date(posting.application_deadline).toLocaleDateString("fr-FR", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                )}
                                {(posting.salary_range_min || posting.salary_range_max) && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            <FiDollarSign className="inline mr-1" />
                                            Rémunération
                                        </p>
                                        <p className="font-semibold text-danger-700">
                                            {posting.salary_range_min ? `${parseInt(posting.salary_range_min).toLocaleString()} CFD` : ""} {posting.salary_range_min && posting.salary_range_max ? "à" : ""}{" "}
                                            {posting.salary_range_max ? `${parseInt(posting.salary_range_max).toLocaleString()} CFD` : ""}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Job Description */}
                            {posting.description && (
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold mb-3 text-danger-600">Description du Poste</h3>
                                    <p className="whitespace-pre-wrap text-justify text-gray-700">{posting.description}</p>
                                </div>
                            )}

                            {/* Responsibilities */}
                            {posting.responsibilities && (
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold mb-3 text-danger-600">Responsabilités</h3>
                                    <p className="whitespace-pre-wrap text-justify text-gray-700">{posting.responsibilities}</p>
                                </div>
                            )}

                            {/* Requirements */}
                            {posting.requirements && (
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold mb-3 text-danger-600">Exigences & Compétences</h3>
                                    <p className="whitespace-pre-wrap text-justify text-gray-700">{posting.requirements}</p>
                                </div>
                            )}

                            {/* Qualifications */}
                            {posting.qualifications && (
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold mb-3 text-danger-600">Qualifications</h3>
                                    <p className="whitespace-pre-wrap text-justify text-gray-700">{posting.qualifications}</p>
                                </div>
                            )}

                            {/* Benefits */}
                            {posting.benefits && (
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold mb-3 text-danger-600">Avantages & Bénéfices</h3>
                                    <p className="whitespace-pre-wrap text-justify text-gray-700">{posting.benefits}</p>
                                </div>
                            )}

                            {/* Call to Action */}
                            <div className="mt-8 p-6 bg-danger-50 rounded-lg border-2 border-danger-200">
                                <h3 className="text-xl font-bold mb-3 text-danger-700">Intéressé(e) par cette opportunité ?</h3>
                                <p className="mb-4 text-gray-700">Rejoignez notre équipe et contribuez à notre succès ! Cliquez sur le bouton ci-dessous pour soumettre votre candidature.</p>
                                <Button color="danger" size="lg" startContent={<FiSend />} onPress={onApplyOpen} className="w-full md:w-auto">
                                    Postuler à cette Offre
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Contact Info */}
                    {posting.receiving_email && (
                        <Card>
                            <CardBody className="text-center">
                                <p className="text-sm text-gray-600">
                                    Pour toute question concernant cette offre, contactez-nous à{" "}
                                    <a href={`mailto:${posting.receiving_email}`} className="text-danger-600 font-semibold hover:underline">
                                        {posting.receiving_email}
                                    </a>
                                </p>
                            </CardBody>
                        </Card>
                    )}
                </div>
            </div>

            {/* Application Modal */}
            <Modal isOpen={isApplyOpen} onClose={onApplyClose} size="5xl" scrollBehavior="outside" isDismissable={!isSubmitting}>
                <ModalContent>
                    <form onSubmit={handleSubmit(onSubmitApplication)}>
                        <ModalHeader>
                            <div>
                                <h3 className="text-2xl font-bold">Postuler à l'Offre</h3>
                                <p className="text-sm text-gray-500 font-normal mt-1">{posting.title}</p>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-6">
                                {/* Personal Information */}
                                <div>
                                    <h4 className="font-semibold text-lg mb-3 text-danger-600">Informations Personnelles</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Controller
                                            name="first_name"
                                            control={control}
                                            rules={{ required: "Le prénom est requis" }}
                                            render={({ field }) => <Input {...field} label="Prénom" placeholder="Votre prénom" isRequired isInvalid={!!errors.first_name} errorMessage={errors.first_name?.message} />}
                                        />
                                        <Controller
                                            name="last_name"
                                            control={control}
                                            rules={{ required: "Le nom est requis" }}
                                            render={({ field }) => <Input {...field} label="Nom" placeholder="Votre nom" isRequired isInvalid={!!errors.last_name} errorMessage={errors.last_name?.message} />}
                                        />
                                        <Controller
                                            name="email"
                                            control={control}
                                            rules={{
                                                required: "L'email est requis",
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: "Email invalide",
                                                },
                                            }}
                                            render={({ field }) => <Input {...field} type="email" label="Email" placeholder="votre.email@example.com" isRequired isInvalid={!!errors.email} errorMessage={errors.email?.message} />}
                                        />
                                        <Controller
                                            name="phone"
                                            control={control}
                                            rules={{ required: "Le téléphone est requis" }}
                                            render={({ field }) => <Input {...field} type="tel" label="Téléphone" placeholder="+243 XXX XXX XXX" isRequired isInvalid={!!errors.phone} errorMessage={errors.phone?.message} />}
                                        />
                                        <Controller name="address" control={control} render={({ field }) => <Input {...field} label="Adresse" placeholder="Votre adresse complète" className="md:col-span-2" />} />
                                    </div>
                                </div>

                                {/* Professional Information */}
                                <div>
                                    <h4 className="font-semibold text-lg mb-3 text-danger-600">Informations Professionnelles</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Controller name="years_of_experience" control={control} render={({ field }) => <Input {...field} type="number" label="Années d'Expérience" placeholder="0" min="0" />} />
                                        <Controller name="expected_salary" control={control} render={({ field }) => <Input {...field} type="number" label="Salaire Attendu (CFD)" placeholder="0" min="0" />} />
                                        <Controller name="availability_date" control={control} render={({ field }) => <Input {...field} type="date" label="Date de Disponibilité" placeholder="JJ/MM/AAAA" />} />
                                        <Controller name="linkedin_url" control={control} render={({ field }) => <Input {...field} type="url" label="Profil LinkedIn" placeholder="https://linkedin.com/in/..." />} />
                                        <Controller name="portfolio_url" control={control} render={({ field }) => <Input {...field} type="url" label="Portfolio / Site Web" placeholder="https://..." className="md:col-span-2" />} />
                                    </div>
                                </div>

                                {/* Cover Letter */}
                                <div>
                                    <h4 className="font-semibold text-lg mb-3 text-danger-600">Lettre de Motivation</h4>
                                    <Controller
                                        name="cover_letter"
                                        control={control}
                                        render={({ field }) => <Textarea {...field} label="Lettre de Motivation" placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..." minRows={6} />}
                                    />
                                </div>

                                {/* File Uploads */}
                                <div>
                                    <h4 className="font-semibold text-lg mb-3 text-danger-600">Documents</h4>
                                    <div className="space-y-4">
                                        <Controller
                                            name="cv_file"
                                            control={control}
                                            rules={{ required: "Le CV est requis" }}
                                            render={({ field: { onChange, value, ...field } }) => (
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">
                                                        CV / Curriculum Vitae <span className="text-danger">*</span>
                                                    </label>
                                                    <input
                                                        {...field}
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={(e) => onChange(e.target.files)}
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-danger-50 file:text-danger-700 hover:file:bg-danger-100"
                                                    />
                                                    {errors.cv_file && <p className="text-danger text-xs mt-1">{errors.cv_file.message}</p>}
                                                    <p className="text-xs text-gray-500 mt-1">Formats acceptés: PDF, DOC, DOCX (Max 5MB)</p>
                                                </div>
                                            )}
                                        />

                                        <Controller
                                            name="cover_letter_file"
                                            control={control}
                                            render={({ field: { onChange, value, ...field } }) => (
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Lettre de Motivation (Fichier) - Optionnel</label>
                                                    <input
                                                        {...field}
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={(e) => onChange(e.target.files)}
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-danger-50 file:text-danger-700 hover:file:bg-danger-100"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Formats acceptés: PDF, DOC, DOCX (Max 5MB)</p>
                                                </div>
                                            )}
                                        />

                                        <Controller
                                            name="additional_documents"
                                            control={control}
                                            render={({ field: { onChange, value, ...field } }) => (
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Documents Complémentaires - Optionnel</label>
                                                    <input
                                                        {...field}
                                                        type="file"
                                                        multiple
                                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                        onChange={(e) => onChange(e.target.files)}
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-danger-50 file:text-danger-700 hover:file:bg-danger-100"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Diplômes, certifications, références... (Max 3 fichiers, 5MB chacun)</p>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-warning-50 rounded-lg">
                                    <p className="text-sm text-warning-800">
                                        <strong>Note:</strong> Assurez-vous que toutes les informations fournies sont exactes. Les candidatures incomplètes ou contenant des informations erronées peuvent être rejetées.
                                    </p>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onApplyClose} isDisabled={isSubmitting}>
                                Annuler
                            </Button>
                            <Button color="danger" type="submit" isLoading={isSubmitting} startContent={!isSubmitting && <FiSend />}>
                                {isSubmitting ? "Envoi en cours..." : "Soumettre ma Candidature"}
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </div>
    );
}
