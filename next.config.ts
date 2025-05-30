import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  basePath: isProduction ? "/chick-n-spin" : "",
  images: {
    loader: "default",
    path: isProduction ? "/chick-n-spin/_next/image" : "/_next/image",
  },
};

export default nextConfig;
