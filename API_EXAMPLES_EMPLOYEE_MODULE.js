// =================================================================
// EXEMPLES D'UTILISATION - API Fiche Employé
// =================================================================

// =================================================================
// 1. DOCUMENTS EMPLOYÉ
// =================================================================

// GET - Liste tous les documents d'un employé
// GET /api/employees/:employeeId/documents
fetch('/api/employees/5b955e09-abd5-48e3-8582-86f0c27584c6/documents', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(res => res.json())
.then(data => console.log(data));

// Response:
// {
//   status: 200,
//   data: [
//     {
//       id: "doc-uuid",
//       employee_id: "emp-uuid",
//       document_type_id: "type-uuid",
//       document_name: "Contrat CDI - MUKENDI.pdf",
//       document_url: "/uploads/documents/xxx.pdf",
//       file_size: 245678,
//       mime_type: "application/pdf",
//       upload_date: "2024-12-01",
//       expiry_date: null,
//       is_verified: true,
//       document_type: { name: "Contrat de travail", code: "contract" }
//     }
//   ]
// }

// POST - Upload un nouveau document
// POST /api/employees/:employeeId/documents
const formData = new FormData();
formData.append('document', fileInput.files[0]);
formData.append('document_type_id', 'type-uuid');
formData.append('document_name', 'Mon Document.pdf');
formData.append('notes', 'Notes optionnelles');
formData.append('expiry_date', '2025-12-31');

fetch('/api/employees/5b955e09-abd5-48e3-8582-86f0c27584c6/documents', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' },
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));

// Response:
// {
//   status: 201,
//   message: "Document ajouté avec succès",
//   data: { /* document object */ }
// }

// DELETE - Supprimer un document
// DELETE /api/employees/:employeeId/documents/:documentId
fetch('/api/employees/emp-uuid/documents/doc-uuid', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(res => res.json())
.then(data => console.log(data));

// GET - Télécharger un document
// GET /api/employees/:employeeId/documents/:documentId/download
// Cette route renvoie directement le fichier pour téléchargement

// =================================================================
// 2. PAIEMENTS & BULLETINS
// =================================================================

// GET - Liste des bulletins de paie
// GET /api/employees/:employeeId/payslips?year=2024&month=12
fetch('/api/employees/5b955e09-abd5-48e3-8582-86f0c27584c6/payslips?year=2024', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(res => res.json())
.then(data => console.log(data));

// Response:
// {
//   status: 200,
//   data: [
//     {
//       id: "payslip-uuid",
//       payslip_number: "BS-2024-12-EMP001",
//       employee_id: "emp-uuid",
//       payroll_period_id: "period-uuid",
//       base_salary: 2000000,
//       gross_salary: 2600000,
//       net_salary: 2080000,
//       total_deductions: 520000,
//       payment_date: "2024-12-25",
//       pdf_url: "/uploads/payslips/xxx.pdf",
//       payroll_period: {
//         period_name: "Décembre 2024",
//         year: 2024,
//         month: 12
//       }
//     }
//   ]
// }

// GET - Historique des paiements avec résumé
// GET /api/employees/:employeeId/payment-history?startYear=2023&endYear=2024
fetch('/api/employees/5b955e09-abd5-48e3-8582-86f0c27584c6/payment-history?startYear=2024&endYear=2024', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(res => res.json())
.then(data => console.log(data));

// Response:
// {
//   status: 200,
//   data: {
//     payslips: [ /* array of payslips */ ],
//     summary: {
//       total_payments: 12,
//       total_gross: 31200000,
//       total_net: 24960000,
//       total_deductions: 6240000,
//       total_tax: 4680000
//     }
//   }
// }

// GET - Détails d'un bulletin spécifique
// GET /api/employees/:employeeId/payslips/:payslipId
fetch('/api/employees/emp-uuid/payslips/payslip-uuid', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(res => res.json())
.then(data => console.log(data));

// GET - Télécharger un bulletin PDF
// GET /api/employees/:employeeId/payslips/:payslipId/download
// Cette route renvoie directement le PDF

// =================================================================
// 3. PRÉSENCE & MOUVEMENTS
// =================================================================

// GET - Présences avec statistiques
// GET /api/employees/:employeeId/attendance?month=12&year=2024
fetch('/api/employees/5b955e09-abd5-48e3-8582-86f0c27584c6/attendance?month=12&year=2024', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(res => res.json())
.then(data => console.log(data));

// Response:
// {
//   status: 200,
//   data: {
//     records: [
//       {
//         id: "att-uuid",
//         employee_id: "emp-uuid",
//         date: "2024-12-18",
//         check_in_time: "08:05:30",
//         check_out_time: "17:10:00",
//         total_hours: 9.08,
//         status: "present",
//         is_late: false,
//         late_minutes: 0
//       }
//     ],
//     statistics: {
//       total_records: 20,
//       present: 17,
//       absent: 1,
//       late: 2,
//       on_leave: 0,
//       total_hours: 162.5,
//       total_late_minutes: 45
//     }
//   }
// }

// GET - Données pour calendrier
// GET /api/employees/:employeeId/attendance/calendar?month=12&year=2024
fetch('/api/employees/5b955e09-abd5-48e3-8582-86f0c27584c6/attendance/calendar?month=12&year=2024', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(res => res.json())
.then(data => console.log(data));

// Response:
// {
//   status: 200,
//   data: [
//     {
//       id: "att-uuid",
//       date: "2024-12-01",
//       status: "present",
//       check_in: "08:00:00",
//       check_out: "17:00:00",
//       total_hours: 9,
//       is_late: false,
//       late_minutes: 0
//     }
//   ]
// }

// GET - Mouvements (entrées/sorties)
// GET /api/employees/:employeeId/attendance/movements?limit=50
fetch('/api/employees/5b955e09-abd5-48e3-8582-86f0c27584c6/attendance/movements?limit=50', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(res => res.json())
.then(data => console.log(data));

// Response:
// {
//   status: 200,
//   data: [
//     {
//       id: "att-uuid-in",
//       date: "2024-12-18",
//       time: "08:05:30",
//       type: "entry",
//       status: "on_time",
//       late_minutes: 0
//     },
//     {
//       id: "att-uuid-out",
//       date: "2024-12-18",
//       time: "17:10:00",
//       type: "exit",
//       total_hours: 9.08
//     }
//   ]
// }

// GET - Résumé mensuel
// GET /api/employees/:employeeId/attendance/summary?month=12&year=2024
fetch('/api/employees/5b955e09-abd5-48e3-8582-86f0c27584c6/attendance/summary?month=12&year=2024', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(res => res.json())
.then(data => console.log(data));

// Response:
// {
//   status: 200,
//   data: {
//     month: 12,
//     year: 2024,
//     working_days: 20,
//     present_days: 17,
//     absent_days: 1,
//     late_days: 2,
//     leave_days: 0,
//     total_hours: 162.5,
//     total_late_minutes: 45
//   }
// }

// =================================================================
// 4. EXEMPLES D'UTILISATION AVEC LES HOOKS
// =================================================================

// Dans un composant React:

import { useGetEmployeeDocuments, useUploadEmployeeDocument } from '@/hooks/useEmployeeDocuments';
import { useGetPaymentHistory } from '@/hooks/usePayroll';
import { useGetAttendanceCalendar } from '@/hooks/useEmployeeAttendance';

function EmployeeProfile({ employeeId }) {
  // Documents
  const { data: documents, isLoading: loadingDocs } = useGetEmployeeDocuments(employeeId);
  const uploadMutation = useUploadEmployeeDocument();

  const handleUpload = async (file, metadata) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type_id', metadata.typeId);
    formData.append('document_name', metadata.name);

    await uploadMutation.mutateAsync({ employeeId, formData });
  };

  // Paiements
  const { data: paymentHistory } = useGetPaymentHistory(employeeId, {
    startYear: 2024,
    endYear: 2024
  });

  // Présence
  const month = 12;
  const year = 2024;
  const { data: calendarData } = useGetAttendanceCalendar(employeeId, month, year);

  return (
    <div>
      {/* Affichage des données */}
    </div>
  );
}

// =================================================================
// 5. CODES D'ERREUR
// =================================================================

// 200 - Succès
// 201 - Créé avec succès
// 400 - Requête invalide
// 401 - Non authentifié
// 403 - Non autorisé (permissions)
// 404 - Ressource non trouvée
// 500 - Erreur serveur

// =================================================================
// 6. FILTRES DISPONIBLES
// =================================================================

// Documents:
// - document_type_id: Filtrer par type de document

// Paiements:
// - year: Année (ex: 2024)
// - month: Mois (1-12)
// - status: Statut (draft, paid, cancelled)

// Présences:
// - startDate: Date début (YYYY-MM-DD)
// - endDate: Date fin (YYYY-MM-DD)
// - month: Mois (1-12)
// - year: Année (ex: 2024)
// - status: Statut (present, absent, late, on_leave)

// =================================================================
// 7. FORMATS DE DATE
// =================================================================

// Envoi vers API: "YYYY-MM-DD" (ex: "2024-12-18")
// Réception: ISO 8601 ou MySQL datetime
// Affichage: Formaté avec toLocaleDateString('fr-FR')
