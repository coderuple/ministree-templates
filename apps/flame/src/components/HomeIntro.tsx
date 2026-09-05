import { Container } from "@/components/ui";

/**
 * The welcome passage between the hero and the composable stack.
 *
 * The Customizer has offered "Welcome section" (heading + body) since the
 * template shipped, but nothing rendered it — a church could type here and see
 * no change on its site. Serif and generously set, because this is the one
 * moment on the page that is meant to be read rather than scanned.
 *
 * Renders nothing when both fields are blank, so a church that doesn't want a
 * welcome simply clears them.
 */
export default function HomeIntro({
  heading,
  body,
}: {
  heading?: string;
  body?: string;
}) {
  const title = heading?.trim();
  const text = body?.trim();
  if (!title && !text) return null;

  return (
    <section className="py-20 sm:py-28">
      <Container size="narrow" className="text-center">
        {title ? (
          <h2 className="font-display text-3xl uppercase tracking-tight sm:text-4xl">{title}</h2>
        ) : null}
        {text ? (
          <p className="font-serif mx-auto mt-6 max-w-2xl text-xl italic leading-relaxed text-muted sm:text-2xl">
            {text}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
