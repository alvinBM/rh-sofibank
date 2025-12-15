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
} from "@nextui-org/react";
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiMoreVertical, FiFolder, FiUsers } from "react-icons/fi";
import { useGetDirections, useGetServices } from "@/src/hooks/useMain";
import {
  useCreateDirection,
  useUpdateDirection,
  useDeleteDirection,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/src/hooks/useSettings";
import { toast } from "react-toastify";

export default function OrganizationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("directions");

  const [directionFormData, setDirectionFormData] = useState({
    name: "",
    code: "",
    description: "",
    manager_id: "",
  });

  const [serviceFormData, setServiceFormData] = useState({
    name: "",
    code: "",
    description: "",
    direction_id: "",
    manager_id: "",
  });

  const { isOpen: isDirectionOpen, onOpen: onDirectionOpen, onClose: onDirectionClose } = useDisclosure();
  const { isOpen: isServiceOpen, onOpen: onServiceOpen, onClose: onServiceClose } = useDisclosure();

  const { data: directionsData, isLoading: isLoadingDirections } = useGetDirections({
    page: 1,
    rowsPerPage: 100,
    query: searchQuery,
  });

  const { data: servicesData, isLoading: isLoadingServices } = useGetServices({
    page: 1,
    rowsPerPage: 100,
    query: searchQuery,
  });

  const createDirectionMutation = useCreateDirection();
  const updateDirectionMutation = useUpdateDirection();
  const deleteDirectionMutation = useDeleteDirection();
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();

  const directions = directionsData?.directions || [];
  const services = servicesData?.services || [];

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  // Direction handlers
  const handleOpenCreateDirection = () => {
    setEditMode(false);
    setSelectedDirection(null);
    setDirectionFormData({
      name: "",
      code: "",
      description: "",
      manager_id: "",
    });
    onDirectionOpen();
  };

  const handleOpenEditDirection = (direction) => {
    setEditMode(true);
    setSelectedDirection(direction);
    setDirectionFormData({
      name: direction.name || "",
      code: direction.code || "",
      description: direction.description || "",
      manager_id: direction.manager_id || "",
    });
    onDirectionOpen();
  };

  const handleSubmitDirection = async () => {
    try {
      if (editMode && selectedDirection) {
        await updateDirectionMutation.mutateAsync({
          directionId: selectedDirection.id,
          directionData: directionFormData,
        });
        toast.success("Direction modifiée avec succès");
      } else {
        await createDirectionMutation.mutateAsync(directionFormData);
        toast.success("Direction créée avec succès");
      }
      onDirectionClose();
    } catch (error) {
      toast.error("Erreur: " + error.message);
    }
  };

  const handleDeleteDirection = async (directionId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette direction ?")) {
      try {
        await deleteDirectionMutation.mutateAsync(directionId);
        toast.success("Direction supprimée avec succès");
      } catch (error) {
        toast.error("Erreur: " + error.message);
      }
    }
  };

  // Service handlers
  const handleOpenCreateService = () => {
    setEditMode(false);
    setSelectedService(null);
    setServiceFormData({
      name: "",
      code: "",
      description: "",
      direction_id: "",
      manager_id: "",
    });
    onServiceOpen();
  };

  const handleOpenEditService = (service) => {
    setEditMode(true);
    setSelectedService(service);
    setServiceFormData({
      name: service.name || "",
      code: service.code || "",
      description: service.description || "",
      direction_id: service.direction_id || "",
      manager_id: service.manager_id || "",
    });
    onServiceOpen();
  };

  const handleSubmitService = async () => {
    try {
      if (editMode && selectedService) {
        await updateServiceMutation.mutateAsync({
          serviceId: selectedService.id,
          serviceData: serviceFormData,
        });
        toast.success("Service modifié avec succès");
      } else {
        await createServiceMutation.mutateAsync(serviceFormData);
        toast.success("Service créé avec succès");
      }
      onServiceClose();
    } catch (error) {
      toast.error("Erreur: " + error.message);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      try {
        await deleteServiceMutation.mutateAsync(serviceId);
        toast.success("Service supprimé avec succès");
      } catch (error) {
        toast.error("Erreur: " + error.message);
      }
    }
  };

  const renderDirectionCell = useCallback((direction, columnKey) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex items-center gap-2">
            <FiFolder className="text-primary" />
            <div>
              <p className="font-semibold">{direction.name}</p>
              <p className="text-xs text-default-400">{direction.code}</p>
            </div>
          </div>
        );
      case "description":
        return <span className="text-sm">{direction.description || "-"}</span>;
      case "services_count":
        const servicesCount = services.filter(s => s.direction_id === direction.id).length;
        return (
          <Chip size="sm" variant="flat" color="primary">
            {servicesCount} service(s)
          </Chip>
        );
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
                onPress={() => handleOpenEditDirection(direction)}
              >
                Modifier
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<FiTrash2 />}
                onPress={() => handleDeleteDirection(direction.id)}
              >
                Supprimer
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return direction[columnKey];
    }
  }, [services]);

  const renderServiceCell = useCallback((service, columnKey) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex items-center gap-2">
            <FiUsers className="text-secondary" />
            <div>
              <p className="font-semibold">{service.name}</p>
              <p className="text-xs text-default-400">{service.code}</p>
            </div>
          </div>
        );
      case "direction":
        return <span className="text-sm">{service.direction?.name || "-"}</span>;
      case "description":
        return <span className="text-sm">{service.description || "-"}</span>;
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
                onPress={() => handleOpenEditService(service)}
              >
                Modifier
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<FiTrash2 />}
                onPress={() => handleDeleteService(service.id)}
              >
                Supprimer
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return service[columnKey];
    }
  }, []);

  return (
    <PermissionGuard requiredPermission="settings_manage">
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Organisation - Directions & Services</h1>
          </div>

          <Card>
            <CardBody>
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={setActiveTab}
                aria-label="Organisation tabs"
              >
                <Tab key="directions" title="Directions">
                  <div className="flex flex-col gap-4 mt-4">
                    <div className="flex justify-between items-center">
                      <Input
                        isClearable
                        placeholder="Rechercher une direction..."
                        startContent={<FiSearch />}
                        value={searchQuery}
                        onValueChange={handleSearchChange}
                        className="flex-1 max-w-md"
                      />
                      <Button
                        color="primary"
                        startContent={<FiPlus />}
                        onPress={handleOpenCreateDirection}
                      >
                        Nouvelle Direction
                      </Button>
                    </div>

                    <Table
                      aria-label="Table des directions"
                      classNames={{
                        wrapper: "min-h-[400px]",
                      }}
                    >
                      <TableHeader>
                        <TableColumn key="name">NOM</TableColumn>
                        <TableColumn key="description">DESCRIPTION</TableColumn>
                        <TableColumn key="services_count">SERVICES</TableColumn>
                        <TableColumn key="actions">ACTIONS</TableColumn>
                      </TableHeader>
                      <TableBody
                        items={directions}
                        isLoading={isLoadingDirections}
                        loadingContent={<Spinner label="Chargement..." />}
                        emptyContent="Aucune direction trouvée"
                      >
                        {(direction) => (
                          <TableRow key={direction.id}>
                            {(columnKey) => (
                              <TableCell>{renderDirectionCell(direction, columnKey)}</TableCell>
                            )}
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Tab>

                <Tab key="services" title="Services">
                  <div className="flex flex-col gap-4 mt-4">
                    <div className="flex justify-between items-center">
                      <Input
                        isClearable
                        placeholder="Rechercher un service..."
                        startContent={<FiSearch />}
                        value={searchQuery}
                        onValueChange={handleSearchChange}
                        className="flex-1 max-w-md"
                      />
                      <Button
                        color="primary"
                        startContent={<FiPlus />}
                        onPress={handleOpenCreateService}
                      >
                        Nouveau Service
                      </Button>
                    </div>

                    <Table
                      aria-label="Table des services"
                      classNames={{
                        wrapper: "min-h-[400px]",
                      }}
                    >
                      <TableHeader>
                        <TableColumn key="name">NOM</TableColumn>
                        <TableColumn key="direction">DIRECTION</TableColumn>
                        <TableColumn key="description">DESCRIPTION</TableColumn>
                        <TableColumn key="actions">ACTIONS</TableColumn>
                      </TableHeader>
                      <TableBody
                        items={services}
                        isLoading={isLoadingServices}
                        loadingContent={<Spinner label="Chargement..." />}
                        emptyContent="Aucun service trouvé"
                      >
                        {(service) => (
                          <TableRow key={service.id}>
                            {(columnKey) => (
                              <TableCell>{renderServiceCell(service, columnKey)}</TableCell>
                            )}
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Tab>

                <Tab key="hierarchy" title="Vue Hiérarchique">
                  <div className="flex flex-col gap-4 mt-4">
                    <Input
                      isClearable
                      placeholder="Rechercher..."
                      startContent={<FiSearch />}
                      value={searchQuery}
                      onValueChange={handleSearchChange}
                      className="flex-1 max-w-md"
                    />

                    <div className="grid gap-4">
                      {directions.map((direction) => (
                        <Card key={direction.id} className="border-l-4 border-primary">
                          <CardBody>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <FiFolder className="text-primary text-xl" />
                                <div>
                                  <h3 className="text-lg font-bold">{direction.name}</h3>
                                  <p className="text-sm text-default-400">{direction.code}</p>
                                </div>
                              </div>
                              <Dropdown>
                                <DropdownTrigger>
                                  <Button isIconOnly size="sm" variant="light">
                                    <FiMoreVertical />
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu>
                                  <DropdownItem
                                    key="edit"
                                    startContent={<FiEdit />}
                                    onPress={() => handleOpenEditDirection(direction)}
                                  >
                                    Modifier
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </div>

                            <div className="ml-8 space-y-2">
                              {services
                                .filter(s => s.direction_id === direction.id)
                                .map((service) => (
                                  <div
                                    key={service.id}
                                    className="flex justify-between items-center p-3 bg-default-100 rounded-lg"
                                  >
                                    <div className="flex items-center gap-2">
                                      <FiUsers className="text-secondary" />
                                      <div>
                                        <p className="font-semibold">{service.name}</p>
                                        <p className="text-xs text-default-400">{service.code}</p>
                                      </div>
                                    </div>
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      onPress={() => handleOpenEditService(service)}
                                    >
                                      <FiEdit />
                                    </Button>
                                  </div>
                                ))}
                              {services.filter(s => s.direction_id === direction.id).length === 0 && (
                                <p className="text-sm text-default-400 italic">Aucun service</p>
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>

        {/* Modal Create/Edit Direction */}
        <Modal isOpen={isDirectionOpen} onClose={onDirectionClose} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  {editMode ? "Modifier la direction" : "Nouvelle direction"}
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col gap-4">
                    <Input
                      label="Nom de la direction"
                      placeholder="Ex: Direction Financière"
                      value={directionFormData.name}
                      onChange={(e) => setDirectionFormData({ ...directionFormData, name: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="Code"
                      placeholder="Ex: DF"
                      value={directionFormData.code}
                      onChange={(e) => setDirectionFormData({ ...directionFormData, code: e.target.value.toUpperCase() })}
                      isRequired
                    />
                    <Input
                      label="Description"
                      placeholder="Description de la direction"
                      value={directionFormData.description}
                      onChange={(e) => setDirectionFormData({ ...directionFormData, description: e.target.value })}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Annuler
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSubmitDirection}
                    isLoading={createDirectionMutation.isLoading || updateDirectionMutation.isLoading}
                  >
                    {editMode ? "Modifier" : "Créer"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal Create/Edit Service */}
        <Modal isOpen={isServiceOpen} onClose={onServiceClose} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  {editMode ? "Modifier le service" : "Nouveau service"}
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col gap-4">
                    <Select
                      label="Direction"
                      placeholder="Sélectionnez une direction"
                      selectedKeys={serviceFormData.direction_id ? [serviceFormData.direction_id] : []}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, direction_id: e.target.value })}
                      isRequired
                    >
                      {directions.map((direction) => (
                        <SelectItem key={direction.id} value={direction.id}>
                          {direction.name}
                        </SelectItem>
                      ))}
                    </Select>
                    <Input
                      label="Nom du service"
                      placeholder="Ex: Service Comptabilité"
                      value={serviceFormData.name}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                      isRequired
                    />
                    <Input
                      label="Code"
                      placeholder="Ex: COMPTA"
                      value={serviceFormData.code}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, code: e.target.value.toUpperCase() })}
                      isRequired
                    />
                    <Input
                      label="Description"
                      placeholder="Description du service"
                      value={serviceFormData.description}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Annuler
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSubmitService}
                    isLoading={createServiceMutation.isLoading || updateServiceMutation.isLoading}
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
