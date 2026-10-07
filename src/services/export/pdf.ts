import { jsPDF } from 'jspdf';
import { autoTable, type RowInput } from 'jspdf-autotable';
import { STOCK_STATUS_LABEL } from '@/lib/config';
import { formatDateTime, formatNumber } from '@/lib/format';
import type { InventoryReport } from './report';

const COLOR_PRIMARY: [number, number, number] = [4, 120, 87];
const COLOR_GROUP: [number, number, number] = [209, 250, 229];
const COLOR_SUBTOTAL: [number, number, number] = [241, 245, 249];
const COLUMN_COUNT = 8;
const MARGIN = 14;

function buildBody(report: InventoryReport): RowInput[] {
  const body: RowInput[] = [];
  let number = 1;

  for (const group of report.groups) {
    body.push([
      {
        content: `${group.categoryName} (${group.items.length} barang)`,
        colSpan: COLUMN_COUNT,
        styles: { fillColor: COLOR_GROUP, fontStyle: 'bold' },
      },
    ]);

    for (const item of group.items) {
      body.push([
        number++,
        item.sku,
        item.name,
        item.categoryName,
        formatNumber(item.quantity),
        item.unitName,
        formatNumber(item.minStock),
        STOCK_STATUS_LABEL[item.stockStatus],
      ]);
    }

    body.push([
      {
        content: `Subtotal ${group.categoryName}`,
        colSpan: 4,
        styles: { fillColor: COLOR_SUBTOTAL, fontStyle: 'bold', halign: 'right' },
      },
      {
        content: formatNumber(group.totalQuantity),
        styles: { fillColor: COLOR_SUBTOTAL, fontStyle: 'bold', halign: 'right' },
      },
      { content: '', colSpan: 3, styles: { fillColor: COLOR_SUBTOTAL } },
    ]);
  }

  if (body.length === 0) {
    body.push([{ content: 'Tidak ada data barang.', colSpan: COLUMN_COUNT, styles: { halign: 'center' } }]);
  }
  return body;
}

function addPageNumbers(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const { width, height } = doc.internal.pageSize;

  doc.setFontSize(8);
  doc.setTextColor(100);
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.text(`Halaman ${page} dari ${pageCount}`, width - MARGIN, height - 8, { align: 'right' });
  }
}

export function buildPdf(report: InventoryReport): Uint8Array {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(report.title, MARGIN, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(
    `Kategori: ${report.filterLabel}   |   Dicetak: ${formatDateTime(report.generatedAt)}   |   ` +
      `${report.itemCount} jenis barang`,
    MARGIN,
    22,
  );
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 27,
    margin: { left: MARGIN, right: MARGIN, bottom: 14 },
    head: [['No', 'Kode', 'Nama Barang', 'Kategori', 'Jumlah', 'Satuan', 'Stok Min.', 'Status']],
    body: buildBody(report),
    foot: [
      [
        { content: 'TOTAL KESELURUHAN', colSpan: 4, styles: { halign: 'right' } },
        { content: formatNumber(report.grandTotal), styles: { halign: 'right' } },
        { content: '', colSpan: 3 },
      ],
    ],
    showFoot: 'lastPage',
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: COLOR_PRIMARY },
    footStyles: { fillColor: COLOR_PRIMARY },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 28 },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 24 },
      6: { cellWidth: 24, halign: 'right' },
      7: { cellWidth: 22 },
    },
  });

  addPageNumbers(doc);
  return new Uint8Array(doc.output('arraybuffer'));
}