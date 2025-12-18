import React, { useState } from "react";
import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Select, SelectItem, Textarea, Chip } from "@nextui-org/react";
import { FiFileText, FiPlus, FiDownload, FiTrash2, FiCheckCircle } from "react-icons/fi";
import { useUploadEmployeeDocument, useDeleteEmployeeDocument } from "@/src/hooks/useEmployeeDocuments";
import { toast } from "react-toastify";

const DOCUMENT_TYPES = [
    { value: "contract", label: "Contrat de travail" },
    { value: "id_card", label: "Carte d'identité" },
    { value: "diploma", label: "Diplôme" },
    { value: "certificate", label: "Certificat" },
    { value: "attestation_service", label: "Attestation de service" },
    { value: "attestation_conge", label: "Attestation de congé" },
    { value: "evaluation", label: "Évaluation" },
    { value: "passport", label: "Passeport" },
    { value: "birth_certificate", label: "Acte de naissance" },
    { value: "other", label: "Autre" },
];

export default function DocumentsSection({ employeeId, documents, refetch }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [formData, setFormData] = useState({
        document_type_id: "",
        document_name: "",
        notes: "",
        expiry_date: "",
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const uploadMutation = useUploadEmployeeDocument();
    const deleteMutation = useDeleteEmployeeDocument();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            if (!formData.document_name) {
                setFormData({ ...formData, document_name: e.target.files[0].name });
            }
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            toast.error("Veuillez sélectionner un fichier");
            return;
        }

        const data = new FormData();
        data.append("document", selectedFile);
        data.append("document_type_id", formData.document_type_id);
        data.append("document_name", formData.document_name);
        if (formData.notes) data.append("notes", formData.notes);
        if (formData.expiry_date) data.append("expiry_date", formData.expiry_date);

        try {
            await uploadMutation.mutateAsync({ employeeId, formData: data });
            refetch();
            onClose();
            setFormData({
                document_type_id: "",
                document_name: "",
                notes: "",
                expiry_date: "",
            });
            setSelectedFile(null);
        } catch (error) {
            console.error("Upload error:", error);
        }
    };

    const handleDelete = async (documentId) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
            try {
                await deleteMutation.mutateAsync({ employeeId, documentId });
                refetch();
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };

    const handleDownload = (documentId, documentName) => {
        // Download implementation
        const link = document.createElement("a");
        link.href = `/api/employees/${employeeId}/documents/${documentId}/download`;
        link.download = documentName;
        link.click();
    };

    return (
        <Card className="mt-4">
            <CardBody>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Documents de l'Employé</h3>
                    <Button color="danger" size="sm" startContent={<FiPlus />} onPress={onOpen}>
                        Ajouter un Document
                    </Button>
                </div>

                {documents && documents.length > 0 ? (
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <Card key={doc.id} shadow="sm">
                                <CardBody>
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{doc.document_name}</p>
                                                {doc.is_verified && (
                                                    <Chip size="sm" color="success" startContent={<FiCheckCircle />}>
                                                        Vérifié
                                                    </Chip>
                                                )}
                                            </div>
                                            <p className="text-sm text-default-500">{doc.document_type?.name}</p>
                                            <p className="text-xs text-default-400">
                                                Ajouté le {new Date(doc.upload_date || doc.created_at).toLocaleDateString("fr-FR")}
                                            </p>
                                            {doc.expiry_date && (
                                                <p className="text-xs text-warning">Expire le {new Date(doc.expiry_date).toLocaleDateString("fr-FR")}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="flat" startContent={<FiDownload />} onPress={() => handleDownload(doc.id, doc.document_name)}>
                                                Télécharger
                                            </Button>
                                            <Button size="sm" color="danger" variant="light" isIconOnly onPress={() => handleDelete(doc.id)}>
                                                <FiTrash2 />
                                            </Button>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-default-400 py-8">Aucun document</p>
                )}
            </CardBody>

            <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                <ModalContent>
                    <ModalHeader>Ajouter un Document</ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <Input type="file" label="Fichier" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />

                            <Input label="Nom du document" placeholder="Ex: Contrat CDI 2024" value={formData.document_name} onChange={(e) => setFormData({ ...formData, document_name: e.target.value })} />

                            <Select label="Type de document" placeholder="Sélectionnez un type" selectedKeys={formData.document_type_id ? [formData.document_type_id] : []} onChange={(e) => setFormData({ ...formData, document_type_id: e.target.value })}>
                                {DOCUMENT_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Input type="date" label="Date d'expiration (optionnel)" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} />

                            <Textarea label="Notes (optionnel)" placeholder="Ajoutez des notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose}>
                            Annuler
                        </Button>
                        <Button color="danger" onPress={handleSubmit} isLoading={uploadMutation.isLoading}>
                            Ajouter
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Card>
    );
}
