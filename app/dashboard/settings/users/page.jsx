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
    User,
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
    Switch,
    Card,
} from "@nextui-org/react";
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiMoreVertical, FiKey, FiUserCheck } from "react-icons/fi";
import { useGetUsers, useCreateUser, useUpdateUser, useDeleteUser, useToggleUserStatus } from "@/src/hooks/useSettings";
import { useGetRoles, useGetUserRoles, useAssignRoleToUser, useRemoveRoleFromUser } from "@/src/hooks/useRBAC";
import { toast } from "react-toastify";

export default function UsersPage() {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        is_active: true,
    });

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isRolesOpen, onOpen: onRolesOpen, onClose: onRolesClose } = useDisclosure();

    const { data, isLoading, error } = useGetUsers({
        page,
        rowsPerPage,
        query: searchQuery,
    });

    const { data: rolesData } = useGetRoles({ page: 1, rowsPerPage: 100 });
    const { data: userRolesData } = useGetUserRoles(selectedUser?.id);

    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();
    const toggleStatusMutation = useToggleUserStatus();
    const assignRoleMutation = useAssignRoleToUser();
    const removeRoleMutation = useRemoveRoleFromUser();

    const users = data?.data || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / rowsPerPage);
    const roles = rolesData?.roles || [];
    const userRoles = userRolesData || [];

    const handleSearchChange = useCallback((value) => {
        setSearchQuery(value);
        setPage(1);
    }, []);

    const handleOpenCreate = () => {
        setEditMode(false);
        setSelectedUser(null);
        setFormData({
            full_name: "",
            email: "",
            phone: "",
            is_active: true,
        });
        onOpen();
    };

    const handleOpenEdit = (user) => {
        setEditMode(true);
        setSelectedUser(user);
        setFormData({
            full_name: user.full_name || "",
            email: user.email || "",
            phone: user.phone || "",
            is_active: user.is_active ?? true,
        });
        onOpen();
    };

    const handleSubmit = async () => {
        try {
            if (editMode && selectedUser) {
                await updateUserMutation.mutateAsync({
                    userId: selectedUser.id,
                    userData: formData,
                });
                toast.success("Utilisateur modifié avec succès");
            } else {
                await createUserMutation.mutateAsync(formData);
                toast.success("Utilisateur créé avec succès");
            }
            onClose();
        } catch (error) {
            toast.error("Erreur: " + error.message);
        }
    };

    const handleDelete = async (userId) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
            try {
                await deleteUserMutation.mutateAsync(userId);
                toast.success("Utilisateur supprimé avec succès");
            } catch (error) {
                toast.error("Erreur: " + error.message);
            }
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await toggleStatusMutation.mutateAsync({
                userId,
                isActive: !currentStatus,
            });
            toast.success("Statut modifié avec succès");
        } catch (error) {
            toast.error("Erreur: " + error.message);
        }
    };

    const handleOpenRoles = (user) => {
        setSelectedUser(user);
        onRolesOpen();
    };

    const handleToggleRole = async (roleId, isAssigned) => {
        try {
            if (isAssigned) {
                await removeRoleMutation.mutateAsync({
                    userId: selectedUser.id,
                    roleId,
                });
                toast.success("Rôle retiré avec succès");
            } else {
                await assignRoleMutation.mutateAsync({
                    userId: selectedUser.id,
                    roleId,
                });
                toast.success("Rôle assigné avec succès");
            }
        } catch (error) {
            toast.error("Erreur: " + error.message);
        }
    };

    const renderCell = useCallback((user, columnKey) => {
        switch (columnKey) {
            case "user":
                return (
                    <User
                        name={user.employee?.first_name + " " + user.employee?.last_name}
                        description={user.email}
                        avatarProps={{
                            name: user.full_name?.[0],
                        }}
                    />
                );
            case "phone":
                return <span>{user.phone || "-"}</span>;
            case "roles":
                return (
                    <div className="flex gap-1 flex-wrap">
                        {user.roles?.slice(0, 2).map((role) => (
                            <Chip key={role?.id} size="sm" variant="flat" color="danger">
                                {role?.name}
                            </Chip>
                        ))}
                        {user.roles?.length > 2 && (
                            <Chip size="sm" variant="flat">
                                +{user.roles.length - 2}
                            </Chip>
                        )}
                    </div>
                );
            case "status":
                return (
                    <Chip color={user.is_active ? "success" : "danger"} variant="flat" size="sm">
                        {user.is_active ? "Actif" : "Inactif"}
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
                            <DropdownItem key="edit" startContent={<FiEdit />} onPress={() => handleOpenEdit(user)}>
                                Modifier
                            </DropdownItem>
                            <DropdownItem key="roles" startContent={<FiUserCheck />} onPress={() => handleOpenRoles(user)}>
                                Gérer les rôles
                            </DropdownItem>
                            <DropdownItem key="toggle" startContent={<FiKey />} onPress={() => handleToggleStatus(user.id, user.is_active)}>
                                {user.is_active ? "Désactiver" : "Activer"}
                            </DropdownItem>
                            <DropdownItem key="delete" className="text-danger" color="danger" startContent={<FiTrash2 />} onPress={() => handleDelete(user.id)}>
                                Supprimer
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                );
            default:
                return user[columnKey];
        }
    }, []);

    const topContent = useMemo(
        () => (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
                    <Button className="bg-red-500 text-white hover:bg-red-700" startContent={<FiPlus />} onPress={handleOpenCreate}>
                        Nouvel Utilisateur
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Input isClearable placeholder="Rechercher par nom ou email..." startContent={<FiSearch />} value={searchQuery} onValueChange={handleSearchChange} className="flex-1" />
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-sm">Total: {total} utilisateur(s)</span>
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
                    <p className="text-danger">Erreur lors du chargement des utilisateurs</p>
                    <p className="text-sm text-default-400">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <PermissionGuard requiredPermissions={[]}>
            <div className="flex flex-col">
                <Card className="shadow-none dark:bg-background">
                    <Table
                        aria-label="Table des utilisateurs"
                        topContent={topContent}
                        bottomContent={bottomContent}
                        classNames={{
                            wrapper: "min-h-[400px]",
                        }}
                    >
                        <TableHeader>
                            <TableColumn key="user">UTILISATEUR</TableColumn>
                            <TableColumn key="phone">TÉLÉPHONE</TableColumn>
                            <TableColumn key="roles">RÔLES</TableColumn>
                            <TableColumn key="status">STATUT</TableColumn>
                            <TableColumn key="actions">ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody items={users} isLoading={isLoading} loadingContent={<Spinner label="Chargement..." />} emptyContent="Aucun utilisateur trouvé">
                            {(user) => <TableRow key={user.id}>{(columnKey) => <TableCell>{renderCell(user, columnKey)}</TableCell>}</TableRow>}
                        </TableBody>
                    </Table>

                    {/* Modal Create/Edit User */}
                    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader>{editMode ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</ModalHeader>
                                    <ModalBody>
                                        <div className="flex flex-col gap-4">
                                            <Input label="Nom complet" placeholder="Entrez le nom complet" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} isRequired />
                                            <Input label="Email" type="email" placeholder="Entrez l'email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} isRequired />
                                            <Input label="Téléphone" placeholder="Entrez le numéro de téléphone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                            <Switch isSelected={formData.is_active} onValueChange={(value) => setFormData({ ...formData, is_active: value })}>
                                                Utilisateur actif
                                            </Switch>
                                        </div>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="danger" variant="light" onPress={onClose}>
                                            Annuler
                                        </Button>
                                        <Button color="danger" onPress={handleSubmit} isLoading={createUserMutation.isLoading || updateUserMutation.isLoading}>
                                            {editMode ? "Modifier" : "Créer"}
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>

                    {/* Modal Manage Roles */}
                    <Modal isOpen={isRolesOpen} onClose={onRolesClose} size="2xl">
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader>Gérer les rôles - {selectedUser?.full_name}</ModalHeader>
                                    <ModalBody>
                                        <div className="flex flex-col gap-3">
                                            {roles.map((role) => {
                                                const isAssigned = userRoles.some((ur) => ur.role_id === role.id);
                                                return (
                                                    <div key={role.id} className="flex justify-between items-center p-3 border rounded-lg">
                                                        <div>
                                                            <p className="font-semibold">{role.name}</p>
                                                            <p className="text-sm text-default-400">{role.description}</p>
                                                        </div>
                                                        <Switch isSelected={isAssigned} onValueChange={() => handleToggleRole(role.id, isAssigned)} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button color="danger" onPress={onClose}>
                                            Fermer
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
