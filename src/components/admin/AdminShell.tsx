import Link from "next/link";
import type { ReactNode } from "react";

/** Page frame for owner admin screens: back link, title, and save/error banners. */
export function AdminShell({
  title,
  intro,
  back = { href: "/admin", label: "Dashboard" },
  notice,
  error,
  children,
}: {
  title: string;
  intro?: ReactNode;
  back?: { href: string; label: string };
  notice?: string | null;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="page-shell py-12">
      <Link href={back.href} className="text-link">
        ← {back.label}
      </Link>
      <h1 className="page-title mt-6 mb-3">{title}</h1>
      {intro && <div className="max-w-2xl text-brand-stone mb-6">{intro}</div>}
      {error && (
        <p
          role="alert"
          className="mb-6 rounded border border-red-200 bg-red-50 p-3 text-red-800"
        >
          {error}
        </p>
      )}
      {notice && !error && (
        <p
          role="status"
          className="mb-6 rounded border border-green-200 bg-green-50 p-3 text-green-900"
        >
          {notice}
        </p>
      )}
      {children}
    </div>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  hint,
  type = "text",
  prefix,
  ...rest
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  hint?: string;
  type?: string;
  prefix?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "defaultValue">) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <span className="flex items-center gap-2">
        {prefix && <span className="text-brand-stone">{prefix}</span>}
        <input
          className="field"
          name={name}
          type={type}
          defaultValue={defaultValue ?? ""}
          {...rest}
        />
      </span>
      {hint && (
        <span className="mt-1 block text-sm text-brand-stone">{hint}</span>
      )}
    </label>
  );
}

export function Check({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1.5"
      />
      <span>
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-sm text-brand-stone">{hint}</span>}
      </span>
    </label>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="border-t border-brand-sand pt-6 mt-8">
      <legend className="section-title text-2xl pr-4">{title}</legend>
      <div className="grid gap-5 sm:grid-cols-2 mt-4">{children}</div>
    </fieldset>
  );
}
