import { AlertCircle } from 'lucide-react';

/** Inline message under a field; pair the input with `fieldA11y(id, error)` from lib/validation. */
export const FieldError = ({ id, error }: { id: string; error?: string }) =>
  error ? <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-[13px] text-destructive"><AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}</p> : null;
