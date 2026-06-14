import { notFound } from "next/navigation";
import { getForm } from "@ministree/template-sdk";
import { Container, Eyebrow } from "@/components/ui";
import FormRenderer from "@/components/FormRenderer";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const form = await getForm(slug);
  return form ? { title: (form.title as string) ?? "Form" } : {};
}

/** Defensively pull a flat field list from the various form payload shapes. */
function extractFields(form: Record<string, unknown>): Array<Record<string, unknown>> {
  if (Array.isArray(form.fields)) return form.fields as Array<Record<string, unknown>>;
  const config = form.config as Record<string, unknown> | undefined;
  if (config && Array.isArray(config.fields)) return config.fields as Array<Record<string, unknown>>;
  const sections = (form.sections ?? config?.sections) as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(sections)) return sections.flatMap((s) => (Array.isArray(s.fields) ? (s.fields as Array<Record<string, unknown>>) : []));
  return [];
}

export default async function FormPage({ params }: Params) {
  const { slug } = await params;
  const form = await getForm(slug);
  if (!form) notFound();

  const title = (form.title as string) ?? "Form";
  const description = (form.description as string) ?? null;
  const fields = extractFields(form);

  return (
    <Container size="narrow" className="py-16">
      <Eyebrow>Form</Eyebrow>
      <h1 className="mt-4 font-display text-5xl uppercase leading-[0.9] tracking-tight sm:text-6xl">{title}</h1>
      {description ? <p className="mt-4 text-muted">{description}</p> : null}
      <div className="mt-10">
        <FormRenderer slug={slug} fields={fields} />
      </div>
    </Container>
  );
}
