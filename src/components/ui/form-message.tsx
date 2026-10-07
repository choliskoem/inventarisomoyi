import type { ActionState } from '@/lib/action-state';

export function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;

  const tone = state.ok
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : 'border-red-200 bg-red-50 text-red-700';

  return (
    <p role={state.ok ? 'status' : 'alert'} className={`rounded-lg border px-3 py-2 text-sm ${tone}`}>
      {state.message}
    </p>
  );
}