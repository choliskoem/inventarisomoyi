'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { validationFailed, type ActionState } from '@/lib/action-state';
import { safeRedirectPath } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { credentialsSchema } from '@/lib/validation';

const AUTH_ERRORS: Record<string, string> = {
  user_already_exists: 'Email sudah terdaftar. Silakan masuk.',
  email_exists: 'Email sudah terdaftar. Silakan masuk.',
  weak_password: 'Kata sandi terlalu lemah.',
  over_email_send_rate_limit: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.',
  email_not_confirmed: 'Email belum dikonfirmasi. Cek kotak masuk Anda.',
  invalid_credentials: 'Email atau kata sandi salah.',
};

function authErrorMessage(code: string | undefined): string {
  return (code && AUTH_ERRORS[code]) || 'Gagal memproses permintaan. Silakan coba lagi.';
}

async function getOrigin(): Promise<string> {
  const headerList = await headers();
  const origin = headerList.get('origin');
  if (origin) return origin;
  const protocol = headerList.get('x-forwarded-proto') ?? 'https';
  return `${protocol}://${headerList.get('host')}`;
}

export async function authenticate(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const values = { email: String(formData.get('email') ?? '') };
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationFailed(parsed.error, values);

  const { mode, email, password, next } = parsed.data;
  const supabase = await createClient();

  if (mode === 'register') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${await getOrigin()}/auth/callback` },
    });
    if (error) return { message: authErrorMessage(error.code), values };

    // Jika konfirmasi email aktif, sesi belum ada sampai email dikonfirmasi.
    if (!data.session) {
      return {
        ok: true,
        message: 'Pendaftaran berhasil. Buka email Anda dan klik tautan konfirmasi, lalu masuk.',
        values,
      };
    }
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { message: authErrorMessage(error.code), values };
  }

  redirect(safeRedirectPath(next));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}         