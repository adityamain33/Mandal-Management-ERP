import XLSX from 'xlsx';

/**
 * Exports data to an Excel Sheet Buffer
 * @param {Array} data - Array of objects to export
 * @param {string} sheetName - Name of the worksheet
 * @returns {Buffer} - Excel file buffer
 */
export const exportToExcel = (data, sheetName = 'Report') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Write to buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};

/**
 * Exports data to a CSV String
 * @param {Array} data - Array of objects to export
 * @returns {string} - CSV formatted string
 */
export const exportToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = ('' + val).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};
