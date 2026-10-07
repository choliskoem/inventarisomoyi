'use client';

import { useActionState } from 'react';
import { FormField, inputClass } from '@/components/ui/form-field';
import { FormMessage } from '@/components/ui/form-message';
import { SubmitButton } from '@/components/ui/submit-button';
import { initialActionState, type FormAction } from '@/lib/action-state';
import { MOVEMENT_TYPE_LABEL } from '@/lib/config';
import type { MovementType } from '@/lib/types';

const TYPES = Object.entries(MOVEMENT_TYPE_LABEL) as [MovementType, string][];

export function MovementForm({ action, unitName }: { action: FormAction; unitName: string }) {
  const [state, formAction] = useActionState(action, initialActionState);
  const selectedType = state.values?.type ?? 'in';

  return (
    <form action={formAction} className="space-y-4">
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-slate-700">Jenis mutasi</legend>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map(([type, label]) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm has-checked:border-emerald-500 has-checked:bg-emerald-50"
            >
              <input type="radio" name="type" value={type} defaultChecked={selectedType === type} className="accent-emerald-600" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <FormField label={`Jumlah (${unitName})`} htmlFor="quantity" error={state.fieldErrors?.quantity} required>
        <input id="quantity" name="quantity" inputMode="decimal" required defaultValue={state.values?.quantity} aria-invalid={Boolean(state.fieldErrors?.quantity)} className={inputClass} />
      </FormField>

      <FormField label="Catatan" htmlFor="note" error={state.fieldErrors?.note}>
        <input id="note" name="note" maxLength={255} placeholder="mis. Pembelian dari supplier" defaultValue={state.values?.note} className={inputClass} />
      </FormField>

      <FormMessage state={state} />
      <SubmitButton className="w-full">Catat Mutasi</SubmitButton>
    </form>
  );
}