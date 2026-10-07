import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getSupabaseEnv } from './env';

export type DbClient = SupabaseClient;

/** Klien Supabase untuk Server Component, Server Action, dan Route Handler. */
export async function createClient(): Promise<DbClient> {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Dipanggil dari Server Component (cookie read-only).
          // Aman diabaikan: sesi sudah diperbarui oleh proxy.ts.
        }
      },
    },
  });
}