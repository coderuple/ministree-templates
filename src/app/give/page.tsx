import { getGiving } from "@ministree/template-sdk";
import { loadContent, loadSettings, siteName } from "@/lib/ministree";
import { ArchiveHeader, Button, Container } from "@/components/ui";

export const revalidate = 60;
export const metadata = { title: "Give" };

export default async function GivePage() {
  const [giving, settings, content] = await Promise.all([getGiving(), loadSettings(), loadContent()]);
  const funds = giving?.funds ?? [];
  const name = siteName(settings);
  const base = settings?.publicSiteUrl?.replace(/\/$/, "");
  const giveUrl = base ? `${base}/give` : "#";

  return (
    <>
      <ArchiveHeader
        eyebrow="Generosity"
        title="Give"
        description={`Your giving supports the mission and ministry of ${name}.`}
      />
      <Container size="narrow" className="py-12">
        <div className="rounded-3xl bg-accent px-8 py-14 text-center text-accent-contrast">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Make a gift</h2>
          <p className="mx-auto mt-3 max-w-md opacity-90">
            Secure online giving, anytime. Thank you for partnering with us.
          </p>
          <div className="mt-7">
            <Button
              href={giveUrl}
              external={giveUrl !== "#"}
              variant="outline"
              className="border-accent-contrast text-accent-contrast hover:bg-accent-contrast hover:text-accent"
            >
              Give now →
            </Button>
          </div>
        </div>

        {funds.length ? (
          <div className="mt-10">
            <h3 className="font-display text-xl font-semibold">Ways to give</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {funds.map((f) => (
                <li key={f.id} className="rounded-2xl border border-border bg-surface px-5 py-4">
                  <p className="font-medium">{f.name}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-8 text-center text-sm text-muted">{content.tagline}</p>
        )}
      </Container>
    </>
  );
}
