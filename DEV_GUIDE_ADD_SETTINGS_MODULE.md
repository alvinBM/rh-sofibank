# Guide Développeur - Ajouter un nouveau sous-module dans Paramétrages

Ce guide explique comment ajouter un nouveau sous-module dans le module Paramétrages en suivant l'architecture existante.

## 📚 Exemple : Ajouter "Contrats" dans Paramétrages

### 1. Backend - Model

Créer `api/src/api/models/Contract.js` :

```javascript
import { DataTypes } from 'sequelize';
import database from '../../config/database.js';

const Contract = database.define('contracts', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    duration_months: {
        type: DataTypes.INTEGER
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Contract;
```

**Ajouter au `models/index.js`** :
```javascript
import Contract from './Contract.js';

// Dans les relations (si nécessaire)
Employee.belongsTo(Contract, {
    foreignKey: 'contract_id',
    as: 'contract'
});

// Dans l'export
export default {
    // ... autres models
    Contract,
};
```

### 2. Backend - Controller

Dans `api/src/api/controllers/settingsController.js`, ajouter :

```javascript
// ==================== CONTRACTS ====================

getAllContracts: async (req, res) => {
    try {
        const { offset = 0, limit = 100, query = '' } = req.query;
        
        const whereClause = {};
        if (query) {
            whereClause[models.sequelize.Sequelize.Op.or] = [
                { name: { [models.sequelize.Sequelize.Op.like]: `%${query}%` } },
                { code: { [models.sequelize.Sequelize.Op.like]: `%${query}%` } },
            ];
        }

        const { rows: contracts, count: total } = await models.Contract.findAndCountAll({
            where: { ...whereClause, is_active: true },
            offset: parseInt(offset),
            limit: parseInt(limit),
            order: [['name', 'ASC']],
        });

        return res.json({
            status: 200,
            message: 'Contrats récupérés avec succès',
            data: contracts,
            total,
        });
    } catch (error) {
        console.error('Get all contracts error:', error);
        return res.json({
            status: 500,
            message: 'Erreur lors de la récupération des contrats',
        });
    }
},

createContract: async (req, res) => {
    try {
        const contract = await models.Contract.create(req.body);

        return res.json({
            status: 201,
            message: 'Contrat créé avec succès',
            data: contract,
        });
    } catch (error) {
        console.error('Create contract error:', error);
        return res.json({
            status: 500,
            message: 'Erreur lors de la création du contrat',
        });
    }
},

updateContract: async (req, res) => {
    try {
        const { id } = req.params;
        const contract = await models.Contract.findByPk(id);

        if (!contract) {
            return res.json({
                status: 404,
                message: 'Contrat non trouvé',
            });
        }

        await contract.update(req.body);

        return res.json({
            status: 200,
            message: 'Contrat mis à jour avec succès',
            data: contract,
        });
    } catch (error) {
        console.error('Update contract error:', error);
        return res.json({
            status: 500,
            message: 'Erreur lors de la mise à jour du contrat',
        });
    }
},

deleteContract: async (req, res) => {
    try {
        const { id } = req.params;
        const contract = await models.Contract.findByPk(id);

        if (!contract) {
            return res.json({
                status: 404,
                message: 'Contrat non trouvé',
            });
        }

        await contract.update({ is_active: false });

        return res.json({
            status: 200,
            message: 'Contrat supprimé avec succès',
        });
    } catch (error) {
        console.error('Delete contract error:', error);
        return res.json({
            status: 500,
            message: 'Erreur lors de la suppression du contrat',
        });
    }
},
```

### 3. Backend - Routes

Dans `api/src/api/routes/settingsRoutes.js`, ajouter :

```javascript
// ==================== CONTRACTS ====================
router.get('/contracts', validateToken, settingsController.getAllContracts);
router.post('/contracts', validateToken, checkPermission(['contracts_manage', 'manage_settings']), settingsController.createContract);
router.put('/contracts/:id', validateToken, checkPermission(['contracts_manage', 'manage_settings']), settingsController.updateContract);
router.delete('/contracts/:id', validateToken, checkPermission(['contracts_manage', 'manage_settings']), settingsController.deleteContract);
```

### 4. Frontend - Service API

Dans `src/services/apis/settingsApiService.js`, ajouter :

```javascript
// ==================== CONTRACTS ====================

export const fetchContracts = async ({ offset = 0, limit = 100, query = '' } = {}) => {
  try {
    const response = await apiClient.get('/settings/contracts', { offset, limit, query });
    return response;
  } catch (error) {
    console.error('Fetch contracts error:', error);
    throw error;
  }
};

export const createContract = async (payload) => {
  try {
    const response = await apiClient.post('/settings/contracts', payload);
    return response.data;
  } catch (error) {
    console.error('Create contract error:', error);
    throw error;
  }
};

export const updateContract = async (id, payload) => {
  try {
    const response = await apiClient.put(`/settings/contracts/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update contract error:', error);
    throw error;
  }
};

export const deleteContract = async (id) => {
  try {
    const response = await apiClient.delete(`/settings/contracts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete contract error:', error);
    throw error;
  }
};

// Dans l'export default, ajouter :
export default {
  // ... autres exports
  fetchContracts,
  createContract,
  updateContract,
  deleteContract,
};
```

### 5. Frontend - Hooks

Dans `src/hooks/useSettings.js`, ajouter :

```javascript
import {
  // ... autres imports
  fetchContracts,
  createContract,
  updateContract,
  deleteContract,
} from "../services/apis/settingsApiService";

// ==================== CONTRACTS HOOKS ====================

export const useGetContracts = ({ page = 1, rowsPerPage = 100, query = "" } = {}) => {
    const offset = (page - 1) * rowsPerPage;

    return useQuery({
        queryKey: ["contracts", { page, rowsPerPage, query }],
        queryFn: () => fetchContracts({ offset, limit: rowsPerPage, query }),
        keepPreviousData: true,
    });
};

export const useCreateContract = () => {
    return useMutation({
        mutationFn: createContract,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contracts"] });
        },
    });
};

export const useUpdateContract = () => {
    return useMutation({
        mutationFn: ({ contractId, contractData }) => updateContract(contractId, contractData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contracts"] });
        },
    });
};

export const useDeleteContract = () => {
    return useMutation({
        mutationFn: deleteContract,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contracts"] });
        },
    });
};
```

### 6. Frontend - Page

Créer `app/dashboard/settings/contracts/page.jsx` :

```jsx
"use client";

import React, { useState, useCallback } from "react";
import PermissionGuard from "@/app/ui/dashboard/PermissionGuard";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Input, Button, Chip, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Card, CardBody,
} from "@nextui-org/react";
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiMoreVertical } from "react-icons/fi";
import { useGetContracts, useCreateContract, useUpdateContract, useDeleteContract } from "@/src/hooks/useSettings";
import { toast } from "react-toastify";

export default function ContractsPage() {
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContract, setSelectedContract] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    duration_months: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const { data, isLoading } = useGetContracts({ page, rowsPerPage, query: searchQuery });
  const createContractMutation = useCreateContract();
  const updateContractMutation = useUpdateContract();
  const deleteContractMutation = useDeleteContract();

  const contracts = data?.data || [];
  const total = data?.total || 0;

  const handleOpenCreate = () => {
    setEditMode(false);
    setSelectedContract(null);
    setFormData({ name: "", code: "", duration_months: "" });
    onOpen();
  };

  const handleOpenEdit = (contract) => {
    setEditMode(true);
    setSelectedContract(contract);
    setFormData({
      name: contract.name || "",
      code: contract.code || "",
      duration_months: contract.duration_months || "",
    });
    onOpen();
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      if (editMode) {
        await updateContractMutation.mutateAsync({
          contractId: selectedContract.id,
          contractData: formData,
        });
        toast.success("Contrat mis à jour avec succès");
      } else {
        await createContractMutation.mutateAsync(formData);
        toast.success("Contrat créé avec succès");
      }
      onClose();
    } catch (error) {
      toast.error(editMode ? "Erreur lors de la mise à jour" : "Erreur lors de la création");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteContractMutation.mutateAsync(selectedContract.id);
      toast.success("Contrat supprimé avec succès");
      onDeleteClose();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const renderCell = useCallback((contract, columnKey) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex flex-col">
            <p className="font-semibold">{contract.name}</p>
            <p className="text-xs text-default-400">{contract.code}</p>
          </div>
        );
      case "duration":
        return <span>{contract.duration_months} mois</span>;
      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger><Button isIconOnly size="sm" variant="light"><FiMoreVertical /></Button></DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="edit" startContent={<FiEdit />} onPress={() => handleOpenEdit(contract)}>Modifier</DropdownItem>
              <DropdownItem key="delete" className="text-danger" color="danger" startContent={<FiTrash2 />}
                onPress={() => { setSelectedContract(contract); onDeleteOpen(); }}>
                Supprimer
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return null;
    }
  }, []);

  return (
    <PermissionGuard requiredPermissions={["contracts_manage", "settings_access"]}>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Types de contrats</h1>
            <p className="text-default-500">Gérer les types de contrats</p>
          </div>
          <Button color="primary" startContent={<FiPlus />} onPress={handleOpenCreate}>Nouveau contrat</Button>
        </div>

        <Card>
          <CardBody>
            <div className="flex gap-4 mb-4">
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<FiSearch />}
                className="max-w-xs"
              />
            </div>

            <Table aria-label="Contrats">
              <TableHeader>
                <TableColumn>NOM</TableColumn>
                <TableColumn>DURÉE</TableColumn>
                <TableColumn width={50}>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody items={contracts} isLoading={isLoading} loadingContent={<Spinner />} emptyContent="Aucun contrat">
                {(contract) => (
                  <TableRow key={contract.id}>
                    {(columnKey) => <TableCell>{renderCell(contract, columnKey)}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        {/* Modal Create/Edit */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader>{editMode ? "Modifier le contrat" : "Nouveau contrat"}</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input label="Nom" isRequired value={formData.name} onValueChange={(v) => setFormData({ ...formData, name: v })} />
                <Input label="Code" isRequired value={formData.code} onValueChange={(v) => setFormData({ ...formData, code: v })} />
                <Input label="Durée (mois)" type="number" value={formData.duration_months} onValueChange={(v) => setFormData({ ...formData, duration_months: v })} />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>Annuler</Button>
              <Button color="primary" onPress={handleSubmit} isLoading={createContractMutation.isPending || updateContractMutation.isPending}>
                {editMode ? "Mettre à jour" : "Créer"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal Delete */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalContent>
            <ModalHeader>Supprimer le contrat</ModalHeader>
            <ModalBody>Êtes-vous sûr de vouloir supprimer <strong>{selectedContract?.name}</strong> ?</ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onDeleteClose}>Annuler</Button>
              <Button color="danger" onPress={handleDelete} isLoading={deleteContractMutation.isPending}>Supprimer</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </PermissionGuard>
  );
}
```

### 7. Sidebar

Dans `app/ui/dashboard/sidebar/sidebar-items.js`, ajouter dans `settings.items[0].items` :

```javascript
{
    key: "contracts",
    icon: "solar:document-text-linear",
    href: "/dashboard/settings/contracts",
    title: "Types de contrats",
    requiredPermission: "contracts_manage",
},
```

### 8. Base de données

Créer un patch SQL `api/database/patch_contracts.sql` :

```sql
USE rh_sofibank;

CREATE TABLE IF NOT EXISTS contracts (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  duration_months INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Ajouter la permission
INSERT IGNORE INTO permissions (id, name, code, module, description, created_at) VALUES
(UUID(), 'Gérer les contrats', 'contracts_manage', 'settings', 'Créer, modifier, supprimer des types de contrats', NOW());
```

Appliquer :
```bash
mysql -u root -p rh_sofibank < api/database/patch_contracts.sql
```

---

## 📋 Checklist

- [ ] Model créé
- [ ] Model ajouté à index.js
- [ ] Controller avec 4 méthodes CRUD
- [ ] Routes avec permissions
- [ ] Service API frontend
- [ ] Hooks React Query (4 hooks)
- [ ] Page NextUI avec Table + Modals
- [ ] Item ajouté au sidebar avec permission
- [ ] Patch SQL créé et appliqué
- [ ] Permission créée en base
- [ ] Tests manuels OK

---

**Temps estimé** : 1-2 heures pour un module complet

**Réutilisez** ce pattern pour tous les futurs sous-modules !
