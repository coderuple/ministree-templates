import manifest from "../../../ministree.config";

/** Ministree reads this to build the church's Customizer. ISR so a redeploy
 *  is picked up by "Refresh fields" without a cold fetch every time. */
export const revalidate = 300;

export function GET() {
  return Response.json(manifest, {
    headers: {
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=300",
    },
  });
}
