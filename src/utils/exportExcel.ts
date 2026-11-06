import * as XLSX from 'xlsx';
import { InventoryItem } from '../types.ts';

export function exportInventoryToExcel(items: InventoryItem[], filenamePrefix = 'Royal_Wunzaligu_Inventory') {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${filenamePrefix}_${dateStr}.xlsx`;

  // Calculate totals
  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const grandTotal = items.reduce(
    (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
    0
  );

  // Build spreadsheet rows (Array of Arrays)
  const rows: (string | number)[][] = [
    ["ROYAL WUN'ZALIGU ENTERPRISE"],
    ['OFFICIAL INVENTORY & STOCK VALUATION SHEET'],
    [`Currency: Ghana Cedis (GHS) | Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`],
    [], // Blank line
    [
      'No',
      'Material Name',
      'Category',
      'Unit',
      'Unit Price (GHS)',
      'Quantity',
      'Total Price (GHS)',
    ],
  ];

  // Populate data items
  items.forEach((item, index) => {
    const unitPrice = Number(item.unitPrice) || 0;
    const qty = Number(item.quantity) || 0;
    const total = Math.round(unitPrice * qty * 100) / 100;

    rows.push([
      index + 1,
      item.name || 'Unnamed Material',
      item.category || 'General',
      item.unit || 'Pcs',
      unitPrice,
      qty,
      total,
    ]);
  });

  // Summary Grand Total Row
  rows.push([]);
  rows.push([
    'GRAND TOTAL',
    '',
    '',
    '',
    '',
    totalQuantity,
    Math.round(grandTotal * 100) / 100,
  ]);

  // Create sheet & workbook
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 32 }, // Material Name
    { wch: 18 }, // Category
    { wch: 10 }, // Unit
    { wch: 18 }, // Unit Price (GHS)
    { wch: 12 }, // Quantity
    { wch: 20 }, // Total Price (GHS)
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

  // Trigger file download
  XLSX.writeFile(workbook, filename);
}
