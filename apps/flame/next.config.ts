import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // event-kit ships TypeScript source, not a build — Next compiles it with the app.
  transpilePackages: ["@ministree-templates/event-kit"],
};

export default nextConfig;
