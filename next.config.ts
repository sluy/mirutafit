import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Required so EasyPanel/Docker can run the app from a minimal standalone bundle.
  output: "standalone",
  // Keep the native image library out of the server bundle (used for media
  // thumbnails, avatar processing, image transforms).
  serverExternalPackages: ["sharp"],
};

export default withNextIntl(nextConfig);
