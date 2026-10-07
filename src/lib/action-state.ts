import { z } from 'zod';

export type FieldErrors = Record<string, string[] | undefined>;

/** Bentuk hasil standar semua Server Action yang dipakai bersama useActionState. */
export interface ActionState {
  ok?: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
  /** Nilai yang dikirim, dikembalikan saat gagal agar isian form tidak hilang. */
  values?: Record<string, string>;
}

export type FormAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export const initialActionState: ActionState = {};

export function getFormValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && !key.startsWith('$ACTION')) values[key] = value;
  }
  return values;
}

export function validationFailed(error: z.ZodError, values: Record<string, string>): ActionState {
  return {
    message: 'Periksa kembali isian yang ditandai.',
    fieldErrors: z.flattenError(error).fieldErrors,
    values,
  };
}