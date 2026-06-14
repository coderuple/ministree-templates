"use client";

import { useState } from "react";
import { createClient } from "@ministree/template-sdk";

interface FormField {
  id?: string;
  name?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string } | string>;
}

/**
 * Generic form renderer + submitter for Ministree custom forms. Reads a defensive
 * field list from the public form payload and POSTs to /forms/:slug/submit.
 * Restyle freely — this is flame's interpretation.
 */
export default function FormRenderer({ slug, fields }: { slug: string; fields: FormField[] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string>("");

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    try {
      await createClient().post(`/forms/${slug}/submit`, { values });
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="font-display text-2xl font-semibold">Thank you!</p>
        <p className="mt-2 text-muted">Your response has been received.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {fields.map((f, i) => {
        const name = f.name ?? f.id ?? `field-${i}`;
        const label = f.label ?? name;
        const type = f.type ?? "text";
        const common = "w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-ink outline-none focus:border-accent";
        return (
          <div key={name}>
            <label className="mb-1.5 block text-sm font-medium">
              {label}
              {f.required ? <span className="text-accent"> *</span> : null}
            </label>
            {type === "textarea" ? (
              <textarea name={name} required={f.required} placeholder={f.placeholder} rows={4} className={common} onChange={(e) => set(name, e.target.value)} />
            ) : type === "select" ? (
              <select name={name} required={f.required} className={common} onChange={(e) => set(name, e.target.value)}>
                <option value="">Select…</option>
                {(f.options ?? []).map((o, j) => {
                  const opt = typeof o === "string" ? { label: o, value: o } : o;
                  return (
                    <option key={j} value={opt.value}>
                      {opt.label}
                    </option>
                  );
                })}
              </select>
            ) : (
              <input type={type} name={name} required={f.required} placeholder={f.placeholder} className={common} onChange={(e) => set(name, e.target.value)} />
            )}
          </div>
        );
      })}

      {state === "error" ? <p className="text-sm text-red-600">{error || "Something went wrong."}</p> : null}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {state === "submitting" ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
