import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchEmployeeDocuments,
  uploadEmployeeDocument,
  updateEmployeeDocument,
  deleteEmployeeDocument,
  downloadEmployeeDocument,
} from "../services/apis/employeeService";
import queryClient from "../lib/react-query-client";
import { toast } from "react-toastify";

/**
 * Hook to fetch all documents for an employee
 */
export const useGetEmployeeDocuments = (employeeId, documentTypeId = null) => {
  return useQuery({
    queryKey: ["employee-documents", employeeId, documentTypeId],
    queryFn: () => fetchEmployeeDocuments(employeeId, documentTypeId),
    enabled: !!employeeId,
  });
};

/**
 * Hook to upload a new document
 */
export const useUploadEmployeeDocument = () => {
  return useMutation({
    mutationFn: ({ employeeId, formData }) => uploadEmployeeDocument(employeeId, formData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["employee-documents", variables.employeeId]);
      toast.success("Document ajouté avec succès");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'ajout du document");
    },
  });
};

/**
 * Hook to update document metadata
 */
export const useUpdateEmployeeDocument = () => {
  return useMutation({
    mutationFn: ({ employeeId, documentId, data }) => updateEmployeeDocument(employeeId, documentId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["employee-documents", variables.employeeId]);
      toast.success("Document mis à jour avec succès");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du document");
    },
  });
};

/**
 * Hook to delete a document
 */
export const useDeleteEmployeeDocument = () => {
  return useMutation({
    mutationFn: ({ employeeId, documentId }) => deleteEmployeeDocument(employeeId, documentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["employee-documents", variables.employeeId]);
      toast.success("Document supprimé avec succès");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la suppression du document");
    },
  });
};

/**
 * Hook to download a document
 */
export const useDownloadEmployeeDocument = () => {
  return useMutation({
    mutationFn: ({ employeeId, documentId }) => downloadEmployeeDocument(employeeId, documentId),
    onError: (error) => {
      toast.error(error.message || "Erreur lors du téléchargement du document");
    },
  });
};
