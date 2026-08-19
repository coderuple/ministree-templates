/**
 * Ministree forms arrive in more than one shape depending on how they were
 * built — fields at the top level, under `config`, or spread across `sections`.
 *
 * Shared because two places render a form now: the `/forms/[slug]` page and the
 * `form` section a church can drop onto any page. One copy means a new shape
 * only has to be handled once.
 */
export function extractFormFields(form: Record<string, unknown>): Array<Record<string, unknown>> {
  if (Array.isArray(form.fields)) return form.fields as Array<Record<string, unknown>>;
  const config = form.config as Record<string, unknown> | undefined;
  if (config && Array.isArray(config.fields)) return config.fields as Array<Record<string, unknown>>;
  const sections = (form.sections ?? config?.sections) as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(sections)) {
    return sections.flatMap((s) =>
      Array.isArray(s.fields) ? (s.fields as Array<Record<string, unknown>>) : [],
    );
  }
  return [];
}
