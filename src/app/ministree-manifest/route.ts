import manifest from "../../../ministree.config";

/**
 * Exposes this template's manifest so Ministree can register it by URL
 * (Customize Site → Register from URL) — no copy-paste needed.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(manifest, {
    headers: { "access-control-allow-origin": "*", "cache-control": "public, max-age=300" },
  });
}
