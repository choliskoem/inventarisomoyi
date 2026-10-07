import { redirect } from 'next/navigation';
import { DEFAULT_REDIRECT } from './config';
import { createClient } from './supabase/server';

/** Ambil pengguna yang sedang login, atau arahkan ke /login. */
export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect('/login');
  return data.user;
}

/** Cegah open redirect: hanya izinkan path internal. */
export function safeRedirectPath(next: string | null | undefined): string {
  if (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')) {
    return next;
  }
  return DEFAULT_REDIRECT;
}