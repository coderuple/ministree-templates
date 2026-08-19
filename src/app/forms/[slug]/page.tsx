import { notFound } from "next/navigation";
import { getForm } from "@ministree/template-sdk";
import { Container, Eyebrow } from "@/components/ui";
import { extractFormFields } from "@/lib/forms";
import FormRenderer from "@/components/FormRenderer";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const form = await getForm(slug);
  return form ? { title: (form.title as string) ?? "Form" } : {};
}

/** Defensively pull a flat field list from the various form payload shapes. */
export default async function FormPage({ params }: Params) {
  const { slug } = await params;
  const form = await getForm(slug);
  if (!form) notFound();

  const title = (form.title as string) ?? "Form";
  const description = (form.description as string) ?? null;
  const fields = extractFormFields(form);

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
