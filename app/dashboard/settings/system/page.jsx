"use client";

import React, { useState, useMemo, useCallback } from "react";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Chip,
  Spinner,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Card,
  CardBody,
  Switch,
} from "@nextui-org/react";
import {
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiSettings,
  FiToggleLeft,
  FiDollarSign,
  FiPackage,
} from "react-icons/fi";
import {
  useGetSystemParameters,
  useCreateSystemParameter,
  useUpdateSystemParameter,
  useDeleteSystemParameter,
} from "@/src/hooks/useSettings";
import { toast } from "react-toastify";

const PARAMETER_CATEGORIES = [
  { value: "general", label: "Général", icon: FiSettings },
  { value: "payroll", label: "Paie", icon: FiDollarSign },
  { value: "modules", label: "Modules", icon: FiPackage },
  { value: "integration", label: "Intégrations", icon: FiToggleLeft },
];

const DATA_TYPES = [
  { value: "string", label: "Texte" },
  { value: "number", label: "Nombre" },
  { value: "boolean", label: "Booléen" },
  { value: "json", label: "JSON" },
];

export default function SystemPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    data_type: "string",
    category: "general",
    description: "",
    is_editable: true,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, isLoading, error } = useGetSystemParameters({
    page: 1,
    rowsPerPage: 1000,
    query: searchQuery,
  });

  const createParameterMutation = useCreateSystemParameter();
  const updateParameterMutation = useUpdateSystemParameter();
  const deleteParameterMutation = useDeleteSystemParameter();

  const parameters = data?.parameters || [];

  const filteredParameters = useMemo(() => {
    if (selectedCategory === "all") return parameters;
    return parameters.filter(p => p.category === selectedCategory);
  }, [parameters, selectedCategory]);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handleOpenCreate = () => {
    setEditMode(false);
    setSelectedParameter(null);
    setFormData({
      key: "",
      value: "",
      data_type: "string",
      category: "general",
      description: "",
      is_editable: true,
    });
    onOpen();
  };

  const handleOpenEdit = (parameter) => {
    setEditMode(true);
    setSelectedParameter(parameter);
    setFormData({
      key: parameter.key || "",
      value: parameter.value || "",
      data_type: parameter.data_type || "string",
      category: parameter.category || "general",
      description: parameter.description || "",
      is_editable: parameter.is_editable ?? true,
    });
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      let processedValue = formData.value;

      // Process value based on data type
      if (formData.data_type === "number") {
        processedValue = Number(formData.value);
      } else if (formData.data_type === "boolean") {
        processedValue = formData.value === "true" || formData.value === true;
      } else if (formData.data_type === "json") {
        try {
          processedValue = JSON.parse(formData.value);
        } catch (e) {
          toast.error("Format JSON invalide");
          return;
        }
      }

      const payload = {
        ...formData,
        value: processedValue,
      };

      if (editMode && selectedParameter) {
        await updateParameterMutation.mutateAsync({
          parameterId: selectedParameter.id,
          parameterData: payload,
        });
        toast.success("Paramètre modifié avec succès");
      } else {
        await createParameterMutation.mutateAsync(payload);
        toast.success("Paramètre créé avec succès");
      }
      onClose();
    } catch (error) {
      toast.error("Erreur: " + error.message);
    }
  };

  const handleDelete = async (parameterId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce paramètre ?")) {
      try {
        await deleteParameterMutation.mutateAsync(parameterId);
        toast.success("Paramètre supprimé avec succès");
      } catch (error) {
        toast.error("Erreur: " + error.message);
      }
    }
  };

  const renderValue = (parameter) => {
    if (parameter.data_type === "boolean") {
      return (
        <Chip size="sm" variant="flat" color={parameter.value ? "success" : "danger"}>
          {parameter.value ? "Activé" : "Désactivé"}
        </Chip>
      );
    }

    if (parameter.data_type === "json") {
      return (
        <code className="text-xs bg-default-100 p-1 rounded">
          {JSON.stringify(parameter.value)}
        </code>
      );
    }

    return <span className="text-sm">{String(parameter.value)}</span>;
  };

  const renderCell = useCallback((parameter, columnKey) => {
    switch (columnKey) {
      case "key":
        return (
          <div>
            <p className="font-semibold">{parameter.key}</p>
            <p className="text-xs text-default-400">
              {PARAMETER_CATEGORIES.find(c => c.value === parameter.category)?.label}
            </p>
          </div>
        );
      case "value":
        return renderValue(parameter);
      case "data_type":
        return (
          <Chip size="sm" variant="flat">
            {DATA_TYPES.find(d => d.value === parameter.data_type)?.label}
          </Chip>
        );
      case "description":
        return <span className="text-sm">{parameter.description || "-"}</span>;
      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <FiMoreVertical className="text-default-400" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                key="edit"
                startContent={<FiEdit />}
                onPress={() => handleOpenEdit(parameter)}
                isDisabled={!parameter.is_editable}
              >
                Modifier
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<FiTrash2 />}
                onPress={() => handleDelete(parameter.id)}
                isDisabled={!parameter.is_editable}
              >
                Supprimer
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return parameter[columnKey];
    }
  }, []);

  const categoriesWithCounts = useMemo(() => {
    const counts = {};
    PARAMETER_CATEGORIES.forEach(cat => {
      counts[cat.value] = parameters.filter(p => p.category === cat.value).length;
    });
    return counts;
  }, [parameters]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-danger">Erreur lors du chargement des paramètres</p>
          <p className="text-sm text-default-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermissions={[]}>
      <div className="p-0">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Paramètres Système</h1>
            <Button
              color="danger"
              startContent={<FiPlus />}
              onPress={handleOpenCreate}
            >
              Nouveau Paramètre
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {PARAMETER_CATEGORIES.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <Card
                  key={category.value}
                  isPressable
                  onPress={() => setSelectedCategory(category.value)}
                  className={selectedCategory === category.value ? "border-2 border-danger" : ""}
                >
                  <CardBody className="flex flex-row items-center gap-3">
                    <div className="p-3 rounded-lg bg-danger/10">
                      <CategoryIcon className="text-danger text-2xl" />
                    </div>
                    <div>
                      <p className="text-sm text-default-400">{category.label}</p>
                      <p className="text-2xl font-bold">
                        {categoriesWithCounts[category.value] || 0}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Input
              isClearable
              placeholder="Rechercher un paramètre..."
              startContent={<FiSearch />}
              value={searchQuery}
              onValueChange={handleSearchChange}
              className="flex-1"
            />
            <Button
              variant={selectedCategory === "all" ? "solid" : "flat"}
              color={selectedCategory === "all" ? "danger" : "default"}
              onPress={() => setSelectedCategory("all")}
            >
              Tous
            </Button>
          </div>

          <Table
            aria-label="Table des paramètres système"
            classNames={{
              wrapper: "min-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn key="key">CLÉ</TableColumn>
              <TableColumn key="value">VALEUR</TableColumn>
              <TableColumn key="data_type">TYPE</TableColumn>
              <TableColumn key="description">DESCRIPTION</TableColumn>
              <TableColumn key="actions">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              items={filteredParameters}
              isLoading={isLoading}
              loadingContent={<Spinner label="Chargement..." />}
              emptyContent="Aucun paramètre trouvé"
            >
              {(parameter) => (
                <TableRow key={parameter.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(parameter, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Quick Settings Panel */}
          <Card className="mt-4">
            <CardBody>
              <h3 className="text-lg font-bold mb-4">Paramètres Rapides</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredParameters
                  .filter(p => p.data_type === "boolean")
                  .slice(0, 6)
                  .map((parameter) => (
                    <div
                      key={parameter.id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{parameter.key}</p>
                        <p className="text-xs text-default-400">{parameter.description}</p>
                      </div>
                      <Switch
                        isSelected={parameter.value === true}
                        onValueChange={async (value) => {
                          try {
                            await updateParameterMutation.mutateAsync({
                              parameterId: parameter.id,
                              parameterData: { ...parameter, value },
                            });
                            toast.success("Paramètre mis à jour");
                          } catch (error) {
                            toast.error("Erreur: " + error.message);
                          }
                        }}
                        isDisabled={!parameter.is_editable}
                      />
                    </div>
                  ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Modal Create/Edit Parameter */}
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  {editMode ? "Modifier le paramètre" : "Nouveau paramètre"}
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col gap-4">
                    <Input
                      label="Clé du paramètre"
                      placeholder="Ex: payroll_frequency"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      isRequired
                      isDisabled={editMode}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Catégorie"
                        selectedKeys={[formData.category]}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        isRequired
                      >
                        {PARAMETER_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </Select>

                      <Select
                        label="Type de données"
                        selectedKeys={[formData.data_type]}
                        onChange={(e) => setFormData({ ...formData, data_type: e.target.value })}
                        isRequired
                      >
                        {DATA_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    {formData.data_type === "boolean" ? (
                      <Select
                        label="Valeur"
                        selectedKeys={[String(formData.value)]}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        isRequired
                      >
                        <SelectItem key="true" value="true">
                          Activé
                        </SelectItem>
                        <SelectItem key="false" value="false">
                          Désactivé
                        </SelectItem>
                      </Select>
                    ) : formData.data_type === "json" ? (
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Valeur (JSON)</label>
                        <textarea
                          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-danger font-mono text-sm"
                          rows="6"
                          placeholder='{"key": "value"}'
                          value={typeof formData.value === "string" ? formData.value : JSON.stringify(formData.value, null, 2)}
                          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        />
                      </div>
                    ) : (
                      <Input
                        label="Valeur"
                        type={formData.data_type === "number" ? "number" : "text"}
                        placeholder="Entrez la valeur"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        isRequired
                      />
                    )}

                    <Input
                      label="Description"
                      placeholder="Description du paramètre"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <Switch
                      isSelected={formData.is_editable}
                      onValueChange={(value) => setFormData({ ...formData, is_editable: value })}
                    >
                      Paramètre modifiable
                    </Switch>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Annuler
                  </Button>
                  <Button
                    color="danger"
                    onPress={handleSubmit}
                    isLoading={createParameterMutation.isLoading || updateParameterMutation.isLoading}
                  >
                    {editMode ? "Modifier" : "Créer"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
