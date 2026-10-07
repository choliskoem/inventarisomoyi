import { z } from 'zod';

const MAX_QUANTITY = 999_999_999_999;

/** Teks opsional: string kosong disimpan sebagai null. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maksimal ${max} karakter`)
    .optional()
    .transform((value) => value || null);

/**
 * Angka desimal dari input form; menerima koma (1,5) maupun titik (1.5).
 * Input kosong diganti `emptyValue` (jika tidak diisi → dianggap belum diisi).
 */
const decimal = (schema: z.ZodNumber, emptyValue?: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') return value ?? emptyValue;
    const normalized = value.trim().replace(',', '.');
    return normalized === '' ? emptyValue : Number(normalized);
  }, schema);

const quantity = (label: string) =>
  z.number({ error: `${label} wajib diisi dengan angka` }).max(MAX_QUANTITY, `${label} terlalu besar`);

export const idSchema = z.uuid();

// --- Auth ---------------------------------------------------------------

export const credentialsSchema = z.object({
  mode: z.enum(['login', 'register']),
  email: z.email('Format email tidak valid').trim().toLowerCase(),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter').max(72, 'Kata sandi terlalu panjang'),
  next: z.string().optional(),
});

// --- Kategori -----------------------------------------------------------

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Nama kategori wajib diisi').max(100, 'Maksimal 100 karakter'),
  description: optionalText(500),
});
export type CategoryInput = z.infer<typeof categorySchema>;

// --- Barang -------------------------------------------------------------

export const itemSchema = z.object({
  category_id: z.uuid('Pilih kategori'),
  unit_id: z.coerce.number().int().positive('Pilih satuan'),
  sku: z.string().trim().min(1, 'Kode barang wajib diisi').max(50, 'Maksimal 50 karakter'),
  name: z.string().trim().min(1, 'Nama barang wajib diisi').max(150, 'Maksimal 150 karakter'),
  description: optionalText(1000),
  min_stock: decimal(quantity('Stok minimum').min(0, 'Stok minimum tidak boleh negatif'), 0),
});
export type ItemInput = z.infer<typeof itemSchema>;

export const createItemSchema = itemSchema.extend({
  initial_quantity: decimal(quantity('Stok awal').min(0, 'Stok awal tidak boleh negatif'), 0),
});
export type CreateItemInput = z.infer<typeof createItemSchema>;

// --- Mutasi stok --------------------------------------------------------

export const movementSchema = z.object({
  type: z.enum(['in', 'out'], { error: 'Pilih jenis mutasi' }),
  quantity: decimal(quantity('Jumlah').positive('Jumlah harus lebih dari 0')),
  note: optionalText(255),
});
export type MovementInput = z.infer<typeof movementSchema>;

// --- Filter (query string) ----------------------------------------------

const filterSchema = z.object({
  category: idSchema.optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
});

export function parseItemFilter(params: Record<string, string | string[] | undefined>) {
  const single = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const { category, q } = filterSchema.parse({ category: single(params.category), q: single(params.q) });
  return { categoryId: category, q: q || undefined };
}