import * as XLSX from "xlsx";

/**
 * Універсальна функція для експорту масиву об'єктів в Excel
 * @param data — масив замаплених даних з українськими колонками
 * @param fileName — бажана назва файлу (без розширення)
 */
export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, "Звіт");

  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};