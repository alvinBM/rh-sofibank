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
  FiActivity,
  FiWifi,
  FiWifiOff,
  FiCheckCircle,
} from "react-icons/fi";
import {
  useGetBiometricTerminals,
  useCreateBiometricTerminal,
  useUpdateBiometricTerminal,
  useDeleteBiometricTerminal,
  useTestBiometricConnection,
} from "@/src/hooks/useSettings";
import { toast } from "react-toastify";

const TERMINAL_STATUS = {
  online: { label: "En ligne", color: "success", icon: FiWifi },
  offline: { label: "Hors ligne", color: "danger", icon: FiWifiOff },
  unknown: { label: "Inconnu", color: "default", icon: FiActivity },
};

const PROTOCOL_OPTIONS = [
  { value: "tcp", label: "TCP/IP" },
  { value: "udp", label: "UDP" },
  { value: "http", label: "HTTP" },
  { value: "https", label: "HTTPS" },
];

export default function BiometricPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerminal, setSelectedTerminal] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    ip_address: "",
    port: "",
    protocol: "tcp",
    location: "",
    device_model: "",
    serial_number: "",
    is_active: true,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isTestOpen, onOpen: onTestOpen, onClose: onTestClose } = useDisclosure();
  const [testResult, setTestResult] = useState(null);

  const { data, isLoading, error } = useGetBiometricTerminals({
    page: 1,
    rowsPerPage: 100,
    query: searchQuery,
  });

  const createTerminalMutation = useCreateBiometricTerminal();
  const updateTerminalMutation = useUpdateBiometricTerminal();
  const deleteTerminalMutation = useDeleteBiometricTerminal();
  const testConnectionMutation = useTestBiometricConnection();

  const terminals = data?.terminals || [];

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handleOpenCreate = () => {
    setEditMode(false);
    setSelectedTerminal(null);
    setFormData({
      name: "",
      ip_address: "",
      port: "",
      protocol: "tcp",
      location: "",
      device_model: "",
      serial_number: "",
      is_active: true,
    });
    onOpen();
  };

  const handleOpenEdit = (terminal) => {
    setEditMode(true);
    setSelectedTerminal(terminal);
    setFormData({
      name: terminal.name || "",
      ip_address: terminal.ip_address || "",
      port: terminal.port || "",
      protocol: terminal.protocol || "tcp",
      location: terminal.location || "",
      device_model: terminal.device_model || "",
      serial_number: terminal.serial_number || "",
      is_active: terminal.is_active ?? true,
    });
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        port: formData.port ? Number(formData.port) : null,
      };

      if (editMode && selectedTerminal) {
        await updateTerminalMutation.mutateAsync({
          terminalId: selectedTerminal.id,
          terminalData: payload,
        });
        toast.success("Terminal modifié avec succès");
      } else {
        await createTerminalMutation.mutateAsync(payload);
        toast.success("Terminal créé avec succès");
      }
      onClose();
    } catch (error) {
      toast.error("Erreur: " + error.message);
    }
  };

  const handleDelete = async (terminalId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce terminal ?")) {
      try {
        await deleteTerminalMutation.mutateAsync(terminalId);
        toast.success("Terminal supprimé avec succès");
      } catch (error) {
        toast.error("Erreur: " + error.message);
      }
    }
  };

  const handleTestConnection = async (terminal) => {
    setSelectedTerminal(terminal);
    setTestResult(null);
    onTestOpen();

    try {
      const result = await testConnectionMutation.mutateAsync(terminal.id);
      setTestResult(result);
      if (result.success) {
        toast.success("Connexion réussie");
      } else {
        toast.error("Échec de la connexion");
      }
    } catch (error) {
      setTestResult({ success: false, message: error.message });
      toast.error("Erreur lors du test: " + error.message);
    }
  };

  const getTerminalStatus = (terminal) => {
    // In a real application, this would check the actual connection status
    // For now, we'll return a status based on is_active
    return terminal.is_active ? "online" : "offline";
  };

  const renderCell = useCallback((terminal, columnKey) => {
    const status = getTerminalStatus(terminal);
    const StatusIcon = TERMINAL_STATUS[status].icon;

    switch (columnKey) {
      case "name":
        return (
          <div className="flex items-center gap-2">
            <StatusIcon className={`text-${TERMINAL_STATUS[status].color}`} />
            <div>
              <p className="font-semibold">{terminal.name}</p>
              <p className="text-xs text-default-400">{terminal.location}</p>
            </div>
          </div>
        );
      case "connection":
        return (
          <div className="flex flex-col">
            <p className="text-sm font-semibold">{terminal.ip_address}</p>
            <p className="text-xs text-default-400">
              Port: {terminal.port} | {terminal.protocol?.toUpperCase()}
            </p>
          </div>
        );
      case "device_info":
        return (
          <div className="flex flex-col">
            <p className="text-sm">{terminal.device_model || "-"}</p>
            <p className="text-xs text-default-400">{terminal.serial_number || "-"}</p>
          </div>
        );
      case "status":
        return (
          <Chip
            color={TERMINAL_STATUS[status].color}
            variant="flat"
            size="sm"
            startContent={<StatusIcon />}
          >
            {TERMINAL_STATUS[status].label}
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
                key="test"
                startContent={<FiCheckCircle />}
                onPress={() => handleTestConnection(terminal)}
              >
                Tester la connexion
              </DropdownItem>
              <DropdownItem
                key="edit"
                startContent={<FiEdit />}
                onPress={() => handleOpenEdit(terminal)}
              >
                Modifier
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<FiTrash2 />}
                onPress={() => handleDelete(terminal.id)}
              >
                Supprimer
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return terminal[columnKey];
    }
  }, []);

  const stats = useMemo(() => {
    const online = terminals.filter(t => getTerminalStatus(t) === "online").length;
    const offline = terminals.filter(t => getTerminalStatus(t) === "offline").length;
    return { total: terminals.length, online, offline };
  }, [terminals]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-danger">Erreur lors du chargement des terminaux</p>
          <p className="text-sm text-default-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermissions={["attendance_settings_manage", "settings_access"]}>
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Terminaux Biométriques</h1>
            <Button
              color="primary"
              startContent={<FiPlus />}
              onPress={handleOpenCreate}
            >
              Nouveau Terminal
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardBody className="flex flex-row items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FiActivity className="text-primary text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-400">Total Terminaux</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex flex-row items-center gap-3">
                <div className="p-3 rounded-lg bg-success/10">
                  <FiWifi className="text-success text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-400">En ligne</p>
                  <p className="text-2xl font-bold">{stats.online}</p>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex flex-row items-center gap-3">
                <div className="p-3 rounded-lg bg-danger/10">
                  <FiWifiOff className="text-danger text-2xl" />
                </div>
                <div>
                  <p className="text-sm text-default-400">Hors ligne</p>
                  <p className="text-2xl font-bold">{stats.offline}</p>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="flex gap-3">
            <Input
              isClearable
              placeholder="Rechercher un terminal..."
              startContent={<FiSearch />}
              value={searchQuery}
              onValueChange={handleSearchChange}
              className="flex-1"
            />
          </div>

          <Table
            aria-label="Table des terminaux biométriques"
            classNames={{
              wrapper: "min-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn key="name">NOM / EMPLACEMENT</TableColumn>
              <TableColumn key="connection">CONNEXION</TableColumn>
              <TableColumn key="device_info">APPAREIL</TableColumn>
              <TableColumn key="status">STATUT</TableColumn>
              <TableColumn key="actions">ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              items={terminals}
              isLoading={isLoading}
              loadingContent={<Spinner label="Chargement..." />}
              emptyContent="Aucun terminal trouvé"
            >
              {(terminal) => (
                <TableRow key={terminal.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(terminal, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal Create/Edit Terminal */}
        <Modal isOpen={isOpen} onClose={onClose} size="3xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  {editMode ? "Modifier le terminal" : "Nouveau terminal"}
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nom du terminal"
                        placeholder="Ex: Terminal Entrée Principale"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        isRequired
                      />
                      <Input
                        label="Emplacement"
                        placeholder="Ex: Bâtiment A - RDC"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Adresse IP"
                        placeholder="Ex: 192.168.1.100"
                        value={formData.ip_address}
                        onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                        isRequired
                      />
                      <Input
                        label="Port"
                        type="number"
                        placeholder="Ex: 4370"
                        value={formData.port}
                        onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                        isRequired
                      />
                      <Select
                        label="Protocole"
                        selectedKeys={[formData.protocol]}
                        onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                        isRequired
                      >
                        {PROTOCOL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Modèle d'appareil"
                        placeholder="Ex: ZKTeco K40"
                        value={formData.device_model}
                        onChange={(e) => setFormData({ ...formData, device_model: e.target.value })}
                      />
                      <Input
                        label="Numéro de série"
                        placeholder="Ex: SN123456789"
                        value={formData.serial_number}
                        onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                      />
                    </div>

                    <Switch
                      isSelected={formData.is_active}
                      onValueChange={(value) => setFormData({ ...formData, is_active: value })}
                    >
                      Terminal actif
                    </Switch>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Annuler
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSubmit}
                    isLoading={createTerminalMutation.isLoading || updateTerminalMutation.isLoading}
                  >
                    {editMode ? "Modifier" : "Créer"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Modal Test Connection */}
        <Modal isOpen={isTestOpen} onClose={onTestClose} size="lg">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>
                  Test de connexion - {selectedTerminal?.name}
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col gap-4">
                    <div className="p-4 bg-default-100 rounded-lg">
                      <p className="text-sm mb-2">
                        <strong>Adresse:</strong> {selectedTerminal?.ip_address}:{selectedTerminal?.port}
                      </p>
                      <p className="text-sm">
                        <strong>Protocole:</strong> {selectedTerminal?.protocol?.toUpperCase()}
                      </p>
                    </div>

                    {testConnectionMutation.isLoading && (
                      <div className="flex items-center justify-center p-4">
                        <Spinner label="Test en cours..." />
                      </div>
                    )}

                    {testResult && (
                      <div
                        className={`p-4 rounded-lg ${
                          testResult.success ? "bg-success/10" : "bg-danger/10"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {testResult.success ? (
                            <FiCheckCircle className="text-success text-xl" />
                          ) : (
                            <FiWifiOff className="text-danger text-xl" />
                          )}
                          <p className="font-semibold">
                            {testResult.success ? "Connexion réussie" : "Échec de la connexion"}
                          </p>
                        </div>
                        <p className="text-sm">{testResult.message}</p>
                        {testResult.latency && (
                          <p className="text-sm mt-2">
                            Latence: {testResult.latency.toFixed(2)} ms
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" onPress={onClose}>
                    Fermer
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
