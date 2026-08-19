import manifest from "../../../ministree.config";

/**
 * Exposes this template's manifest so Ministree can register it by URL
 * (Customize Site → Register from URL) — no copy-paste needed.
 * ISR (not force-static) so admin "Refresh fields" picks up a redeploy's new
 * fields without a rebuild.
 */
export const revalidate = 300;

export function GET() {
  return Response.json(manifest, {
    headers: { "access-control-allow-origin": "*", "cache-control": "public, max-age=300" },
  });
}
