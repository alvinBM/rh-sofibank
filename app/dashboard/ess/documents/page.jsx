"use client";

import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { FiFileText, FiDownload, FiEye, FiSearch } from "react-icons/fi";
import { useGetMyDocuments } from "@/src/hooks/useESS";

const DOCUMENT_CATEGORIES = {
  contract: "Contrat",
  payslip: "Fiche de Paie",
  certificate: "Certificat",
  evaluation: "Évaluation",
  id: "Pièce d'Identité",
  other: "Autre",
};

export default function MyDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data: documents, isLoading } = useGetMyDocuments();

  const filteredDocuments = documents?.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || doc.document_type?.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mes Documents</h1>
          <p className="text-default-500">Consultez vos documents personnels</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex gap-4">
            <Input
              placeholder="Rechercher un document..."
              startContent={<FiSearch />}
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex-1"
            />

            <Select
              label="Catégorie"
              placeholder="Toutes les catégories"
              selectedKeys={categoryFilter ? [categoryFilter] : []}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-64"
            >
              {Object.entries(DOCUMENT_CATEGORIES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </Select>

            <Button variant="flat" onPress={() => {
              setSearchQuery("");
              setCategoryFilter("");
            }}>
              Réinitialiser
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" label="Chargement..." />
          </div>
        ) : filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} shadow="sm" className="hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FiFileText className="text-primary text-xl" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{doc.title}</h3>
                        <p className="text-sm text-default-500">{doc.document_type?.name}</p>
                        <div className="flex gap-3 mt-2 text-xs text-default-400">
                          <span>Ajouté le {new Date(doc.created_at).toLocaleDateString("fr-FR")}</span>
                          {doc.document_date && (
                            <span>Date: {new Date(doc.document_date).toLocaleDateString("fr-FR")}</span>
                          )}
                          {doc.expiry_date && (
                            <span>Expire: {new Date(doc.expiry_date).toLocaleDateString("fr-FR")}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Chip
                          size="sm"
                          variant="flat"
                          color="primary"
                        >
                          {DOCUMENT_CATEGORIES[doc.document_type?.category] || doc.document_type?.category}
                        </Chip>
                        {doc.is_confidential && (
                          <Chip size="sm" color="danger" variant="flat">
                            Confidentiel
                          </Chip>
                        )}
                      </div>
                    </div>

                    {doc.description && (
                      <p className="text-sm text-default-600 mt-2">{doc.description}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<FiEye />}
                      onPress={() => window.open(doc.file_url, "_blank")}
                    >
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      startContent={<FiDownload />}
                      as="a"
                      href={doc.file_url}
                      download={doc.file_name}
                    >
                      Télécharger
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <Card>
            <CardBody className="text-center py-12">
              <FiFileText className="mx-auto text-4xl text-default-300 mb-4" />
              <p className="text-default-500">Aucun document trouvé</p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
