'use client';

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { buttonClass, type ButtonSize, type ButtonVariant } from './button';

interface SubmitButtonProps {
  children: ReactNode;
  pendingText?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function SubmitButton({
  children,
  pendingText = 'Menyimpan…',
  variant = 'primary',
  size = 'md',
  className = '',
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={buttonClass(variant, size, className)}>
      {pending ? pendingText : children}
    </button>
  );
}