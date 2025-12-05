
import Papa from 'papaparse';

export const downloadCSV = (data, filename) => {
  // Convert array of arrays to CSV string
  const csvContent = data.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma or quote
      const cellStr = String(cell === null || cell === undefined ? '' : cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(",")
  ).join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const parseCSV = (text) => {
  // Using PapaParse for robust CSV parsing handling quotes and spaces correctly
  const results = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/['"]+/g, '')
  });
  
  if (results.errors && results.errors.length > 0) {
    console.warn("CSV Parse Errors:", results.errors);
  }

  return results.data;
};
