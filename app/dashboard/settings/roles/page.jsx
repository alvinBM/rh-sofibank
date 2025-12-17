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
    Pagination,
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
    Checkbox,
    Tabs,
    Tab,
    Card,
} from "@nextui-org/react";
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiMoreVertical, FiShield } from "react-icons/fi";
import { useGetRoles, useGetPermissions, useGetRolePermissions, useCreateRole, useUpdateRole, useUpdateRolePermissions } from "@/src/hooks/useRBAC";
import { toast } from "react-toastify";

export default function RolesPage() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        description: "",
    });

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isPermissionsOpen, onOpen: onPermissionsOpen, onClose: onPermissionsClose } = useDisclosure();

    const { data, isLoading, error } = useGetRoles({
        page,
        rowsPerPage,
        query: searchQuery,
    });

    const { data: permissionsData } = useGetPermissions({ page: 1, rowsPerPage: 10000 });
    const { data: rolePermissionsData } = useGetRolePermissions(selectedRole?.id);

    const createRoleMutation = useCreateRole();
    const updateRoleMutation = useUpdateRole();
    const updatePermissionsMutation = useUpdateRolePermissions();

    const roles = data?.data || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / rowsPerPage);
    const permissions = permissionsData?.data || [];
    const rolePermissions = rolePermissionsData || [];

    const [selectedPermissions, setSelectedPermissions] = useState([]);

    const handleSearchChange = useCallback((value) => {
        setSearchQuery(value);
        setPage(1);
    }, []);

    const handleOpenCreate = () => {
        setEditMode(false);
        setSelectedRole(null);
        setFormData({
            name: "",
            code: "",
            description: "",
        });
        onOpen();
    };

    const handleOpenEdit = (role) => {
        setEditMode(true);
        setSelectedRole(role);
        setFormData({
            name: role.name || "",
            code: role.code || "",
            description: role.description || "",
        });
        onOpen();
    };

    const handleSubmit = async () => {
        try {
            if (editMode && selectedRole) {
                await updateRoleMutation.mutateAsync({
                    roleId: selectedRole.id,
                    payload: formData,
                });
                toast.success("Rôle modifié avec succès");
            } else {
                await createRoleMutation.mutateAsync(formData);
                toast.success("Rôle créé avec succès");
            }
            onClose();
        } catch (error) {
            toast.error("Erreur: " + error.message);
        }
    };

    const handleOpenPermissions = (role) => {
        setSelectedRole(role);
        onPermissionsOpen();
    };

    // Update selected permissions when rolePermissionsData changes
    React.useEffect(() => {
        if (rolePermissionsData && Array.isArray(rolePermissionsData)) {
            const permissionIds = rolePermissionsData.map((p) => p.id);
            setSelectedPermissions(permissionIds);
        }
    }, [rolePermissionsData]);

    const handleTogglePermission = (permissionId) => {
        setSelectedPermissions((prev) => {
            if (prev.includes(permissionId)) {
                return prev.filter((id) => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    };

    const handleSavePermissions = async () => {
        try {
            await updatePermissionsMutation.mutateAsync({
                roleId: selectedRole.id,
                permissionIds: selectedPermissions,
            });
            toast.success("Permissions mises à jour avec succès");
            onPermissionsClose();
        } catch (error) {
            toast.error("Erreur: " + error.message);
        }
    };

    // Group permissions by module
    const groupedPermissions = useMemo(() => {
        const groups = {};
        permissions.forEach((permission) => {
            const moduleName = permission.module || "Autres";
            if (!groups[moduleName]) {
                groups[moduleName] = [];
            }
            groups[moduleName].push(permission);
        });
        return groups;
    }, [permissions]);

    const renderCell = useCallback(
        (role, columnKey) => {
            switch (columnKey) {
                case "name":
                    return (
                        <div>
                            <p className="font-semibold">{role.name}</p>
                            <p className="text-xs text-default-400">{role.code}</p>
                        </div>
                    );
                case "description":
                    return <span className="text-sm">{role.description || "-"}</span>;
                case "permissions_count":
                    const rolePermsCount = role.permissions?.length || 0;
                    return (
                        <Chip size="sm" variant="flat" color="danger">
                            {rolePermsCount} permissions
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
                                <DropdownItem key="edit" startContent={<FiEdit />} onPress={() => handleOpenEdit(role)}>
                                    Modifier
                                </DropdownItem>
                                <DropdownItem key="permissions" startContent={<FiShield />} onPress={() => handleOpenPermissions(role)}>
                                    Gérer les permissions
                                </DropdownItem>
                                <DropdownItem key="delete" className="text-danger" color="danger" startContent={<FiTrash2 />}>
                                    Supprimer
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    );
                default:
                    return role[columnKey];
            }
        },
        [rolePermissions]
    );

    const topContent = useMemo(
        () => (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Rôles & Permissions</h1>
                    <Button color="danger" startContent={<FiPlus />} onPress={handleOpenCreate}>
                        Nouveau Rôle
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Input isClearable placeholder="Rechercher un rôle..." startContent={<FiSearch />} value={searchQuery} onValueChange={handleSearchChange} className="flex-1" />
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-sm">Total: {total} rôle(s)</span>
                    <Select
                        label="Lignes par page"
                        size="sm"
                        selectedKeys={[String(rowsPerPage)]}
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setPage(1);
                        }}
                        className="w-40"
                    >
                        <SelectItem key="10" value="10">
                            10
                        </SelectItem>
                        <SelectItem key="20" value="20">
                            20
                        </SelectItem>
                        <SelectItem key="50" value="50">
                            50
                        </SelectItem>
                    </Select>
                </div>
            </div>
        ),
        [searchQuery, total, rowsPerPage, handleSearchChange]
    );

    const bottomContent = useMemo(
        () => (
            <div className="flex w-full justify-center">
                <Pagination isCompact showControls showShadow color="danger" page={page} total={totalPages} onChange={setPage} />
            </div>
        ),
        [page, totalPages]
    );

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-danger">Erreur lors du chargement des rôles</p>
                    <p className="text-sm text-default-400">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <PermissionGuard requiredPermissions={["roles_manage", "settings_access"]}>
            <div className="flex flex-col">
                <Card className="shadow-none dark:bg-background">
                    <Table
                        aria-label="Table des rôles"
                        topContent={topContent}
                        bottomContent={bottomContent}
                        classNames={{
                            wrapper: "min-h-[400px]",
                        }}
                    >
                        <TableHeader>
                            <TableColumn key="name">NOM</TableColumn>
                            <TableColumn key="description">DESCRIPTION</TableColumn>
                            <TableColumn key="permissions_count">PERMISSIONS</TableColumn>
                            <TableColumn key="actions">ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody items={roles} isLoading={isLoading} loadingContent={<Spinner label="Chargement..." />} emptyContent="Aucun rôle trouvé">
                            {(role) => <TableRow key={role.id}>{(columnKey) => <TableCell>{renderCell(role, columnKey)}</TableCell>}</TableRow>}
                        </TableBody>
                    </Table>

                    {/* Modal Create/Edit Role */}
                    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader>{editMode ? "Modifier le rôle" : "Nouveau rôle"}</ModalHeader>
                                    <ModalBody>
                                        <div className="flex flex-col gap-4">
                                            <Input label="Nom du rôle" placeholder="Ex: Administrateur" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} isRequired />
                                            <Input label="Code" placeholder="Ex: ADMIN" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} isRequired />
                                            <Input label="Description" placeholder="Description du rôle" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                        </div>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="danger" variant="light" onPress={onClose}>
                                            Annuler
                                        </Button>
                                        <Button color="danger" onPress={handleSubmit} isLoading={createRoleMutation.isLoading || updateRoleMutation.isLoading}>
                                            {editMode ? "Modifier" : "Créer"}
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>

                    {/* Modal Manage Permissions */}
                    <Modal isOpen={isPermissionsOpen} onClose={onPermissionsClose} size="4xl" scrollBehavior="inside">
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader>Gérer les permissions - {selectedRole?.name}</ModalHeader>
                                    <ModalBody>
                                        <Tabs aria-label="Modules de permissions">
                                            {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                                                <Tab key={module} title={module}>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                        {modulePermissions.map((permission) => (
                                                            <div key={permission.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-default-100">
                                                                <Checkbox color="danger" isSelected={selectedPermissions.includes(permission.id)} onValueChange={() => handleTogglePermission(permission.id)} />
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-sm">{permission.name}</p>
                                                                    <p className="text-xs text-default-400">{permission.code}</p>
                                                                    {permission.description && <p className="text-xs text-default-500 mt-1">{permission.description}</p>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Tab>
                                            ))}
                                        </Tabs>

                                        <div className="mt-4 p-3 bg-default-100 rounded-lg">
                                            <p className="text-sm font-semibold">{selectedPermissions.length} permission(s) sélectionnée(s)</p>
                                        </div>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="danger" variant="light" onPress={onClose}>
                                            Annuler
                                        </Button>
                                        <Button color="danger" onPress={handleSavePermissions} isLoading={updatePermissionsMutation.isLoading}>
                                            Enregistrer
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                </Card>
            </div>
        </PermissionGuard>
    );
}
