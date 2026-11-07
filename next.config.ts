import type { NextConfig } from "next";
import { GITHUB_PAGES_BASE_PATH } from "./src/lib/site";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGithubPages
    ? {
        output: "export",
        basePath: GITHUB_PAGES_BASE_PATH,
        trailingSlash: true,
        images: { unoptimized: true },
        env: {
          NEXT_PUBLIC_BASE_PATH: GITHUB_PAGES_BASE_PATH,
        },
      }
    : {
        cacheComponents: true,
        partialPrefetching: true,
      }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
