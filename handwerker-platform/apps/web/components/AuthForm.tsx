"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/actions/auth";
import { SubmitButton } from "./SubmitButton";

export function AuthForm({
  action,
  submitLabel,
  children,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
  children: React.ReactNode;
}) {
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await action(formData);
          if (result?.error) setError(result.error);
        });
      }}
    >
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
