'use client';

import { useActionState, useState } from 'react';
import { authenticate } from '@/actions/auth.actions';
import { FormField, inputClass } from '@/components/ui/form-field';
import { FormMessage } from '@/components/ui/form-message';
import { SubmitButton } from '@/components/ui/submit-button';
import { initialActionState } from '@/lib/action-state';

type Mode = 'login' | 'register';

const COPY: Record<Mode, { submit: string; pending: string; switchText: string; switchAction: string }> = {
  login: { submit: 'Masuk', pending: 'Memproses…', switchText: 'Belum punya akun?', switchAction: 'Daftar' },
  register: { submit: 'Daftar', pending: 'Mendaftarkan…', switchText: 'Sudah punya akun?', switchAction: 'Masuk' },
};

export function LoginForm({ next }: { next?: string }) {
  const [mode, setMode] = useState<Mode>('login');
  const [state, formAction] = useActionState(authenticate, initialActionState);
  const copy = COPY[mode];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="mode" value={mode} />
      {next && <input type="hidden" name="next" value={next} />}

      <FormField label="Email" htmlFor="email" error={state.fieldErrors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          className={inputClass}
        />
      </FormField>

      <FormField label="Kata sandi" htmlFor="password" error={state.fieldErrors?.password}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          minLength={6}
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          className={inputClass}
        />
      </FormField>

      <FormMessage state={state} />

      <SubmitButton pendingText={copy.pending} className="w-full">
        {copy.submit}
      </SubmitButton>

      <p className="text-center text-sm text-slate-500">
        {copy.switchText}{' '}
        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="font-medium text-emerald-700 hover:underline"
        >
          {copy.switchAction}
        </button>
      </p>
    </form>
  );
}