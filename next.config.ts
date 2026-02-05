import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/threads",
        destination: "/letters",
        permanent: true,
      },
      {
        source: "/threads/:path*",
        destination: "/letters/:path*",
        permanent: true,
      },
    ];
  },
};

export default withBotId(nextConfig);
