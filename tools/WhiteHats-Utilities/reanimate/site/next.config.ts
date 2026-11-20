import type { NextConfig } from "next";

// Static export: the whole site is prebuilt HTML/CSS/JS, served by Cloudflare Workers static assets.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // The static host serves examples/<name>/index.html for the folder URL; `next dev` doesn't, so map it here.
  ...(process.env.NODE_ENV === "development" && {
    rewrites: async () => [{ source: "/examples/:name/", destination: "/examples/:name/index.html" }],
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
