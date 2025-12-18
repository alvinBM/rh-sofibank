import models from '../models/index.js';
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const employeeDocumentsController = {
  /**
   * Get all documents for an employee
   */
  getByEmployeeId: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { document_type_id } = req.query;

      const where = { employee_id: employeeId };
      
      if (document_type_id) {
        where.document_type_id = document_type_id;
      }

      const documents = await models.EmployeeDocument.findAll({
        where,
        include: [
          { 
            model: models.DocumentType, 
            as: 'document_type',
            attributes: ['id', 'name', 'code']
          },
          {
            model: models.User,
            as: 'verified_by_user',
            attributes: ['id', 'email', 'first_name', 'last_name']
          }
        ],
        order: [['upload_date', 'DESC']]
      });

      return res.status(200).json({
        status: 200,
        data: documents
      });
    } catch (error) {
      console.error('Get employee documents error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération des documents',
        error: error.message
      });
    }
  },

  /**
   * Get document by ID
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const document = await models.EmployeeDocument.findByPk(id, {
        include: [
          { 
            model: models.DocumentType, 
            as: 'document_type' 
          },
          {
            model: models.Employee,
            as: 'employee',
            attributes: ['id', 'first_name', 'last_name', 'employee_number']
          }
        ]
      });

      if (!document) {
        return res.status(200).json({
          status: 404,
          message: 'Document non trouvé'
        });
      }

      return res.status(200).json({
        status: 200,
        data: document
      });
    } catch (error) {
      console.error('Get document error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la récupération du document',
        error: error.message
      });
    }
  },

  /**
   * Upload a new document
   */
  create: async (req, res) => {
    try {
      const { employeeId } = req.params;
      const {
        document_type_id,
        document_name,
        expiry_date,
        notes
      } = req.body;

      // Check if file was uploaded
      if (!req.files || !req.files.document) {
        return res.status(200).json({
          status: 400,
          message: 'Aucun fichier fourni'
        });
      }

      const file = req.files.document;
      
      // Create upload directory if it doesn't exist
      const uploadDir = path.join(__dirname, '../../../public/uploads/documents');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      // Move file to upload directory
      await file.mv(filePath);

      // Create document record
      const document = await models.EmployeeDocument.create({
        employee_id: employeeId,
        document_type_id,
        document_name: document_name || file.name,
        document_url: `/uploads/documents/${fileName}`,
        file_size: file.size,
        mime_type: file.mimetype,
        expiry_date: expiry_date || null,
        notes: notes || null
      });

      const documentWithRelations = await models.EmployeeDocument.findByPk(document.id, {
        include: [
          { model: models.DocumentType, as: 'document_type' }
        ]
      });

      return res.status(200).json({
        status: 201,
        message: 'Document ajouté avec succès',
        data: documentWithRelations
      });
    } catch (error) {
      console.error('Upload document error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de l\'ajout du document',
        error: error.message
      });
    }
  },

  /**
   * Update document metadata
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        document_name,
        document_type_id,
        expiry_date,
        notes,
        is_verified
      } = req.body;

      const document = await models.EmployeeDocument.findByPk(id);

      if (!document) {
        return res.status(200).json({
          status: 404,
          message: 'Document non trouvé'
        });
      }

      const updateData = {};
      
      if (document_name) updateData.document_name = document_name;
      if (document_type_id) updateData.document_type_id = document_type_id;
      if (expiry_date !== undefined) updateData.expiry_date = expiry_date;
      if (notes !== undefined) updateData.notes = notes;
      
      if (is_verified !== undefined) {
        updateData.is_verified = is_verified;
        if (is_verified) {
          updateData.verified_by = req.user.id;
          updateData.verified_at = new Date();
        }
      }

      await document.update(updateData);

      const updatedDocument = await models.EmployeeDocument.findByPk(id, {
        include: [
          { model: models.DocumentType, as: 'document_type' }
        ]
      });

      return res.status(200).json({
        status: 200,
        message: 'Document mis à jour avec succès',
        data: updatedDocument
      });
    } catch (error) {
      console.error('Update document error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la mise à jour du document',
        error: error.message
      });
    }
  },

  /**
   * Delete a document
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const document = await models.EmployeeDocument.findByPk(id);

      if (!document) {
        return res.status(200).json({
          status: 404,
          message: 'Document non trouvé'
        });
      }

      // Delete physical file
      const filePath = path.join(__dirname, '../../../public', document.document_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await document.destroy();

      return res.status(200).json({
        status: 200,
        message: 'Document supprimé avec succès'
      });
    } catch (error) {
      console.error('Delete document error:', error);
      return res.status(200).json({
        status: 500,
        message: 'Erreur lors de la suppression du document',
        error: error.message
      });
    }
  },

  /**
   * Download a document
   */
  download: async (req, res) => {
    try {
      const { id } = req.params;

      const document = await models.EmployeeDocument.findByPk(id);

      if (!document) {
        return res.status(404).json({
          status: 404,
          message: 'Document non trouvé'
        });
      }

      const filePath = path.join(__dirname, '../../../public', document.document_url);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          status: 404,
          message: 'Fichier non trouvé'
        });
      }

      res.download(filePath, document.document_name);
    } catch (error) {
      console.error('Download document error:', error);
      return res.status(500).json({
        status: 500,
        message: 'Erreur lors du téléchargement du document',
        error: error.message
      });
    }
  }
};

export default employeeDocumentsController;
