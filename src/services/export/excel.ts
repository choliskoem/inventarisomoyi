import ExcelJS from 'exceljs';
import { APP_NAME, STOCK_STATUS_LABEL } from '@/lib/config';
import { formatDateTime } from '@/lib/format';
import type { InventoryReport } from './report';

const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF047857' } };
const GROUP_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
const TOTAL_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
};
const NUMBER_FORMAT = '#,##0.##';

const ITEM_COLUMNS = [
  { header: 'No', key: 'no', width: 6 },
  { header: 'Kode', key: 'sku', width: 14 },
  { header: 'Nama Barang', key: 'name', width: 34 },
  { header: 'Kategori', key: 'category', width: 20 },
  { header: 'Jumlah', key: 'quantity', width: 12 },
  { header: 'Satuan', key: 'unit', width: 12 },
  { header: 'Stok Min.', key: 'minStock', width: 11 },
  { header: 'Status', key: 'status', width: 11 },
] as const;

const QUANTITY_COL = 'E';
const LAST_COL = 'H';

function styleRow(row: ExcelJS.Row, fill: ExcelJS.Fill, bold = true) {
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = fill;
    cell.font = { ...cell.font, bold };
    cell.border = THIN_BORDER;
  });
}

function addTitle(sheet: ExcelJS.Worksheet, report: InventoryReport) {
  sheet.mergeCells(`A1:${LAST_COL}1`);
  sheet.getCell('A1').value = report.title;
  sheet.getCell('A1').font = { size: 14, bold: true };

  sheet.mergeCells(`A2:${LAST_COL}2`);
  sheet.getCell('A2').value =
    `Kategori: ${report.filterLabel}  •  Dicetak: ${formatDateTime(report.generatedAt)}`;
  sheet.getCell('A2').font = { size: 10, color: { argb: 'FF64748B' } };
}

function addItemsSheet(workbook: ExcelJS.Workbook, report: InventoryReport) {
  const sheet = workbook.addWorksheet('Daftar Barang', { views: [{ state: 'frozen', ySplit: 4 }] });
  addTitle(sheet, report);

  sheet.columns = ITEM_COLUMNS.map(({ key, width }) => ({ key, width }));
  const header = sheet.getRow(4);
  header.values = ITEM_COLUMNS.map((column) => column.header);
  styleRow(header, HEADER_FILL);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };

  const subtotalCells: string[] = [];
  let number = 1;

  for (const group of report.groups) {
    const groupRow = sheet.addRow([`${group.categoryName} (${group.items.length} barang)`]);
    sheet.mergeCells(`A${groupRow.number}:${LAST_COL}${groupRow.number}`);
    styleRow(groupRow, GROUP_FILL);

    const firstItemRow = groupRow.number + 1;
    for (const item of group.items) {
      const row = sheet.addRow({
        no: number++,
        sku: item.sku,
        name: item.name,
        category: item.categoryName,
        quantity: item.quantity,
        unit: item.unitName,
        minStock: item.minStock,
        status: STOCK_STATUS_LABEL[item.stockStatus],
      });
      row.eachCell({ includeEmpty: true }, (cell) => (cell.border = THIN_BORDER));
    }
    const lastItemRow = sheet.lastRow!.number;

    const subtotalRow = sheet.addRow({ name: `Subtotal ${group.categoryName}` });
    subtotalRow.getCell('quantity').value = {
      formula: `SUM(${QUANTITY_COL}${firstItemRow}:${QUANTITY_COL}${lastItemRow})`,
      result: group.totalQuantity,
    };
    styleRow(subtotalRow, TOTAL_FILL);
    subtotalCells.push(`${QUANTITY_COL}${subtotalRow.number}`);
  }

  const totalRow = sheet.addRow({ name: 'TOTAL KESELURUHAN' });
  totalRow.getCell('quantity').value = subtotalCells.length
    ? { formula: subtotalCells.join('+'), result: report.grandTotal }
    : 0;
  styleRow(totalRow, GROUP_FILL);

  sheet.getColumn('quantity').numFmt = NUMBER_FORMAT;
  sheet.getColumn('minStock').numFmt = NUMBER_FORMAT;
}

function addSummarySheet(workbook: ExcelJS.Workbook, report: InventoryReport) {
  const sheet = workbook.addWorksheet('Ringkasan Kategori');
  addTitle(sheet, report);

  sheet.columns = [
    { key: 'category', width: 28 },
    { key: 'itemCount', width: 16 },
    { key: 'quantity', width: 16 },
  ];
  const header = sheet.getRow(4);
  header.values = ['Kategori', 'Jenis Barang', 'Total Jumlah'];
  header.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.border = THIN_BORDER;
  });

  for (const group of report.groups) {
    const row = sheet.addRow({
      category: group.categoryName,
      itemCount: group.items.length,
      quantity: group.totalQuantity,
    });
    row.eachCell((cell) => (cell.border = THIN_BORDER));
  }

  const firstRow = 5;
  const lastRow = sheet.lastRow!.number;
  const hasData = report.groups.length > 0;
  const totalRow = sheet.addRow({
    category: 'TOTAL',
    itemCount: hasData ? { formula: `SUM(B${firstRow}:B${lastRow})`, result: report.itemCount } : 0,
    quantity: hasData ? { formula: `SUM(C${firstRow}:C${lastRow})`, result: report.grandTotal } : 0,
  });
  totalRow.eachCell((cell) => {
    cell.fill = TOTAL_FILL;
    cell.font = { bold: true };
    cell.border = THIN_BORDER;
  });

  sheet.getColumn('quantity').numFmt = NUMBER_FORMAT;
}

export async function buildExcel(report: InventoryReport): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = APP_NAME;
  workbook.created = report.generatedAt;

  addItemsSheet(workbook, report);
  addSummarySheet(workbook, report);

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}