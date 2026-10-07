import { formatFileDate } from '@/lib/format';
import type { ExportFormat } from '@/lib/types';
import { buildExcel } from './excel';
import { buildPdf } from './pdf';
import type { InventoryReport } from './report';

export { buildInventoryReport } from './report';

export interface ExportFile {
  body: Uint8Array;
  contentType: string;
  fileName: string;
}

const EXPORTERS: Record<ExportFormat, { extension: string; contentType: string; build: (r: InventoryReport) => Uint8Array | Promise<Uint8Array> }> = {
  excel: {
    extension: 'xlsx',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    build: buildExcel,
  },
  pdf: {
    extension: 'pdf',
    contentType: 'application/pdf',
    build: buildPdf,
  },
};

export function isExportFormat(value: string): value is ExportFormat {
  return value in EXPORTERS;
}

export async function createExportFile(format: ExportFormat, report: InventoryReport): Promise<ExportFile> {
  const exporter = EXPORTERS[format];
  return {
    body: await exporter.build(report),
    contentType: exporter.contentType,
    fileName: `inventaris-${formatFileDate(report.generatedAt)}.${exporter.extension}`,
  };
}