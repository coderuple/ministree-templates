import { getGiving } from "@ministree/template-sdk";
import { loadContent } from "@/lib/ministree";
import { Container } from "@/components/ui";
import GivingExperience, { type GivingContent } from "@/components/giving/GivingExperience";

export const revalidate = 60;
export const metadata = { title: "Give" };

/** Full native giving experience — funds, amount, frequency, gift aid, card. */
export default async function GivePage() {
  const [giving, content] = await Promise.all([getGiving(), loadContent()]);
  const givingContent = ((content as { giving?: GivingContent }).giving ?? {}) as GivingContent;

  if (!giving) {
    return (
      <Container className="py-24">
        <h1 className="font-display text-6xl uppercase leading-[0.9] tracking-tight sm:text-7xl">
          {givingContent.heading || "Give"}
        </h1>
        <p className="font-serif mt-5 max-w-xl text-xl italic text-muted">
          Giving isn&apos;t set up yet. Please check back soon.
        </p>
      </Container>
    );
  }

  return <GivingExperience giving={giving} content={givingContent} />;
}
