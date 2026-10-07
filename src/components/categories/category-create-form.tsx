'use client';

import { useActionState } from 'react';
import { createCategoryAction } from '@/actions/category.actions';
import { FormField, inputClass } from '@/components/ui/form-field';
import { FormMessage } from '@/components/ui/form-message';
import { SubmitButton } from '@/components/ui/submit-button';
import { initialActionState } from '@/lib/action-state';

export function CategoryCreateForm() {
  const [state, formAction] = useActionState(createCategoryAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <FormField label="Nama kategori" htmlFor="new-category-name" error={state.fieldErrors?.name} required>
        <input
          id="new-category-name"
          name="name"
          maxLength={100}
          placeholder="mis. Elektronik"
          defaultValue={state.values?.name}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          className={inputClass}
        />
      </FormField>

      <FormField label="Keterangan" htmlFor="new-category-description" error={state.fieldErrors?.description}>
        <textarea
          id="new-category-description"
          name="description"
          rows={2}
          maxLength={500}
          defaultValue={state.values?.description}
          className={inputClass}
        />
      </FormField>

      <FormMessage state={state} />
      <SubmitButton>Tambah Kategori</SubmitButton>
    </form>
  );
}