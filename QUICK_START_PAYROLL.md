# Guide de Démarrage Rapide - Module Paie

## Étapes d'installation et configuration

### 1. Installation des dépendances

```bash
# Backend
cd api
npm install pdfkit
```

### 2. Créer les tables dans la base de données

Exécutez le script SQL fourni dans votre demande initiale pour créer les tables :
- `payroll_periods`
- `payslips`
- `payslip_items`
- `payroll_item_types`
- `payroll_variables`
- `payroll_settings`

```bash
mysql -u root -p rh_sofibank < path/to/payroll_tables.sql
```

### 3. Initialiser les données de base

```bash
mysql -u root -p rh_sofibank < api/database/payroll_initial_data.sql
```

Ceci créera automatiquement :
- 12 types d'éléments de paie (salaire, primes, IRPP, INSS, etc.)
- Paramètres par défaut (IRPP 30%, INSS 5%, jour de paiement le 24)

### 4. Créer le dossier pour les PDFs

```bash
mkdir -p api/public/uploads/payslips
```

### 5. Redémarrer le serveur backend

```bash
cd api
npm run dev
```

### 6. Vérifier l'intégration

Ouvrez votre navigateur et testez :
- Page paie : http://localhost:3000/dashboard/payroll
- API Health : http://localhost:5000/api/health

## Utilisation rapide

### Créer votre première paie

1. **Accédez à la page Paie**
   - Menu : Tableau de bord > Paie

2. **Créer une période de paie**
   - Cliquez sur "+ Nouvelle Période"
   - Sélectionnez le mois et l'année
   - Définissez la date de paiement (par défaut le 24)
   - Cliquez sur "Créer"

3. **Ajouter des éléments variables (optionnel)**
   - Onglet "Éléments Variables"
   - Cliquez sur "+ Ajouter"
   - Sélectionnez un employé
   - Choisissez le type (bonus, prime, etc.)
   - Entrez le montant
   - Sélectionnez la période
   - Cliquez sur "Ajouter"

4. **Traiter la paie**
   - Revenez à l'onglet "Exécutions"
   - Cliquez sur "Traiter" pour la période créée
   - Le système calculera automatiquement :
     - Salaire brut de chaque employé
     - Déductions (IRPP, INSS)
     - Salaire net
   - Cela créera un bulletin pour chaque employé actif

5. **Approuver la paie**
   - Après traitement, cliquez sur "Approuver"
   - Vérifiez les montants
   - Confirmez l'approbation

6. **Distribuer les bulletins**
   - Cliquez sur "Distribuer"
   - Le système générera les PDFs pour tous les bulletins
   - Les bulletins seront disponibles au téléchargement

### Voir les bulletins d'un employé

1. Allez dans Employés
2. Cliquez sur un employé
3. Allez dans l'onglet "Paie"
4. Vous verrez :
   - Résumé des paiements
   - Historique complet
   - Boutons de téléchargement PDF

## Configuration des salaires

Pour que la paie fonctionne, assurez-vous que :

### Option 1 : Salaire par grade
Ajoutez une colonne `base_salary` à la table `grades` :

```sql
ALTER TABLE `grades` ADD COLUMN `base_salary` DECIMAL(12,2) DEFAULT 0.00 AFTER `name`;

-- Puis mettez à jour les salaires
UPDATE `grades` SET `base_salary` = 800000.00 WHERE `code` = 'DIR';
UPDATE `grades` SET `base_salary` = 600000.00 WHERE `code` = 'CHEF_SERV';
UPDATE `grades` SET `base_salary` = 400000.00 WHERE `code` = 'CADRE';
UPDATE `grades` SET `base_salary` = 250000.00 WHERE `code` = 'AGENT';
```

### Option 2 : Salaire par poste
Ajoutez une colonne `base_salary` à la table `job_positions` :

```sql
ALTER TABLE `job_positions` ADD COLUMN `base_salary` DECIMAL(12,2) DEFAULT 0.00 AFTER `title`;

-- Puis mettez à jour selon vos postes
```

## Paramètres configurables

### Modifier les taux d'imposition
1. Page Paie > Onglet "Paramètres"
2. Modifiez :
   - Taux IRPP (par défaut 30%)
   - Taux INSS (par défaut 5%)
   - Jour de paiement (par défaut 24)
   - Devise (par défaut CDF)

## Tests recommandés

### Test 1 : Paie simple
1. Créez une période de paie pour le mois en cours
2. Traitez sans éléments variables
3. Vérifiez que tous les employés actifs ont un bulletin
4. Approuvez et distribuez
5. Téléchargez un bulletin PDF

### Test 2 : Paie avec primes
1. Créez une période
2. Ajoutez une prime à un employé spécifique
3. Traitez la paie
4. Vérifiez que la prime apparaît dans le bulletin de cet employé

### Test 3 : Consultation employé
1. Allez sur le profil d'un employé
2. Vérifiez l'onglet Paie
3. Téléchargez un bulletin

## Résolution de problèmes courants

### Problème : Aucun employé traité lors du process
**Solution** :
- Vérifiez que des employés ont `employment_status = 'active'` et `is_active = true`
- Vérifiez que les grades ou postes ont un `base_salary` > 0

### Problème : Erreur lors de la génération PDF
**Solution** :
- Vérifiez que le dossier `api/public/uploads/payslips/` existe
- Vérifiez les permissions : `chmod -R 755 api/public/uploads/`
- Vérifiez que pdfkit est installé : `npm list pdfkit`

### Problème : Montants de déduction incorrects
**Solution** :
- Vérifiez les paramètres dans l'onglet "Paramètres"
- Vérifiez que les types d'éléments sont correctement configurés (catégorie, imposable, etc.)

### Problème : Les éléments variables n'apparaissent pas
**Solution** :
- Vérifiez que le statut est "approved"
- Vérifiez que la période correspond (format YYYY-MM)
- Vérifiez que l'employé est bien associé

## Flux complet recommandé

### Chaque mois :

1. **Semaine 1-2** : Collecte des éléments variables
   - Saisir les heures supplémentaires
   - Saisir les primes du mois
   - Saisir les déductions ponctuelles

2. **Semaine 3** : Traitement
   - Créer la période de paie
   - Traiter la paie
   - Vérifier les bulletins générés

3. **Semaine 4** : Validation et distribution
   - Faire valider par le responsable RH
   - Approuver la paie
   - Distribuer les bulletins
   - Archiver les PDFs si nécessaire

## Checklist avant première paie

- [ ] Tables créées dans la base de données
- [ ] Données initiales (types d'éléments, paramètres) insérées
- [ ] PDFKit installé
- [ ] Dossier uploads/payslips créé avec bonnes permissions
- [ ] Au moins un employé actif avec salaire de base défini
- [ ] Paramètres de paie configurés (taux IRPP/INSS)
- [ ] Serveur backend redémarré

## Commandes utiles

```bash
# Vérifier les logs backend
tail -f api/logs/app.log

# Vérifier les employés actifs
mysql -u root -p -D rh_sofibank -e "SELECT id, first_name, last_name, employment_status FROM employees WHERE employment_status='active'"

# Vérifier les types d'éléments
mysql -u root -p -D rh_sofibank -e "SELECT name, code, category FROM payroll_item_types WHERE is_active=1"

# Vérifier les paramètres
mysql -u root -p -D rh_sofibank -e "SELECT * FROM payroll_settings WHERE is_active=1"
```

## Support

En cas de problème, vérifiez :
1. Les logs du serveur backend
2. La console du navigateur (F12)
3. Les données dans la base de données
4. Le fichier PAYROLL_MODULE_README.md pour la documentation complète
