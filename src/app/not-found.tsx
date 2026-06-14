import { loadContent, loadSettings } from "@/lib/ministree";
import { Button, Container } from "@/components/ui";

/** 404 — uses the church's custom not-found copy when set. */
export default async function NotFound() {
  const [settings, content] = await Promise.all([loadSettings(), loadContent()]);
  const title = settings?.notFoundTitle ?? "Page not found";
  const body = settings?.notFoundBody ?? content.tagline;

  return (
    <Container className="py-32 text-center sm:py-40">
      <p className="font-display text-7xl font-semibold text-accent">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">{body}</p>
      <div className="mt-8">
        <Button href="/">Back home</Button>
      </div>
    </Container>
  );
}
