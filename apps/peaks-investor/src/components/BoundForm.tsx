"use client";

import { useActionState, type ReactNode } from "react";

type Result = { error?: string; ok?: string; href?: string } | void;

export function BoundForm({
  action,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<Result>;
  children: ReactNode;
  className?: string;
}) {
  const [message, formAction] = useActionState(async (_previous: Result, formData: FormData) => {
    const result = (await action(formData)) ?? {};
    if (result.href) {
      window.location.assign(result.href);
    }
    return result;
  }, undefined as Result);
  const text = message?.error || message?.ok || "";
  return (
    <form action={formAction} className={className}>
      {text ? (
        <p className={message?.error ? "mb-3 text-sm font-semibold text-brand" : "mb-3 text-sm font-semibold"}>{text}</p>
      ) : null}
      {children}
    </form>
  );
}
