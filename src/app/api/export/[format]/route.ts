import type { NextRequest } from 'next/server';
import { getErrorMessage } from '@/lib/errors';
import { createClient } from '@/lib/supabase/server';
import { parseItemFilter } from '@/lib/validation';
import { getCategoryName } from '@/services/category.service';
import { buildInventoryReport, createExportFile, isExportFormat } from '@/services/export';
import { listItems } from '@/services/item.service';

interface RouteContext {
  params: Promise<{ format: string }>;
}

/** GET /api/export/excel|pdf?category=<uuid>&q=<kata kunci> */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { format } = await params;
  if (!isExportFormat(format)) {
    return Response.json({ error: 'Format tidak didukung. Gunakan excel atau pdf.' }, { status: 404 });
  }

  const db = await createClient();
  const { data: auth } = await db.auth.getUser();
  if (!auth.user) return Response.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });

  try {
    const filter = parseItemFilter(Object.fromEntries(request.nextUrl.searchParams));
    const [items, categoryName] = await Promise.all([
      listItems(db, filter),
      filter.categoryId ? getCategoryName(db, filter.categoryId) : Promise.resolve(null),
    ]);

    const filterParts = [categoryName ?? 'Semua kategori'];
    if (filter.q) filterParts.push(`pencarian "${filter.q}"`);

    const file = await createExportFile(format, buildInventoryReport(items, filterParts.join(', ')));

    return new Response(file.body as BodyInit, {
      headers: {
        'Content-Type': file.contentType,
        'Content-Disposition': `attachment; filename="${file.fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}