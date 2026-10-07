import { NextResponse, type NextRequest } from 'next/server';
import { safeRedirectPath } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/** Tujuan tautan konfirmasi email Supabase: tukar `code` menjadi sesi login. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeRedirectPath(searchParams.get('next')), origin));
    }
  }

  return NextResponse.redirect(new URL('/login?error=confirmation', origin));
}