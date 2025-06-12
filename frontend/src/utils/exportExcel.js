import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (tableId, title = "Report") => {
  const doc = new jsPDF();
  doc.text(title, 10, 10);
  doc.autoTable({ html: `#${tableId}` });
  doc.save(`${title}.pdf`);
};
