'use client';

import { useActionState } from 'react';
import { initialActionState, type ActionState } from '@/lib/action-state';
import { SubmitButton } from './ui/submit-button';

interface DeleteButtonProps {
  /** Server Action yang sudah di-bind dengan ID data, mis. deleteItemAction.bind(null, id) */
  action: () => Promise<ActionState>;
  confirmMessage: string;
  label?: string;
}

export function DeleteButton({ action, confirmMessage, label = 'Hapus' }: DeleteButtonProps) {
  const [state, formAction] = useActionState(() => action(), initialActionState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
      className="inline-flex flex-col items-end gap-1"
    >
      <SubmitButton variant="danger" size="sm" pendingText="Menghapus…">
        {label}
      </SubmitButton>
      {state.message && !state.ok && (
        <p role="alert" className="max-w-64 text-right text-xs text-red-600">
          {state.message}
        </p>
      )}
    </form>
  );
}